export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface RefreshToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface MetaAdAccount {
  id: string
  userId: string
  accountId: string
  accountName: string
  accessToken: string
  connected: boolean
  lastSync: Date
}

export interface SpotifyAccount {
  id: string
  userId: string
  spotifyId: string
  displayName: string
  accessToken: string
  refreshToken: string
  connected: boolean
  lastSync: Date
}

export interface Campaign {
  id: string
  userId: string
  name: string
  metaAdAccountId?: string
  spotifyAccountId?: string
  metaAdId?: string
  spotifyTrackId?: string
  startDate: Date
  endDate?: Date
  budget: number
  status: 'active' | 'paused' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface MetricSnapshot {
  campaignId: string
  date: Date
  impressions: number
  clicks: number
  spend: number
  streams: number
  conversions: number
}