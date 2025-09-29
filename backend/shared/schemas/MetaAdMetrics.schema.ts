import { Schema, model } from 'mongoose'
import { MetaAdMetrics } from '../types/database'

const metaAdMetricsSchema = new Schema<MetaAdMetrics>(
  {
    campaignId: {
      type: String,
      required: true,
      index: true,
    },
    adSetId: {
      type: String,
      index: true,
    },
    adId: {
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
    spend: {
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
    ctr: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
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
    cpa: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    roas: {
      type: Number,
      min: 0,
    },
    placement: {
      type: String,
      required: true,
    },
    demographics: {
      type: Schema.Types.Mixed,
      default: {},
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
    collection: 'meta_ad_metrics',
  }
)

// Compound indexes
metaAdMetricsSchema.index({ campaignId: 1, date: -1 })
metaAdMetricsSchema.index({ adSetId: 1, date: -1 })
metaAdMetricsSchema.index({ adId: 1, date: -1 })
metaAdMetricsSchema.index({ organizationId: 1, date: -1 })

// TTL index
metaAdMetricsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 })

export const MetaAdMetricsModel = model<MetaAdMetrics>('MetaAdMetrics', metaAdMetricsSchema)