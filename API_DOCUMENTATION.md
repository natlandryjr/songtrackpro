# SongTrackPro API Documentation

## Overview

RESTful API for connecting Meta Ads campaigns with Spotify streaming analytics.

**Base URL:** `https://api.songtrackpro.com/v1` (Production)
**Base URL:** `http://localhost:3000` (Development)

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens expire after 15 minutes. Use the refresh token to get a new access token.

---

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "organizationName": "My Label"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

#### Verify Email
```http
GET /auth/verify-email/:token
```

**Response:** `200 OK`

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`

#### Logout
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

#### Get Profile
```http
GET /auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### OAuth Integration

#### Connect Spotify Account
```http
GET /auth/spotify/connect
```

**Query Params:**
- `redirect_uri` - Callback URL

**Response:** Redirects to Spotify OAuth

#### Spotify OAuth Callback
```http
GET /auth/spotify/callback?code=xxx
```

**Response:** `200 OK`

#### Connect Meta Account
```http
GET /auth/meta/connect
```

**Response:** Redirects to Meta OAuth

#### Meta OAuth Callback
```http
GET /auth/meta/callback?code=xxx
```

**Response:** `200 OK`

#### Disconnect Integration
```http
DELETE /auth/integrations/:provider
```

**Params:**
- `provider` - "spotify" | "meta"

**Response:** `200 OK`

---

### Campaigns

#### List Campaigns
```http
GET /campaigns
```

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `status` - Filter by status (draft, active, paused, completed, archived)
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset
- `sort` - Sort field (default: createdAt)
- `order` - Sort order (asc, desc)

**Response:** `200 OK`
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "name": "Summer Release Campaign",
      "status": "active",
      "budget": 5000,
      "budgetSpent": 1250.50,
      "startDate": "2024-06-01T00:00:00Z",
      "endDate": "2024-08-31T23:59:59Z",
      "track": {
        "id": "uuid",
        "title": "Summer Vibes",
        "artist": "Artist Name"
      },
      "metrics": {
        "impressions": 150000,
        "clicks": 3500,
        "streams": 12000
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

#### Get Campaign
```http
GET /campaigns/:id
```

**Response:** `200 OK`

#### Create Campaign
```http
POST /campaigns
```

**Request Body:**
```json
{
  "name": "New Campaign",
  "description": "Campaign description",
  "trackId": "uuid",
  "objective": "streams",
  "budget": 5000,
  "currency": "USD",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "targetAudience": {
    "ageMin": 18,
    "ageMax": 35,
    "genders": ["all"],
    "locations": ["US", "CA", "UK"],
    "interests": ["music", "concerts"]
  },
  "creativeAssets": {
    "imageUrl": "https://...",
    "videoUrl": "https://...",
    "headline": "Listen Now",
    "description": "New single out now"
  }
}
```

**Response:** `201 Created`

#### Update Campaign
```http
PATCH /campaigns/:id
```

**Request Body:** Partial campaign object

**Response:** `200 OK`

#### Delete Campaign
```http
DELETE /campaigns/:id
```

**Response:** `204 No Content`

#### Launch Campaign
```http
POST /campaigns/:id/launch
```

**Response:** `200 OK`

#### Pause Campaign
```http
POST /campaigns/:id/pause
```

**Response:** `200 OK`

#### Archive Campaign
```http
POST /campaigns/:id/archive
```

**Response:** `200 OK`

---

### Tracks

#### List Tracks
```http
GET /tracks
```

**Query Params:**
- `search` - Search by title or artist
- `limit` - Results per page
- `offset` - Pagination offset

**Response:** `200 OK`

#### Get Track
```http
GET /tracks/:id
```

**Response:** `200 OK`

#### Create Track
```http
POST /tracks
```

**Request Body:**
```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "releaseDate": "2024-06-01",
  "duration": 210,
  "spotifyId": "spotify_track_id",
  "coverArtUrl": "https://...",
  "genres": ["pop", "electronic"]
}
```

**Response:** `201 Created`

#### Update Track
```http
PATCH /tracks/:id
```

**Response:** `200 OK`

#### Delete Track
```http
DELETE /tracks/:id
```

**Response:** `204 No Content`

#### Sync from Spotify
```http
POST /tracks/sync/spotify
```

**Request Body:**
```json
{
  "spotifyUri": "spotify:track:xxx"
}
```

**Response:** `201 Created`

---

### Audiences

#### List Audiences
```http
GET /audiences
```

**Response:** `200 OK`

#### Get Audience
```http
GET /audiences/:id
```

**Response:** `200 OK`

#### Create Audience
```http
POST /audiences
```

**Request Body:**
```json
{
  "name": "EDM Fans 18-35",
  "description": "Young adults interested in EDM",
  "criteria": {
    "ageMin": 18,
    "ageMax": 35,
    "interests": ["electronic music", "festivals"],
    "behaviors": ["music streaming"],
    "locations": ["US", "CA"]
  }
}
```

**Response:** `201 Created`

#### Update Audience
```http
PATCH /audiences/:id
```

**Response:** `200 OK`

#### Delete Audience
```http
DELETE /audiences/:id
```

**Response:** `204 No Content`

#### Create Lookalike Audience
```http
POST /audiences/:id/lookalike
```

**Request Body:**
```json
{
  "name": "Lookalike - EDM Fans",
  "countries": ["US"],
  "ratio": 0.01
}
```

**Response:** `201 Created`

#### Sync to Meta
```http
POST /audiences/:id/sync/meta
```

**Response:** `200 OK`

---

### Analytics

#### Get Campaign Analytics
```http
GET /analytics/campaigns/:id
```

**Query Params:**
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `granularity` - "day" | "week" | "month"

**Response:** `200 OK`
```json
{
  "campaignId": "uuid",
  "period": {
    "start": "2024-06-01T00:00:00Z",
    "end": "2024-06-30T23:59:59Z"
  },
  "summary": {
    "totalSpend": 1250.50,
    "totalImpressions": 150000,
    "totalClicks": 3500,
    "totalStreams": 12000,
    "avgCtr": 2.33,
    "avgCpc": 0.36,
    "roi": 1.85
  },
  "daily": [
    {
      "date": "2024-06-01",
      "impressions": 5000,
      "clicks": 120,
      "spend": 42.50,
      "streams": 380
    }
  ]
}
```

#### Get Overview Analytics
```http
GET /analytics/overview
```

**Query Params:**
- `startDate`
- `endDate`

**Response:** `200 OK`

#### Get Track Analytics
```http
GET /analytics/tracks/:id
```

**Response:** `200 OK`

#### Get Audience Insights
```http
GET /analytics/audiences/:id/insights
```

**Response:** `200 OK`

#### Export Report
```http
POST /analytics/campaigns/:id/export
```

**Request Body:**
```json
{
  "format": "csv" | "pdf" | "xlsx",
  "startDate": "2024-06-01",
  "endDate": "2024-06-30"
}
```

**Response:** `200 OK`
```json
{
  "reportUrl": "https://...",
  "expiresAt": "2024-07-01T00:00:00Z"
}
```

---

### Real-time Streaming Data

#### Get Real-time Streams
```http
GET /streaming/realtime/:trackId
```

**Query Params:**
- `interval` - Time window (5m, 15m, 1h)

**Response:** `200 OK`
```json
{
  "trackId": "uuid",
  "interval": "5m",
  "data": [
    {
      "timestamp": "2024-06-01T12:00:00Z",
      "streams": 45,
      "countries": {
        "US": 25,
        "CA": 10,
        "UK": 10
      }
    }
  ]
}
```

#### Stream Events WebSocket
```
ws://localhost:3000/streaming/ws/:trackId
```

**Messages:**
```json
{
  "event": "stream",
  "data": {
    "trackId": "uuid",
    "platform": "spotify",
    "country": "US",
    "timestamp": "2024-06-01T12:00:00Z"
  }
}
```

---

### Integrations

#### List Integrations
```http
GET /integrations
```

**Response:** `200 OK`

#### Get Integration
```http
GET /integrations/:provider
```

**Response:** `200 OK`

#### Sync Integration Data
```http
POST /integrations/:provider/sync
```

**Response:** `202 Accepted`

#### Get Sync Status
```http
GET /integrations/:provider/sync/status
```

**Response:** `200 OK`

---

### Meta Ads Integration

#### Get Meta Ad Accounts
```http
GET /meta/accounts
```

**Response:** `200 OK`

#### Get Meta Campaigns
```http
GET /meta/campaigns
```

**Response:** `200 OK`

#### Get Meta Insights
```http
GET /meta/campaigns/:metaCampaignId/insights
```

**Response:** `200 OK`

#### Create Meta Campaign
```http
POST /meta/campaigns
```

**Request Body:**
```json
{
  "campaignId": "uuid",
  "adAccountId": "act_123",
  "objective": "OUTCOME_AWARENESS",
  "budget": 5000,
  "bidStrategy": "LOWEST_COST_WITHOUT_CAP"
}
```

**Response:** `201 Created`

#### Update Meta Campaign
```http
PATCH /meta/campaigns/:metaCampaignId
```

**Response:** `200 OK`

#### Send Conversion Event
```http
POST /meta/conversions
```

**Request Body:**
```json
{
  "eventName": "Purchase",
  "eventTime": 1623456789,
  "userData": {
    "email": "user@example.com",
    "phone": "+1234567890"
  },
  "customData": {
    "currency": "USD",
    "value": 9.99
  }
}
```

**Response:** `200 OK`

---

### Spotify Integration

#### Get Spotify Profile
```http
GET /spotify/profile
```

**Response:** `200 OK`

#### Get Spotify Tracks
```http
GET /spotify/tracks
```

**Response:** `200 OK`

#### Get Spotify Analytics
```http
GET /spotify/tracks/:spotifyId/analytics
```

**Response:** `200 OK`

#### Get Playlists
```http
GET /spotify/playlists
```

**Response:** `200 OK`

---

### Webhooks

#### List Webhooks
```http
GET /webhooks
```

**Response:** `200 OK`

#### Create Webhook
```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["campaign.created", "campaign.updated", "metrics.updated"],
  "secret": "webhook_secret"
}
```

**Response:** `201 Created`

#### Delete Webhook
```http
DELETE /webhooks/:id
```

**Response:** `204 No Content`

#### Webhook Event Format
```json
{
  "id": "event_uuid",
  "type": "campaign.updated",
  "timestamp": "2024-06-01T12:00:00Z",
  "data": {
    "campaignId": "uuid",
    "changes": {}
  },
  "signature": "sha256_signature"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes

- `VALIDATION_ERROR` - Invalid request data
- `AUTHENTICATION_ERROR` - Missing or invalid auth token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTEGRATION_ERROR` - External API error
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting

**Rate Limits:**
- Free tier: 100 requests/hour
- Starter: 1,000 requests/hour
- Professional: 10,000 requests/hour
- Enterprise: Custom

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623456789
```

**Rate Limit Error:** `429 Too Many Requests`

---

## Pagination

List endpoints support pagination:

**Query Params:**
- `limit` - Items per page (max: 100, default: 20)
- `offset` - Skip items

**Response:**
```json
{
  "data": [],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasNext": true
  }
}
```

---

## Versioning

API version is included in the URL: `/v1/`

Breaking changes will result in a new version.

---

## SDKs

Official SDKs:
- JavaScript/TypeScript
- Python
- Ruby
- PHP

---

## Support

- API Status: https://status.songtrackpro.com
- Documentation: https://docs.songtrackpro.com
- Support: support@songtrackpro.com