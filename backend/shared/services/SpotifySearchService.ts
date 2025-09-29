import axios, { AxiosInstance } from 'axios'
import {
  SpotifySearchResults,
  SpotifySearchType,
  SpotifyRecommendations,
  SpotifyApiError,
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

export class SpotifySearchService {
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
   * Search for tracks, artists, albums, and playlists
   */
  async search(
    userId: string,
    query: string,
    types: SpotifySearchType[],
    options?: {
      market?: string
      limit?: number
      offset?: number
      include_external?: 'audio'
    }
  ): Promise<SpotifySearchResults> {
    const cacheKey = `spotify:search:${query}:${types.join(',')}:${options?.market || 'US'}:${options?.offset || 0}`
    const cached = await this.getFromCache<SpotifySearchResults>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        q: query,
        type: types.join(','),
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      }

      if (options?.market) params.market = options.market
      if (options?.include_external) params.include_external = options.include_external

      const response = await this.client.get('/search', {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      await this.setInCache(cacheKey, response.data, 1800) // Cache for 30 minutes

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to search')
      throw error
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(
    userId: string,
    query: string,
    options?: {
      market?: string
      limit?: number
      offset?: number
    }
  ) {
    const result = await this.search(userId, query, ['track'], options)
    return result.tracks
  }

  /**
   * Search for artists
   */
  async searchArtists(
    userId: string,
    query: string,
    options?: {
      market?: string
      limit?: number
      offset?: number
    }
  ) {
    const result = await this.search(userId, query, ['artist'], options)
    return result.artists
  }

  /**
   * Search for albums
   */
  async searchAlbums(
    userId: string,
    query: string,
    options?: {
      market?: string
      limit?: number
      offset?: number
    }
  ) {
    const result = await this.search(userId, query, ['album'], options)
    return result.albums
  }

  /**
   * Search for playlists
   */
  async searchPlaylists(
    userId: string,
    query: string,
    options?: {
      market?: string
      limit?: number
      offset?: number
    }
  ) {
    const result = await this.search(userId, query, ['playlist'], options)
    return result.playlists
  }

  /**
   * Get recommendations based on seeds
   */
  async getRecommendations(
    userId: string,
    seeds: {
      seed_artists?: string[]
      seed_tracks?: string[]
      seed_genres?: string[]
    },
    options?: {
      limit?: number
      market?: string
      // Target audio features
      target_acousticness?: number
      target_danceability?: number
      target_energy?: number
      target_instrumentalness?: number
      target_key?: number
      target_liveness?: number
      target_loudness?: number
      target_mode?: number
      target_popularity?: number
      target_speechiness?: number
      target_tempo?: number
      target_time_signature?: number
      target_valence?: number
      // Min/max ranges
      min_acousticness?: number
      max_acousticness?: number
      min_danceability?: number
      max_danceability?: number
      min_energy?: number
      max_energy?: number
      min_instrumentalness?: number
      max_instrumentalness?: number
      min_liveness?: number
      max_liveness?: number
      min_loudness?: number
      max_loudness?: number
      min_popularity?: number
      max_popularity?: number
      min_speechiness?: number
      max_speechiness?: number
      min_tempo?: number
      max_tempo?: number
      min_valence?: number
      max_valence?: number
    }
  ): Promise<SpotifyRecommendations> {
    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    // Validate seeds
    const totalSeeds =
      (seeds.seed_artists?.length || 0) +
      (seeds.seed_tracks?.length || 0) +
      (seeds.seed_genres?.length || 0)

    if (totalSeeds === 0 || totalSeeds > 5) {
      throw new Error('Must provide 1-5 seed values (artists, tracks, or genres)')
    }

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const params: any = {
        limit: options?.limit || 20,
      }

      if (seeds.seed_artists?.length) {
        params.seed_artists = seeds.seed_artists.join(',')
      }

      if (seeds.seed_tracks?.length) {
        params.seed_tracks = seeds.seed_tracks.join(',')
      }

      if (seeds.seed_genres?.length) {
        params.seed_genres = seeds.seed_genres.join(',')
      }

      if (options?.market) params.market = options.market

      // Add all audio feature targets and ranges
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (key !== 'limit' && key !== 'market' && value !== undefined) {
            params[key] = value
          }
        })
      }

      const response = await this.client.get('/recommendations', {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return response.data
    } catch (error) {
      this.handleApiError(error, 'Failed to get recommendations')
      throw error
    }
  }

  /**
   * Get available genre seeds for recommendations
   */
  async getAvailableGenreSeeds(userId: string): Promise<string[]> {
    const cacheKey = 'spotify:genre-seeds'
    const cached = await this.getFromCache<string[]>(cacheKey)
    if (cached) return cached

    if (this.rateLimiter) await this.rateLimiter.checkLimit(userId)

    try {
      const accessToken = await this.authService.getValidToken(userId)

      const response = await this.client.get('/recommendations/available-genre-seeds', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const genres = response.data.genres
      await this.setInCache(cacheKey, genres, 86400) // Cache for 24 hours

      return genres
    } catch (error) {
      this.handleApiError(error, 'Failed to get available genre seeds')
      throw error
    }
  }

  /**
   * Advanced track search with filters
   */
  async advancedTrackSearch(
    userId: string,
    filters: {
      artist?: string
      track?: string
      album?: string
      year?: number
      genre?: string
      isrc?: string
      upc?: string
    },
    options?: {
      market?: string
      limit?: number
      offset?: number
    }
  ) {
    const queryParts: string[] = []

    if (filters.track) queryParts.push(`track:${filters.track}`)
    if (filters.artist) queryParts.push(`artist:${filters.artist}`)
    if (filters.album) queryParts.push(`album:${filters.album}`)
    if (filters.year) queryParts.push(`year:${filters.year}`)
    if (filters.genre) queryParts.push(`genre:${filters.genre}`)
    if (filters.isrc) queryParts.push(`isrc:${filters.isrc}`)
    if (filters.upc) queryParts.push(`upc:${filters.upc}`)

    if (queryParts.length === 0) {
      throw new Error('At least one search filter must be provided')
    }

    const query = queryParts.join(' ')
    return this.searchTracks(userId, query, options)
  }

  /**
   * Search by ISRC (International Standard Recording Code)
   */
  async searchByISRC(
    userId: string,
    isrc: string,
    options?: {
      market?: string
    }
  ) {
    return this.searchTracks(userId, `isrc:${isrc}`, {
      market: options?.market,
      limit: 1,
    })
  }

  /**
   * Get similar tracks based on a track
   */
  async getSimilarTracks(
    userId: string,
    trackId: string,
    limit: number = 20
  ): Promise<SpotifyRecommendations> {
    return this.getRecommendations(
      userId,
      { seed_tracks: [trackId] },
      { limit }
    )
  }

  /**
   * Get similar artists based on an artist
   */
  async getSimilarArtists(
    userId: string,
    artistId: string,
    limit: number = 20
  ): Promise<SpotifyRecommendations> {
    return this.getRecommendations(
      userId,
      { seed_artists: [artistId] },
      { limit }
    )
  }

  /**
   * Discover tracks by genre
   */
  async discoverByGenre(
    userId: string,
    genre: string,
    options?: {
      limit?: number
      target_popularity?: number
      target_energy?: number
      target_danceability?: number
    }
  ): Promise<SpotifyRecommendations> {
    return this.getRecommendations(
      userId,
      { seed_genres: [genre] },
      {
        limit: options?.limit,
        target_popularity: options?.target_popularity,
        target_energy: options?.target_energy,
        target_danceability: options?.target_danceability,
      }
    )
  }

  /**
   * Get recommendations for a playlist continuation
   */
  async getPlaylistContinuation(
    userId: string,
    trackIds: string[],
    limit: number = 20
  ): Promise<SpotifyRecommendations> {
    // Use up to 5 random tracks from the playlist as seeds
    const seeds = trackIds
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)

    return this.getRecommendations(
      userId,
      { seed_tracks: seeds },
      { limit }
    )
  }

  /**
   * Search with autocomplete suggestions
   */
  async searchWithAutocomplete(
    userId: string,
    query: string,
    type: SpotifySearchType = 'track'
  ) {
    return this.search(userId, query, [type], {
      limit: 10,
    })
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