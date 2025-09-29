import axios, { AxiosInstance } from 'axios'
import { MetaCustomAudience, MetaApiError } from '../types/metaApi'
import { MetaAuthService } from './MetaAuthService'

interface RateLimiter {
  checkLimit(): Promise<boolean>
  recordCall(cpuTime: number, totalTime: number): Promise<void>
}

export class MetaAudienceService {
  private baseUrl = 'https://graph.facebook.com/v18.0'
  private client: AxiosInstance
  private authService: MetaAuthService
  private rateLimiter: RateLimiter

  constructor(authService: MetaAuthService, rateLimiter: RateLimiter) {
    this.authService = authService
    this.rateLimiter = rateLimiter

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.response.use(
      (response) => {
        this.trackRateLimit(response.headers)
        return response
      },
      (error) => {
        if (error.response) {
          this.trackRateLimit(error.response.headers)
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Create custom audience
   */
  async createCustomAudience(
    userId: string,
    adAccountId: string,
    audience: {
      name: string
      description?: string
      subtype: 'CUSTOM' | 'WEBSITE' | 'APP' | 'OFFLINE_CONVERSION' | 'ENGAGEMENT' | 'VIDEO'
      customer_file_source?: 'USER_PROVIDED_ONLY' | 'PARTNER_PROVIDED_ONLY' | 'BOTH_USER_AND_PARTNER_PROVIDED'
    }
  ): Promise<MetaCustomAudience> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.post(
        `/act_${adAccountId}/customaudiences`,
        {
          name: audience.name,
          description: audience.description,
          subtype: audience.subtype,
          customer_file_source: audience.customer_file_source || 'USER_PROVIDED_ONLY',
        },
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getCustomAudience(userId, response.data.id)
    } catch (error) {
      this.handleApiError(error, 'Failed to create custom audience')
      throw error
    }
  }

  /**
   * Create lookalike audience
   */
  async createLookalikeAudience(
    userId: string,
    adAccountId: string,
    lookalike: {
      name: string
      origin_audience_id: string
      country: string
      ratio: number
      starting_ratio?: number
      type?: 'similarity' | 'reach'
    }
  ): Promise<MetaCustomAudience> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.post(
        `/act_${adAccountId}/customaudiences`,
        {
          name: lookalike.name,
          subtype: 'LOOKALIKE',
          lookalike_spec: {
            origin: [
              {
                id: lookalike.origin_audience_id,
                type: 'custom_audience',
              },
            ],
            country: lookalike.country,
            ratio: lookalike.ratio,
            starting_ratio: lookalike.starting_ratio || lookalike.ratio,
            type: lookalike.type || 'similarity',
          },
        },
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getCustomAudience(userId, response.data.id)
    } catch (error) {
      this.handleApiError(error, 'Failed to create lookalike audience')
      throw error
    }
  }

  /**
   * Add users to custom audience (hashed data)
   */
  async addUsersToAudience(
    userId: string,
    audienceId: string,
    users: Array<{
      email?: string
      phone?: string
      first_name?: string
      last_name?: string
      city?: string
      state?: string
      zip?: string
      country?: string
      gender?: 'm' | 'f'
      date_of_birth?: string
      external_id?: string
    }>,
    options?: {
      session_id?: string
      batch_seq?: number
      last_batch_flag?: boolean
    }
  ): Promise<{
    audience_id: string
    session_id: string
    num_received: number
    num_invalid_entries: number
    invalid_entry_samples?: any
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      // Convert user data to Meta's schema format
      const schema = []
      const data = []

      if (users[0]?.email) schema.push('EMAIL')
      if (users[0]?.phone) schema.push('PHONE')
      if (users[0]?.first_name) schema.push('FN')
      if (users[0]?.last_name) schema.push('LN')
      if (users[0]?.city) schema.push('CT')
      if (users[0]?.state) schema.push('ST')
      if (users[0]?.zip) schema.push('ZIP')
      if (users[0]?.country) schema.push('COUNTRY')
      if (users[0]?.gender) schema.push('GEN')
      if (users[0]?.date_of_birth) schema.push('DOBY')
      if (users[0]?.external_id) schema.push('EXTERN_ID')

      for (const user of users) {
        const row = []
        if (schema.includes('EMAIL')) row.push(user.email || '')
        if (schema.includes('PHONE')) row.push(user.phone || '')
        if (schema.includes('FN')) row.push(user.first_name || '')
        if (schema.includes('LN')) row.push(user.last_name || '')
        if (schema.includes('CT')) row.push(user.city || '')
        if (schema.includes('ST')) row.push(user.state || '')
        if (schema.includes('ZIP')) row.push(user.zip || '')
        if (schema.includes('COUNTRY')) row.push(user.country || '')
        if (schema.includes('GEN')) row.push(user.gender || '')
        if (schema.includes('DOBY')) row.push(user.date_of_birth || '')
        if (schema.includes('EXTERN_ID')) row.push(user.external_id || '')
        data.push(row)
      }

      const payload: any = {
        schema,
        data,
      }

      if (options?.session_id) {
        payload.session = {
          session_id: options.session_id,
          batch_seq: options.batch_seq || 1,
          last_batch_flag: options.last_batch_flag || false,
          estimated_num_total: users.length,
        }
      }

      const response = await this.client.post(
        `/${audienceId}/users`,
        payload,
        {
          params: { access_token: accessToken },
        }
      )

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to add users to audience')
      throw error
    }
  }

  /**
   * Remove users from custom audience
   */
  async removeUsersFromAudience(
    userId: string,
    audienceId: string,
    users: Array<{
      email?: string
      phone?: string
      external_id?: string
    }>
  ): Promise<{
    audience_id: string
    session_id: string
    num_received: number
    num_invalid_entries: number
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const schema = []
      const data = []

      if (users[0]?.email) schema.push('EMAIL')
      if (users[0]?.phone) schema.push('PHONE')
      if (users[0]?.external_id) schema.push('EXTERN_ID')

      for (const user of users) {
        const row = []
        if (schema.includes('EMAIL')) row.push(user.email || '')
        if (schema.includes('PHONE')) row.push(user.phone || '')
        if (schema.includes('EXTERN_ID')) row.push(user.external_id || '')
        data.push(row)
      }

      const response = await this.client.delete(`/${audienceId}/users`, {
        params: { access_token: accessToken },
        data: {
          schema,
          data,
        },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to remove users from audience')
      throw error
    }
  }

  /**
   * Get custom audience details
   */
  async getCustomAudience(userId: string, audienceId: string): Promise<MetaCustomAudience> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'id',
        'account_id',
        'name',
        'description',
        'subtype',
        'approximate_count',
        'data_source',
        'delivery_status',
        'operation_status',
        'lookalike_spec',
        'created_time',
        'updated_time',
      ].join(',')

      const response = await this.client.get(`/${audienceId}`, {
        params: {
          access_token: accessToken,
          fields,
        },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get custom audience')
      throw error
    }
  }

  /**
   * Update custom audience
   */
  async updateCustomAudience(
    userId: string,
    audienceId: string,
    updates: {
      name?: string
      description?: string
    }
  ): Promise<MetaCustomAudience> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      await this.client.post(
        `/${audienceId}`,
        updates,
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getCustomAudience(userId, audienceId)
    } catch (error) {
      this.handleApiError(error, 'Failed to update custom audience')
      throw error
    }
  }

  /**
   * Delete custom audience
   */
  async deleteCustomAudience(userId: string, audienceId: string): Promise<boolean> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.delete(`/${audienceId}`, {
        params: { access_token: accessToken },
      })

      return response.data.success || false
    } catch (error) {
      this.handleApiError(error, 'Failed to delete custom audience')
      throw error
    }
  }

  /**
   * List custom audiences for ad account
   */
  async listCustomAudiences(
    userId: string,
    adAccountId: string,
    options?: {
      limit?: number
      subtype?: string[]
    }
  ): Promise<{
    data: MetaCustomAudience[]
    paging?: { cursors: { before: string; after: string } }
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'id',
        'account_id',
        'name',
        'description',
        'subtype',
        'approximate_count',
        'delivery_status',
        'created_time',
      ].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
        limit: options?.limit || 25,
      }

      if (options?.subtype) {
        params.filtering = JSON.stringify([
          {
            field: 'subtype',
            operator: 'IN',
            value: options.subtype,
          },
        ])
      }

      const response = await this.client.get(`/act_${adAccountId}/customaudiences`, {
        params,
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to list custom audiences')
      throw error
    }
  }

  /**
   * Share custom audience with another ad account
   */
  async shareAudience(
    userId: string,
    audienceId: string,
    targetAdAccountId: string
  ): Promise<boolean> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.post(
        `/${audienceId}/adaccounts`,
        {
          adaccounts: [`act_${targetAdAccountId}`],
        },
        {
          params: { access_token: accessToken },
        }
      )

      return response.data.success || false
    } catch (error) {
      this.handleApiError(error, 'Failed to share audience')
      throw error
    }
  }

  /**
   * Get audience reach estimate
   */
  async getReachEstimate(
    userId: string,
    adAccountId: string,
    targeting: any,
    optimization_goal: string
  ): Promise<{
    estimate_ready: boolean
    users: number
    bid_estimations: Array<{
      location: number
      unsupported: number
      cpc_min: number
      cpc_median: number
      cpc_max: number
    }>
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/act_${adAccountId}/reachestimate`, {
        params: {
          access_token: accessToken,
          targeting_spec: JSON.stringify(targeting),
          optimization_goal,
        },
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get reach estimate')
      throw error
    }
  }

  /**
   * Search for interest targeting options
   */
  async searchInterests(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<Array<{
    id: string
    name: string
    audience_size_lower_bound: number
    audience_size_upper_bound: number
    path: string[]
    description: string
    topic: string
  }>> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/search', {
        params: {
          access_token: accessToken,
          type: 'adinterest',
          q: query,
          limit,
        },
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to search interests')
      throw error
    }
  }

  /**
   * Get targeting suggestions based on interests
   */
  async getTargetingSuggestions(
    userId: string,
    interests: string[],
    limit: number = 10
  ): Promise<Array<{
    id: string
    name: string
    audience_size: number
    path: string[]
    type: string
  }>> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/search', {
        params: {
          access_token: accessToken,
          type: 'adTargetingCategory',
          class: 'interests',
          interest_list: JSON.stringify(interests),
          limit,
        },
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get targeting suggestions')
      throw error
    }
  }

  /**
   * Track rate limit from response headers
   */
  private trackRateLimit(headers: any): void {
    const usage = headers['x-business-use-case-usage']
    if (usage) {
      try {
        const usageData = JSON.parse(usage)
        const accountId = Object.keys(usageData)[0]
        if (accountId && usageData[accountId][0]) {
          const { call_count, total_cputime, total_time } = usageData[accountId][0]
          this.rateLimiter.recordCall(total_cputime, total_time)
        }
      } catch (error) {
        console.error('Failed to parse rate limit headers:', error)
      }
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