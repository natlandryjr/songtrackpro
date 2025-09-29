-- Migration: 005-create-audiences-integrations
-- Description: Create audiences and integrations tables
-- Date: 2025-09-29

-- Create enum types
CREATE TYPE integration_provider AS ENUM ('meta', 'spotify');
CREATE TYPE integration_status AS ENUM ('connected', 'disconnected', 'error', 'expired');

-- Audiences table
CREATE TABLE audiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  size INTEGER,
  criteria JSONB NOT NULL DEFAULT '{}',
  meta_audience_id VARCHAR(255),
  is_custom BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for audiences
CREATE INDEX idx_audiences_organization_id ON audiences(organization_id);
CREATE INDEX idx_audiences_meta_audience_id ON audiences(meta_audience_id);
CREATE INDEX idx_audiences_created_by ON audiences(created_by);
CREATE INDEX idx_audiences_is_custom ON audiences(is_custom);

-- Audience insights table
CREATE TABLE audience_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audience_id UUID NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  demographics JSONB NOT NULL DEFAULT '{}',
  interests JSONB NOT NULL DEFAULT '{}',
  behaviors JSONB NOT NULL DEFAULT '{}',
  locations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for audience_insights
CREATE INDEX idx_audience_insights_audience_id ON audience_insights(audience_id);
CREATE INDEX idx_audience_insights_date ON audience_insights(date);

-- Integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider integration_provider NOT NULL,
  status integration_status NOT NULL DEFAULT 'connected',
  account_id VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  last_sync_at TIMESTAMP,
  last_error_at TIMESTAMP,
  last_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, provider)
);

-- Create indexes for integrations
CREATE INDEX idx_integrations_organization_id ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_account_id ON integrations(account_id);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_last_sync_at ON integrations(last_sync_at);

-- API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) NOT NULL UNIQUE,
  key_hash VARCHAR(255) NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for api_keys
CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_created_by ON api_keys(created_by);