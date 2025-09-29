import { Schema, model } from 'mongoose'
import { SpotifyMetrics } from '../types/database'

const spotifyMetricsSchema = new Schema<SpotifyMetrics>(
  {
    trackId: {
      type: String,
      required: true,
      index: true,
    },
    campaignId: {
      type: String,
      index: true,
    },
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    streams: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    listeners: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    saves: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    skipRate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    completionRate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    playlists: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    demographics: {
      age: {
        type: Map,
        of: Number,
        default: {},
      },
      gender: {
        type: Map,
        of: Number,
        default: {},
      },
      country: {
        type: Map,
        of: Number,
        default: {},
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'spotify_metrics',
  }
)

// Compound indexes
spotifyMetricsSchema.index({ trackId: 1, date: -1 })
spotifyMetricsSchema.index({ campaignId: 1, date: -1 })
spotifyMetricsSchema.index({ organizationId: 1, date: -1 })

// TTL index
spotifyMetricsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 })

export const SpotifyMetricsModel = model<SpotifyMetrics>('SpotifyMetrics', spotifyMetricsSchema)