-- ==============================================================================
-- MIOS VERTICAL SLICE 3: EXPERIMENTS (LABS / STRUCTURED GROWTH & A/B TESTING)
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE experiment_type AS ENUM ('a_b_test', 'multivariate', 'landing_page', 'pricing', 'offer', 'audience');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experiment_status AS ENUM ('queued', 'running', 'completed', 'aborted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experiment_impact AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create Experiments Table
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  test_code TEXT NOT NULL DEFAULT 'A/B-0x000',
  type experiment_type NOT NULL DEFAULT 'a_b_test',
  status experiment_status NOT NULL DEFAULT 'running',
  impact experiment_impact NOT NULL DEFAULT 'high',
  hypothesis_query TEXT NOT NULL,
  primary_metric TEXT NOT NULL DEFAULT 'ctr',
  target_lift NUMERIC DEFAULT 15.0,
  actual_lift NUMERIC DEFAULT 0.0,
  traffic_split TEXT DEFAULT '50/50',
  sample_size INTEGER DEFAULT 0,
  runtime_hours NUMERIC DEFAULT 0.0,
  confidence_score INTEGER DEFAULT 0,
  decision_protocol_notes TEXT[] DEFAULT '{}',
  control_name TEXT DEFAULT 'Control',
  control_metrics JSONB DEFAULT '{"ctr": 0, "cvr": 0, "conversions": 0}'::jsonb,
  variant_a_name TEXT DEFAULT 'Variant A',
  variant_a_metrics JSONB DEFAULT '{"ctr": 0, "cvr": 0, "conversions": 0}'::jsonb,
  variant_b_name TEXT DEFAULT 'Variant B',
  variant_b_metrics JSONB DEFAULT '{"ctr": 0, "cvr": 0, "conversions": 0}'::jsonb,
  winner_variant TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  creative_id UUID REFERENCES public.creatives(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 3. Enable RLS
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.experiments;
CREATE POLICY "Enable read access for all authenticated users" ON public.experiments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert access for all authenticated users" ON public.experiments;
CREATE POLICY "Enable insert access for all authenticated users" ON public.experiments
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all authenticated users" ON public.experiments;
CREATE POLICY "Enable update access for all authenticated users" ON public.experiments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for all authenticated users" ON public.experiments;
CREATE POLICY "Enable delete access for all authenticated users" ON public.experiments
  FOR DELETE TO authenticated USING (true);

-- 5. Updated_at Trigger
DROP TRIGGER IF EXISTS trg_experiments_updated_at ON public.experiments;
CREATE TRIGGER trg_experiments_updated_at
  BEFORE UPDATE ON public.experiments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 6. Insert Seed Marketing Experiments
INSERT INTO public.experiments (
  name,
  test_code,
  type,
  status,
  impact,
  hypothesis_query,
  primary_metric,
  target_lift,
  actual_lift,
  traffic_split,
  sample_size,
  runtime_hours,
  confidence_score,
  decision_protocol_notes,
  control_name,
  control_metrics,
  variant_a_name,
  variant_a_metrics,
  variant_b_name,
  variant_b_metrics,
  winner_variant
)
VALUES
(
  'Landing Page Intake Structure',
  'EXP-101',
  'a_b_test',
  'running',
  'high',
  'Replacing the single-page intake form with a 2-step qualification modal will increase lead conversion rate by 15%.',
  'ctr',
  15.0,
  18.4,
  '50/50',
  14204,
  48.2,
  88,
  ARRAY[
    'Variant B outperforming Control across primary conversion metrics.',
    'Statistical significance threshold (95%) not yet reached. Estimated remaining runtime: 13 hours.',
    'Secondary metric (Bounce Rate) remains within acceptable variance.'
  ],
  'Control (Standard Form)',
  '{"ctr": 2.1, "cvr": 8.4, "conversions": 120}'::jsonb,
  'Variant A (Social Proof Header)',
  '{"ctr": 2.4, "cvr": 9.6, "conversions": 142}'::jsonb,
  'Variant B (2-Step Qualification Modal)',
  '{"ctr": 2.8, "cvr": 11.2, "conversions": 168}'::jsonb,
  NULL
),
(
  'Outbound Executive Subject Line Test',
  'EXP-102',
  'multivariate',
  'queued',
  'high',
  'Framing the subject line around Q3 benchmark findings will increase executive open and response rates by 25%.',
  'cvr',
  25.0,
  0.0,
  '25/25/25/25',
  0,
  0.0,
  0,
  ARRAY[
    'Queued for launch after the current landing page intake test concludes.',
    'Target audience segment: B2B SMB decision-makers with 30-day inactivity.'
  ],
  'Control (Standard Introduction)',
  '{"ctr": 1.8, "cvr": 7.0, "conversions": 0}'::jsonb,
  'Variant A (Benchmark Report Hook)',
  '{"ctr": 0.0, "cvr": 0.0, "conversions": 0}'::jsonb,
  'Variant B (ROI Case Study Hook)',
  '{"ctr": 0.0, "cvr": 0.0, "conversions": 0}'::jsonb,
  NULL
),
(
  'B2B Advisory Free Audit Offer vs. Paid Discovery Call',
  'EXP-103',
  'offer',
  'completed',
  'high',
  'Offering a complimentary 30-minute diagnostic audit instead of a paid consultation will increase qualified inquiries by 40%.',
  'cvr',
  40.0,
  44.2,
  '50/50',
  28400,
  168.0,
  96,
  ARRAY[
    'Complimentary diagnostic audit increased qualified inquiry conversion rate by 44.2%.',
    'Test concluded at 96% statistical confidence.',
    'Recommended Action: Adopt "Complimentary Diagnostic Audit" as the standard evergreen offer.'
  ],
  'Control (Paid Discovery Call)',
  '{"ctr": 2.2, "cvr": 6.8, "conversions": 180}'::jsonb,
  'Variant A (Discounted Consultation)',
  '{"ctr": 3.1, "cvr": 9.1, "conversions": 240}'::jsonb,
  'Variant B (Complimentary Diagnostic Audit)',
  '{"ctr": 3.6, "cvr": 11.8, "conversions": 312}'::jsonb,
  'Variant B (Complimentary Diagnostic Audit)'
)
ON CONFLICT DO NOTHING;
