import axios, { AxiosInstance } from 'axios'
import crypto from 'crypto'
import { MetaConversionEvent, MetaApiError } from '../types/metaApi'
import { MetaAuthService } from './MetaAuthService'

interface RateLimiter {
  checkLimit(): Promise<boolean>
  recordCall(cpuTime: number, totalTime: number): Promise<void>
}

export class MetaConversionService {
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
   * Send conversion event to Meta Conversions API
   */
  async sendConversionEvent(
    userId: string,
    pixelId: string,
    events: MetaConversionEvent | MetaConversionEvent[],
    testEventCode?: string
  ): Promise<{
    events_received: number
    messages: string[]
    fbtrace_id: string
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const eventsArray = Array.isArray(events) ? events : [events]

      const payload: any = {
        data: eventsArray,
        access_token: accessToken,
      }

      if (testEventCode) {
        payload.test_event_code = testEventCode
      }

      const response = await this.client.post(`/${pixelId}/events`, payload)

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to send conversion event')
      throw error
    }
  }

  /**
   * Send batch conversion events
   */
  async sendBatchConversionEvents(
    userId: string,
    pixelId: string,
    events: MetaConversionEvent[],
    options?: {
      testEventCode?: string
      partner_agent?: string
    }
  ): Promise<{
    events_received: number
    messages: string[]
    fbtrace_id: string
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const payload: any = {
        data: events,
        access_token: accessToken,
      }

      if (options?.testEventCode) {
        payload.test_event_code = options.testEventCode
      }

      if (options?.partner_agent) {
        payload.partner_agent = options.partner_agent
      }

      const response = await this.client.post(`/${pixelId}/events`, payload)

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to send batch conversion events')
      throw error
    }
  }

  /**
   * Create standard purchase conversion event
   */
  createPurchaseEvent(
    eventId: string,
    userData: MetaConversionEvent['user_data'],
    customData: {
      value: number
      currency: string
      content_ids?: string[]
      content_name?: string
      content_type?: string
      num_items?: number
    },
    eventSourceUrl?: string
  ): MetaConversionEvent {
    return {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      user_data: this.hashUserData(userData),
      custom_data: customData,
      action_source: eventSourceUrl ? 'website' : 'other',
      event_source_url: eventSourceUrl,
    }
  }

  /**
   * Create standard lead conversion event
   */
  createLeadEvent(
    eventId: string,
    userData: MetaConversionEvent['user_data'],
    customData?: {
      value?: number
      currency?: string
      content_name?: string
    },
    eventSourceUrl?: string
  ): MetaConversionEvent {
    return {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      user_data: this.hashUserData(userData),
      custom_data: customData,
      action_source: eventSourceUrl ? 'website' : 'other',
      event_source_url: eventSourceUrl,
    }
  }

  /**
   * Create custom conversion event (e.g., "StreamOnSpotify")
   */
  createCustomEvent(
    eventName: string,
    eventId: string,
    userData: MetaConversionEvent['user_data'],
    customData?: MetaConversionEvent['custom_data'],
    actionSource: MetaConversionEvent['action_source'] = 'other',
    eventSourceUrl?: string
  ): MetaConversionEvent {
    return {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      user_data: this.hashUserData(userData),
      custom_data: customData,
      action_source: actionSource,
      event_source_url: eventSourceUrl,
    }
  }

  /**
   * Create AddToCart conversion event
   */
  createAddToCartEvent(
    eventId: string,
    userData: MetaConversionEvent['user_data'],
    customData: {
      value: number
      currency: string
      content_ids: string[]
      content_name: string
      content_type?: string
    },
    eventSourceUrl?: string
  ): MetaConversionEvent {
    return {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      user_data: this.hashUserData(userData),
      custom_data: customData,
      action_source: eventSourceUrl ? 'website' : 'other',
      event_source_url: eventSourceUrl,
    }
  }

  /**
   * Create CompleteRegistration conversion event
   */
  createRegistrationEvent(
    eventId: string,
    userData: MetaConversionEvent['user_data'],
    customData?: {
      value?: number
      currency?: string
      content_name?: string
    },
    eventSourceUrl?: string
  ): MetaConversionEvent {
    return {
      event_name: 'CompleteRegistration',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      user_data: this.hashUserData(userData),
      custom_data: customData,
      action_source: eventSourceUrl ? 'website' : 'other',
      event_source_url: eventSourceUrl,
    }
  }

  /**
   * Hash user data fields according to Meta requirements
   */
  private hashUserData(userData: MetaConversionEvent['user_data']): MetaConversionEvent['user_data'] {
    const hashed: MetaConversionEvent['user_data'] = {
      ...userData,
    }

    // Hash PII fields if they exist and are not already hashed
    if (userData.em && !this.isHashed(userData.em)) {
      hashed.em = this.hashValue(userData.em.toLowerCase().trim())
    }

    if (userData.ph && !this.isHashed(userData.ph)) {
      // Remove non-numeric characters and hash
      const cleaned = userData.ph.replace(/[^0-9]/g, '')
      hashed.ph = this.hashValue(cleaned)
    }

    if (userData.fn && !this.isHashed(userData.fn)) {
      hashed.fn = this.hashValue(userData.fn.toLowerCase().trim())
    }

    if (userData.ln && !this.isHashed(userData.ln)) {
      hashed.ln = this.hashValue(userData.ln.toLowerCase().trim())
    }

    if (userData.ct && !this.isHashed(userData.ct)) {
      hashed.ct = this.hashValue(userData.ct.toLowerCase().trim())
    }

    if (userData.st && !this.isHashed(userData.st)) {
      hashed.st = this.hashValue(userData.st.toLowerCase().trim())
    }

    // Normalize zip code
    if (userData.zp) {
      hashed.zp = userData.zp.toLowerCase().trim().split('-')[0]
    }

    // Normalize country to lowercase 2-letter code
    if (userData.country) {
      hashed.country = userData.country.toLowerCase().trim()
    }

    return hashed
  }

  /**
   * Hash value using SHA256
   */
  private hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex')
  }

  /**
   * Check if value is already hashed (64 character hex string)
   */
  private isHashed(value: string): boolean {
    return /^[a-f0-9]{64}$/i.test(value)
  }

  /**
   * Get conversion event stats for testing
   */
  async getConversionEventStats(
    userId: string,
    pixelId: string,
    testEventCode: string
  ): Promise<{
    test_events: Array<{
      event_time: number
      event_name: string
      match_keys: string[]
      trace_id: string
    }>
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/${pixelId}/test_events`, {
        params: {
          access_token: accessToken,
          test_event_code: testEventCode,
        },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get conversion event stats')
      throw error
    }
  }

  /**
   * Validate conversion event before sending
   */
  validateConversionEvent(event: MetaConversionEvent): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check required fields
    if (!event.event_name) {
      errors.push('event_name is required')
    }

    if (!event.event_time) {
      errors.push('event_time is required')
    }

    if (!event.user_data) {
      errors.push('user_data is required')
    }

    if (!event.action_source) {
      errors.push('action_source is required')
    }

    // Check user_data has at least one identifier
    if (event.user_data) {
      const hasIdentifier =
        event.user_data.em ||
        event.user_data.ph ||
        event.user_data.external_id ||
        event.user_data.fbc ||
        event.user_data.fbp

      if (!hasIdentifier) {
        errors.push('user_data must contain at least one identifier (em, ph, external_id, fbc, or fbp)')
      }
    }

    // Validate event_time is not too old (7 days)
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
    if (event.event_time < sevenDaysAgo) {
      errors.push('event_time is older than 7 days')
    }

    // Validate event_time is not in the future
    if (event.event_time > Math.floor(Date.now() / 1000) + 60) {
      errors.push('event_time is in the future')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Create offline conversion event dataset
   */
  async createOfflineEventSet(
    userId: string,
    businessId: string,
    name: string
  ): Promise<{
    id: string
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.post(
        `/${businessId}/offline_conversion_data_sets`,
        {
          name,
        },
        {
          params: { access_token: accessToken },
        }
      )

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to create offline event set')
      throw error
    }
  }

  /**
   * Upload offline conversions
   */
  async uploadOfflineConversions(
    userId: string,
    offlineEventSetId: string,
    events: MetaConversionEvent[]
  ): Promise<{
    num_received: number
    num_processed: number
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.post(
        `/${offlineEventSetId}/events`,
        {
          data: events,
        },
        {
          params: { access_token: accessToken },
        }
      )

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to upload offline conversions')
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