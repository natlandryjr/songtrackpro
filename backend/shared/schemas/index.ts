import { connect } from 'mongoose'

export { CampaignMetricsModel } from './CampaignMetrics.schema'
export { SpotifyMetricsModel } from './SpotifyMetrics.schema'
export { MetaAdMetricsModel } from './MetaAdMetrics.schema'
export { ActivityEventModel } from './ActivityEvent.schema'
export { StreamingEventModel } from './StreamingEvent.schema'
export { CampaignReportModel } from './CampaignReport.schema'

export const initMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/songtrackpro'

    await connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    console.log('✓ MongoDB connection established successfully')
  } catch (error) {
    console.error('✗ Unable to connect to MongoDB:', error)
    throw error
  }
}