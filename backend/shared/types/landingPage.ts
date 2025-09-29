// Landing Page Types and Interfaces

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
  traffic_split: number[] // e.g., [50, 50] for 50/50 split
  winner?: string // variant_id
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
  // Hero Section
  hero?: {
    headline: string
    subheadline?: string
    image?: string
    cta_primary?: CTAButton
    cta_secondary?: CTAButton
  }

  // Spotify Player Section
  spotify_player?: {
    uri: string // track, album, or playlist URI
    type: 'track' | 'album' | 'playlist'
    theme: 'dark' | 'light'
    height?: number
    compact?: boolean
  }

  // Text Section
  text?: {
    content: string // HTML or Markdown
    alignment: 'left' | 'center' | 'right'
  }

  // Image Section
  image?: {
    url: string
    alt: string
    caption?: string
    link?: string
  }

  // Video Section
  video?: {
    type: 'youtube' | 'vimeo' | 'url'
    url: string
    thumbnail?: string
    autoplay?: boolean
    controls?: boolean
  }

  // CTA Section
  cta?: {
    headline: string
    description?: string
    buttons: CTAButton[]
  }

  // Form Section
  form?: {
    fields: FormField[]
    submit_button_text: string
    success_message: string
    redirect_url?: string
    webhook_url?: string
  }

  // Social Links Section
  social_links?: {
    title?: string
    links: SocialLink[]
    style: 'icons' | 'buttons' | 'text'
  }

  // Countdown Section
  countdown?: {
    title: string
    end_date: string
    end_message?: string
  }

  // Testimonials Section
  testimonials?: {
    title?: string
    items: Testimonial[]
    layout: 'grid' | 'carousel' | 'list'
  }

  // Gallery Section
  gallery?: {
    title?: string
    images: GalleryImage[]
    columns: number
    lightbox: boolean
  }

  // Features Section
  features?: {
    title?: string
    items: Feature[]
    layout: 'grid' | 'list'
  }

  // Pricing Section
  pricing?: {
    title?: string
    plans: PricingPlan[]
  }

  // FAQ Section
  faq?: {
    title?: string
    items: FAQItem[]
  }

  // Custom HTML Section
  custom_html?: {
    html: string
  }
}

export interface CTAButton {
  text: string
  url: string
  style: 'primary' | 'secondary' | 'outline' | 'ghost'
  icon?: string
  target?: '_self' | '_blank'
  track_event?: string
}

export interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select, radio
  validation?: {
    pattern?: string
    min?: number
    max?: number
    message?: string
  }
}

export interface SocialLink {
  platform: 'spotify' | 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'soundcloud' | 'apple_music' | 'website'
  url: string
  label?: string
}

export interface Testimonial {
  id: string
  name: string
  role?: string
  avatar?: string
  content: string
  rating?: number
}

export interface GalleryImage {
  id: string
  url: string
  thumbnail?: string
  alt: string
  caption?: string
}

export interface Feature {
  id: string
  icon?: string
  title: string
  description: string
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  billing_period: 'one-time' | 'monthly' | 'yearly'
  features: string[]
  highlighted?: boolean
  cta: CTAButton
}

export interface FAQItem {
  id: string
  question: string
  answer: string
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

export interface LandingPageTemplate {
  id: string
  name: string
  description: string
  category: 'music_release' | 'artist_promo' | 'event' | 'merch' | 'custom'
  thumbnail: string
  preview_url?: string
  theme: LandingPageTheme
  content: PageContent
  is_premium: boolean
  created_at: string
}

export interface LandingPageAnalytics {
  page_id: string
  date: string
  visits: number
  unique_visitors: number
  conversions: number
  conversion_rate: number
  bounce_rate: number
  avg_time_on_page: number
  traffic_sources: TrafficSource[]
  device_breakdown: DeviceBreakdown
  geo_data: GeoData[]
  section_interactions: SectionInteraction[]
}

export interface TrafficSource {
  source: string
  visits: number
  conversions: number
  percentage: number
}

export interface DeviceBreakdown {
  desktop: number
  mobile: number
  tablet: number
}

export interface GeoData {
  country: string
  country_code: string
  visits: number
  conversions: number
}

export interface SectionInteraction {
  section_id: string
  section_type: SectionType
  views: number
  clicks: number
  engagement_rate: number
}

export interface PageVisit {
  id: string
  page_id: string
  variant_id?: string // For A/B testing
  visitor_id: string
  session_id: string
  timestamp: string
  user_agent: string
  ip_address: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  os: string
  browser: string
  country?: string
  city?: string
  time_on_page?: number
  converted: boolean
  conversion_value?: number
}

export interface PageBuilder {
  page: LandingPage
  history: PageBuilderHistory[]
  current_step: number
}

export interface PageBuilderHistory {
  timestamp: string
  action: 'add_section' | 'remove_section' | 'update_section' | 'reorder_sections' | 'update_theme' | 'update_seo'
  data: any
}

export interface DragDropContext {
  dragging: boolean
  draggedSection?: PageSection
  draggedIndex?: number
  dropTargetIndex?: number
}