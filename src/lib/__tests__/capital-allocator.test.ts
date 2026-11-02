import { describe, it, expect } from 'vitest';
import {
  computeImpactScore,
  evaluateCampaignAllocation,
  evaluateCreativeAllocation,
  buildPortfolioAllocationSummary,
} from '../utils/capital-allocator';
import {
  CampaignWithMetrics,
  CreativeRow,
  UnitEconomicsProfile,
} from '../types/database';

const b2bProfile: UnitEconomicsProfile = {
  industry_preset: 'b2b_advisory',
  business_name: 'Apex B2B Tax & Compliance Advisory',
  avg_ltv: 180000,
  gross_margin_pct: 75,
  target_ltv_cac_ratio: 3.0,
  avg_sales_cycle_days: 30,
  target_lead_to_close_rate: 15,
  min_spend_for_evaluation: 5000,
};

function createCampaign(overrides: Partial<CampaignWithMetrics> = {}): CampaignWithMetrics {
  return {
    id: 'camp-1',
    name: 'Enterprise Tax Retainer Search',
    platform: 'google_ads',
    objective: 'Lead Generation',
    status: 'active',
    start_date: '2026-09-01T00:00:00Z',
    end_date: null,
    owner_id: null,
    target_audience: 'CFOs',
    service: 'Tax Advisory',
    market_segment: 'Enterprise B2B',
    location: 'Mumbai',
    offer: 'Audit Risk Review',
    cta: 'Book Call',
    landing_destination: 'LP',
    spend: 20000,
    reach: 10000,
    impressions: 25000,
    clicks: 500,
    messages: 10,
    calls: 5,
    site_visits: 400,
    inquiries: 15,
    qualified_leads: 6,
    quotes_sent: 4,
    customers_won: 2,
    revenue: 60000,
    cogs: 15000,
    hypothesis: null,
    result_summary: null,
    what_worked: null,
    what_failed: null,
    next_experiment: null,
    confidence: 'high',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-10-15T00:00:00Z',
    created_by: null,
    updated_by: null,
    ctr: 2.0,
    cpm: 800,
    cpc: 40,
    cpl: 3333,
    cac: 10000,
    roas: 3.0,
    gross_profit: 45000,
    net_profit: 25000,
    conversion_rate: 33.3,
    ...overrides,
  };
}

function createCreative(overrides: Partial<CreativeRow> = {}): CreativeRow {
  return {
    id: 'cr-1',
    name: 'CFO Audit Penalty Fear Hook',
    format: 'video',
    status: 'active',
    angle: 'fear_urgency',
    platform: 'meta_ads',
    campaign_id: 'camp-1',
    headline: 'Eliminate Audit Risk',
    primary_text: 'Guaranteed SLA Compliance',
    cta_text: 'Book Assessment',
    asset_url: null,
    spend: 10000,
    impressions: 20000,
    clicks: 450,
    inquiries: 8,
    customers_won: 1,
    revenue: 30000,
    fatigue_score: 25,
    hook_hypothesis: null,
    what_worked: null,
    what_failed: null,
    tags: [],
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-10-15T00:00:00Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}

describe('Data Science Capital Allocator Engine', () => {
  describe('computeImpactScore', () => {
    it('clamps multi-factor inputs and computes normalized composite score [1, 100]', () => {
      const high = computeImpactScore(9.5, 0.9, 0.95, 0.9);
      expect(high.compositeScore).toBe(73);

      const clamped = computeImpactScore(25, 2.0, -5, 0);
      expect(clamped.outcomeImpact).toBe(10);
      expect(clamped.statisticalConfidence).toBe(1);
      expect(clamped.relevance).toBe(0.1);
      expect(clamped.urgency).toBe(0.1);
      expect(clamped.compositeScore).toBe(1);
    });
  });

  describe('evaluateCampaignAllocation — 4 Regimes & 3-Layer Causal Attribution', () => {
    const now = new Date('2026-10-15T00:00:00Z');

    it('classifies high-ROAS, within-CAC-ceiling campaigns into EXPLOIT (+25% scale)', () => {
      const winner = createCampaign({
        spend: 20000,
        revenue: 60000,
        roas: 3.0, // > 2.39x targetScalingRoas
        cac: 10000, // <= ₹45,000 maxAllowableCac
        customers_won: 2,
      });

      const decision = evaluateCampaignAllocation(winner, b2bProfile, now);
      expect(decision.regime).toBe('exploit');
      expect(decision.recommendedSpendDeltaPct).toBe(25);
      expect(decision.recommendedSpendAmount).toBe(25000);
      expect(decision.primarySignal).toContain('ROAS at 3.00x beats 2.39x scaling threshold');
      expect(decision.causalHypothesis).toContain('unit-economic product-market fit');
      expect(decision.counterfactualAction).toContain('Scale budget by +25%');
    });

    it('classifies young campaigns inside sales-cycle lag window with healthy CPL into HOLD_PIPELINE (0% delta)', () => {
      const youngPipeline = createCampaign({
        start_date: '2026-10-08T00:00:00Z', // 7 days old (< 30d sales cycle)
        spend: 18000,
        qualified_leads: 4,
        cpl: 4500, // <= ₹6,750 maxAllowableCpl
        customers_won: 0,
        revenue: 0,
        roas: 0,
      });

      const decision = evaluateCampaignAllocation(youngPipeline, b2bProfile, now);
      expect(decision.regime).toBe('hold_pipeline');
      expect(decision.recommendedSpendDeltaPct).toBe(0);
      expect(decision.recommendedSpendAmount).toBe(18000);
      expect(decision.primarySignal).toContain('Day 7 of 30d sales cycle');
      expect(decision.causalHypothesis).toContain('natural 30-day conversion lag, not funnel failure');
    });

    it('distinguishes EXPLORE funnel-split leakage (good CPL, poor closed ROAS) vs baseline creative hook optimization', () => {
      // Case A: Mature campaign, healthy CPL (₹4,000 <= ₹6,750), good CTR (2.2%), but ROAS (0.8x) < 1.33x break-even
      const funnelLeakCampaign = createCampaign({
        start_date: '2026-09-01T00:00:00Z', // 44 days old
        spend: 20000,
        ctr: 2.2,
        qualified_leads: 5,
        cpl: 4000,
        revenue: 16000,
        roas: 0.8,
      });

      const leakDecision = evaluateCampaignAllocation(funnelLeakCampaign, b2bProfile, now);
      expect(leakDecision.regime).toBe('explore');
      expect(leakDecision.primarySignal).toContain('Healthy top-of-funnel CPL');
      expect(leakDecision.causalHypothesis).toContain('downstream sales qualification, proposal follow-up, or offer framing is leaking conversions');

      // Case B: Mature campaign with profitable baseline ROAS (1.8x >= 1.33x break-even, but < 2.39x target scaling)
      const baselineProfitable = createCampaign({
        start_date: '2026-09-01T00:00:00Z',
        spend: 20000,
        revenue: 36000,
        roas: 1.8,
      });

      const hookExploreDecision = evaluateCampaignAllocation(baselineProfitable, b2bProfile, now);
      expect(hookExploreDecision.regime).toBe('explore');
      expect(hookExploreDecision.primarySignal).toContain('Profitable baseline ROAS (1.80x vs 1.33x break-even)');
      expect(hookExploreDecision.counterfactualAction).toContain('Allocate 20% of campaign budget to test 2 new creative hook angles in LABS');
    });

    it('classifies unit-economic breaches into REALLOCATE_KILL (-100% pause & redeploy)', () => {
      const breachCampaign = createCampaign({
        start_date: '2026-09-01T00:00:00Z', // Mature 44d
        spend: 30000,
        qualified_leads: 1,
        cpl: 30000, // > ₹6,750 Max CPL
        customers_won: 0,
        revenue: 0,
        roas: 0,
      });

      const decision = evaluateCampaignAllocation(breachCampaign, b2bProfile, now);
      expect(decision.regime).toBe('reallocate_kill');
      expect(decision.recommendedSpendDeltaPct).toBe(-100);
      expect(decision.recommendedSpendAmount).toBe(0);
      expect(decision.counterfactualAction).toContain('Pause campaign immediately and redeploy ₹30,000');
    });
  });

  describe('evaluateCreativeAllocation & buildPortfolioAllocationSummary', () => {
    it('flags high-ROAS but fatigued creatives (fatigue >= 60) into EXPLORE (-20% refresh)', () => {
      const fatiguedCreative = createCreative({
        spend: 12000,
        revenue: 36000, // 3.0x ROAS
        fatigue_score: 72,
      });

      const decision = evaluateCreativeAllocation(fatiguedCreative, b2bProfile);
      expect(decision.regime).toBe('explore');
      expect(decision.recommendedSpendDeltaPct).toBe(-20);
      expect(decision.causalHypothesis).toContain('fatigue score 72/100');
      expect(decision.counterfactualAction).toContain('Spin up a fresh visual/hook iteration');
    });

    it('sorts portfolio decisions by Impact Score descending and dynamically shifts Explore/Exploit ratio', () => {
      const now = new Date('2026-10-15T00:00:00Z');

      // High-performing portfolio (>50% exploit spend, <20% at-risk spend) -> 80/20 regime
      const exploitCampaign = createCampaign({
        id: 'c-exploit',
        spend: 60000,
        revenue: 180000,
        roas: 3.0,
        cac: 15000,
        customers_won: 4,
      });
      const holdCampaign = createCampaign({
        id: 'c-hold',
        start_date: '2026-10-10T00:00:00Z',
        spend: 20000,
        qualified_leads: 4,
        cpl: 5000,
        roas: 0,
        revenue: 0,
      });

      const stableSummary = buildPortfolioAllocationSummary(
        [holdCampaign, exploitCampaign],
        [],
        b2bProfile,
        now
      );

      expect(stableSummary.totalCurrentSpend).toBe(80000);
      expect(stableSummary.exploitSpend).toBe(60000);
      expect(stableSummary.targetExploitRatioPct).toBe(80);
      expect(stableSummary.targetExploreRatioPct).toBe(20);
      // Decisions sorted by compositeScore descending (exploit campaign > hold campaign)
      expect(stableSummary.decisions[0].entityId).toBe('c-exploit');

      // Inefficient portfolio (>=35% at-risk spend) -> 55/45 regime
      const killCampaign = createCampaign({
        id: 'c-kill',
        spend: 50000,
        qualified_leads: 1,
        cpl: 50000,
        roas: 0,
        revenue: 0,
      });

      const inefficientSummary = buildPortfolioAllocationSummary(
        [killCampaign, holdCampaign],
        [],
        b2bProfile,
        now
      );
      expect(inefficientSummary.atRiskSpend).toBe(50000);
      expect(inefficientSummary.redeployableCapital).toBe(50000);
      expect(inefficientSummary.targetExploitRatioPct).toBe(55);
      expect(inefficientSummary.targetExploreRatioPct).toBe(45);
    });
  });
});
