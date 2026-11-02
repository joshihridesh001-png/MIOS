-- ==============================================================================
-- MIOS Migration 007: Business Unit Economics & Sales-Cycle Lag Calibration
-- Idempotent schema setup for first-principles CAC ceilings, CPL thresholds,
-- and sales-cycle maturity lag parameters.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.business_unit_economics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_preset TEXT NOT NULL DEFAULT 'b2b_advisory',
  business_name TEXT NOT NULL,
  avg_ltv NUMERIC(12, 2) NOT NULL,
  gross_margin_pct NUMERIC(5, 2) NOT NULL,
  target_ltv_cac_ratio NUMERIC(5, 2) NOT NULL,
  avg_sales_cycle_days INTEGER NOT NULL,
  target_lead_to_close_rate NUMERIC(5, 2) NOT NULL,
  min_spend_for_evaluation NUMERIC(12, 2) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.business_unit_economics ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policy for authenticated users
DO $$ BEGIN
  CREATE POLICY "Enable access for authenticated users on business_unit_economics"
  ON public.business_unit_economics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Attach updated_at trigger if update_updated_at() function exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    DROP TRIGGER IF EXISTS trg_business_unit_economics_updated_at ON public.business_unit_economics;
    CREATE TRIGGER trg_business_unit_economics_updated_at
      BEFORE UPDATE ON public.business_unit_economics
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- Seed default B2B Accounting & Advisory profile if table is empty
INSERT INTO public.business_unit_economics (
  industry_preset,
  business_name,
  avg_ltv,
  gross_margin_pct,
  target_ltv_cac_ratio,
  avg_sales_cycle_days,
  target_lead_to_close_rate,
  min_spend_for_evaluation
)
SELECT
  'b2b_advisory',
  'B2B Accounting & Advisory',
  180000.00,
  75.00,
  3.00,
  30,
  15.00,
  15000.00
WHERE NOT EXISTS (
  SELECT 1 FROM public.business_unit_economics
);
