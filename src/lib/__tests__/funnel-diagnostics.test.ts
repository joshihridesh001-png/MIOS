import { describe, it, expect } from 'vitest';
import {
  diagnoseCampaignFunnel,
  evaluateAssumptionFalsification,
} from '../utils/funnel-diagnostics';
import {
  AssumptionLedgerEntry,
  CampaignWithMetrics,
  UnitEconomicsProfile,
} from '../types/database';

const b2bProfile: UnitEconomicsProfile = {
  industry_preset: 'b2b_advisory',
  business_name: 'Apex B2B Tax & Compliance Advisory',
  avg_ltv: 180000,
  gross_margin_pct: 75,
  target_ltv_cac_ratio: 3.0,
  avg_sales_cycle_days: 30,
  target_lead_to_close_rate: 20, // close benchmark = max(25, round(20 * 1.5)) = 30%
  min_spend_for_evaluation: 5000,
};

function createCampaign(overrides: Partial<CampaignWithMetrics> = {}): CampaignWithMetrics {
  return {
    id: 'camp-funnel-1',
    name: 'CFO Compliance Search Funnel',
    platform: 'google_ads',
    objective: 'Lead Generation',
    status: 'active',
    start_date: '2026-09-01T00:00:00Z',
    end_date: null,
    owner_id: null,
    target_audience: 'CFOs',
    service: 'Statutory Audit',
    market_segment: 'Enterprise B2B',
    location: 'Mumbai',
    offer: 'Audit Risk Review',
    cta: 'Book Call',
    landing_destination: 'LP',
    spend: 20000,
    reach: 10000,
    impressions: 20000,
    clicks: 400, // 2.0% CTR (benchmark 1.5%)
    messages: 20,
    calls: 20,
    site_visits: 350,
    inquiries: 40, // 10.0% Click->Inquiry (benchmark 8.0%)
    qualified_leads: 20, // 50.0% Inquiry->Qualified (benchmark 45.0%)
    quotes_sent: 14, // 70.0% Qualified->Quote (benchmark 65.0%)
    customers_won: 5, // 35.7% Quote->Won (benchmark 30.0%)
    revenue: 90000,
    cogs: 22500,
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
    cpm: 1000,
    cpc: 50,
    cpl: 1000,
    cac: 4000,
    roas: 4.5,
    gross_profit: 67500,
    net_profit: 47500,
    conversion_rate: 25,
    ...overrides,
  };
}

describe('Funnel Bottleneck Locator, Kill-Switch Evaluator & Assumption Falsification Engine', () => {
  const now = new Date('2026-10-15T00:00:00Z');

  describe('diagnoseCampaignFunnel — Bottleneck Isolation', () => {
    it('isolates inquiry_to_qualified as primary bottleneck when CTR and Landing CVR are strong but lead fit collapses', () => {
      const lowFitCampaign = createCampaign({
        impressions: 20000,
        clicks: 400, // 2.0% CTR (healthy vs 1.5%)
        inquiries: 40, // 10.0% Landing CVR (healthy vs 8.0%)
        qualified_leads: 4, // 10.0% Fit Rate (collapses vs 45.0% benchmark)
        quotes_sent: 3, // 75.0% Discovery Rate (healthy vs 65.0%)
        customers_won: 1, // 33.3% Close Rate (healthy vs 30.0%)
      });

      const report = diagnoseCampaignFunnel(lowFitCampaign, b2bProfile, now);
      expect(report.primaryBottleneck).not.toBeNull();
      expect(report.primaryBottleneck?.stage).toBe('inquiry_to_qualified');
      expect(report.primaryBottleneck?.actualRatePct).toBe(10);
      expect(report.primaryBottleneck?.brokenAssumption).toContain(
        'Targeting and ad copy pre-qualify buyers'
      );
    });

    it('isolates quote_to_won as primary bottleneck when top and middle funnel convert well but proposals fail to close', () => {
      const lowCloseCampaign = createCampaign({
        impressions: 20000,
        clicks: 400, // 2.0% CTR
        inquiries: 40, // 10.0% CVR
        qualified_leads: 20, // 50.0% Fit
        quotes_sent: 15, // 75.0% Quote Rate
        customers_won: 1, // 6.67% Close Rate (collapses vs 30.0% benchmark)
      });

      const report = diagnoseCampaignFunnel(lowCloseCampaign, b2bProfile, now);
      expect(report.primaryBottleneck).not.toBeNull();
      expect(report.primaryBottleneck?.stage).toBe('quote_to_won');
      expect(report.primaryBottleneck?.prescribedIntervention).toContain(
        'Strengthen risk-reversal guarantee'
      );
    });
  });

  describe('diagnoseCampaignFunnel — Predefined Kill-Switch Criteria', () => {
    it('triggers kill switch when spend >= 1.5x evaluation floor with 0 qualified leads', () => {
      const zeroLeadBleed = createCampaign({
        spend: 8000, // >= 5000 * 1.5 (7500)
        inquiries: 10,
        qualified_leads: 0,
        quotes_sent: 0,
        customers_won: 0,
        revenue: 0,
        roas: 0,
      });

      const report = diagnoseCampaignFunnel(zeroLeadBleed, b2bProfile, now);
      expect(report.killSwitchTriggered).toBe(true);
      expect(report.killSwitchReason).toContain(
        'Kill Criterion Met: Spent ₹8,000 (>1.5x evaluation floor) with 0 qualified leads.'
      );
    });

    it('triggers kill switch when mature campaign (daysRunning >= sales cycle) has ROAS below 70% of break-even', () => {
      // Break-even ROAS for 75% margin is 1.33x -> 70% of 1.33x is 0.931x
      const matureFailedCampaign = createCampaign({
        start_date: '2026-09-01T00:00:00Z', // 44 days old >= 30d sales cycle
        spend: 15000, // >= 2x min_spend_for_evaluation (10000)
        qualified_leads: 3,
        customers_won: 1,
        revenue: 10500,
        roas: 0.7, // < 0.931x
      });

      const report = diagnoseCampaignFunnel(matureFailedCampaign, b2bProfile, now);
      expect(report.killSwitchTriggered).toBe(true);
      expect(report.killSwitchReason).toContain(
        'Kill Criterion Met: Full 30d sales cycle elapsed with ROAS (0.70x) below 70% of break-even (1.33x).'
      );
    });
  });

  describe('evaluateAssumptionFalsification', () => {
    const baseLedgerEntry: AssumptionLedgerEntry = {
      id: 'assump-1',
      entity_type: 'campaign',
      entity_id: 'camp-funnel-1',
      entity_name: 'CFO Compliance Search Funnel',
      assumption: 'CFOs searching statutory compliance keywords convert at <= ₹6,750 CPL',
      evidence: 'Prior Q3 benchmark',
      confidence: 'medium',
      reversibility: 'reversible_two_way',
      consequence_if_wrong: 'Wasted test budget of ₹10,000',
      falsification_test: 'Run ₹10,000 search test over 30 days',
      kill_criteria: 'Zero qualified leads after ₹7,500 spend',
      status: 'validating',
      created_at: '2026-09-01T00:00:00Z',
    };

    it('marks assumption as falsified when linked campaign triggers kill switch', () => {
      const failedCampaign = createCampaign({
        id: 'camp-funnel-1',
        spend: 9000,
        qualified_leads: 0,
        customers_won: 0,
        quotes_sent: 0,
        roas: 0,
      });

      const evaluation = evaluateAssumptionFalsification(
        baseLedgerEntry,
        [failedCampaign],
        b2bProfile
      );
      expect(evaluation.suggestedStatus).toBe('falsified');
      expect(evaluation.diagnosticNote).toContain('Kill Criterion Met');
    });

    it('marks assumption as validated when linked campaign achieves break-even ROAS or higher without kill switch', () => {
      const profitableCampaign = createCampaign({
        id: 'camp-funnel-1',
        spend: 20000,
        qualified_leads: 8,
        roas: 2.5, // >= 1.33x break-even
      });

      const evaluation = evaluateAssumptionFalsification(
        baseLedgerEntry,
        [profitableCampaign],
        b2bProfile
      );
      expect(evaluation.suggestedStatus).toBe('validated');
      expect(evaluation.diagnosticNote).toContain(
        'Linked campaign achieved profitable unit economics above break-even ROAS.'
      );
    });
  });
});
