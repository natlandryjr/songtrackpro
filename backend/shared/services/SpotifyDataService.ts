import axios, { AxiosInstance } from 'axios'
import {
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyAudioFeatures,
  SpotifyTopTracks,
  SpotifyArtistInsights,
  SpotifyApiError,
  SpotifyTimeRange,
  SpotifyPagingObject,
  SpotifyArtistAlbums,
  SpotifyFollowedArtists,
  SpotifyUser,
} from '../types/spotifyApi'
import { SpotifyAuthService } from './SpotifyAuthService'

interface RateLimiter {
  checkLimit(accountId?: string): Promise<boolean>
  recordCall(cpuTime: number, totalTime: number, accountId?: string): Promise<void>
}

interface CacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
}

export class SpotifyDataService {
  private baseUrl = 'https://api.spotify.com/v1'
  private client: AxiosInstance
  private authService: SpotifyAuthService
  private rateLimiter?: RateLimiter
  private cache?: CacheService

  constructor(
    authService: SpotifyAuthService,
    rateLimiter?: RateLimiter,
    cache?: CacheService
  ) {
    this.authService = authService
    this.rateLimiter = rateLimiter
    this.cache = cache

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<SpotifyUser> {
    const cacheKey = `spotify:user:${userId}:profile`
    const cached = await this.getFromCache<SpotifyUser>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const user: SpotifyUser = response.data
      await this.setInCache(cacheKey, user, 300) // Cache for 5 minutes

      return user
    } catch (error) {
      this.handleApiError(error, 'Failed to get current user')
      throw error
    }
  }

  /**
   * Get track by ID
   */
  async getTrack(userId: string, trackId: string): Promise<SpotifyTrack> {
    const cacheKey = `spotify:track:${trackId}`
    const cached = await this.getFromCache<SpotifyTrack>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const track: SpotifyTrack = response.data
      await this.setInCache(cacheKey, track, 3600) // Cache for 1 hour

      return track
    } catch (error) {
      this.handleApiError(error, 'Failed to get track')
      throw error
    }
  }

  /**
   * Get multiple tracks by IDs
   */
  async getTracks(userId: string, trackIds: string[]): Promise<SpotifyTrack[]> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/tracks', {
        params: { ids: trackIds.join(',') },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data.tracks
    } catch (error) {
      this.handleApiError(error, 'Failed to get tracks')
      throw error
    }
  }

  /**
   * Get artist by ID
   */
  async getArtist(userId: string, artistId: string): Promise<SpotifyArtist> {
    const cacheKey = `spotify:artist:${artistId}`
    const cached = await this.getFromCache<SpotifyArtist>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const artist: SpotifyArtist = response.data
      await this.setInCache(cacheKey, artist, 3600) // Cache for 1 hour

      return artist
    } catch (error) {
      this.handleApiError(error, 'Failed to get artist')
      throw error
    }
  }

  /**
   * Get multiple artists by IDs
   */
  async getArtists(userId: string, artistIds: string[]): Promise<SpotifyArtist[]> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/artists', {
        params: { ids: artistIds.join(',') },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data.artists
    } catch (error) {
      this.handleApiError(error, 'Failed to get artists')
      throw error
    }
  }

  /**
   * Get artist's top tracks
   */
  async getArtistTopTracks(
    userId: string,
    artistId: string,
    market: string = 'US'
  ): Promise<SpotifyTrack[]> {
    const cacheKey = `spotify:artist:${artistId}:top-tracks:${market}`
    const cached = await this.getFromCache<SpotifyTrack[]>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/artists/${artistId}/top-tracks`, {
        params: { market },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const tracks: SpotifyTrack[] = response.data.tracks
      await this.setInCache(cacheKey, tracks, 3600) // Cache for 1 hour

      return tracks
    } catch (error) {
      this.handleApiError(error, 'Failed to get artist top tracks')
      throw error
    }
  }

  /**
   * Get artist's albums
   */
  async getArtistAlbums(
    userId: string,
    artistId: string,
    options?: {
      include_groups?: string[]
      market?: string
      limit?: number
      offset?: number
    }
  ): Promise<SpotifyArtistAlbums> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      }

      if (options?.include_groups) {
        params.include_groups = options.include_groups.join(',')
      }

      if (options?.market) {
        params.market = options.market
      }

      const response = await this.client.get(`/artists/${artistId}/albums`, {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get artist albums')
      throw error
    }
  }

  /**
   * Get related artists
   */
  async getRelatedArtists(userId: string, artistId: string): Promise<SpotifyArtist[]> {
    const cacheKey = `spotify:artist:${artistId}:related`
    const cached = await this.getFromCache<SpotifyArtist[]>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/artists/${artistId}/related-artists`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const artists: SpotifyArtist[] = response.data.artists
      await this.setInCache(cacheKey, artists, 3600) // Cache for 1 hour

      return artists
    } catch (error) {
      this.handleApiError(error, 'Failed to get related artists')
      throw error
    }
  }

  /**
   * Get comprehensive artist insights
   */
  async getArtistInsights(
    userId: string,
    artistId: string,
    market: string = 'US'
  ): Promise<SpotifyArtistInsights> {
    const [artist, topTracks, relatedArtists, albums, appearsOn] = await Promise.all([
      this.getArtist(userId, artistId),
      this.getArtistTopTracks(userId, artistId, market),
      this.getRelatedArtists(userId, artistId),
      this.getArtistAlbums(userId, artistId, {
        include_groups: ['album', 'single'],
        limit: 10,
      }),
      this.getArtistAlbums(userId, artistId, {
        include_groups: ['appears_on'],
        limit: 10,
      }),
    ])

    return {
      artist,
      topTracks,
      relatedArtists,
      albums: albums.items,
      appearsOn: appearsOn.items,
    }
  }

  /**
   * Get album by ID
   */
  async getAlbum(userId: string, albumId: string): Promise<SpotifyAlbum> {
    const cacheKey = `spotify:album:${albumId}`
    const cached = await this.getFromCache<SpotifyAlbum>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/albums/${albumId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const album: SpotifyAlbum = response.data
      await this.setInCache(cacheKey, album, 3600) // Cache for 1 hour

      return album
    } catch (error) {
      this.handleApiError(error, 'Failed to get album')
      throw error
    }
  }

  /**
   * Get album tracks
   */
  async getAlbumTracks(
    userId: string,
    albumId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<SpotifyPagingObject<SpotifyTrack>> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/albums/${albumId}/tracks`, {
        params: {
          limit: options?.limit || 50,
          offset: options?.offset || 0,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get album tracks')
      throw error
    }
  }

  /**
   * Get audio features for a track
   */
  async getAudioFeatures(userId: string, trackId: string): Promise<SpotifyAudioFeatures> {
    const cacheKey = `spotify:track:${trackId}:audio-features`
    const cached = await this.getFromCache<SpotifyAudioFeatures>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/audio-features/${trackId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const features: SpotifyAudioFeatures = response.data
      await this.setInCache(cacheKey, features, 86400) // Cache for 24 hours

      return features
    } catch (error) {
      this.handleApiError(error, 'Failed to get audio features')
      throw error
    }
  }

  /**
   * Get audio features for multiple tracks
   */
  async getMultipleAudioFeatures(
    userId: string,
    trackIds: string[]
  ): Promise<SpotifyAudioFeatures[]> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/audio-features', {
        params: { ids: trackIds.join(',') },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data.audio_features
    } catch (error) {
      this.handleApiError(error, 'Failed to get multiple audio features')
      throw error
    }
  }

  /**
   * Get user's top tracks
   */
  async getUserTopTracks(
    userId: string,
    options?: {
      time_range?: SpotifyTimeRange
      limit?: number
      offset?: number
    }
  ): Promise<SpotifyPagingObject<SpotifyTrack>> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/me/top/tracks', {
        params: {
          time_range: options?.time_range || 'medium_term',
          limit: options?.limit || 20,
          offset: options?.offset || 0,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get user top tracks')
      throw error
    }
  }

  /**
   * Get user's top artists
   */
  async getUserTopArtists(
    userId: string,
    options?: {
      time_range?: SpotifyTimeRange
      limit?: number
      offset?: number
    }
  ): Promise<SpotifyPagingObject<SpotifyArtist>> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/me/top/artists', {
        params: {
          time_range: options?.time_range || 'medium_term',
          limit: options?.limit || 20,
          offset: options?.offset || 0,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get user top artists')
      throw error
    }
  }

  /**
   * Get user's recently played tracks
   */
  async getRecentlyPlayed(
    userId: string,
    options?: {
      limit?: number
      after?: number
      before?: number
    }
  ): Promise<{
    items: Array<{
      track: SpotifyTrack
      played_at: string
      context: any
    }>
    next: string | null
    cursors: {
      after: string
      before: string
    }
  }> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        limit: options?.limit || 50,
      }

      if (options?.after) params.after = options.after
      if (options?.before) params.before = options.before

      const response = await this.client.get('/me/player/recently-played', {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get recently played tracks')
      throw error
    }
  }

  /**
   * Get user's followed artists
   */
  async getFollowedArtists(
    userId: string,
    options?: {
      limit?: number
      after?: string
    }
  ): Promise<SpotifyFollowedArtists> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        type: 'artist',
        limit: options?.limit || 20,
      }

      if (options?.after) params.after = options.after

      const response = await this.client.get('/me/following', {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get followed artists')
      throw error
    }
  }

  /**
   * Check if user follows artists
   */
  async checkFollowingArtists(userId: string, artistIds: string[]): Promise<boolean[]> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/me/following/contains', {
        params: {
          type: 'artist',
          ids: artistIds.join(','),
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to check following artists')
      throw error
    }
  }

  /**
   * Get user's saved tracks
   */
  async getSavedTracks(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    }
  ): Promise<SpotifyPagingObject<{ added_at: string; track: SpotifyTrack }>> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      }

      if (options?.market) params.market = options.market

      const response = await this.client.get('/me/tracks', {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get saved tracks')
      throw error
    }
  }

  /**
   * Cache helper methods
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.cache) return null
    try {
      return await this.cache.get<T>(key)
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  private async setInCache<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.cache) return
    try {
      await this.cache.set(key, value, ttlSeconds)
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  /**
   * Handle API errors with proper typing
   */
  private handleApiError(error: any, context: string): void {
    if (axios.isAxiosError(error) && error.response?.data) {
      const spotifyError = error.response.data as SpotifyApiError
      console.error(`${context}:`, {
        status: spotifyError.error.status,
        message: spotifyError.error.message,
      })
    } else {
      console.error(`${context}:`, error)
    }
  }
}