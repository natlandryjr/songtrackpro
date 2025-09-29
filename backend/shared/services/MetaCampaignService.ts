import axios, { AxiosInstance } from 'axios'
import { MetaCampaign, MetaAdSet, MetaAd, MetaApiError, CampaignObjective, CampaignStatus } from '../types/metaApi'
import { MetaAuthService } from './MetaAuthService'

interface RateLimiter {
  checkLimit(): Promise<boolean>
  recordCall(cpuTime: number, totalTime: number): Promise<void>
}

export class MetaCampaignService {
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

    // Add response interceptor for rate limit tracking
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
   * Create a new campaign
   */
  async createCampaign(
    userId: string,
    adAccountId: string,
    campaign: {
      name: string
      objective: CampaignObjective
      status?: CampaignStatus
      special_ad_categories?: string[]
      buying_type?: 'AUCTION' | 'RESERVED'
      daily_budget?: number
      lifetime_budget?: number
      start_time?: string
      stop_time?: string
    }
  ): Promise<MetaCampaign> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.post(
        `/act_${adAccountId}/campaigns`,
        {
          name: campaign.name,
          objective: campaign.objective,
          status: campaign.status || 'PAUSED',
          special_ad_categories: campaign.special_ad_categories || [],
          buying_type: campaign.buying_type || 'AUCTION',
          ...(campaign.daily_budget && { daily_budget: campaign.daily_budget }),
          ...(campaign.lifetime_budget && { lifetime_budget: campaign.lifetime_budget }),
          ...(campaign.start_time && { start_time: campaign.start_time }),
          ...(campaign.stop_time && { stop_time: campaign.stop_time }),
        },
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getCampaign(userId, response.data.id)
    } catch (error) {
      this.handleApiError(error, 'Failed to create campaign')
      throw error
    }
  }

  /**
   * Get campaign details
   */
  async getCampaign(userId: string, campaignId: string): Promise<MetaCampaign> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'id',
        'name',
        'objective',
        'status',
        'special_ad_categories',
        'buying_type',
        'created_time',
        'updated_time',
        'account_id',
        'budget_remaining',
        'daily_budget',
        'lifetime_budget',
        'start_time',
        'stop_time',
      ].join(',')

      const response = await this.client.get(`/${campaignId}`, {
        params: {
          access_token: accessToken,
          fields,
        },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get campaign')
      throw error
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    userId: string,
    campaignId: string,
    updates: {
      name?: string
      status?: CampaignStatus
      daily_budget?: number
      lifetime_budget?: number
      start_time?: string
      stop_time?: string
    }
  ): Promise<MetaCampaign> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      await this.client.post(
        `/${campaignId}`,
        updates,
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getCampaign(userId, campaignId)
    } catch (error) {
      this.handleApiError(error, 'Failed to update campaign')
      throw error
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(userId: string, campaignId: string): Promise<boolean> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.delete(`/${campaignId}`, {
        params: { access_token: accessToken },
      })

      return response.data.success || false
    } catch (error) {
      this.handleApiError(error, 'Failed to delete campaign')
      throw error
    }
  }

  /**
   * List campaigns for ad account
   */
  async listCampaigns(
    userId: string,
    adAccountId: string,
    options?: {
      limit?: number
      status?: CampaignStatus[]
      after?: string
    }
  ): Promise<{
    data: MetaCampaign[]
    paging?: { cursors: { before: string; after: string }; next?: string }
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'id',
        'name',
        'objective',
        'status',
        'created_time',
        'updated_time',
        'account_id',
        'budget_remaining',
        'daily_budget',
        'lifetime_budget',
      ].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
        limit: options?.limit || 25,
      }

      if (options?.status) {
        params.filtering = JSON.stringify([
          {
            field: 'status',
            operator: 'IN',
            value: options.status,
          },
        ])
      }

      if (options?.after) {
        params.after = options.after
      }

      const response = await this.client.get(`/act_${adAccountId}/campaigns`, {
        params,
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to list campaigns')
      throw error
    }
  }

  /**
   * Create ad set for a campaign
   */
  async createAdSet(
    userId: string,
    adAccountId: string,
    adSet: {
      name: string
      campaign_id: string
      status?: CampaignStatus
      billing_event: 'APP_INSTALLS' | 'CLICKS' | 'IMPRESSIONS' | 'LINK_CLICKS' | 'OFFER_CLAIMS' | 'PAGE_LIKES' | 'POST_ENGAGEMENT' | 'VIDEO_VIEWS'
      optimization_goal: string
      bid_amount?: number
      daily_budget?: number
      lifetime_budget?: number
      targeting: any
      start_time?: string
      end_time?: string
    }
  ): Promise<MetaAdSet> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.post(
        `/act_${adAccountId}/adsets`,
        {
          name: adSet.name,
          campaign_id: adSet.campaign_id,
          status: adSet.status || 'PAUSED',
          billing_event: adSet.billing_event,
          optimization_goal: adSet.optimization_goal,
          ...(adSet.bid_amount && { bid_amount: adSet.bid_amount }),
          ...(adSet.daily_budget && { daily_budget: adSet.daily_budget }),
          ...(adSet.lifetime_budget && { lifetime_budget: adSet.lifetime_budget }),
          targeting: adSet.targeting,
          ...(adSet.start_time && { start_time: adSet.start_time }),
          ...(adSet.end_time && { end_time: adSet.end_time }),
        },
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getAdSet(userId, response.data.id)
    } catch (error) {
      this.handleApiError(error, 'Failed to create ad set')
      throw error
    }
  }

  /**
   * Get ad set details
   */
  async getAdSet(userId: string, adSetId: string): Promise<MetaAdSet> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'id',
        'name',
        'campaign_id',
        'status',
        'billing_event',
        'optimization_goal',
        'bid_amount',
        'budget_remaining',
        'daily_budget',
        'lifetime_budget',
        'targeting',
        'start_time',
        'end_time',
        'created_time',
        'updated_time',
      ].join(',')

      const response = await this.client.get(`/${adSetId}`, {
        params: {
          access_token: accessToken,
          fields,
        },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get ad set')
      throw error
    }
  }

  /**
   * Update ad set
   */
  async updateAdSet(
    userId: string,
    adSetId: string,
    updates: {
      name?: string
      status?: CampaignStatus
      bid_amount?: number
      daily_budget?: number
      lifetime_budget?: number
      targeting?: any
    }
  ): Promise<MetaAdSet> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      await this.client.post(
        `/${adSetId}`,
        updates,
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getAdSet(userId, adSetId)
    } catch (error) {
      this.handleApiError(error, 'Failed to update ad set')
      throw error
    }
  }

  /**
   * List ad sets for campaign
   */
  async listAdSets(
    userId: string,
    campaignId: string,
    options?: {
      limit?: number
      status?: CampaignStatus[]
    }
  ): Promise<{
    data: MetaAdSet[]
    paging?: { cursors: { before: string; after: string } }
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'id',
        'name',
        'campaign_id',
        'status',
        'billing_event',
        'optimization_goal',
        'daily_budget',
        'lifetime_budget',
        'targeting',
      ].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
        limit: options?.limit || 25,
      }

      if (options?.status) {
        params.filtering = JSON.stringify([
          {
            field: 'status',
            operator: 'IN',
            value: options.status,
          },
        ])
      }

      const response = await this.client.get(`/${campaignId}/adsets`, {
        params,
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to list ad sets')
      throw error
    }
  }

  /**
   * Create ad for ad set
   */
  async createAd(
    userId: string,
    adAccountId: string,
    ad: {
      name: string
      adset_id: string
      creative: {
        creative_id?: string
        object_story_spec?: any
      }
      status?: CampaignStatus
      tracking_specs?: any[]
    }
  ): Promise<MetaAd> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.post(
        `/act_${adAccountId}/ads`,
        {
          name: ad.name,
          adset_id: ad.adset_id,
          creative: ad.creative,
          status: ad.status || 'PAUSED',
          ...(ad.tracking_specs && { tracking_specs: ad.tracking_specs }),
        },
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getAd(userId, response.data.id)
    } catch (error) {
      this.handleApiError(error, 'Failed to create ad')
      throw error
    }
  }

  /**
   * Get ad details
   */
  async getAd(userId: string, adId: string): Promise<MetaAd> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = [
        'id',
        'name',
        'adset_id',
        'status',
        'creative',
        'created_time',
        'updated_time',
        'tracking_specs',
      ].join(',')

      const response = await this.client.get(`/${adId}`, {
        params: {
          access_token: accessToken,
          fields,
        },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get ad')
      throw error
    }
  }

  /**
   * Update ad
   */
  async updateAd(
    userId: string,
    adId: string,
    updates: {
      name?: string
      status?: CampaignStatus
      creative?: any
    }
  ): Promise<MetaAd> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      await this.client.post(
        `/${adId}`,
        updates,
        {
          params: { access_token: accessToken },
        }
      )

      return await this.getAd(userId, adId)
    } catch (error) {
      this.handleApiError(error, 'Failed to update ad')
      throw error
    }
  }

  /**
   * List ads for ad set
   */
  async listAds(
    userId: string,
    adSetId: string,
    options?: {
      limit?: number
      status?: CampaignStatus[]
    }
  ): Promise<{
    data: MetaAd[]
    paging?: { cursors: { before: string; after: string } }
  }> {
    await this.rateLimiter.checkLimit()

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const fields = ['id', 'name', 'adset_id', 'status', 'creative', 'created_time'].join(',')

      const params: any = {
        access_token: accessToken,
        fields,
        limit: options?.limit || 25,
      }

      if (options?.status) {
        params.filtering = JSON.stringify([
          {
            field: 'status',
            operator: 'IN',
            value: options.status,
          },
        ])
      }

      const response = await this.client.get(`/${adSetId}/ads`, {
        params,
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to list ads')
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