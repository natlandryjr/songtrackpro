import axios, { AxiosInstance } from 'axios'
import {
  SpotifyStreamingStats,
  SpotifyDemographics,
  SpotifyGeographicData,
  SpotifyPlaylistPerformance,
  SpotifyApiError,
  SpotifyTrack,
  SpotifyArtist,
} from '../types/spotifyApi'
import { SpotifyAuthService } from './SpotifyAuthService'
import { SpotifyDataService } from './SpotifyDataService'

interface RateLimiter {
  checkLimit(accountId?: string): Promise<boolean>
  recordCall(cpuTime: number, totalTime: number, accountId?: string): Promise<void>
}

interface CacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
}

/**
 * Spotify Analytics Service
 * Note: Spotify for Artists API is restricted and requires special access.
 * This service provides mock/simulated analytics data and aggregates available public data.
 * For production use with real Spotify for Artists data, additional API access is required.
 */
export class SpotifyAnalyticsService {
  private baseUrl = 'https://api.spotify.com/v1'
  private client: AxiosInstance
  private authService: SpotifyAuthService
  private dataService: SpotifyDataService
  private rateLimiter?: RateLimiter
  private cache?: CacheService

  constructor(
    authService: SpotifyAuthService,
    dataService: SpotifyDataService,
    rateLimiter?: RateLimiter,
    cache?: CacheService
  ) {
    this.authService = authService
    this.dataService = dataService
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
   * Get streaming statistics for a track
   * Note: This generates simulated data. Real data requires Spotify for Artists API access.
   */
  async getTrackStreamingStats(
    userId: string,
    trackId: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<SpotifyStreamingStats[]> {
    const cacheKey = `spotify:analytics:track:${trackId}:${dateRange.startDate}:${dateRange.endDate}`
    const cached = await this.getFromCache<SpotifyStreamingStats[]>(cacheKey)
    if (cached) return cached

    // Get track data to use in simulation
    const track = await this.dataService.getTrack(userId, trackId)

    // Generate simulated streaming stats based on popularity
    const stats = this.generateStreamingStats(dateRange, track.popularity)

    await this.setInCache(cacheKey, stats, 3600) // Cache for 1 hour

    return stats
  }

  /**
   * Get artist streaming statistics
   */
  async getArtistStreamingStats(
    userId: string,
    artistId: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<SpotifyStreamingStats[]> {
    const cacheKey = `spotify:analytics:artist:${artistId}:${dateRange.startDate}:${dateRange.endDate}`
    const cached = await this.getFromCache<SpotifyStreamingStats[]>(cacheKey)
    if (cached) return cached

    // Get artist data to use in simulation
    const artist = await this.dataService.getArtist(userId, artistId)

    // Generate simulated streaming stats based on popularity and followers
    const baseStreams = Math.floor((artist.followers?.total || 10000) * 0.1)
    const stats = this.generateStreamingStats(dateRange, artist.popularity || 50, baseStreams)

    await this.setInCache(cacheKey, stats, 3600) // Cache for 1 hour

    return stats
  }

  /**
   * Get demographic breakdown for artist
   * Note: Simulated data - real data requires Spotify for Artists API
   */
  async getArtistDemographics(
    userId: string,
    artistId: string
  ): Promise<SpotifyDemographics> {
    const cacheKey = `spotify:analytics:demographics:${artistId}`
    const cached = await this.getFromCache<SpotifyDemographics>(cacheKey)
    if (cached) return cached

    // Generate simulated demographics based on genre and popularity
    const artist = await this.dataService.getArtist(userId, artistId)
    const demographics = this.generateDemographics(artist)

    await this.setInCache(cacheKey, demographics, 86400) // Cache for 24 hours

    return demographics
  }

  /**
   * Get geographic streaming data
   * Note: Simulated data - real data requires Spotify for Artists API
   */
  async getGeographicData(
    userId: string,
    artistId: string
  ): Promise<SpotifyGeographicData[]> {
    const cacheKey = `spotify:analytics:geographic:${artistId}`
    const cached = await this.getFromCache<SpotifyGeographicData[]>(cacheKey)
    if (cached) return cached

    // Generate simulated geographic data
    const artist = await this.dataService.getArtist(userId, artistId)
    const geoData = this.generateGeographicData(artist)

    await this.setInCache(cacheKey, geoData, 86400) // Cache for 24 hours

    return geoData
  }

  /**
   * Get playlist performance for a track
   * Uses real Spotify API to find playlists containing the track
   */
  async getTrackPlaylistPerformance(
    userId: string,
    trackId: string
  ): Promise<SpotifyPlaylistPerformance[]> {
    const cacheKey = `spotify:analytics:playlist-performance:${trackId}`
    const cached = await this.getFromCache<SpotifyPlaylistPerformance[]>(cacheKey)
    if (cached) return cached

    // Note: Finding all playlists containing a track is not directly supported by Spotify API
    // This would require searching featured/category playlists or user's playlists
    // Returning simulated data for now
    const track = await this.dataService.getTrack(userId, trackId)
    const playlistPerformance = this.generatePlaylistPerformance(track)

    await this.setInCache(cacheKey, playlistPerformance, 3600) // Cache for 1 hour

    return playlistPerformance
  }

  /**
   * Get artist performance summary
   */
  async getArtistPerformanceSummary(
    userId: string,
    artistId: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<{
    totalStreams: number
    totalListeners: number
    averageStreamsPerListener: number
    saveRate: number
    topTracks: Array<{
      track: SpotifyTrack
      streams: number
      saves: number
      completion: number
    }>
    demographics: SpotifyDemographics
    geographic: SpotifyGeographicData[]
  }> {
    const [streamingStats, demographics, geographic, artist] = await Promise.all([
      this.getArtistStreamingStats(userId, artistId, dateRange),
      this.getArtistDemographics(userId, artistId),
      this.getGeographicData(userId, artistId),
      this.dataService.getArtist(userId, artistId),
    ])

    // Get top tracks with simulated stats
    const topTracksData = await this.dataService.getArtistTopTracks(userId, artistId)
    const topTracks = topTracksData.slice(0, 5).map((track, index) => ({
      track,
      streams: Math.floor(125000 / (index + 1)),
      saves: Math.floor(8900 / (index + 1)),
      completion: Math.floor(82 - index * 2),
    }))

    // Aggregate streaming stats
    const totalStreams = streamingStats.reduce((sum, stat) => sum + stat.streams, 0)
    const totalListeners = streamingStats.reduce((sum, stat) => sum + stat.listeners, 0)
    const avgStreamsPerListener = totalListeners > 0 ? totalStreams / totalListeners : 0
    const totalSaves = streamingStats.reduce((sum, stat) => sum + stat.saves, 0)
    const saveRate = totalStreams > 0 ? (totalSaves / totalStreams) * 100 : 0

    return {
      totalStreams,
      totalListeners,
      averageStreamsPerListener: parseFloat(avgStreamsPerListener.toFixed(1)),
      saveRate: parseFloat(saveRate.toFixed(1)),
      topTracks,
      demographics,
      geographic,
    }
  }

  /**
   * Get track performance metrics
   */
  async getTrackPerformanceMetrics(
    userId: string,
    trackId: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<{
    totalStreams: number
    totalListeners: number
    saves: number
    skipRate: number
    completionRate: number
    playlistPerformance: SpotifyPlaylistPerformance[]
    streamingStats: SpotifyStreamingStats[]
  }> {
    const [streamingStats, playlistPerformance] = await Promise.all([
      this.getTrackStreamingStats(userId, trackId, dateRange),
      this.getTrackPlaylistPerformance(userId, trackId),
    ])

    const totalStreams = streamingStats.reduce((sum, stat) => sum + stat.streams, 0)
    const totalListeners = streamingStats.reduce((sum, stat) => sum + stat.listeners, 0)
    const saves = streamingStats.reduce((sum, stat) => sum + stat.saves, 0)
    const avgSkipRate =
      streamingStats.reduce((sum, stat) => sum + (stat.skip_rate || 0), 0) /
      streamingStats.length
    const completionRate = 100 - avgSkipRate

    return {
      totalStreams,
      totalListeners,
      saves,
      skipRate: parseFloat(avgSkipRate.toFixed(1)),
      completionRate: parseFloat(completionRate.toFixed(1)),
      playlistPerformance,
      streamingStats,
    }
  }

  /**
   * Generate simulated streaming stats
   * This is a placeholder for real Spotify for Artists data
   */
  private generateStreamingStats(
    dateRange: { startDate: string; endDate: string },
    popularity: number,
    baseStreams: number = 10000
  ): SpotifyStreamingStats[] {
    const stats: SpotifyStreamingStats[] = []
    const start = new Date(dateRange.startDate)
    const end = new Date(dateRange.endDate)

    const popularityMultiplier = popularity / 50 // Normalize around 50

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const randomVariation = 0.8 + Math.random() * 0.4 // 80% to 120%
      const streams = Math.floor(baseStreams * popularityMultiplier * randomVariation)
      const listeners = Math.floor(streams / (2 + Math.random()))
      const saves = Math.floor(streams * (0.1 + Math.random() * 0.05))
      const playlistAdds = Math.floor(streams * (0.05 + Math.random() * 0.03))

      stats.push({
        date: date.toISOString().split('T')[0],
        streams,
        listeners,
        saves,
        playlist_adds: playlistAdds,
        skip_rate: 15 + Math.random() * 10, // 15-25%
      })
    }

    return stats
  }

  /**
   * Generate simulated demographics
   */
  private generateDemographics(artist: SpotifyArtist): SpotifyDemographics {
    // Simulate age distribution based on genre
    const hasYouthGenre = artist.genres?.some(g =>
      ['pop', 'hip hop', 'rap', 'trap', 'dance'].some(youth => g.includes(youth))
    )

    return {
      age_ranges: hasYouthGenre
        ? [
            { range: '18-24', percentage: 35 },
            { range: '25-34', percentage: 28 },
            { range: '35-44', percentage: 20 },
            { range: '45-54', percentage: 12 },
            { range: '55+', percentage: 5 },
          ]
        : [
            { range: '18-24', percentage: 20 },
            { range: '25-34', percentage: 30 },
            { range: '35-44', percentage: 25 },
            { range: '45-54', percentage: 15 },
            { range: '55+', percentage: 10 },
          ],
      genders: [
        { gender: 'male', percentage: 52 },
        { gender: 'female', percentage: 45 },
        { gender: 'non-binary', percentage: 2 },
        { gender: 'unknown', percentage: 1 },
      ],
    }
  }

  /**
   * Generate simulated geographic data
   */
  private generateGeographicData(artist: SpotifyArtist): SpotifyGeographicData[] {
    const baseStreams = (artist.followers?.total || 10000) * 0.1

    return [
      {
        country: 'United States',
        country_code: 'US',
        streams: Math.floor(baseStreams * 0.35),
        listeners: Math.floor(baseStreams * 0.35 * 0.45),
        percentage: 35,
      },
      {
        country: 'United Kingdom',
        country_code: 'GB',
        streams: Math.floor(baseStreams * 0.15),
        listeners: Math.floor(baseStreams * 0.15 * 0.45),
        percentage: 15,
      },
      {
        country: 'Canada',
        country_code: 'CA',
        streams: Math.floor(baseStreams * 0.12),
        listeners: Math.floor(baseStreams * 0.12 * 0.45),
        percentage: 12,
      },
      {
        country: 'Germany',
        country_code: 'DE',
        streams: Math.floor(baseStreams * 0.10),
        listeners: Math.floor(baseStreams * 0.10 * 0.45),
        percentage: 10,
      },
      {
        country: 'Australia',
        country_code: 'AU',
        streams: Math.floor(baseStreams * 0.08),
        listeners: Math.floor(baseStreams * 0.08 * 0.45),
        percentage: 8,
      },
    ]
  }

  /**
   * Generate simulated playlist performance
   */
  private generatePlaylistPerformance(track: SpotifyTrack): SpotifyPlaylistPerformance[] {
    const popularity = track.popularity

    const playlists: SpotifyPlaylistPerformance[] = []

    if (popularity > 70) {
      playlists.push({
        playlist_id: '37i9dQZF1DXcBWIGoYBM5M',
        playlist_name: "Today's Top Hits",
        follower_count: 32500000,
        track_position: Math.floor(Math.random() * 50) + 1,
        streams_from_playlist: Math.floor(80000 + Math.random() * 20000),
        added_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (popularity > 50) {
      playlists.push({
        playlist_id: '37i9dQZF1DX0XUsuxWHRQd',
        playlist_name: 'RapCaviar',
        follower_count: 15800000,
        track_position: Math.floor(Math.random() * 30) + 1,
        streams_from_playlist: Math.floor(60000 + Math.random() * 15000),
        added_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (popularity > 30) {
      playlists.push({
        playlist_id: '37i9dQZF1DX1lVhptIYRda',
        playlist_name: 'Hot Country',
        follower_count: 8200000,
        track_position: Math.floor(Math.random() * 20) + 1,
        streams_from_playlist: Math.floor(40000 + Math.random() * 10000),
        added_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    return playlists
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