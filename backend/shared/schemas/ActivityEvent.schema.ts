import { Schema, model } from 'mongoose'
import { ActivityEvent } from '../types/database'

const activityEventSchema = new Schema<ActivityEvent>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['login', 'campaign_created', 'campaign_updated', 'integration_connected', 'report_generated', 'custom'],
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    resource: {
      type: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
      name: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'activity_events',
  }
)

// Compound indexes
activityEventSchema.index({ userId: 1, timestamp: -1 })
activityEventSchema.index({ organizationId: 1, timestamp: -1 })
activityEventSchema.index({ type: 1, timestamp: -1 })

// TTL index - keep activity logs for 1 year
activityEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 })

export const ActivityEventModel = model<ActivityEvent>('ActivityEvent', activityEventSchema)