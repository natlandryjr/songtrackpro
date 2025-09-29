export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface MetaAccount {
  id: string
  accountId: string
  accountName: string
  connected: boolean
  lastSync: string
}

export interface SpotifyAccount {
  id: string
  spotifyId: string
  displayName: string
  connected: boolean
  lastSync: string
}

export interface Campaign {
  id: string
  name: string
  metaAdId?: string
  spotifyTrackId?: string
  startDate: string
  endDate?: string
  budget: number
  spend: number
  streams: number
  status: 'active' | 'paused' | 'completed'
}

export interface MetricData {
  date: string
  value: number
}

export interface AnalyticsData {
  impressions: MetricData[]
  clicks: MetricData[]
  streams: MetricData[]
  conversions: MetricData[]
}