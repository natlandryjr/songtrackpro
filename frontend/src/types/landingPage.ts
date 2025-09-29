// Landing Page Types (Frontend)
// This is a simplified version for the frontend

export interface LandingPage {
  id: string
  user_id: string
  name: string
  slug: string
  custom_domain?: string
  template_id: string
  status: 'draft' | 'published' | 'archived'
  theme: LandingPageTheme
  seo: SEOSettings
  meta_pixel_id?: string
  tracking: TrackingSettings
  ab_test?: ABTest
  content: PageContent
  created_at: string
  updated_at: string
  published_at?: string
  visits: number
  conversions: number
}

export interface LandingPageTheme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    textSecondary: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: 'compact' | 'normal' | 'relaxed'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  animations: boolean
}

export interface SEOSettings {
  title: string
  description: string
  keywords: string[]
  og_image?: string
  og_title?: string
  og_description?: string
  twitter_card?: 'summary' | 'summary_large_image' | 'player'
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  canonical_url?: string
  robots?: 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow'
}

export interface TrackingSettings {
  google_analytics_id?: string
  facebook_pixel_id?: string
  custom_scripts?: {
    header?: string
    footer?: string
  }
  conversion_events: ConversionEvent[]
}

export interface ConversionEvent {
  id: string
  name: string
  type: 'click' | 'form_submit' | 'spotify_play' | 'custom'
  selector?: string
  value?: number
  track_to_meta?: boolean
  track_to_google?: boolean
}

export interface ABTest {
  id: string
  name: string
  status: 'running' | 'paused' | 'completed'
  variants: ABTestVariant[]
  traffic_split: number[]
  winner?: string
  started_at: string
  ended_at?: string
}

export interface ABTestVariant {
  id: string
  name: string
  content: PageContent
  visits: number
  conversions: number
  conversion_rate: number
}

export interface PageContent {
  sections: PageSection[]
  global_styles?: Record<string, any>
}

export interface PageSection {
  id: string
  type: SectionType
  order: number
  visible: boolean
  settings: SectionSettings
  content: SectionContent
  styles?: SectionStyles
}

export type SectionType =
  | 'hero'
  | 'spotify_player'
  | 'text'
  | 'image'
  | 'video'
  | 'cta'
  | 'form'
  | 'social_links'
  | 'countdown'
  | 'testimonials'
  | 'gallery'
  | 'features'
  | 'pricing'
  | 'faq'
  | 'custom_html'

export interface SectionSettings {
  container_width?: 'full' | 'wide' | 'normal' | 'narrow'
  padding?: {
    top: number
    bottom: number
    left: number
    right: number
  }
  background?: {
    type: 'color' | 'gradient' | 'image' | 'video'
    value: string
    overlay?: {
      color: string
      opacity: number
    }
  }
  animation?: {
    type: 'fade' | 'slide' | 'zoom' | 'none'
    duration: number
    delay: number
  }
}

export interface SectionContent {
  [key: string]: any
}

export interface SectionStyles {
  backgroundColor?: string
  textColor?: string
  padding?: string
  margin?: string
  border?: string
  borderRadius?: string
  boxShadow?: string
  custom?: Record<string, any>
}