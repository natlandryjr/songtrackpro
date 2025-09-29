import axios, { AxiosInstance } from 'axios'
import { AppError } from '../middleware/errorHandler'

export class SpotifyAPI {
  private client: AxiosInstance
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.client = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
  }

  // User Profile
  async getProfile() {
    try {
      const response = await this.client.get('/me')
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Tracks
  async getTrack(trackId: string) {
    try {
      const response = await this.client.get(`/tracks/${trackId}`)
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async searchTracks(query: string, limit: number = 20) {
    try {
      const response = await this.client.get('/search', {
        params: {
          q: query,
          type: 'track',
          limit,
        },
      })
      return response.data.tracks
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async getUserTracks(limit: number = 50) {
    try {
      const response = await this.client.get('/me/tracks', {
        params: { limit },
      })
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Artists
  async getArtist(artistId: string) {
    try {
      const response = await this.client.get(`/artists/${artistId}`)
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async getArtistTopTracks(artistId: string, market: string = 'US') {
    try {
      const response = await this.client.get(`/artists/${artistId}/top-tracks`, {
        params: { market },
      })
      return response.data.tracks
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Playlists
  async getUserPlaylists(limit: number = 50) {
    try {
      const response = await this.client.get('/me/playlists', {
        params: { limit },
      })
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async getPlaylist(playlistId: string) {
    try {
      const response = await this.client.get(`/playlists/${playlistId}`)
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Analytics (requires Spotify for Artists API access)
  // Note: Spotify for Artists API is separate and requires special access
  async getTrackAnalytics(trackId: string) {
    // This is a placeholder - actual implementation requires Spotify for Artists API
    throw new AppError('Spotify for Artists API access required', 501)
  }

  // Recently Played
  async getRecentlyPlayed(limit: number = 50) {
    try {
      const response = await this.client.get('/me/player/recently-played', {
        params: { limit },
      })
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Top Items
  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20) {
    try {
      const response = await this.client.get('/me/top/tracks', {
        params: {
          time_range: timeRange,
          limit,
        },
      })
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20) {
    try {
      const response = await this.client.get('/me/top/artists', {
        params: {
          time_range: timeRange,
          limit,
        },
      })
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }

  // Audio Features
  async getAudioFeatures(trackId: string) {
    try {
      const response = await this.client.get(`/audio-features/${trackId}`)
      return response.data
    } catch (error: any) {
      throw new AppError(
        `Spotify API Error: ${error.response?.data?.error?.message || error.message}`,
        502
      )
    }
  }
}