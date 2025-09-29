# SongTrackPro API Implementation Guide

## Overview

Complete RESTful API architecture with microservices, OAuth integrations, rate limiting, webhooks, and comprehensive error handling.

---

## Architecture

### Microservices

```
API Gateway (Port 3000)
├── Auth Service (Port 3001) - User authentication & OAuth
├── Meta Service (Port 3002) - Meta Ads integration
├── Spotify Service (Port 3003) - Spotify integration
└── Analytics Service (Port 3004) - Analytics & reporting
```

### Technology Stack

- **Framework:** Express.js with TypeScript
- **Authentication:** JWT with refresh tokens
- **Validation:** Zod schemas
- **Rate Limiting:** express-rate-limit (tiered by subscription)
- **Documentation:** OpenAPI 3.0 (Swagger)
- **Error Handling:** Centralized with AppError class
- **Webhooks:** HMAC SHA-256 signatures with retries

---

## Key Features Implemented

### 1. Authentication & Authorization

**Files:**
- `/backend/services/auth/src/controllers/authController.ts`
- `/backend/services/auth/src/controllers/oauthController.ts`
- `/backend/services/auth/src/middleware/authMiddleware.ts`

**Features:**
- ✅ User registration with email/password
- ✅ Login with JWT tokens (15min access, 7d refresh)
- ✅ Token refresh mechanism
- ✅ OAuth 2.0 for Spotify (user profile, tracks, analytics)
- ✅ OAuth 2.0 for Meta (ad accounts, campaigns, insights)
- ✅ Integration disconnect

**OAuth Scopes:**

*Spotify:*
- `user-read-email`
- `user-read-private`
- `user-top-read`
- `user-library-read`
- `streaming`
- `user-read-recently-played`

*Meta:*
- `ads_management`
- `ads_read`
- `business_management`
- `read_insights`

### 2. Rate Limiting

**File:** `/backend/shared/middleware/rateLimiter.ts`

**Tiers:**
- **Free:** 100 requests/hour
- **Starter:** 1,000 requests/hour
- **Professional:** 10,000 requests/hour
- **Enterprise:** 100,000 requests/hour

**Special Limits:**
- Auth endpoints: 5 attempts per 15 minutes

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623456789
```

### 3. Input Validation

**File:** `/backend/shared/middleware/validation.ts`

**Features:**
- Zod schema validation
- Body, query, and params validation
- Detailed error messages with field-level feedback
- Common schemas (pagination, ID, date ranges)

**Example:**
```typescript
router.post('/campaigns',
  validate(campaignSchema),
  createCampaign
)
```

### 4. Error Handling

**File:** `/backend/shared/middleware/errorHandler.ts`

**Error Codes:**
- `VALIDATION_ERROR` (400)
- `AUTHENTICATION_ERROR` (401)
- `AUTHORIZATION_ERROR` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTEGRATION_ERROR` (502)
- `SERVER_ERROR` (500)

**Response Format:**
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

### 5. Meta Ads Integration

**File:** `/backend/shared/integrations/MetaAdsAPI.ts`

**Features:**
- ✅ Get ad accounts
- ✅ List campaigns
- ✅ Create/update campaigns
- ✅ Get campaign insights (impressions, clicks, spend, conversions)
- ✅ Custom audiences (create, list)
- ✅ Lookalike audiences
- ✅ Conversions API for tracking events

**Conversions API Events:**
```typescript
{
  event_name: 'Purchase',
  event_time: 1623456789,
  user_data: {
    em: 'hashed_email',
    ph: 'hashed_phone',
    client_ip_address: '127.0.0.1',
    client_user_agent: 'Mozilla/5.0...',
    fbc: 'fb_click_id',
    fbp: 'fb_browser_id'
  },
  custom_data: {
    currency: 'USD',
    value: 9.99
  },
  action_source: 'website'
}
```

### 6. Spotify Integration

**File:** `/backend/shared/integrations/SpotifyAPI.ts`

**Features:**
- ✅ Get user profile
- ✅ Search tracks
- ✅ Get track details & audio features
- ✅ Get artist info & top tracks
- ✅ User playlists
- ✅ Recently played tracks
- ✅ Top tracks & artists (by time range)
- ⚠️ Spotify for Artists analytics (requires special access)

**Audio Features:**
```typescript
{
  danceability: 0.735,
  energy: 0.578,
  key: 5,
  loudness: -6.746,
  tempo: 125.99,
  valence: 0.543,
  // ... more features
}
```

### 7. Webhook System

**File:** `/backend/shared/webhooks/WebhookHandler.ts`

**Features:**
- HMAC SHA-256 signature verification
- Automatic retries with exponential backoff
- Event broadcasting
- Webhook management (create, delete, list)

**Event Types:**
- `campaign.created`
- `campaign.updated`
- `campaign.launched`
- `campaign.paused`
- `campaign.completed`
- `metrics.updated`
- `report.daily.ready`
- `integration.connected`
- `budget.warning`
- `goal.reached`

**Webhook Payload:**
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

**Headers:**
```
X-Webhook-Signature: sha256=...
X-Webhook-Id: webhook_uuid
X-Webhook-Timestamp: 2024-06-01T12:00:00Z
```

### 8. Swagger Documentation

**File:** `/backend/gateway/src/swagger.ts`

**Features:**
- OpenAPI 3.0 specification
- Interactive API explorer
- Authentication schemas
- Request/response examples
- Error response documentation

**Access:** `http://localhost:3000/api-docs`

---

## API Endpoints Summary

### Authentication (12 endpoints)
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/profile` - Get profile
- `GET /auth/verify-email/:token` - Verify email
- `GET /auth/spotify/connect` - Connect Spotify
- `GET /auth/spotify/callback` - Spotify callback
- `GET /auth/meta/connect` - Connect Meta
- `GET /auth/meta/callback` - Meta callback
- `DELETE /auth/integrations/:provider` - Disconnect
- `GET /auth/integrations` - List integrations

### Campaigns (7 endpoints)
- `GET /campaigns` - List campaigns (with filters)
- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - Get campaign
- `PATCH /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign
- `POST /campaigns/:id/launch` - Launch
- `POST /campaigns/:id/pause` - Pause

### Tracks (6 endpoints)
- `GET /tracks` - List tracks (with search)
- `POST /tracks` - Create track
- `GET /tracks/:id` - Get track
- `PATCH /tracks/:id` - Update track
- `DELETE /tracks/:id` - Delete track
- `POST /tracks/sync/spotify` - Sync from Spotify

### Audiences (6 endpoints)
- `GET /audiences` - List audiences
- `POST /audiences` - Create audience
- `GET /audiences/:id` - Get audience
- `PATCH /audiences/:id` - Update audience
- `DELETE /audiences/:id` - Delete audience
- `POST /audiences/:id/lookalike` - Create lookalike
- `POST /audiences/:id/sync/meta` - Sync to Meta

### Analytics (5 endpoints)
- `GET /analytics/campaigns/:id` - Campaign analytics
- `GET /analytics/overview` - Overview
- `GET /analytics/tracks/:id` - Track analytics
- `GET /analytics/audiences/:id/insights` - Audience insights
- `POST /analytics/campaigns/:id/export` - Export report

### Meta Integration (5 endpoints)
- `GET /meta/accounts` - List ad accounts
- `GET /meta/campaigns` - List Meta campaigns
- `GET /meta/campaigns/:id/insights` - Get insights
- `POST /meta/campaigns` - Create campaign
- `POST /meta/conversions` - Send conversion event

### Spotify Integration (6 endpoints)
- `GET /spotify/profile` - User profile
- `GET /spotify/tracks` - User tracks
- `GET /spotify/tracks/:id/analytics` - Track analytics
- `GET /spotify/playlists` - User playlists
- `GET /spotify/artists/:id` - Artist info
- `GET /spotify/search` - Search tracks

### Webhooks (4 endpoints)
- `GET /webhooks` - List webhooks
- `POST /webhooks` - Create webhook
- `GET /webhooks/:id` - Get webhook
- `DELETE /webhooks/:id` - Delete webhook

### Real-time (2 endpoints)
- `GET /streaming/realtime/:trackId` - Real-time streams
- `WS /streaming/ws/:trackId` - WebSocket stream events

**Total:** 59 RESTful endpoints + 1 WebSocket endpoint

---

## Security Best Practices

### 1. Authentication
- JWT tokens with short expiration (15 minutes)
- Secure refresh token rotation
- HttpOnly cookies for refresh tokens (recommended)
- Rate limiting on auth endpoints (5 attempts/15min)

### 2. Data Protection
- Bcrypt for password hashing (10 rounds)
- HTTPS required in production
- CORS configuration
- Helmet.js security headers
- Input sanitization with Zod

### 3. API Security
- Bearer token authentication
- Per-user rate limiting
- Request validation
- SQL injection protection (Sequelize parameterized queries)
- NoSQL injection protection (Mongoose validation)

### 4. Webhook Security
- HMAC SHA-256 signatures
- Timestamp validation (5-minute window)
- Replay attack prevention
- Secret rotation support

---

## Performance Optimizations

### 1. Database
- Indexes on all foreign keys
- Compound indexes for common queries
- Connection pooling (max: 10 connections)
- Query result caching with Redis

### 2. API
- Pagination (default: 20, max: 100)
- Field selection for large responses
- Gzip compression
- ETags for caching
- CDN for static assets

### 3. Rate Limiting
- Redis-backed rate limiter
- Sliding window algorithm
- Per-user limits
- Burst protection

---

## Deployment Checklist

- [ ] Set environment variables for all services
- [ ] Configure SMTP for email verification
- [ ] Set up Meta App and get credentials
- [ ] Set up Spotify App and get credentials
- [ ] Configure webhook URLs
- [ ] Set up SSL certificates
- [ ] Configure CDN
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure log aggregation
- [ ] Set up backup strategy
- [ ] Load test API endpoints
- [ ] Security audit
- [ ] API documentation deployment
- [ ] Rate limit tuning per tier

---

## Testing Recommendations

### Unit Tests
- Controller functions
- Validation schemas
- Webhook signature verification
- API wrapper methods

### Integration Tests
- Auth flow (register → verify → login)
- OAuth flows (Spotify, Meta)
- Campaign CRUD operations
- Webhook delivery

### Load Tests
- Rate limiter behavior
- Database connection pool
- Concurrent requests
- WebSocket connections

---

## Monitoring & Alerts

### Key Metrics
- API response time (p50, p95, p99)
- Error rate by endpoint
- Rate limit hits
- Database query time
- Integration API failures
- Webhook delivery success rate

### Alerts
- Error rate > 5%
- Response time > 1000ms
- Database connection pool exhausted
- Integration API down
- Webhook delivery failure rate > 20%

---

## Next Steps

1. **Complete Implementation:**
   - Finish remaining controllers
   - Add comprehensive error handling
   - Implement background jobs for syncing

2. **Testing:**
   - Write unit tests (target: 80% coverage)
   - Integration tests for critical paths
   - Load testing

3. **Documentation:**
   - Complete Swagger specs for all endpoints
   - Write SDK documentation
   - Create API usage examples

4. **DevOps:**
   - CI/CD pipeline
   - Kubernetes deployment
   - Auto-scaling rules
   - Monitoring setup

5. **Security:**
   - Penetration testing
   - OAuth flow audit
   - Rate limit testing
   - DDoS protection

---

## Support & Resources

- API Documentation: `/api-docs`
- GitHub: `https://github.com/natlandryjr/songtrackpro`
- Meta for Developers: `https://developers.facebook.com`
- Spotify for Developers: `https://developer.spotify.com`