import axios, { AxiosInstance } from 'axios'
import { SpotifyAccessToken, SpotifyApiError, SPOTIFY_REQUIRED_SCOPES } from '../types/spotifyApi'

interface TokenStorage {
  getToken(userId: string): Promise<SpotifyAccessToken | null>
  saveToken(userId: string, token: SpotifyAccessToken): Promise<void>
  deleteToken(userId: string): Promise<void>
}

export class SpotifyAuthService {
  private authUrl = 'https://accounts.spotify.com'
  private client: AxiosInstance
  private tokenStorage: TokenStorage
  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    tokenStorage: TokenStorage
  ) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUri = redirectUri
    this.tokenStorage = tokenStorage

    this.client = axios.create({
      baseURL: this.authUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }

  /**
   * Generate OAuth authorization URL for user to grant permissions
   */
  getAuthorizationUrl(state: string, scopes?: string[]): string {
    const scopeList = scopes || SPOTIFY_REQUIRED_SCOPES

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state,
      scope: scopeList.join(' '),
      show_dialog: 'false',
    })

    return `${this.authUrl}/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<SpotifyAccessToken> {
    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

      const response = await this.client.post(
        '/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      const token: SpotifyAccessToken = {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token,
        scope: response.data.scope,
        user_id: '',
      }

      return token
    } catch (error) {
      this.handleApiError(error, 'Failed to exchange code for token')
      throw error
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<SpotifyAccessToken> {
    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

      const response = await this.client.post(
        '/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      const token: SpotifyAccessToken = {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token || refreshToken,
        scope: response.data.scope,
        user_id: '',
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
      throw new Error('No token found for user. Please re-authenticate with Spotify.')
    }

    // Check if token is expired or expiring soon (within 5 minutes)
    const expiresAt = Date.now() + storedToken.expires_in * 1000
    const expiringThreshold = Date.now() + 5 * 60 * 1000

    if (expiresAt < expiringThreshold) {
      if (!storedToken.refresh_token) {
        throw new Error('No refresh token available. Please re-authenticate with Spotify.')
      }

      console.log(`Spotify token expiring soon for user ${userId}, refreshing...`)

      try {
        const newToken = await this.refreshAccessToken(storedToken.refresh_token)
        newToken.user_id = storedToken.user_id

        await this.tokenStorage.saveToken(userId, newToken)
        return newToken.access_token
      } catch (error) {
        console.error('Failed to refresh Spotify token:', error)
        throw new Error('Token refresh failed. Please re-authenticate with Spotify.')
      }
    }

    return storedToken.access_token
  }

  /**
   * Save token after successful authentication
   */
  async saveUserToken(userId: string, token: SpotifyAccessToken): Promise<void> {
    token.user_id = userId
    await this.tokenStorage.saveToken(userId, token)
  }

  /**
   * Revoke user's access (remove from storage)
   */
  async revokeToken(userId: string): Promise<void> {
    await this.tokenStorage.deleteToken(userId)
  }

  /**
   * Check if user has valid token
   */
  async hasValidToken(userId: string): Promise<boolean> {
    try {
      const token = await this.tokenStorage.getToken(userId)
      if (!token) return false

      const expiresAt = Date.now() + token.expires_in * 1000
      return expiresAt > Date.now()
    } catch (error) {
      return false
    }
  }

  /**
   * Get Client Credentials token (for public API access without user context)
   */
  async getClientCredentialsToken(): Promise<string> {
    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

      const response = await this.client.post(
        '/api/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      return response.data.access_token
    } catch (error) {
      this.handleApiError(error, 'Failed to get client credentials token')
      throw error
    }
  }

  /**
   * Validate required scopes
   */
  validateScopes(grantedScopes: string, requiredScopes: string[]): {
    isValid: boolean
    missingScopes: string[]
  } {
    const granted = grantedScopes.split(' ')
    const missing = requiredScopes.filter(scope => !granted.includes(scope))

    return {
      isValid: missing.length === 0,
      missingScopes: missing,
    }
  }

  /**
   * Handle API errors with proper typing
   */
  private handleApiError(error: any, context: string): void {
    if (axios.isAxiosError(error) && error.response?.data) {
      const spotifyError = error.response.data as SpotifyApiError
      console.error(`${context}:`, {
        status: spotifyError.error.status,
        message: spotifyError.error.message,
      })
    } else {
      console.error(`${context}:`, error)
    }
  }
}