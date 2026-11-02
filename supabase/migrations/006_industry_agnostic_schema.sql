-- ==============================================================================
-- MIOS Migration 006: Industry-Agnostic Service Business Schema Upgrade
-- 100% Idempotent migration from legacy domain columns/seeds to universal
-- service-business ontology (campaigns, customers, buyer_personas, experiments).
-- ==============================================================================

-- 1. Ensure customer_segment_type enum exists and extend customer_property_type if present
DO $$ BEGIN
  CREATE TYPE public.customer_segment_type AS ENUM (
    'b2c',
    'b2b_smb',
    'b2b_mid_market',
    'b2b_enterprise',
    'local_service',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_property_type') THEN
    ALTER TYPE public.customer_property_type ADD VALUE IF NOT EXISTS 'b2c';
    ALTER TYPE public.customer_property_type ADD VALUE IF NOT EXISTS 'b2b_smb';
    ALTER TYPE public.customer_property_type ADD VALUE IF NOT EXISTS 'b2b_mid_market';
    ALTER TYPE public.customer_property_type ADD VALUE IF NOT EXISTS 'b2b_enterprise';
    ALTER TYPE public.customer_property_type ADD VALUE IF NOT EXISTS 'local_service';
    ALTER TYPE public.customer_property_type ADD VALUE IF NOT EXISTS 'other';
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Drop dependent view before renaming campaigns column, then rename & recreate view
DROP VIEW IF EXISTS public.campaigns_with_metrics CASCADE;

DO $$ BEGIN
  -- campaigns.pest_type -> campaigns.market_segment
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'pest_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'market_segment'
  ) THEN
    ALTER TABLE public.campaigns RENAME COLUMN pest_type TO market_segment;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'market_segment'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN market_segment TEXT;
  END IF;

  -- customers.property_type -> customers.client_segment
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'property_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'client_segment'
  ) THEN
    ALTER TABLE public.customers RENAME COLUMN property_type TO client_segment;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'client_segment'
  ) THEN
    ALTER TABLE public.customers ALTER COLUMN client_segment SET DEFAULT 'b2c';
    UPDATE public.customers SET client_segment = 'b2c' WHERE client_segment = 'residential';
    UPDATE public.customers SET client_segment = 'b2b_smb' WHERE client_segment = 'commercial';
    UPDATE public.customers SET client_segment = 'b2b_enterprise' WHERE client_segment = 'industrial';
  END IF;

  -- customers.amc_opportunity -> customers.retainer_opportunity
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'amc_opportunity'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'retainer_opportunity'
  ) THEN
    ALTER TABLE public.customers RENAME COLUMN amc_opportunity TO retainer_opportunity;
  END IF;

  -- buyer_personas.property_type -> buyer_personas.client_segment
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'buyer_personas' AND column_name = 'property_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'buyer_personas' AND column_name = 'client_segment'
  ) THEN
    ALTER TABLE public.buyer_personas RENAME COLUMN property_type TO client_segment;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'buyer_personas' AND column_name = 'client_segment'
  ) THEN
    ALTER TABLE public.buyer_personas ALTER COLUMN client_segment SET DEFAULT 'b2c';
    UPDATE public.buyer_personas SET client_segment = 'b2c' WHERE client_segment = 'residential';
    UPDATE public.buyer_personas SET client_segment = 'b2b_smb' WHERE client_segment = 'commercial';
    UPDATE public.buyer_personas SET client_segment = 'b2b_enterprise' WHERE client_segment = 'industrial';
  END IF;

  -- buyer_personas.pest_type -> buyer_personas.service_category
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'buyer_personas' AND column_name = 'pest_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'buyer_personas' AND column_name = 'service_category'
  ) THEN
    ALTER TABLE public.buyer_personas RENAME COLUMN pest_type TO service_category;
  END IF;
END $$;

-- 3. Recreate campaigns_with_metrics view
CREATE OR REPLACE VIEW public.campaigns_with_metrics
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
  (c.revenue - c.cogs - c.spend) AS net_profit,
  CASE
    WHEN c.inquiries > 0 THEN ROUND((c.customers_won::decimal / c.inquiries) * 100, 2)
    WHEN (c.messages + c.calls + c.qualified_leads) > 0 THEN ROUND((c.customers_won::decimal / (c.messages + c.calls + c.qualified_leads)) * 100, 2)
  END AS conversion_rate
FROM public.campaigns c;

-- 4. Refresh indexes on renamed columns
DROP INDEX IF EXISTS public.idx_customers_property_type;
DROP INDEX IF EXISTS public.idx_buyer_personas_property;
CREATE INDEX IF NOT EXISTS idx_customers_client_segment ON public.customers(client_segment);
CREATE INDEX IF NOT EXISTS idx_buyer_personas_segment ON public.buyer_personas(client_segment);

-- 5. Replace legacy pest-control personas with industry-agnostic service-business personas
DELETE FROM public.buyer_personas
WHERE name IN (
  'The Frantic Residential Bedbug Buyer',
  'The Commercial Warehouse Facilities Manager'
) OR service_category IN ('bed_bugs', 'rodents', 'termites');

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
