import { Schema, model } from 'mongoose'
import { CampaignReport } from '../types/database'

const campaignReportSchema = new Schema<CampaignReport>(
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
    period: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    summary: {
      totalSpend: {
        type: Number,
        required: true,
        default: 0,
      },
      totalImpressions: {
        type: Number,
        required: true,
        default: 0,
      },
      totalClicks: {
        type: Number,
        required: true,
        default: 0,
      },
      totalStreams: {
        type: Number,
        required: true,
        default: 0,
      },
      totalConversions: {
        type: Number,
        required: true,
        default: 0,
      },
      avgCtr: {
        type: Number,
        required: true,
        default: 0,
      },
      avgCpc: {
        type: Number,
        required: true,
        default: 0,
      },
      avgCpm: {
        type: Number,
        required: true,
        default: 0,
      },
      roi: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    performance: {
      daily: [
        {
          date: {
            type: Date,
            required: true,
          },
          spend: {
            type: Number,
            required: true,
            default: 0,
          },
          impressions: {
            type: Number,
            required: true,
            default: 0,
          },
          clicks: {
            type: Number,
            required: true,
            default: 0,
          },
          streams: {
            type: Number,
            required: true,
            default: 0,
          },
        },
      ],
    },
    topLocations: [
      {
        country: {
          type: String,
          required: true,
        },
        impressions: {
          type: Number,
          required: true,
          default: 0,
        },
        conversions: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    topDemographics: {
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
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'campaign_reports',
  }
)

// Indexes
campaignReportSchema.index({ campaignId: 1, 'period.start': -1 })
campaignReportSchema.index({ organizationId: 1, generatedAt: -1 })

// TTL index - keep reports for 2 years
campaignReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 })

export const CampaignReportModel = model<CampaignReport>('CampaignReport', campaignReportSchema)