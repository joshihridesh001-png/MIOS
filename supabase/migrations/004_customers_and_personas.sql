-- ==============================================================================
-- MIOS Migration 004: Customers, CX Feedback & Buyer Personas Schema
-- Governed by ADR-001 (ISO/IEC 25010 Quality Model, SOLID, RLS Enforcement)
-- ==============================================================================

-- 1. Create Client Segment and Customer Status Types if they don't exist
DO $$ BEGIN
  CREATE TYPE public.customer_segment_type AS ENUM ('b2c', 'b2b_smb', 'b2b_mid_market', 'b2b_enterprise', 'local_service', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.customer_status AS ENUM ('lead', 'quoted', 'won', 'lost', 'churned');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create Customers Table (Consumer Psychology, Attribution & Post-Job CX)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  client_segment TEXT NOT NULL DEFAULT 'b2c',
  
  -- Attribution Chain
  lead_source TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  campaign_creative_id UUID REFERENCES public.creatives(id) ON DELETE SET NULL,
  
  -- Financial Economics
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ltv DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Pre-Sale Consumer Psychology
  why_contacted TEXT,
  biggest_fear TEXT,
  biggest_objection TEXT,
  why_chose_us TEXT,
  what_built_trust TEXT,
  questions_asked TEXT,
  
  -- Post-Engagement CX & Operational Feedback
  cx_rating INTEGER CHECK (cx_rating >= 1 AND cx_rating <= 5),
  job_quality_feedback TEXT,
  improvement_opportunities TEXT[] DEFAULT '{}',
  has_review BOOLEAN NOT NULL DEFAULT false,
  has_referral BOOLEAN NOT NULL DEFAULT false,
  retainer_opportunity BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'won',
  
  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3. Create Buyer Personas Table (Active Creative Collaborator & CX Monitor)
CREATE TABLE IF NOT EXISTS public.buyer_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_segment TEXT NOT NULL DEFAULT 'b2c',
  service_category TEXT,
  
  -- Aggregated & Editable Psychological Clusters
  dominant_fears TEXT[] DEFAULT '{}',
  dominant_objections TEXT[] DEFAULT '{}',
  trust_builders TEXT[] DEFAULT '{}',
  
  -- Creative Library Collaborator (JSONB Array of recommended angles)
  -- Format: [{ hook: "...", headline: "...", emotion: "...", psych_principle: "...", rationale: "..." }]
  recommended_creative_angles JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- CX & LTV Intelligence
  avg_cx_rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  top_improvement_opportunities TEXT[] DEFAULT '{}',
  avg_ltv DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sample_size INTEGER NOT NULL DEFAULT 0,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  
  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 4. Create Performance Indexes for Executive Dashboards
CREATE INDEX IF NOT EXISTS idx_customers_campaign ON public.customers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_customers_client_segment ON public.customers(client_segment);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_buyer_personas_segment ON public.buyer_personas(client_segment);

-- 5. Enable Row Level Security (RLS) on Both Tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_personas ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Access Policies (Unrestricted internal authenticated access for MVP per CEO request)
DO $$ BEGIN
  CREATE POLICY "Enable access for authenticated users on customers"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable access for authenticated users on buyer_personas"
  ON public.buyer_personas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 7. Seed Initial Baseline Buyer Personas (Industry-Agnostic Service Businesses)
INSERT INTO public.buyer_personas (
  name, client_segment, service_category, dominant_fears, dominant_objections, trust_builders, 
  recommended_creative_angles, avg_cx_rating, top_improvement_opportunities, avg_ltv, sample_size, is_custom
)
SELECT
  'High-Intent B2B Retainer Decision Maker',
  'b2b_smb',
  'Advisory & Accounting',
  ARRAY['Compliance penalties and missed regulatory deadlines', 'Cashflow blindspots during quarterly expansion', 'Disruptive or disorganized onboarding process'],
  ARRAY['High switching cost from existing provider', 'Unclear retainer ROI in the first 90 days'],
  ARRAY['Contractual SLA & response-time guarantees', 'Audited client case studies with quantified ROI', 'Dedicated senior account partner'],
  '[
    {
      "hook": "Outgrowing your current advisory firm? Don''t wait for a compliance penalty to expose blindspots.",
      "headline": "Audit-Ready Financial Advisory & Monthly Forecasting — Zero Onboarding Disruption.",
      "emotion": "authority",
      "psych_principle": "Risk Mitigation & Authority Positioning",
      "rationale": "Addresses the executive fear of compliance and cashflow blindspots while removing onboarding friction."
    },
    {
      "hook": "Paying a monthly retainer without clear visibility into margin improvement?",
      "headline": "How SMB Leaders Recover 3x Their Retainer Cost in 90 Days Through Structured Advisory.",
      "emotion": "trust",
      "psych_principle": "Quantified Proof & ROI Clarity",
      "rationale": "Directly resolves the retainer ROI and switching-cost objection with concrete value framing."
    }
  ]'::jsonb,
  4.80,
  ARRAY['Standardize 14-day onboarding checklist milestones', 'Include quarterly executive KPI summary in monthly reporting'],
  85000.00,
  64,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.buyer_personas WHERE name = 'High-Intent B2B Retainer Decision Maker'
);

INSERT INTO public.buyer_personas (
  name, client_segment, service_category, dominant_fears, dominant_objections, trust_builders, 
  recommended_creative_angles, avg_cx_rating, top_improvement_opportunities, avg_ltv, sample_size, is_custom
)
SELECT
  'Local Brick-and-Mortar High-LTV Client',
  'b2c',
  'Local Clinic & Specialist Services',
  ARRAY['Hidden post-visit fees and surprise billing', 'Inconsistent service quality or rushed appointments', 'Wasted time in waiting rooms despite booking'],
  ARRAY['Higher upfront pricing compared to budget clinics', 'Uncertainty whether specialist care is necessary now'],
  ARRAY['Verified local client reviews and video testimonials', 'Transparent upfront pricing schedule', 'Written service satisfaction guarantee'],
  '[
    {
      "hook": "Tired of rushed 5-minute appointments and surprise charges after your visit?",
      "headline": "Specialist Care With Transparent Upfront Pricing — On-Time Appointments Guaranteed.",
      "emotion": "trust",
      "psych_principle": "Transparency & Certainty",
      "rationale": "Eliminates anxiety around hidden fees and wasted time while differentiating from high-volume budget alternatives."
    }
  ]'::jsonb,
  4.75,
  ARRAY['Send automated pre-visit pricing and preparation summary via WhatsApp', 'Introduce annual preventive care membership packages'],
  24000.00,
  142,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.buyer_personas WHERE name = 'Local Brick-and-Mortar High-LTV Client'
);
