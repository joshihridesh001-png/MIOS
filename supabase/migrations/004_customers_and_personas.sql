-- ==============================================================================
-- MIOS Migration 004: Customers, CX Feedback & Buyer Personas Schema
-- Governed by ADR-001 (ISO/IEC 25010 Quality Model, SOLID, RLS Enforcement)
-- ==============================================================================

-- 1. Create Property Type and Customer Status Types if they don't exist
DO $$ BEGIN
  CREATE TYPE public.customer_property_type AS ENUM ('residential', 'commercial', 'industrial', 'other');
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
  property_type TEXT NOT NULL DEFAULT 'residential',
  
  -- Attribution Chain
  lead_source TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  campaign_creative_id UUID REFERENCES public.creatives(id) ON DELETE SET NULL,
  
  -- Financial Economics
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ltv DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Pre-Sale Consumer Psychology (The Gold Mine)
  why_contacted TEXT,
  biggest_fear TEXT,
  biggest_objection TEXT,
  why_chose_us TEXT,
  what_built_trust TEXT,
  questions_asked TEXT,
  
  -- Post-Job CX & Operational Feedback
  cx_rating INTEGER CHECK (cx_rating >= 1 AND cx_rating <= 5),
  job_quality_feedback TEXT,
  improvement_opportunities TEXT[] DEFAULT '{}',
  has_review BOOLEAN NOT NULL DEFAULT false,
  has_referral BOOLEAN NOT NULL DEFAULT false,
  amc_opportunity BOOLEAN NOT NULL DEFAULT false,
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
  property_type TEXT NOT NULL DEFAULT 'residential',
  pest_type TEXT,
  
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
CREATE INDEX IF NOT EXISTS idx_customers_property_type ON public.customers(property_type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_buyer_personas_property ON public.buyer_personas(property_type);

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

-- 7. Seed Initial Baseline Buyer Personas (Residential vs Commercial)
INSERT INTO public.buyer_personas (
  name, property_type, pest_type, dominant_fears, dominant_objections, trust_builders, 
  recommended_creative_angles, avg_cx_rating, top_improvement_opportunities, avg_ltv, sample_size, is_custom
)
SELECT
  'The Frantic Residential Bedbug Buyer',
  'residential',
  'bed_bugs',
  ARRAY['Chemical toxicity for children and pets', 'Infestation returning after treatment', 'Social stigma of neighbors knowing'],
  ARRAY['High price compared to local DIY sprays', 'Will we have to vacate the house for days?'],
  ARRAY['100% Botanical / Non-Toxic Certification', '180-Day Re-Infestation Guarantee', 'Unmarked Service Vehicles'],
  '[
    {
      "hook": "Bedbugs hiding in your child''s mattress? Don''t use toxic chemical sprays.",
      "headline": "100% Kid & Pet Safe Botanical Bedbug Eradication — Guaranteed in 24 Hours.",
      "emotion": "fear",
      "psych_principle": "Loss Aversion & Protection Instinct",
      "rationale": "Directly addresses the dominant fear of chemical toxicity while triggering immediate action."
    },
    {
      "hook": "Tried DIY sprays and they came back 2 weeks later?",
      "headline": "Why Bedbug Sprays Fail (And The Heat Technology That Ends Them Permanently).",
      "emotion": "authority",
      "psych_principle": "Education & Authority Positioning",
      "rationale": "Overcomes the objection to professional pricing by demonstrating why cheap DIY fails."
    }
  ]'::jsonb,
  4.80,
  ARRAY['Ensure technicians explain post-job ventilation timing clearly', 'Offer protective mattress encasements at checkout'],
  12500.00,
  142,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.buyer_personas WHERE name = 'The Frantic Residential Bedbug Buyer'
);

INSERT INTO public.buyer_personas (
  name, property_type, pest_type, dominant_fears, dominant_objections, trust_builders, 
  recommended_creative_angles, avg_cx_rating, top_improvement_opportunities, avg_ltv, sample_size, is_custom
)
SELECT
  'The Commercial Warehouse Facilities Manager',
  'commercial',
  'rodents',
  ARRAY['Health inspection failure & warehouse closure', 'Rodent damage to stored inventory & wiring', 'Disruption to active loading dock operations'],
  ARRAY['Can your team work overnight without disrupting forklift traffic?', 'Is your AMC reporting compliant with audit standards?'],
  ARRAY['ISO/HACCP Digital Compliance Reports', 'Overnight & Sunday Service Teams', 'Dedicated Account Manager'],
  '[
    {
      "hook": "One rodent in your food warehouse can cost Rs 5 Lakhs in inspection fines.",
      "headline": "Audit-Ready Commercial Rodent Shield — Zero Operational Disruption.",
      "emotion": "authority",
      "psych_principle": "Risk Mitigation & Compliance Proof",
      "rationale": "Speaks to the facilities manager''s KPI: passing audits and avoiding downtime."
    }
  ]'::jsonb,
  4.65,
  ARRAY['Automate monthly digital audit PDF emails to warehouse managers', 'Introduce Annual Maintenance Contract (AMC) renewal discount tiers'],
  75000.00,
  38,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.buyer_personas WHERE name = 'The Commercial Warehouse Facilities Manager'
);
