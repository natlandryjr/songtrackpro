// Meta Marketing API Types and Interfaces

export interface MetaAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  user_id: string
  ad_account_id: string
}

export interface MetaCampaign {
  id: string
  name: string
  objective: CampaignObjective
  status: CampaignStatus
  special_ad_categories?: string[]
  buying_type?: 'AUCTION' | 'RESERVED'
  created_time: string
  updated_time: string
  account_id: string
  budget_remaining?: string
  daily_budget?: string
  lifetime_budget?: string
  start_time?: string
  stop_time?: string
}

export type CampaignObjective =
  | 'APP_INSTALLS'
  | 'BRAND_AWARENESS'
  | 'EVENT_RESPONSES'
  | 'LEAD_GENERATION'
  | 'LINK_CLICKS'
  | 'LOCAL_AWARENESS'
  | 'MESSAGES'
  | 'MOBILE_APP_ENGAGEMENT'
  | 'MOBILE_APP_INSTALLS'
  | 'OFFER_CLAIMS'
  | 'OUTCOME_APP_PROMOTION'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_TRAFFIC'
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'PRODUCT_CATALOG_SALES'
  | 'REACH'
  | 'STORE_VISITS'
  | 'VIDEO_VIEWS'
  | 'CONVERSIONS'

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'

export interface MetaAdSet {
  id: string
  name: string
  campaign_id: string
  status: CampaignStatus
  billing_event: 'APP_INSTALLS' | 'CLICKS' | 'IMPRESSIONS' | 'LINK_CLICKS' | 'NONE' | 'OFFER_CLAIMS' | 'PAGE_LIKES' | 'POST_ENGAGEMENT' | 'VIDEO_VIEWS'
  optimization_goal: string
  bid_amount?: number
  budget_remaining?: string
  daily_budget?: string
  lifetime_budget?: string
  targeting: MetaTargeting
  start_time?: string
  end_time?: string
  created_time: string
  updated_time: string
}

export interface MetaTargeting {
  age_min?: number
  age_max?: number
  genders?: (1 | 2)[] // 1 = male, 2 = female
  geo_locations?: {
    countries?: string[]
    regions?: Array<{ key: string }>
    cities?: Array<{ key: string; radius?: number; distance_unit?: 'mile' | 'kilometer' }>
  }
  interests?: Array<{ id: string; name: string }>
  behaviors?: Array<{ id: string; name: string }>
  custom_audiences?: Array<{ id: string }>
  excluded_custom_audiences?: Array<{ id: string }>
  flexible_spec?: Array<{
    interests?: Array<{ id: string; name: string }>
    behaviors?: Array<{ id: string; name: string }>
  }>
  publisher_platforms?: ('facebook' | 'instagram' | 'messenger' | 'audience_network')[]
  facebook_positions?: string[]
  instagram_positions?: string[]
  device_platforms?: ('mobile' | 'desktop')[]
  locales?: string[]
}

export interface MetaAd {
  id: string
  name: string
  adset_id: string
  status: CampaignStatus
  creative: MetaCreative
  created_time: string
  updated_time: string
  tracking_specs?: MetaTrackingSpec[]
}

export interface MetaCreative {
  id?: string
  name?: string
  object_story_spec?: {
    page_id: string
    link_data?: {
      link: string
      message?: string
      name?: string
      description?: string
      call_to_action?: {
        type: 'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'DOWNLOAD' | 'WATCH_MORE' | 'LISTEN_NOW'
        value?: {
          link?: string
        }
      }
      image_hash?: string
      picture?: string
    }
    video_data?: {
      video_id: string
      message?: string
      call_to_action?: {
        type: string
      }
    }
  }
  degrees_of_freedom_spec?: {
    creative_features_spec?: {
      standard_enhancements?: {
        enroll_status: 'OPT_IN' | 'OPT_OUT'
      }
    }
  }
}

export interface MetaTrackingSpec {
  action_type: string[]
  fb_pixel?: string[]
  application?: string[]
}

export interface MetaCustomAudience {
  id: string
  account_id: string
  name: string
  description?: string
  subtype: 'CUSTOM' | 'LOOKALIKE' | 'WEBSITE' | 'APP' | 'OFFLINE_CONVERSION' | 'ENGAGEMENT' | 'VIDEO' | 'DYNAMIC'
  approximate_count?: number
  data_source?: {
    type: string
    sub_type: string
  }
  delivery_status?: {
    code: number
    description: string
  }
  operation_status?: {
    code: number
    description: string
  }
  lookalike_spec?: {
    type: 'similarity' | 'reach'
    ratio: number
    starting_ratio?: number
    country: string
    origin?: Array<{ id: string; type: string }>
  }
  created_time: string
  updated_time: string
}

export interface MetaInsights {
  impressions: number
  clicks: number
  spend: number
  reach: number
  frequency: number
  ctr: number
  cpc: number
  cpm: number
  cpp: number
  actions?: MetaAction[]
  cost_per_action_type?: MetaCostPerAction[]
  date_start: string
  date_stop: string
}

export interface MetaAction {
  action_type: string
  value: number
}

export interface MetaCostPerAction {
  action_type: string
  value: number
}

export interface MetaConversionEvent {
  event_name: string
  event_time: number
  user_data: {
    em?: string // email (hashed)
    ph?: string // phone (hashed)
    ge?: string // gender
    db?: string // date of birth (YYYYMMDD)
    ln?: string // last name (hashed)
    fn?: string // first name (hashed)
    ct?: string // city (hashed)
    st?: string // state (hashed)
    zp?: string // zip/postal code
    country?: string // country code
    external_id?: string
    client_ip_address?: string
    client_user_agent?: string
    fbc?: string // Facebook click ID
    fbp?: string // Facebook browser ID
  }
  custom_data?: {
    value?: number
    currency?: string
    content_name?: string
    content_category?: string
    content_ids?: string[]
    content_type?: string
    num_items?: number
  }
  action_source: 'email' | 'website' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other'
  event_source_url?: string
  opt_out?: boolean
}

export interface MetaApiError {
  error: {
    message: string
    type: string
    code: number
    error_subcode?: number
    error_user_title?: string
    error_user_msg?: string
    fbtrace_id: string
  }
}

export interface MetaBatchRequest {
  method: 'GET' | 'POST' | 'DELETE'
  relative_url: string
  body?: string
}

export interface MetaBatchResponse {
  code: number
  headers: Array<{ name: string; value: string }>
  body: string
}

export interface RateLimitInfo {
  call_count: number
  total_cputime: number
  total_time: number
  type: 'pages' | 'ads_management'
  app_id_util_pct: number
  estimated_time_to_regain_access?: number
}