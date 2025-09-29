import axios, { AxiosInstance } from 'axios'
import { MetaInsights, MetaApiError } from '../types/metaApi'
import { MetaAuthService } from './MetaAuthService'

interface RateLimiter {
  checkLimit(): Promise<boolean>
  recordCall(cpuTime: number, totalTime: number): Promise<void>
}

export class MetaInsightsService {
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
   * Get campaign insights
   */
  async getCampaignInsights(
    userId: string,
    campaignId: string,
    options?: {
      date_preset?: 'today' | 'yesterday' | 'last_7d' | 'last_14d' | 'last_28d' | 'last_30d' | 'last_90d' | 'lifetime'
      time_range?: { since: string; until: string }
      level?: 'campaign' | 'adset' | 'ad'
      breakdowns?: string[]
      time_increment?: number | 'all_days' | 'monthly'
    }
  ): Promise<MetaInsights[]> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'impressions',
        'clicks',
        'spend',
        'reach',
        'frequency',
        'ctr',
        'cpc',
        'cpm',
        'cpp',
        'actions',
        'cost_per_action_type',
        'date_start',
        'date_stop',
      ].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
        level: options?.level || 'campaign',
      }

      if (options?.date_preset) {
        params.date_preset = options.date_preset
      } else if (options?.time_range) {
        params.time_range = JSON.stringify(options.time_range)
      } else {
        params.date_preset = 'last_30d'
      }

      if (options?.breakdowns) {
        params.breakdowns = options.breakdowns.join(',')
      }

      if (options?.time_increment) {
        params.time_increment = options.time_increment
      }

      const response = await this.client.get(`/${campaignId}/insights`, {
        params,
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get campaign insights')
      throw error
    }
  }

  /**
   * Get ad set insights
   */
  async getAdSetInsights(
    userId: string,
    adSetId: string,
    options?: {
      date_preset?: string
      time_range?: { since: string; until: string }
      breakdowns?: string[]
    }
  ): Promise<MetaInsights[]> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'impressions',
        'clicks',
        'spend',
        'reach',
        'frequency',
        'ctr',
        'cpc',
        'cpm',
        'cpp',
        'actions',
        'cost_per_action_type',
        'date_start',
        'date_stop',
      ].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
      }

      if (options?.date_preset) {
        params.date_preset = options.date_preset
      } else if (options?.time_range) {
        params.time_range = JSON.stringify(options.time_range)
      } else {
        params.date_preset = 'last_30d'
      }

      if (options?.breakdowns) {
        params.breakdowns = options.breakdowns.join(',')
      }

      const response = await this.client.get(`/${adSetId}/insights`, {
        params,
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get ad set insights')
      throw error
    }
  }

  /**
   * Get ad insights
   */
  async getAdInsights(
    userId: string,
    adId: string,
    options?: {
      date_preset?: string
      time_range?: { since: string; until: string }
      breakdowns?: string[]
    }
  ): Promise<MetaInsights[]> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'impressions',
        'clicks',
        'spend',
        'reach',
        'frequency',
        'ctr',
        'cpc',
        'cpm',
        'cpp',
        'actions',
        'cost_per_action_type',
        'date_start',
        'date_stop',
      ].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
      }

      if (options?.date_preset) {
        params.date_preset = options.date_preset
      } else if (options?.time_range) {
        params.time_range = JSON.stringify(options.time_range)
      } else {
        params.date_preset = 'last_30d'
      }

      if (options?.breakdowns) {
        params.breakdowns = options.breakdowns.join(',')
      }

      const response = await this.client.get(`/${adId}/insights`, {
        params,
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get ad insights')
      throw error
    }
  }

  /**
   * Get ad account insights with aggregation
   */
  async getAdAccountInsights(
    userId: string,
    adAccountId: string,
    options?: {
      date_preset?: string
      time_range?: { since: string; until: string }
      level?: 'account' | 'campaign' | 'adset' | 'ad'
      breakdowns?: string[]
      time_increment?: number | 'all_days' | 'monthly'
      filtering?: any[]
      limit?: number
    }
  ): Promise<{
    data: MetaInsights[]
    paging?: { cursors: { before: string; after: string }; next?: string }
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'campaign_id',
        'campaign_name',
        'adset_id',
        'adset_name',
        'ad_id',
        'ad_name',
        'impressions',
        'clicks',
        'spend',
        'reach',
        'frequency',
        'ctr',
        'cpc',
        'cpm',
        'cpp',
        'actions',
        'cost_per_action_type',
        'conversions',
        'conversion_values',
        'date_start',
        'date_stop',
      ].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
        level: options?.level || 'campaign',
        limit: options?.limit || 100,
      }

      if (options?.date_preset) {
        params.date_preset = options.date_preset
      } else if (options?.time_range) {
        params.time_range = JSON.stringify(options.time_range)
      } else {
        params.date_preset = 'last_30d'
      }

      if (options?.breakdowns) {
        params.breakdowns = options.breakdowns.join(',')
      }

      if (options?.time_increment) {
        params.time_increment = options.time_increment
      }

      if (options?.filtering) {
        params.filtering = JSON.stringify(options.filtering)
      }

      const response = await this.client.get(`/act_${adAccountId}/insights`, {
        params,
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get ad account insights')
      throw error
    }
  }

  /**
   * Get insights with demographic breakdowns
   */
  async getDemographicInsights(
    userId: string,
    objectId: string,
    objectType: 'campaign' | 'adset' | 'ad',
    options?: {
      date_preset?: string
      time_range?: { since: string; until: string }
    }
  ): Promise<{
    age: MetaInsights[]
    gender: MetaInsights[]
    country: MetaInsights[]
  }> {
    const [ageData, genderData, countryData] = await Promise.all([
      this.getInsightsWithBreakdown(userId, objectId, objectType, ['age'], options),
      this.getInsightsWithBreakdown(userId, objectId, objectType, ['gender'], options),
      this.getInsightsWithBreakdown(userId, objectId, objectType, ['country'], options),
    ])

    return {
      age: ageData,
      gender: genderData,
      country: countryData,
    }
  }

  /**
   * Get insights with custom breakdown
   */
  async getInsightsWithBreakdown(
    userId: string,
    objectId: string,
    objectType: 'campaign' | 'adset' | 'ad',
    breakdowns: string[],
    options?: {
      date_preset?: string
      time_range?: { since: string; until: string }
    }
  ): Promise<MetaInsights[]> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'impressions',
        'clicks',
        'spend',
        'reach',
        'ctr',
        'cpc',
        'cpm',
        'actions',
        'cost_per_action_type',
        'date_start',
        'date_stop',
      ].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
        breakdowns: breakdowns.join(','),
      }

      if (options?.date_preset) {
        params.date_preset = options.date_preset
      } else if (options?.time_range) {
        params.time_range = JSON.stringify(options.time_range)
      } else {
        params.date_preset = 'last_30d'
      }

      const response = await this.client.get(`/${objectId}/insights`, {
        params,
      })

      return response.data.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get insights with breakdown')
      throw error
    }
  }

  /**
   * Get real-time delivery insights
   */
  async getDeliveryInsights(
    userId: string,
    objectId: string,
    objectType: 'campaign' | 'adset' | 'ad'
  ): Promise<{
    status: string
    delivery_status: string
    issues_info?: Array<{
      error_code: string
      error_message: string
      error_summary: string
      level: string
    }>
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = ['delivery_info', 'issues_info'].join(',')

      const response = await this.client.get(`/${objectId}`, {
        params: {
          access_token: accessToken,
          fields,
        },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get delivery insights')
      throw error
    }
  }

  /**
   * Get conversion insights by conversion event
   */
  async getConversionInsights(
    userId: string,
    campaignId: string,
    conversionEvents: string[],
    options?: {
      date_preset?: string
      time_range?: { since: string; until: string }
    }
  ): Promise<Array<{
    action_type: string
    value: number
    cost_per_action: number
    date_start: string
    date_stop: string
  }>> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        access_token: accessToken,
        fields: 'actions,cost_per_action_type,date_start,date_stop',
        action_attribution_windows: ['7d_click', '1d_view'],
      }

      if (options?.date_preset) {
        params.date_preset = options.date_preset
      } else if (options?.time_range) {
        params.time_range = JSON.stringify(options.time_range)
      } else {
        params.date_preset = 'last_30d'
      }

      const response = await this.client.get(`/${campaignId}/insights`, {
        params,
      })

      const insights = response.data.data[0]
      if (!insights || !insights.actions) {
        return []
      }

      return insights.actions
        .filter((action: any) => conversionEvents.includes(action.action_type))
        .map((action: any) => {
          const costPerAction = insights.cost_per_action_type?.find(
            (cpa: any) => cpa.action_type === action.action_type
          )

          return {
            action_type: action.action_type,
            value: parseFloat(action.value),
            cost_per_action: costPerAction ? parseFloat(costPerAction.value) : 0,
            date_start: insights.date_start,
            date_stop: insights.date_stop,
          }
        })
    } catch (error) {
      this.handleApiError(error, 'Failed to get conversion insights')
      throw error
    }
  }

  /**
   * Calculate aggregated metrics from multiple insights
   */
  aggregateInsights(insights: MetaInsights[]): MetaInsights {
    const aggregated: MetaInsights = {
      impressions: 0,
      clicks: 0,
      spend: 0,
      reach: 0,
      frequency: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      cpp: 0,
      date_start: insights[0]?.date_start || '',
      date_stop: insights[insights.length - 1]?.date_stop || '',
    }

    for (const insight of insights) {
      aggregated.impressions += insight.impressions
      aggregated.clicks += insight.clicks
      aggregated.spend += insight.spend
      aggregated.reach += insight.reach
    }

    // Calculate averages and ratios
    aggregated.ctr = (aggregated.clicks / aggregated.impressions) * 100
    aggregated.cpc = aggregated.spend / aggregated.clicks
    aggregated.cpm = (aggregated.spend / aggregated.impressions) * 1000
    aggregated.cpp = aggregated.spend / aggregated.reach
    aggregated.frequency = aggregated.impressions / aggregated.reach

    return aggregated
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