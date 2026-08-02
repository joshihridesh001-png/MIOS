-- ============================================================
-- MIOS SLICE 2: CREATIVES (AD LIBRARY & ASSET PERFORMANCE)
-- Idempotent schema migration for Creatives
-- ============================================================

-- 1. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE creative_format AS ENUM ('image', 'video', 'carousel', 'text', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE creative_status AS ENUM ('draft', 'active', 'testing', 'fatigued', 'retired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE creative_angle AS ENUM (
    'discount_offer',
    'fear_urgency',
    'social_proof_reviews',
    'educational',
    'authority_guarantee',
    'before_after',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. TABLE: creatives
CREATE TABLE IF NOT EXISTS creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  format creative_format NOT NULL DEFAULT 'image',
  status creative_status NOT NULL DEFAULT 'draft',
  angle creative_angle NOT NULL DEFAULT 'discount_offer',
  platform platform_type DEFAULT 'meta_ads',
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Creative Copy & Asset
  headline text DEFAULT '',
  primary_text text DEFAULT '',
  cta_text text DEFAULT 'Learn More',
  asset_url text DEFAULT '',
  
  -- Performance Metrics
  spend numeric(12,2) NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  inquiries integer NOT NULL DEFAULT 0,
  customers_won integer NOT NULL DEFAULT 0,
  revenue numeric(12,2) NOT NULL DEFAULT 0,
  fatigue_score integer NOT NULL DEFAULT 0 CHECK (fatigue_score >= 0 AND fatigue_score <= 100),
  
  -- Strategy & Reflection
  hook_hypothesis text DEFAULT '',
  what_worked text DEFAULT '',
  what_failed text DEFAULT '',
  tags text[] DEFAULT '{}',
  
  -- Audit Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_creatives_format ON creatives(format);
CREATE INDEX IF NOT EXISTS idx_creatives_status ON creatives(status);
CREATE INDEX IF NOT EXISTS idx_creatives_angle ON creatives(angle);
CREATE INDEX IF NOT EXISTS idx_creatives_campaign ON creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creatives_platform ON creatives(platform);

-- 4. VIEW: creatives_with_metrics
DROP VIEW IF EXISTS creatives_with_metrics CASCADE;

CREATE VIEW creatives_with_metrics
WITH (security_invoker = true)
AS SELECT 
  cr.*,
  CASE WHEN cr.impressions > 0 
    THEN ROUND((cr.clicks::decimal / cr.impressions) * 100, 2) 
  END AS ctr,
  CASE WHEN cr.clicks > 0 
    THEN ROUND(cr.spend / cr.clicks, 2) 
  END AS cpc,
  CASE WHEN cr.spend > 0 
    THEN ROUND(cr.revenue / cr.spend, 2) 
  END AS roas,
  (cr.revenue - cr.spend) AS net_profit,
  CASE WHEN cr.inquiries > 0 
    THEN ROUND((cr.customers_won::decimal / cr.inquiries) * 100, 2)
  END AS conversion_rate
FROM creatives cr;

-- 5. TRIGGERS
DO $$ BEGIN
  CREATE TRIGGER creatives_updated_at BEFORE UPDATE ON creatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. RLS POLICIES
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Enable all access for authenticated users on creatives"
    ON creatives FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
