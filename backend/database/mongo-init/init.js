// MongoDB initialization script
db = db.getSiblingDB('songtrackpro');

// Create collections with validation
db.createCollection('metaAdMetrics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['campaignId', 'adId', 'date', 'impressions', 'clicks', 'spend'],
      properties: {
        campaignId: { bsonType: 'string' },
        adId: { bsonType: 'string' },
        date: { bsonType: 'date' },
        impressions: { bsonType: 'int' },
        clicks: { bsonType: 'int' },
        spend: { bsonType: 'double' },
        conversions: { bsonType: 'int' },
      },
    },
  },
});

db.createCollection('spotifyMetrics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['campaignId', 'trackId', 'date', 'streams'],
      properties: {
        campaignId: { bsonType: 'string' },
        trackId: { bsonType: 'string' },
        date: { bsonType: 'date' },
        streams: { bsonType: 'int' },
        listeners: { bsonType: 'int' },
        saves: { bsonType: 'int' },
      },
    },
  },
});

// Create indexes
db.metaAdMetrics.createIndex({ campaignId: 1, date: -1 });
db.metaAdMetrics.createIndex({ adId: 1 });
db.spotifyMetrics.createIndex({ campaignId: 1, date: -1 });
db.spotifyMetrics.createIndex({ trackId: 1 });

print('MongoDB initialization complete');