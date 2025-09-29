# Database Migrations

This directory contains PostgreSQL migration files for SongTrackPro.

## Migration Files

1. **001-create-extensions.sql** - PostgreSQL extensions (UUID, trigram, citext)
2. **002-create-users-and-organizations.sql** - Users and organizations with RBAC
3. **003-create-subscriptions-billing.sql** - Stripe subscriptions and billing
4. **004-create-tracks-campaigns.sql** - Music tracks and ad campaigns
5. **005-create-audiences-integrations.sql** - Audience targeting and API integrations
6. **006-create-notifications.sql** - User notifications system
7. **007-create-triggers.sql** - Automatic timestamp updates

## Running Migrations

### Using psql

```bash
# Run all migrations in order
psql -U songtrackpro -d songtrackpro -f 001-create-extensions.sql
psql -U songtrackpro -d songtrackpro -f 002-create-users-and-organizations.sql
psql -U songtrackpro -d songtrackpro -f 003-create-subscriptions-billing.sql
psql -U songtrackpro -d songtrackpro -f 004-create-tracks-campaigns.sql
psql -U songtrackpro -d songtrackpro -f 005-create-audiences-integrations.sql
psql -U songtrackpro -d songtrackpro -f 006-create-notifications.sql
psql -U songtrackpro -d songtrackpro -f 007-create-triggers.sql
```

### Using Docker

```bash
# Copy migrations to container and run
docker cp migrations/ songtrackpro-postgres:/migrations
docker exec -it songtrackpro-postgres bash -c "cd /migrations && psql -U songtrackpro -d songtrackpro -f 001-create-extensions.sql"
# ... repeat for each migration
```

## Schema Overview

### Core Tables

- **users** - User accounts with authentication
- **organizations** - Artist/label/agency organizations
- **organization_members** - Role-based access control
- **subscriptions** - Stripe subscription management
- **invoices** - Billing history
- **payment_methods** - Payment methods

### Campaign Management

- **tracks** - Music tracks/songs
- **campaigns** - Marketing campaigns
- **campaign_goals** - Campaign objectives and KPIs
- **audiences** - Target audiences
- **audience_insights** - Audience demographics

### Integrations

- **integrations** - Meta/Spotify API connections
- **api_keys** - API access keys
- **refresh_tokens** - JWT refresh tokens
- **notifications** - User notifications

## Indexes

All tables include appropriate indexes for:
- Foreign keys
- Frequently queried columns
- Full-text search (trigram indexes)
- Unique constraints

## Data Types

### Enums
- `user_role`: artist, label, agency, admin
- `subscription_tier`: free, starter, professional, enterprise
- `subscription_status`: active, past_due, canceled, trialing, incomplete
- `campaign_status`: draft, active, paused, completed, archived
- `integration_provider`: meta, spotify
- `integration_status`: connected, disconnected, error, expired

### JSONB Fields
Used for flexible schema fields:
- Organization settings
- Campaign targeting and creative assets
- Audience criteria
- Integration metadata

## Best Practices

1. Always backup before running migrations in production
2. Test migrations in development first
3. Run migrations during low-traffic periods
4. Monitor for long-running queries
5. Keep migrations idempotent when possible