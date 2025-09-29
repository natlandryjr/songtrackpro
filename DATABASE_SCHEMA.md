# SongTrackPro Database Schema Documentation

## Overview

SongTrackPro uses a hybrid database architecture:
- **PostgreSQL** for relational data (users, campaigns, billing)
- **MongoDB** for analytics and time-series data (metrics, events)

## PostgreSQL Schema

### Core Entities

#### Users & Organizations

**users**
- Multi-tenant user management
- Role-based access control (artist, label, agency, admin)
- Email verification and onboarding tracking
- Links to organizations for collaboration

**organizations**
- Artist, label, or agency accounts
- Subscription-based billing
- Custom settings per organization
- Unique slug for vanity URLs

**organization_members**
- Role-based team access
- Granular permissions
- Invitation tracking

### Subscription & Billing

**subscriptions**
- Stripe integration
- Multiple tiers: free, starter, professional, enterprise
- Trial period support
- Auto-renewal management

**invoices**
- Billing history
- Payment status tracking
- PDF storage

**payment_methods**
- Multiple payment methods per organization
- Default payment method selection

### Campaigns & Tracks

**tracks**
- Music metadata (title, artist, album)
- Platform identifiers (Spotify, Apple Music)
- ISRC codes for rights management
- Full-text search on title/artist

**campaigns**
- Marketing campaign management
- Budget tracking and spend monitoring
- Meta Ads integration
- Target audience and creative assets stored as JSONB
- Links to tracks for campaign attribution

**campaign_goals**
- Multiple goals per campaign
- Types: streams, followers, engagement, conversions, reach
- Progress tracking

### Audiences & Targeting

**audiences**
- Custom and Meta synced audiences
- Flexible criteria stored as JSONB
- Size estimation

**audience_insights**
- Time-series demographic data
- Interest and behavior patterns
- Location insights

### Integrations

**integrations**
- OAuth token management
- Meta and Spotify API connections
- Auto-refresh token handling
- Error tracking for debugging

**api_keys**
- Programmatic API access
- Scoped permissions
- Usage tracking
- Expiration support

### Notifications

**notifications**
- In-app notification system
- Read/unread tracking
- Flexible data payload

## MongoDB Schema

### Analytics & Metrics

**campaign_metrics**
- Daily campaign performance
- Core metrics: impressions, clicks, conversions
- Calculated metrics: CTR, CPC, CPM, conversion rate
- TTL: 2 years

**meta_ad_metrics**
- Granular Meta Ads data
- Ad set and ad-level tracking
- Placement performance
- ROAS calculation
- TTL: 2 years

**spotify_metrics**
- Track streaming data
- Listener demographics
- Save and skip rates
- Playlist additions
- TTL: 2 years

### Event Tracking

**activity_events**
- User action logging
- Audit trail for compliance
- Resource tracking (what was changed)
- IP and user agent capture
- TTL: 1 year

**streaming_events**
- Real-time streaming data
- Play, skip, complete events
- Geographic data
- Device information
- TTL: 90 days

**system_events**
- API call logging
- Sync job tracking
- Error monitoring
- Performance metrics
- TTL: 30 days

### Reports

**campaign_reports**
- Pre-aggregated campaign data
- Daily performance breakdowns
- Top locations and demographics
- ROI calculations
- TTL: 2 years

**api_usage**
- API rate limiting data
- Endpoint performance
- Request/response sizes
- TTL: 90 days

## Relationships

### PostgreSQL Relations

```
organizations
  ├── has many: users (via organization_id)
  ├── has many: campaigns
  ├── has many: tracks
  ├── has many: integrations
  ├── has one: subscription
  └── belongs to: user (owner)

campaigns
  ├── belongs to: organization
  ├── belongs to: track
  ├── belongs to: user (creator)
  └── has many: campaign_goals

tracks
  ├── belongs to: organization
  └── has many: campaigns

integrations
  ├── belongs to: organization
  └── has many: (linked via account_id in MongoDB)
```

### MongoDB Relations

MongoDB documents reference PostgreSQL entities via UUIDs:
- `organizationId` → organizations.id
- `campaignId` → campaigns.id
- `trackId` → tracks.id
- `userId` → users.id

## Indexes

### PostgreSQL Indexes

**Unique Indexes:**
- users.email
- organizations.slug
- tracks.spotify_id
- tracks.isrc
- integrations(organization_id, provider)

**Performance Indexes:**
- All foreign keys
- users(role, created_at)
- campaigns(status, start_date)
- Full-text: tracks(title, artist) using trigram

### MongoDB Indexes

**Compound Indexes:**
- campaign_metrics(campaignId, date)
- spotify_metrics(trackId, date)
- meta_ad_metrics(campaignId, date)
- activity_events(userId, timestamp)

**TTL Indexes:**
- All time-series collections have TTL indexes on createdAt/timestamp

## Data Types

### Enums (PostgreSQL)
- `user_role`: artist | label | agency | admin
- `subscription_tier`: free | starter | professional | enterprise
- `subscription_status`: active | past_due | canceled | trialing | incomplete
- `campaign_status`: draft | active | paused | completed | archived
- `integration_provider`: meta | spotify
- `integration_status`: connected | disconnected | error | expired

### JSONB Fields (PostgreSQL)
Flexible schema fields for:
- Organization settings
- Campaign targeting criteria
- Campaign creative assets
- Audience criteria
- Integration metadata
- Notification data

### MongoDB Schemas
All use TypeScript interfaces with Mongoose schemas for validation

## Security

### PostgreSQL
- Foreign key constraints with CASCADE/SET NULL
- Check constraints on enums
- Row-level security (to be implemented)
- Encrypted at rest

### MongoDB
- Schema validation
- TTL indexes for automatic data cleanup
- Encrypted at rest
- Connection pooling

## Migrations

PostgreSQL migrations are in `/backend/database/migrations/`:
1. Extensions (UUID, trigram, citext)
2. Users and organizations
3. Subscriptions and billing
4. Tracks and campaigns
5. Audiences and integrations
6. Notifications
7. Triggers for automatic timestamps

## Best Practices

1. **Always use transactions** for multi-table operations
2. **Use JSONB indexes** for frequently queried JSON fields
3. **Implement soft deletes** for audit trails (add deleted_at column)
4. **Partition large tables** by date (campaign_metrics, events)
5. **Regular VACUUM** on PostgreSQL
6. **Monitor MongoDB indexes** for efficiency
7. **Archive old data** before TTL expiration if needed