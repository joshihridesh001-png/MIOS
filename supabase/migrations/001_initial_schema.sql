-- ============================================================
-- MARKETING INTELLIGENCE OS — Initial Migration
-- Slice 1: Profiles + Campaigns + Learnings + Audit
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE platform_type AS ENUM (
  'meta_ads', 'google_ads', 'whatsapp', 
  'organic_social', 'offline', 'other'
);

CREATE TYPE campaign_status AS ENUM (
  'draft', 'active', 'paused', 'completed', 'archived'
);

CREATE TYPE confidence_level AS ENUM ('low', 'medium', 'high');

CREATE TYPE user_role AS ENUM ('ceo', 'cmo', 'marketing_intern');

CREATE TYPE learning_source AS ENUM (
  'campaign', 'creative', 'experiment', 'customer', 'manual'
);

CREATE TYPE learning_category AS ENUM (
  'marketing', 'sales', 'operations', 
  'customer_psychology', 'pricing', 'competitor', 'other'
);

CREATE TYPE audit_action AS ENUM ('insert', 'update', 'delete');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  role        user_role NOT NULL DEFAULT 'marketing_intern',
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Campaigns
CREATE TABLE campaigns (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  platform            platform_type,
  objective           text,
  status              campaign_status NOT NULL DEFAULT 'draft',
  start_date          date,
  end_date            date,
  owner_id            uuid REFERENCES profiles(id),
  -- Targeting & Offer
  target_audience     text,
  service             text,
  market_segment      text,
  location            text,
  offer               text,
  cta                 text,
  landing_destination text,
  -- Raw Metrics
  spend               decimal(12,2) DEFAULT 0,
  reach               integer DEFAULT 0,
  impressions         integer DEFAULT 0,
  clicks              integer DEFAULT 0,
  messages            integer DEFAULT 0,
  calls               integer DEFAULT 0,
  site_visits         integer DEFAULT 0,
  inquiries           integer DEFAULT 0,
  qualified_leads     integer DEFAULT 0,
  quotes_sent         integer DEFAULT 0,
  customers_won       integer DEFAULT 0,
  revenue             decimal(12,2) DEFAULT 0,
  cogs                decimal(12,2) DEFAULT 0,
  -- Reflection
  hypothesis          text,
  result_summary      text,
  what_worked         text,
  what_failed         text,
  next_experiment     text,
  confidence          confidence_level,
  -- Audit
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid REFERENCES profiles(id),
  updated_by          uuid REFERENCES profiles(id)
);

-- Learnings
CREATE TABLE learnings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight              text NOT NULL,
  source_type          learning_source NOT NULL,
  source_id            uuid,
  category             learning_category NOT NULL DEFAULT 'marketing',
  -- Confidence Algorithm fields
  confidence_score     decimal(5,2) DEFAULT 0,
  supporting_count     integer DEFAULT 1,
  confirmations        integer DEFAULT 0,
  total_tests          integer DEFAULT 0,
  contradiction_count  integer DEFAULT 0,
  avg_improvement      decimal(8,2) DEFAULT 0,
  last_confirmed_at    timestamptz,
  confidence_breakdown jsonb DEFAULT '{}',
  -- Other
  tags                 jsonb DEFAULT '[]',
  is_active            boolean NOT NULL DEFAULT true,
  superseded_by        uuid REFERENCES learnings(id),
  -- Audit
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid REFERENCES profiles(id),
  updated_by           uuid REFERENCES profiles(id)
);

-- Audit Log
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  text NOT NULL,
  record_id   uuid NOT NULL,
  action      audit_action NOT NULL,
  old_values  jsonb,
  new_values  jsonb,
  changed_by  uuid REFERENCES profiles(id),
  changed_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. CALCULATED METRICS VIEW
-- ============================================================

DROP VIEW IF EXISTS campaigns_with_metrics CASCADE;

CREATE VIEW campaigns_with_metrics
WITH (security_invoker = true)
AS SELECT
  c.*,
  CASE WHEN c.impressions > 0 
    THEN ROUND((c.clicks::decimal / c.impressions) * 100, 2) 
  END AS ctr,
  CASE WHEN c.impressions > 0 
    THEN ROUND((c.spend / c.impressions) * 1000, 2) 
  END AS cpm,
  CASE WHEN c.clicks > 0 
    THEN ROUND(c.spend / c.clicks, 2) 
  END AS cpc,
  CASE WHEN c.qualified_leads > 0 
    THEN ROUND(c.spend / c.qualified_leads, 2) 
  END AS cpl,
  CASE WHEN c.customers_won > 0 
    THEN ROUND(c.spend / c.customers_won, 2) 
  END AS cac,
  CASE WHEN c.spend > 0 
    THEN ROUND(c.revenue / c.spend, 2) 
  END AS roas,
  (c.revenue - c.cogs) AS gross_profit,
  CASE 
    WHEN c.inquiries > 0 THEN ROUND((c.customers_won::decimal / c.inquiries) * 100, 2)
    WHEN (c.messages + c.calls + c.qualified_leads) > 0 THEN ROUND((c.customers_won::decimal / (c.messages + c.calls + c.qualified_leads)) * 100, 2)
  END AS conversion_rate
FROM campaigns c;

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER learnings_updated_at BEFORE UPDATE ON learnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit trigger (SECURITY DEFINER to bypass RLS for audit writes)
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'insert', to_jsonb(NEW), NEW.created_by);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), NEW.updated_by);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values)
    VALUES (TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$;

-- Revoke direct execution (trigger-only)
REVOKE EXECUTE ON FUNCTION audit_trigger_fn() FROM anon, authenticated;

CREATE TRIGGER campaigns_audit AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER learnings_audit AFTER INSERT OR UPDATE OR DELETE ON learnings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'marketing_intern')
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 5. ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- CAMPAIGNS
CREATE POLICY "Authenticated users can view campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CEO and CMO can insert campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('ceo', 'cmo')
    )
  );

CREATE POLICY "CEO and CMO can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('ceo', 'cmo')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('ceo', 'cmo')
    )
  );

CREATE POLICY "CEO can delete campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role = 'ceo'
    )
  );

-- LEARNINGS
CREATE POLICY "Authenticated users can view learnings"
  ON learnings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CEO and CMO can insert learnings"
  ON learnings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('ceo', 'cmo')
    )
  );

CREATE POLICY "CEO and CMO can update learnings"
  ON learnings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('ceo', 'cmo')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('ceo', 'cmo')
    )
  );

CREATE POLICY "CEO can delete learnings"
  ON learnings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role = 'ceo'
    )
  );

-- AUDIT LOG
CREATE POLICY "CEO can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (select auth.uid()) 
      AND role = 'ceo'
    )
  );

-- ============================================================
-- 6. INDEXES
-- ============================================================

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_platform ON campaigns(platform);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_learnings_source ON learnings(source_type, source_id);
CREATE INDEX idx_learnings_category ON learnings(category);
CREATE INDEX idx_learnings_active ON learnings(is_active) WHERE is_active = true;
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
