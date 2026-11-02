-- ==============================================================================
-- MIOS Migration 008: Assumption Ledger, Reversibility Tagging & Kill Criteria
-- Idempotent schema setup for tracking core growth assumptions, falsification
-- tests, decision reversibility (1-way vs. 2-way doors), and kill criteria.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.assumption_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL DEFAULT 'system' CHECK (entity_type IN ('campaign', 'experiment', 'system')),
  entity_id UUID,
  entity_name TEXT NOT NULL,
  assumption TEXT NOT NULL,
  evidence TEXT NOT NULL DEFAULT '',
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low', 'medium', 'high')),
  reversibility TEXT NOT NULL DEFAULT 'reversible_two_way' CHECK (reversibility IN ('reversible_two_way', 'irreversible_one_way')),
  consequence_if_wrong TEXT NOT NULL DEFAULT '',
  falsification_test TEXT NOT NULL DEFAULT '',
  kill_criteria TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'untested' CHECK (status IN ('untested', 'validating', 'validated', 'falsified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assumption_ledger_status ON public.assumption_ledger(status);
CREATE INDEX IF NOT EXISTS idx_assumption_ledger_entity ON public.assumption_ledger(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE public.assumption_ledger ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policy for authenticated users
DO $$ BEGIN
  CREATE POLICY "Enable access for authenticated users on assumption_ledger"
  ON public.assumption_ledger
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
    DROP TRIGGER IF EXISTS trg_assumption_ledger_updated_at ON public.assumption_ledger;
    CREATE TRIGGER trg_assumption_ledger_updated_at
      BEFORE UPDATE ON public.assumption_ledger
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- Seed 3 realistic service-business assumptions if table is empty
INSERT INTO public.assumption_ledger (
  entity_type,
  entity_id,
  entity_name,
  assumption,
  evidence,
  confidence,
  reversibility,
  consequence_if_wrong,
  falsification_test,
  kill_criteria,
  status
)
SELECT * FROM (
  VALUES
    (
      'experiment',
      NULL::uuid,
      'B2B Advisory Free Audit Offer vs. Paid Discovery Call',
      'Offering a complimentary 30-minute diagnostic audit converts cold B2B traffic into qualified leads at 1.4x the rate of a direct retainer consultation pitch.',
      'Tested across 28,400 impressions in EXP-103; inquiry conversion rate lifted +44.2% at 96% statistical confidence.',
      'high',
      'reversible_two_way',
      'Higher volume of low-intent diagnostic calls consuming senior advisor calendar capacity without downstream retainer conversion.',
      'Track 30-day lead-to-retainer close rate on diagnostic audit leads vs. historical baseline (15% close rate).',
      'Pause offer if qualified-to-won conversion drops below 10% after 25 completed diagnostic audits.',
      'validated'
    ),
    (
      'system',
      NULL::uuid,
      'Inbound Speed-to-Lead SLA (< 5 Minutes)',
      'Responding to inbound WhatsApp and web form inquiries within 5 minutes doubles the inquiry-to-qualified rate compared to >30-minute response times.',
      'Initial cohort of 42 inbound inquiries shows 58% qualification rate under 5 minutes vs. 27% when contacted after 30 minutes.',
      'medium',
      'reversible_two_way',
      'Unnecessary operational overhead routing instant alerts to intake specialists during off-peak hours.',
      'Compare inquiry-to-qualified conversion across <5 min vs. 5–30 min response cohorts over 100 consecutive inquiries.',
      'Relax instant routing requirement if qualification lift is <15% after 100 tracked inquiries.',
      'validating'
    ),
    (
      'campaign',
      NULL::uuid,
      'High-LTV Retainer Pricing & Case Study Proof',
      'Audited client ROI case studies in follow-up proposals overcome switching-cost and upfront retainer pricing objections for B2B SMB decision-makers.',
      'Qualitative interviews with 14 won B2B clients cited quantified peer case studies as the primary trust builder prior to signing.',
      'medium',
      'irreversible_one_way',
      'Publishing higher anchor pricing without sufficient perceived proof depresses quote-to-won rate and lengthens the sales cycle beyond 45 days.',
      'Measure quote-to-won rate on proposals sent with vertical-matched ROI case studies vs. standard service scope proposals.',
      'Revert to tiered starter package if quote-to-won rate falls below 20% across 15 consecutive proposals.',
      'validating'
    )
) AS seed (
  entity_type,
  entity_id,
  entity_name,
  assumption,
  evidence,
  confidence,
  reversibility,
  consequence_if_wrong,
  falsification_test,
  kill_criteria,
  status
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.assumption_ledger
);
