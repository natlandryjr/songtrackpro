// Spotify Web API Types and Interfaces

export interface SpotifyAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
  user_id: string
}

export interface SpotifyUser {
  id: string
  display_name: string
  email?: string
  country?: string
  product?: 'premium' | 'free' | 'open'
  images?: SpotifyImage[]
  followers?: {
    total: number
  }
  external_urls: {
    spotify: string
  }
}

export interface SpotifyArtist {
  id: string
  name: string
  type: 'artist'
  uri: string
  href: string
  external_urls: {
    spotify: string
  }
  images?: SpotifyImage[]
  genres?: string[]
  popularity?: number
  followers?: {
    total: number
  }
}

export interface SpotifyTrack {
  id: string
  name: string
  type: 'track'
  uri: string
  href: string
  external_urls: {
    spotify: string
  }
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  explicit: boolean
  popularity: number
  preview_url?: string
  track_number: number
  disc_number: number
  is_local: boolean
  available_markets?: string[]
  external_ids?: {
    isrc?: string
    ean?: string
    upc?: string
  }
}

export interface SpotifyAlbum {
  id: string
  name: string
  type: 'album'
  uri: string
  href: string
  external_urls: {
    spotify: string
  }
  artists: SpotifyArtist[]
  images: SpotifyImage[]
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  total_tracks: number
  album_type: 'album' | 'single' | 'compilation'
  genres?: string[]
  label?: string
  popularity?: number
  available_markets?: string[]
}

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  type: 'playlist'
  uri: string
  href: string
  external_urls: {
    spotify: string
  }
  owner: {
    id: string
    display_name: string
    external_urls: {
      spotify: string
    }
  }
  public: boolean
  collaborative: boolean
  images: SpotifyImage[]
  tracks: {
    total: number
    href: string
  }
  followers?: {
    total: number
  }
  snapshot_id: string
}

export interface SpotifyPlaylistTrack {
  added_at: string
  added_by: {
    id: string
    external_urls: {
      spotify: string
    }
  }
  is_local: boolean
  track: SpotifyTrack
}

export interface SpotifyAudioFeatures {
  id: string
  acousticness: number
  danceability: number
  energy: number
  instrumentalness: number
  key: number
  liveness: number
  loudness: number
  mode: number
  speechiness: number
  tempo: number
  time_signature: number
  valence: number
  duration_ms: number
}

export interface SpotifyTopTracks {
  tracks: SpotifyTrack[]
}

export interface SpotifyTopArtists {
  artists: SpotifyArtist[]
}

export interface SpotifySearchResults {
  tracks?: {
    href: string
    items: SpotifyTrack[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
  artists?: {
    href: string
    items: SpotifyArtist[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
  albums?: {
    href: string
    items: SpotifyAlbum[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
  playlists?: {
    href: string
    items: SpotifyPlaylist[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
}

export interface SpotifyArtistInsights {
  artist: SpotifyArtist
  topTracks: SpotifyTrack[]
  relatedArtists: SpotifyArtist[]
  albums: SpotifyAlbum[]
  appearsOn: SpotifyAlbum[]
}

// Spotify for Artists API (when available)
export interface SpotifyStreamingStats {
  date: string
  streams: number
  listeners: number
  saves: number
  playlist_adds: number
  skip_rate?: number
}

export interface SpotifyDemographics {
  age_ranges: Array<{
    range: string
    percentage: number
  }>
  genders: Array<{
    gender: 'male' | 'female' | 'non-binary' | 'unknown'
    percentage: number
  }>
}

export interface SpotifyGeographicData {
  country: string
  country_code: string
  streams: number
  listeners: number
  percentage: number
}

export interface SpotifyPlaylistPerformance {
  playlist_id: string
  playlist_name: string
  follower_count: number
  track_position?: number
  streams_from_playlist: number
  added_date: string
}

export interface SpotifyApiError {
  error: {
    status: number
    message: string
  }
}

export interface SpotifyPagingObject<T> {
  href: string
  items: T[]
  limit: number
  next: string | null
  offset: number
  previous: string | null
  total: number
}

export interface SpotifyCategory {
  id: string
  name: string
  icons: SpotifyImage[]
  href: string
}

export interface SpotifyRecommendations {
  seeds: Array<{
    afterFilteringSize: number
    afterRelinkingSize: number
    href: string
    id: string
    initialPoolSize: number
    type: 'artist' | 'track' | 'genre'
  }>
  tracks: SpotifyTrack[]
}

export interface SpotifyCurrentlyPlaying {
  timestamp: number
  context?: {
    type: string
    href: string
    external_urls: {
      spotify: string
    }
    uri: string
  }
  progress_ms: number
  item: SpotifyTrack
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
  is_playing: boolean
}

export interface SpotifyPlaybackState {
  device: {
    id: string
    is_active: boolean
    is_private_session: boolean
    is_restricted: boolean
    name: string
    type: string
    volume_percent: number
  }
  repeat_state: 'off' | 'track' | 'context'
  shuffle_state: boolean
  timestamp: number
  context?: {
    type: string
    href: string
    external_urls: {
      spotify: string
    }
    uri: string
  }
  progress_ms: number
  item: SpotifyTrack
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
  is_playing: boolean
}

export interface SpotifyArtistAlbums {
  href: string
  items: SpotifyAlbum[]
  limit: number
  next: string | null
  offset: number
  previous: string | null
  total: number
}

export interface SpotifyFollowedArtists {
  artists: {
    href: string
    items: SpotifyArtist[]
    limit: number
    next: string | null
    cursors: {
      after: string
    }
    total: number
  }
}

export type SpotifySearchType = 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode'

export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term'

export interface SpotifyAuthScopes {
  // Images
  'ugc-image-upload': boolean

  // Listening History
  'user-read-recently-played': boolean
  'user-top-read': boolean
  'user-read-playback-position': boolean

  // Spotify Connect
  'user-read-playback-state': boolean
  'user-modify-playback-state': boolean
  'user-read-currently-playing': boolean

  // Playback
  'app-remote-control': boolean
  'streaming': boolean

  // Playlists
  'playlist-modify-public': boolean
  'playlist-modify-private': boolean
  'playlist-read-private': boolean
  'playlist-read-collaborative': boolean

  // Follow
  'user-follow-modify': boolean
  'user-follow-read': boolean

  // Library
  'user-library-modify': boolean
  'user-library-read': boolean

  // Users
  'user-read-email': boolean
  'user-read-private': boolean
}

export const SPOTIFY_REQUIRED_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-follow-read',
]