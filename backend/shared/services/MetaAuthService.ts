import axios, { AxiosInstance } from 'axios'
import { MetaAccessToken, MetaApiError } from '../types/metaApi'

interface TokenStorage {
  getToken(userId: string): Promise<MetaAccessToken | null>
  saveToken(userId: string, token: MetaAccessToken): Promise<void>
  deleteToken(userId: string): Promise<void>
}

export class MetaAuthService {
  private baseUrl = 'https://graph.facebook.com/v18.0'
  private client: AxiosInstance
  private tokenStorage: TokenStorage
  private appId: string
  private appSecret: string
  private redirectUri: string

  constructor(
    appId: string,
    appSecret: string,
    redirectUri: string,
    tokenStorage: TokenStorage
  ) {
    this.appId = appId
    this.appSecret = appSecret
    this.redirectUri = redirectUri
    this.tokenStorage = tokenStorage

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Generate OAuth authorization URL for user to grant permissions
   */
  getAuthorizationUrl(state: string): string {
    const scopes = [
      'ads_management',
      'ads_read',
      'business_management',
      'pages_read_engagement',
      'pages_manage_ads',
      'leads_retrieval',
    ]

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      state,
      scope: scopes.join(','),
      response_type: 'code',
    })

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<MetaAccessToken> {
    try {
      const response = await this.client.get('/oauth/access_token', {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: this.redirectUri,
          code,
        },
      })

      const token: MetaAccessToken = {
        access_token: response.data.access_token,
        token_type: response.data.token_type || 'Bearer',
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token,
        user_id: response.data.user_id || '',
        ad_account_id: response.data.ad_account_id || '',
      }

      return token
    } catch (error) {
      this.handleApiError(error, 'Failed to exchange code for token')
      throw error
    }
  }

  /**
   * Exchange short-lived token for long-lived token (60 days)
   */
  async exchangeForLongLivedToken(shortLivedToken: string): Promise<MetaAccessToken> {
    try {
      const response = await this.client.get('/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: shortLivedToken,
        },
      })

      const token: MetaAccessToken = {
        access_token: response.data.access_token,
        token_type: 'Bearer',
        expires_in: response.data.expires_in,
        user_id: '',
        ad_account_id: '',
      }

      return token
    } catch (error) {
      this.handleApiError(error, 'Failed to exchange for long-lived token')
      throw error
    }
  }

  /**
   * Refresh access token before expiration
   */
  async refreshAccessToken(refreshToken: string): Promise<MetaAccessToken> {
    try {
      const response = await this.client.get('/oauth/access_token', {
        params: {
          grant_type: 'refresh_token',
          client_id: this.appId,
          client_secret: this.appSecret,
          refresh_token: refreshToken,
        },
      })

      const token: MetaAccessToken = {
        access_token: response.data.access_token,
        token_type: response.data.token_type || 'Bearer',
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token || refreshToken,
        user_id: '',
        ad_account_id: '',
      }

      return token
    } catch (error) {
      this.handleApiError(error, 'Failed to refresh access token')
      throw error
    }
  }

  /**
   * Get valid access token for user, refreshing if necessary
   */
  async getValidToken(userId: string): Promise<string> {
    const storedToken = await this.tokenStorage.getToken(userId)

    if (!storedToken) {
      throw new Error('No token found for user. Please re-authenticate.')
    }

    // Check if token is expired or expiring soon (within 24 hours)
    const expiresAt = Date.now() + storedToken.expires_in * 1000
    const expiringThreshold = Date.now() + 24 * 60 * 60 * 1000

    if (expiresAt < expiringThreshold && storedToken.refresh_token) {
      console.log(`Token expiring soon for user ${userId}, refreshing...`)

      try {
        const newToken = await this.refreshAccessToken(storedToken.refresh_token)
        newToken.user_id = storedToken.user_id
        newToken.ad_account_id = storedToken.ad_account_id

        await this.tokenStorage.saveToken(userId, newToken)
        return newToken.access_token
      } catch (error) {
        console.error('Failed to refresh token:', error)
        throw new Error('Token refresh failed. Please re-authenticate.')
      }
    }

    return storedToken.access_token
  }

  /**
   * Validate access token and get token info
   */
  async validateToken(accessToken: string): Promise<{
    app_id: string
    application: string
    expires_at: number
    is_valid: boolean
    scopes: string[]
    user_id: string
  }> {
    try {
      const response = await this.client.get('/debug_token', {
        params: {
          input_token: accessToken,
          access_token: `${this.appId}|${this.appSecret}`,
        },
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to validate token')
      throw error
    }
  }

  /**
   * Get user's ad accounts
   */
  async getUserAdAccounts(accessToken: string): Promise<Array<{
    id: string
    account_id: string
    name: string
    account_status: number
    currency: string
    timezone_name: string
  }>> {
    try {
      const response = await this.client.get('/me/adaccounts', {
        params: {
          access_token: accessToken,
          fields: 'id,account_id,name,account_status,currency,timezone_name',
        },
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get user ad accounts')
      throw error
    }
  }

  /**
   * Save token after successful authentication
   */
  async saveUserToken(userId: string, token: MetaAccessToken): Promise<void> {
    await this.tokenStorage.saveToken(userId, token)
  }

  /**
   * Revoke user's access token
   */
  async revokeToken(userId: string): Promise<void> {
    try {
      const token = await this.tokenStorage.getToken(userId)

      if (token) {
        await this.client.delete('/me/permissions', {
          params: {
            access_token: token.access_token,
          },
        })
      }

      await this.tokenStorage.deleteToken(userId)
    } catch (error) {
      console.error('Failed to revoke token:', error)
      // Still delete from storage even if revoke fails
      await this.tokenStorage.deleteToken(userId)
    }
  }

  /**
   * Handle API errors with proper typing
   */
  private handleApiError(error: any, context: string): void {
    if (axios.isAxiosError(error) && error.response?.data) {
      const metaError = error.response.data as MetaApiError
      console.error(`${context}:`, {
        message: metaError.error.message,
        type: metaError.error.type,
        code: metaError.error.code,
        subcode: metaError.error.error_subcode,
        trace_id: metaError.error.fbtrace_id,
      })
    } else {
      console.error(`${context}:`, error)
    }
  }
}