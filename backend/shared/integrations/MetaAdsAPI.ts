import axios, { AxiosInstance } from 'axios'
import { AppError } from '../middleware/errorHandler'

export class MetaAdsAPI {
  private client: AxiosInstance
  private accessToken: string
  private apiVersion: string = 'v18.0'

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Ad Accounts
  async getAdAccounts() {
    try {
      const response = await this.client.get('/me/adaccounts', {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,account_status,currency,timezone_name,amount_spent',
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Campaigns
  async getCampaigns(adAccountId: string) {
    try {
      const response = await this.client.get(`/${adAccountId}/campaigns`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,status,objective,spend_cap,daily_budget,lifetime_budget,created_time',
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async createCampaign(adAccountId: string, params: {
    name: string
    objective: string
    status: string
    special_ad_categories?: string[]
  }) {
    try {
      const response = await this.client.post(
        `/${adAccountId}/campaigns`,
        {
          ...params,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async updateCampaign(campaignId: string, params: any) {
    try {
      const response = await this.client.post(
        `/${campaignId}`,
        {
          ...params,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Insights
  async getCampaignInsights(campaignId: string, params: {
    time_range?: { since: string; until: string }
    fields?: string[]
  }) {
    const fields = params.fields || [
      'impressions',
      'clicks',
      'spend',
      'reach',
      'frequency',
      'ctr',
      'cpc',
      'cpm',
      'actions',
      'conversions',
    ]

    try {
      const response = await this.client.get(`/${campaignId}/insights`, {
        params: {
          access_token: this.accessToken,
          fields: fields.join(','),
          ...(params.time_range && { time_range: JSON.stringify(params.time_range) }),
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Custom Audiences
  async getCustomAudiences(adAccountId: string) {
    try {
      const response = await this.client.get(`/${adAccountId}/customaudiences`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,description,approximate_count,subtype,delivery_status',
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async createCustomAudience(adAccountId: string, params: {
    name: string
    subtype: string
    description?: string
    customer_file_source?: string
  }) {
    try {
      const response = await this.client.post(
        `/${adAccountId}/customaudiences`,
        {
          ...params,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async createLookalikeAudience(adAccountId: string, params: {
    name: string
    origin_audience_id: string
    lookalike_spec: {
      country: string
      ratio: number
    }
  }) {
    try {
      const response = await this.client.post(
        `/${adAccountId}/customaudiences`,
        {
          subtype: 'LOOKALIKE',
          ...params,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Conversions API
  async sendConversionEvent(pixelId: string, events: Array<{
    event_name: string
    event_time: number
    user_data: {
      em?: string // email
      ph?: string // phone
      fn?: string // first name
      ln?: string // last name
      ct?: string // city
      st?: string // state
      zp?: string // zip
      country?: string
      external_id?: string
      client_ip_address?: string
      client_user_agent?: string
      fbc?: string // Facebook click ID
      fbp?: string // Facebook browser ID
    }
    custom_data?: {
      currency?: string
      value?: number
      content_name?: string
      content_category?: string
      content_ids?: string[]
      contents?: Array<{ id: string; quantity: number }>
    }
    action_source: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other'
  }>) {
    try {
      const response = await this.client.post(
        `/${pixelId}/events`,
        {
          data: events,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Meta API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }
}