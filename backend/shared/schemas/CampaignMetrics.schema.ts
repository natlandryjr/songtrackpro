import { Schema, model } from 'mongoose'
import { CampaignMetrics } from '../types/database'

const campaignMetricsSchema = new Schema<CampaignMetrics>(
  {
    campaignId: {
      type: String,
      required: true,
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
    impressions: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    ctr: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    spend: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    cpc: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    cpm: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    conversions: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    conversionRate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    reach: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    frequency: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    engagement: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    videoViews: {
      type: Number,
      min: 0,
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
    collection: 'campaign_metrics',
  }
)

// Compound indexes for efficient queries
campaignMetricsSchema.index({ campaignId: 1, date: -1 })
campaignMetricsSchema.index({ organizationId: 1, date: -1 })
campaignMetricsSchema.index({ date: -1 })

// TTL index to auto-delete old data after 2 years
campaignMetricsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 })

export const CampaignMetricsModel = model<CampaignMetrics>('CampaignMetrics', campaignMetricsSchema)