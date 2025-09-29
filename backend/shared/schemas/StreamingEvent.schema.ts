import { Schema, model } from 'mongoose'
import { StreamingEvent } from '../types/database'

const streamingEventSchema = new Schema<StreamingEvent>(
  {
    trackId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['spotify', 'apple', 'youtube', 'other'],
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['play', 'skip', 'complete', 'save', 'share'],
      index: true,
    },
    duration: Number,
    position: Number,
    location: {
      country: {
        type: String,
        required: true,
      },
      city: String,
      lat: Number,
      lon: Number,
    },
    device: {
      type: {
        type: String,
        required: true,
      },
      os: String,
      browser: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'streaming_events',
  }
)

// Compound indexes
streamingEventSchema.index({ trackId: 1, timestamp: -1 })
streamingEventSchema.index({ platform: 1, timestamp: -1 })
streamingEventSchema.index({ eventType: 1, timestamp: -1 })

// TTL index - keep streaming events for 90 days
streamingEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 })

export const StreamingEventModel = model<StreamingEvent>('StreamingEvent', streamingEventSchema)