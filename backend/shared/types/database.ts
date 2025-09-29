// ============================================================================
// PostgreSQL Types (Relational Data)
// ============================================================================

export enum UserRole {
  ARTIST = 'artist',
  LABEL = 'label',
  AGENCY = 'agency',
  ADMIN = 'admin',
}

export enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum IntegrationProvider {
  META = 'meta',
  SPOTIFY = 'spotify',
}

export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  EXPIRED = 'expired',
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: UserRole
  organizationId?: string
  avatar?: string
  emailVerified: boolean
  onboardingCompleted: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  type: UserRole
  website?: string
  logo?: string
  ownerId: string
  subscriptionId?: string
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: string[]
  invitedBy?: string
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}

// Subscription & Billing
export interface Subscription {
  id: string
  organizationId: string
  stripeCustomerId: string
  stripeSubscriptionId?: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEndsAt?: Date
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  organizationId: string
  subscriptionId: string
  stripeInvoiceId: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  paidAt?: Date
  dueDate: Date
  invoiceUrl?: string
  invoicePdf?: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface PaymentMethod {
  id: string
  organizationId: string
  stripePaymentMethodId: string
  type: 'card' | 'bank_account'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Songs/Tracks
export interface Track {
  id: string
  organizationId: string
  title: string
  artist: string
  album?: string
  releaseDate?: Date
  duration?: number
  isrc?: string
  spotifyId?: string
  spotifyUri?: string
  appleId?: string
  coverArtUrl?: string
  genres: string[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Campaigns
export interface Campaign {
  id: string
  organizationId: string
  name: string
  description?: string
  trackId?: string
  status: CampaignStatus
  objective: string
  budget: number
  budgetSpent: number
  currency: string
  startDate: Date
  endDate?: Date
  metaAdAccountId?: string
  metaCampaignId?: string
  targetAudience: Record<string, any>
  creativeAssets: Record<string, any>
  settings: Record<string, any>
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CampaignGoal {
  id: string
  campaignId: string
  type: 'streams' | 'followers' | 'engagement' | 'conversions' | 'reach'
  target: number
  current: number
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

// Audiences
export interface Audience {
  id: string
  organizationId: string
  name: string
  description?: string
  size?: number
  criteria: Record<string, any>
  metaAudienceId?: string
  isCustom: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface AudienceInsight {
  id: string
  audienceId: string
  date: Date
  demographics: Record<string, any>
  interests: Record<string, any>
  behaviors: Record<string, any>
  locations: Record<string, any>
  createdAt: Date
}

// Integrations
export interface Integration {
  id: string
  organizationId: string
  provider: IntegrationProvider
  status: IntegrationStatus
  accountId: string
  accountName: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
  scopes: string[]
  metadata: Record<string, any>
  lastSyncAt?: Date
  lastErrorAt?: Date
  lastError?: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiKey {
  id: string
  organizationId: string
  name: string
  key: string
  keyHash: string
  permissions: string[]
  lastUsedAt?: Date
  expiresAt?: Date
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Notifications
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  readAt?: Date
  createdAt: Date
}

// Refresh Tokens (Auth)
export interface RefreshToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

// ============================================================================
// MongoDB Types (Analytics & Time-Series Data)
// ============================================================================

// Campaign Analytics
export interface CampaignMetrics {
  _id?: string
  campaignId: string
  organizationId: string
  date: Date
  impressions: number
  clicks: number
  ctr: number
  spend: number
  cpc: number
  cpm: number
  conversions: number
  conversionRate: number
  reach: number
  frequency: number
  engagement: number
  videoViews?: number
  metadata: Record<string, any>
  createdAt: Date
}

// Spotify Analytics
export interface SpotifyMetrics {
  _id?: string
  trackId: string
  campaignId?: string
  organizationId: string
  date: Date
  streams: number
  listeners: number
  saves: number
  skipRate: number
  completionRate: number
  playlists: number
  demographics: {
    age: Record<string, number>
    gender: Record<string, number>
    country: Record<string, number>
  }
  metadata: Record<string, any>
  createdAt: Date
}

// Meta Ads Analytics
export interface MetaAdMetrics {
  _id?: string
  campaignId: string
  adSetId?: string
  adId?: string
  organizationId: string
  date: Date
  impressions: number
  clicks: number
  spend: number
  conversions: number
  reach: number
  frequency: number
  ctr: number
  cpc: number
  cpm: number
  cpa: number
  roas?: number
  placement: string
  demographics: Record<string, any>
  metadata: Record<string, any>
  createdAt: Date
}

// User Activity Events
export interface ActivityEvent {
  _id?: string
  userId: string
  organizationId: string
  type: 'login' | 'campaign_created' | 'campaign_updated' | 'integration_connected' | 'report_generated' | 'custom'
  action: string
  resource?: {
    type: string
    id: string
    name?: string
  }
  metadata: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// System Analytics Events
export interface SystemEvent {
  _id?: string
  type: 'api_call' | 'sync' | 'webhook' | 'error' | 'warning'
  service: string
  action: string
  status: 'success' | 'error' | 'warning'
  duration?: number
  errorMessage?: string
  errorStack?: string
  metadata: Record<string, any>
  timestamp: Date
}

// Real-time Streaming Data
export interface StreamingEvent {
  _id?: string
  trackId: string
  userId?: string
  sessionId: string
  platform: 'spotify' | 'apple' | 'youtube' | 'other'
  eventType: 'play' | 'skip' | 'complete' | 'save' | 'share'
  duration?: number
  position?: number
  location?: {
    country: string
    city?: string
    lat?: number
    lon?: number
  }
  device: {
    type: string
    os?: string
    browser?: string
  }
  metadata: Record<string, any>
  timestamp: Date
}

// Aggregated Campaign Reports
export interface CampaignReport {
  _id?: string
  campaignId: string
  organizationId: string
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalSpend: number
    totalImpressions: number
    totalClicks: number
    totalStreams: number
    totalConversions: number
    avgCtr: number
    avgCpc: number
    avgCpm: number
    roi: number
  }
  performance: {
    daily: Array<{
      date: Date
      spend: number
      impressions: number
      clicks: number
      streams: number
    }>
  }
  topLocations: Array<{
    country: string
    impressions: number
    conversions: number
  }>
  topDemographics: {
    age: Record<string, number>
    gender: Record<string, number>
  }
  metadata: Record<string, any>
  generatedAt: Date
  createdAt: Date
}

// API Usage Tracking
export interface ApiUsage {
  _id?: string
  organizationId: string
  apiKeyId?: string
  endpoint: string
  method: string
  statusCode: number
  duration: number
  requestSize: number
  responseSize: number
  ipAddress: string
  userAgent?: string
  timestamp: Date
}

// Webhook Logs
export interface WebhookLog {
  _id?: string
  organizationId: string
  webhookId: string
  event: string
  payload: Record<string, any>
  status: 'pending' | 'success' | 'failed' | 'retrying'
  attempts: number
  lastAttemptAt?: Date
  responseStatus?: number
  responseBody?: string
  errorMessage?: string
  timestamp: Date
}