-- ============================================================
-- 000_full_setup.sql (100% IDEMPOTENT COMPLETE SETUP)
-- Marketing Intelligence OS — Database Schema + CEO Account
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. ENUMS (Idempotent creation)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE platform_type AS ENUM ('meta_ads', 'google_ads', 'whatsapp', 'organic_social', 'offline', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE confidence_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ceo', 'cmo', 'marketing_intern');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE learning_source AS ENUM ('campaign', 'creative', 'experiment', 'customer', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE learning_category AS ENUM ('marketing', 'sales', 'operations', 'customer_psychology', 'pricing', 'competitor', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM ('insert', 'update', 'delete');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'marketing_intern',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  platform platform_type,
  objective text,
  status campaign_status NOT NULL DEFAULT 'draft',
  start_date date,
  end_date date,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,

  -- Target & Offer Context
  target_audience text,
  service text,
  pest_type text,
  location text,
  offer text,
  cta text,
  landing_destination text,

  -- Raw Performance Inputs
  spend numeric(12,2) NOT NULL DEFAULT 0,
  reach integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  messages integer NOT NULL DEFAULT 0,
  calls integer NOT NULL DEFAULT 0,
  site_visits integer NOT NULL DEFAULT 0,
  inquiries integer NOT NULL DEFAULT 0,
  qualified_leads integer NOT NULL DEFAULT 0,
  quotes_sent integer NOT NULL DEFAULT 0,
  customers_won integer NOT NULL DEFAULT 0,
  revenue numeric(12,2) NOT NULL DEFAULT 0,
  cogs numeric(12,2) NOT NULL DEFAULT 0,

  -- Reflection & Learning Hook
  hypothesis text,
  result_summary text,
  what_worked text,
  what_failed text,
  next_experiment text,
  confidence confidence_level,

  -- Audit Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS inquiries integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS learnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight text NOT NULL,
  source_type learning_source NOT NULL,
  source_id uuid,
  category learning_category NOT NULL,
  confidence_score integer NOT NULL DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  supporting_count integer NOT NULL DEFAULT 1,
  confirmations integer NOT NULL DEFAULT 1,
  total_tests integer NOT NULL DEFAULT 1,
  contradiction_count integer NOT NULL DEFAULT 0,
  avg_improvement numeric(6,2) NOT NULL DEFAULT 0,
  last_confirmed_at timestamptz DEFAULT now(),
  confidence_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  superseded_by uuid REFERENCES learnings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action audit_action NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_learnings_category ON learnings(category);
CREATE INDEX IF NOT EXISTS idx_learnings_active ON learnings(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- ============================================================
-- 3. CALCULATED METRICS VIEW
-- ============================================================

DROP VIEW IF EXISTS campaigns_with_metrics CASCADE;

CREATE OR REPLACE VIEW campaigns_with_metrics AS
SELECT 
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
  (c.revenue - c.cogs - c.spend) AS net_profit,
  CASE 
    WHEN c.inquiries > 0 THEN ROUND((c.customers_won::decimal / c.inquiries) * 100, 2)
    WHEN (c.messages + c.calls + c.qualified_leads) > 0 THEN ROUND((c.customers_won::decimal / (c.messages + c.calls + c.qualified_leads)) * 100, 2)
  END AS conversion_rate
FROM campaigns c;

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS campaigns_updated_at ON campaigns;
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS learnings_updated_at ON learnings;
CREATE TRIGGER learnings_updated_at BEFORE UPDATE ON learnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
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

REVOKE EXECUTE ON FUNCTION audit_trigger_fn() FROM anon, authenticated;

DROP TRIGGER IF EXISTS campaigns_audit ON campaigns;
CREATE TRIGGER campaigns_audit AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

DROP TRIGGER IF EXISTS learnings_audit ON learnings;
CREATE TRIGGER learnings_audit AFTER INSERT OR UPDATE OR DELETE ON learnings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'marketing_intern')
  )
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 5. ROW-LEVEL SECURITY (Idempotent Policy Creation)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- CAMPAIGNS
DROP POLICY IF EXISTS "Authenticated users can view campaigns" ON campaigns;
CREATE POLICY "Authenticated users can view campaigns" ON campaigns FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "CEO and CMO can insert campaigns" ON campaigns;
CREATE POLICY "CEO and CMO can insert campaigns" ON campaigns FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('ceo', 'cmo')));

DROP POLICY IF EXISTS "CEO and CMO can update campaigns" ON campaigns;
CREATE POLICY "CEO and CMO can update campaigns" ON campaigns FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('ceo', 'cmo')));

DROP POLICY IF EXISTS "CEO can delete campaigns" ON campaigns;
CREATE POLICY "CEO can delete campaigns" ON campaigns FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ceo'));

-- LEARNINGS
DROP POLICY IF EXISTS "Authenticated users can view learnings" ON learnings;
CREATE POLICY "Authenticated users can view learnings" ON learnings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "CEO and CMO can insert learnings" ON learnings;
CREATE POLICY "CEO and CMO can insert learnings" ON learnings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('ceo', 'cmo')));

DROP POLICY IF EXISTS "CEO and CMO can update learnings" ON learnings;
CREATE POLICY "CEO and CMO can update learnings" ON learnings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('ceo', 'cmo')));

DROP POLICY IF EXISTS "CEO can delete learnings" ON learnings;
CREATE POLICY "CEO can delete learnings" ON learnings FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ceo'));

-- AUDIT LOG
DROP POLICY IF EXISTS "CEO and CMO can view audit log" ON audit_log;
CREATE POLICY "CEO and CMO can view audit log" ON audit_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('ceo', 'cmo')));

-- ============================================================
-- 6. CEO USER SETUP (GoTrue Compatible)
-- ============================================================

DELETE FROM auth.identities WHERE user_id = '11111111-1111-1111-1111-111111111111' OR identity_data->>'email' ILIKE '%ceo@hridesh%';
DELETE FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111' OR email ILIKE '%ceo@hridesh%';
DELETE FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'authenticated',
  'authenticated',
  'ceo@hridesh.co',
  crypt('SaSokKWqkpobCPAE', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Hridesh","role":"ceo"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"ceo@hridesh.co","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  '11111111-1111-1111-1111-111111111111',
  now(),
  now(),
  now()
);

INSERT INTO public.profiles (id, full_name, role)
VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'Hridesh', 'ceo')
ON CONFLICT (id) DO UPDATE
SET full_name = 'Hridesh',
    role = 'ceo';
