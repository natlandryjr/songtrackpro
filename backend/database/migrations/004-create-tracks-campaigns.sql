-- Migration: 004-create-tracks-campaigns
-- Description: Create tracks and campaigns tables
-- Date: 2025-09-29

-- Create enum types
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');

-- Tracks table
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  release_date DATE,
  duration INTEGER,
  isrc VARCHAR(12) UNIQUE,
  spotify_id VARCHAR(255) UNIQUE,
  spotify_uri VARCHAR(255),
  apple_id VARCHAR(255),
  cover_art_url VARCHAR(512),
  genres TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for tracks
CREATE INDEX idx_tracks_organization_id ON tracks(organization_id);
CREATE INDEX idx_tracks_spotify_id ON tracks(spotify_id);
CREATE INDEX idx_tracks_isrc ON tracks(isrc);
CREATE INDEX idx_tracks_artist ON tracks(artist);
CREATE INDEX idx_tracks_title ON tracks(title);
CREATE INDEX idx_tracks_title_trgm ON tracks USING gin (title gin_trgm_ops);
CREATE INDEX idx_tracks_artist_trgm ON tracks USING gin (artist gin_trgm_ops);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  objective VARCHAR(255) NOT NULL,
  budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  budget_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  meta_ad_account_id VARCHAR(255),
  meta_campaign_id VARCHAR(255),
  target_audience JSONB NOT NULL DEFAULT '{}',
  creative_assets JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for campaigns
CREATE INDEX idx_campaigns_organization_id ON campaigns(organization_id);
CREATE INDEX idx_campaigns_track_id ON campaigns(track_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_meta_campaign_id ON campaigns(meta_campaign_id);

-- Campaign goals table
CREATE TABLE campaign_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('streams', 'followers', 'engagement', 'conversions', 'reach')),
  target INTEGER NOT NULL,
  current INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for campaign_goals
CREATE INDEX idx_campaign_goals_campaign_id ON campaign_goals(campaign_id);
CREATE INDEX idx_campaign_goals_type ON campaign_goals(type);