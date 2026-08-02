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
  'CONVERSION_OVERRIDE',
  'A/B-0x88F',
  'a_b_test',
  'running',
  'high',
  '$ IF user_intent == "high" THEN
  inject(urgency_module)
  WILL increase(ctr) BY
  15%',
  'ctr',
  15.0,
  18.4,
  '50/50',
  14204,
  48.2,
  88,
  ARRAY[
    '> Variant B outperforming Control across all primary conversion vectors.',
    '> Statistical significance threshold (95%) not yet met. Projected time to conclusion: 12H:45M',
    '! Secondary metric (Bounce Rate) shows elevated degradation. Monitor closely.'
  ],
  'Control (Standard Form)',
  '{"ctr": 2.1, "cvr": 8.4, "conversions": 120}'::jsonb,
  'Variant A (Urgency Badge)',
  '{"ctr": 2.4, "cvr": 9.6, "conversions": 142}'::jsonb,
  'Variant B (2-Step Modal)',
  '{"ctr": 2.8, "cvr": 11.2, "conversions": 168}'::jsonb,
  NULL
),
(
  'SUBJECT_LINE_SYNTAX',
  'MVT-0x92C',
  'multivariate',
  'queued',
  'high',
  '$ IF header == "Pest Alert" THEN open_rate WILL increase BY 25%',
  'cvr',
  25.0,
  0.0,
  '25/25/25/25',
  0,
  0.0,
  0,
  ARRAY[
    '> Queued for allocation after current running protocol concludes.',
    '> Target audience segment: Residential 30-day non-converters.'
  ],
  'Control',
  '{"ctr": 1.8, "cvr": 7.0, "conversions": 0}'::jsonb,
  'Variant A',
  '{"ctr": 0.0, "cvr": 0.0, "conversions": 0}'::jsonb,
  'Variant B',
  '{"ctr": 0.0, "cvr": 0.0, "conversions": 0}'::jsonb,
  NULL
),
(
  'Q3_TERMITE_RUSH',
  'A/B-0x44A',
  'offer',
  'completed',
  'high',
  '$ IF termite_inspection == "Free Same-Day" THEN inquiries WILL increase BY 40%',
  'cvr',
  40.0,
  44.2,
  '50/50',
  28400,
  168.0,
  96,
  ARRAY[
    '> [SUCCESS] Same-Day guarantee increased inquiry conversion rate by 44.2%.',
    '> Protocol completed with 96% statistical confidence.',
    '> Recommended Action: Make "Free Same-Day Inspection" standard evergreen copy.'
  ],
  'Control ($49 Inspection)',
  '{"ctr": 2.2, "cvr": 6.8, "conversions": 180}'::jsonb,
  'Variant A ($0 Inspection)',
  '{"ctr": 3.1, "cvr": 9.1, "conversions": 240}'::jsonb,
  'Variant B (Free Same-Day)',
  '{"ctr": 3.6, "cvr": 11.8, "conversions": 312}'::jsonb,
  'Variant B (Free Same-Day)'
)
ON CONFLICT DO NOTHING;
