-- ==============================================================================
-- MIOS VERTICAL SLICE 5: EXPERIMENTS UPGRADE
-- Adds detailed metrics tracking and confidence thresholds.
-- ==============================================================================

-- 1. Add Thresholds
ALTER TABLE public.experiments 
ADD COLUMN IF NOT EXISTS target_confidence NUMERIC DEFAULT 80.0,
ADD COLUMN IF NOT EXISTS minimum_lift NUMERIC DEFAULT 15.0;

-- 2. Expand Control Metrics
ALTER TABLE public.experiments
ADD COLUMN IF NOT EXISTS control_spend NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS control_impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS control_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS control_conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS control_customers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS control_revenue NUMERIC DEFAULT 0;

-- 3. Expand Variant A Metrics
ALTER TABLE public.experiments
ADD COLUMN IF NOT EXISTS variant_a_spend NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_a_impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_a_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_a_conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_a_customers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_a_revenue NUMERIC DEFAULT 0;

-- 4. Expand Variant B Metrics
ALTER TABLE public.experiments
ADD COLUMN IF NOT EXISTS variant_b_spend NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_b_impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_b_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_b_conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_b_customers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_b_revenue NUMERIC DEFAULT 0;

-- Note: Rates (CTR, CVR) and efficiencies (CAC, CPM, ROI) should be calculated dynamically
-- in the application layer to maintain a single source of truth and avoid desync.
