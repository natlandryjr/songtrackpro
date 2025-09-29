import axios, { AxiosInstance } from 'axios'
import {
  SpotifyPlaylist,
  SpotifyPlaylistTrack,
  SpotifyApiError,
  SpotifyPagingObject,
  SpotifyCategory,
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

export class SpotifyPlaylistService {
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
   * Get playlist by ID
   */
  async getPlaylist(userId: string, playlistId: string): Promise<SpotifyPlaylist> {
    const cacheKey = `spotify:playlist:${playlistId}`
    const cached = await this.getFromCache<SpotifyPlaylist>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const playlist: SpotifyPlaylist = response.data
      await this.setInCache(cacheKey, playlist, 1800) // Cache for 30 minutes

      return playlist
    } catch (error) {
      this.handleApiError(error, 'Failed to get playlist')
      throw error
    }
  }

  /**
   * Get playlist tracks
   */
  async getPlaylistTracks(
    userId: string,
    playlistId: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    }
  ): Promise<SpotifyPagingObject<SpotifyPlaylistTrack>> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
      }

      if (options?.market) params.market = options.market

      const response = await this.client.get(`/playlists/${playlistId}/tracks`, {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get playlist tracks')
      throw error
    }
  }

  /**
   * Get all tracks from a playlist (handles pagination)
   */
  async getAllPlaylistTracks(
    userId: string,
    playlistId: string,
    market?: string
  ): Promise<SpotifyPlaylistTrack[]> {
    const allTracks: SpotifyPlaylistTrack[] = []
    let offset = 0
    const limit = 100

    while (true) {
      const page = await this.getPlaylistTracks(userId, playlistId, {
        limit,
        offset,
        market,
      })

      allTracks.push(...page.items)

      if (!page.next) break
      offset += limit
    }

    return allTracks
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<SpotifyPagingObject<SpotifyPlaylist>> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/me/playlists', {
        params: {
          limit: options?.limit || 50,
          offset: options?.offset || 0,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get user playlists')
      throw error
    }
  }

  /**
   * Create a playlist
   */
  async createPlaylist(
    userId: string,
    name: string,
    options?: {
      description?: string
      public?: boolean
      collaborative?: boolean
    }
  ): Promise<SpotifyPlaylist> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      // Get user profile to get user ID
      const userResponse = await this.client.get('/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const spotifyUserId = userResponse.data.id

      const response = await this.client.post(
        `/users/${spotifyUserId}/playlists`,
        {
          name,
          description: options?.description || '',
          public: options?.public !== undefined ? options.public : true,
          collaborative: options?.collaborative || false,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to create playlist')
      throw error
    }
  }

  /**
   * Update playlist details
   */
  async updatePlaylist(
    userId: string,
    playlistId: string,
    updates: {
      name?: string
      description?: string
      public?: boolean
      collaborative?: boolean
    }
  ): Promise<void> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      await this.client.put(`/playlists/${playlistId}`, updates, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      // Invalidate cache
      await this.deleteFromCache(`spotify:playlist:${playlistId}`)
    } catch (error) {
      this.handleApiError(error, 'Failed to update playlist')
      throw error
    }
  }

  /**
   * Add tracks to playlist
   */
  async addTracksToPlaylist(
    userId: string,
    playlistId: string,
    trackUris: string[],
    position?: number
  ): Promise<{ snapshot_id: string }> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const body: any = { uris: trackUris }
      if (position !== undefined) body.position = position

      const response = await this.client.post(`/playlists/${playlistId}/tracks`, body, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      // Invalidate cache
      await this.deleteFromCache(`spotify:playlist:${playlistId}`)

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to add tracks to playlist')
      throw error
    }
  }

  /**
   * Remove tracks from playlist
   */
  async removeTracksFromPlaylist(
    userId: string,
    playlistId: string,
    tracks: Array<{ uri: string; positions?: number[] }>
  ): Promise<{ snapshot_id: string }> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.delete(`/playlists/${playlistId}/tracks`, {
        data: { tracks },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      // Invalidate cache
      await this.deleteFromCache(`spotify:playlist:${playlistId}`)

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to remove tracks from playlist')
      throw error
    }
  }

  /**
   * Reorder tracks in playlist
   */
  async reorderPlaylistTracks(
    userId: string,
    playlistId: string,
    rangeStart: number,
    insertBefore: number,
    rangeLength: number = 1
  ): Promise<{ snapshot_id: string }> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.put(
        `/playlists/${playlistId}/tracks`,
        {
          range_start: rangeStart,
          insert_before: insertBefore,
          range_length: rangeLength,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      // Invalidate cache
      await this.deleteFromCache(`spotify:playlist:${playlistId}`)

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to reorder playlist tracks')
      throw error
    }
  }

  /**
   * Replace all tracks in playlist
   */
  async replacePlaylistTracks(
    userId: string,
    playlistId: string,
    trackUris: string[]
  ): Promise<void> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      await this.client.put(
        `/playlists/${playlistId}/tracks`,
        { uris: trackUris },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      // Invalidate cache
      await this.deleteFromCache(`spotify:playlist:${playlistId}`)
    } catch (error) {
      this.handleApiError(error, 'Failed to replace playlist tracks')
      throw error
    }
  }

  /**
   * Get featured playlists
   */
  async getFeaturedPlaylists(
    userId: string,
    options?: {
      country?: string
      locale?: string
      timestamp?: string
      limit?: number
      offset?: number
    }
  ): Promise<{
    message: string
    playlists: SpotifyPagingObject<SpotifyPlaylist>
  }> {
    const cacheKey = `spotify:featured-playlists:${options?.country || 'US'}`
    const cached = await this.getFromCache<any>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      }

      if (options?.country) params.country = options.country
      if (options?.locale) params.locale = options.locale
      if (options?.timestamp) params.timestamp = options.timestamp

      const response = await this.client.get('/browse/featured-playlists', {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      await this.setInCache(cacheKey, response.data, 3600) // Cache for 1 hour

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get featured playlists')
      throw error
    }
  }

  /**
   * Get category playlists
   */
  async getCategoryPlaylists(
    userId: string,
    categoryId: string,
    options?: {
      country?: string
      limit?: number
      offset?: number
    }
  ): Promise<SpotifyPagingObject<SpotifyPlaylist>> {
    const cacheKey = `spotify:category-playlists:${categoryId}:${options?.country || 'US'}`
    const cached = await this.getFromCache<SpotifyPagingObject<SpotifyPlaylist>>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      }

      if (options?.country) params.country = options.country

      const response = await this.client.get(`/browse/categories/${categoryId}/playlists`, {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const data = response.data.playlists
      await this.setInCache(cacheKey, data, 3600) // Cache for 1 hour

      return data
    } catch (error) {
      this.handleApiError(error, 'Failed to get category playlists')
      throw error
    }
  }

  /**
   * Get browse categories
   */
  async getCategories(
    userId: string,
    options?: {
      country?: string
      locale?: string
      limit?: number
      offset?: number
    }
  ): Promise<SpotifyPagingObject<SpotifyCategory>> {
    const cacheKey = `spotify:categories:${options?.country || 'US'}`
    const cached = await this.getFromCache<SpotifyPagingObject<SpotifyCategory>>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      }

      if (options?.country) params.country = options.country
      if (options?.locale) params.locale = options.locale

      const response = await this.client.get('/browse/categories', {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const data = response.data.categories
      await this.setInCache(cacheKey, data, 3600) // Cache for 1 hour

      return data
    } catch (error) {
      this.handleApiError(error, 'Failed to get categories')
      throw error
    }
  }

  /**
   * Check if user follows playlist
   */
  async checkUserFollowsPlaylist(
    userId: string,
    playlistId: string,
    userIds: string[]
  ): Promise<boolean[]> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get(`/playlists/${playlistId}/followers/contains`, {
        params: { ids: userIds.join(',') },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to check if user follows playlist')
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

  private async deleteFromCache(key: string): Promise<void> {
    if (!this.cache) return
    try {
      await this.cache.delete(key)
    } catch (error) {
      console.error('Cache delete error:', error)
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