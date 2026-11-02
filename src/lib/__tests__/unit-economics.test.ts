import { describe, it, expect } from 'vitest';
import {
  computeDerivedThresholds,
  evaluateCampaignUnitEconomics,
  UnitEconomicsProfile,
} from '../utils/unit-economics';
import { CampaignWithMetrics } from '../types/database';

const b2bAdvisoryProfile: UnitEconomicsProfile = {
  business_name: 'Apex B2B Tax & Compliance Advisory',
  vertical: 'Accounting & Advisory',
  avg_ltv: 180000,
  gross_margin_pct: 75,
  target_ltv_cac_ratio: 3.0,
  avg_sales_cycle_days: 30,
  target_lead_to_close_rate: 15,
  min_spend_for_evaluation: 5000,
};

const localClinicProfile: UnitEconomicsProfile = {
  business_name: 'SmileCare Dental & Aesthetics Clinic',
  vertical: 'Healthcare / Clinic',
  avg_ltv: 18000,
  gross_margin_pct: 65,
  target_ltv_cac_ratio: 3.0,
  avg_sales_cycle_days: 7,
  target_lead_to_close_rate: 25,
  min_spend_for_evaluation: 2000,
};

function createMockCampaign(overrides: Partial<CampaignWithMetrics> = {}): CampaignWithMetrics {
  return {
    id: 'camp-1',
    name: 'Q4 Executive Search Campaign',
    platform: 'meta_ads',
    objective: 'Lead Generation',
    status: 'active',
    start_date: '2026-10-01T00:00:00Z',
    end_date: null,
    owner_id: null,
    target_audience: 'CFOs & Founders',
    service: 'Statutory Audit Retainer',
    market_segment: 'Enterprise B2B',
    location: 'Mumbai',
    offer: 'Free Compliance Risk Assessment',
    cta: 'Book Consultation',
    landing_destination: 'Website LP',
    spend: 25000,
    reach: 12000,
    impressions: 30000,
    clicks: 450,
    messages: 20,
    calls: 5,
    site_visits: 350,
    inquiries: 15,
    qualified_leads: 5,
    quotes_sent: 3,
    customers_won: 0,
    revenue: 0,
    cogs: 0,
    hypothesis: null,
    result_summary: null,
    what_worked: null,
    what_failed: null,
    next_experiment: null,
    confidence: 'medium',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    created_by: null,
    updated_by: null,
    ctr: 1.5,
    cpm: 833.33,
    cpc: 55.56,
    cpl: 5000,
    cac: null,
    roas: 0,
    gross_profit: 0,
    net_profit: -25000,
    conversion_rate: 0,
    ...overrides,
  };
}

describe('First-Principles Unit Economics & Sales-Cycle Lag Engine', () => {
  describe('computeDerivedThresholds', () => {
    it('computes exact derived unit economic thresholds for B2B Advisory vs Local Clinic', () => {
      const b2bDerived = computeDerivedThresholds(b2bAdvisoryProfile);
      expect(b2bDerived.lifetimeGrossProfit).toBe(135000);
      expect(b2bDerived.maxAllowableCac).toBe(45000);
      expect(b2bDerived.maxAllowableCpl).toBe(6750);
      expect(b2bDerived.breakEvenRoas).toBe(1.33);
      expect(b2bDerived.targetScalingRoas).toBe(2.39);

      const clinicDerived = computeDerivedThresholds(localClinicProfile);
      expect(clinicDerived.lifetimeGrossProfit).toBe(11700);
      expect(clinicDerived.maxAllowableCac).toBe(3900);
      expect(clinicDerived.maxAllowableCpl).toBe(975);
      expect(clinicDerived.breakEvenRoas).toBe(1.54);
      expect(clinicDerived.targetScalingRoas).toBe(2.77);
    });

    it('guards against zero, negative, or non-finite inputs without producing NaN or Infinity', () => {
      const zeroAndNegativeProfile: UnitEconomicsProfile = {
        avg_ltv: -5000,
        gross_margin_pct: 0,
        target_ltv_cac_ratio: -2,
        avg_sales_cycle_days: -10,
        target_lead_to_close_rate: 0,
        min_spend_for_evaluation: -100,
      };

      const derived = computeDerivedThresholds(zeroAndNegativeProfile);
      expect(Number.isFinite(derived.maxAllowableCac)).toBe(true);
      expect(Number.isFinite(derived.maxAllowableCpl)).toBe(true);
      expect(Number.isFinite(derived.breakEvenRoas)).toBe(true);
      expect(Number.isFinite(derived.targetScalingRoas)).toBe(true);
      expect(Number.isFinite(derived.lifetimeGrossProfit)).toBe(true);
      expect(derived.maxAllowableCac).toBe(0);
      expect(derived.breakEvenRoas).toBe(100);
    });
  });

  describe('evaluateCampaignUnitEconomics', () => {
    it('protects young campaigns inside the Sales-Cycle Lag Window with healthy CPL (emits pipeline_lag instead of false ROAS warning)', () => {
      // 7-day-old B2B campaign (sales cycle = 30d), ₹25,000 spend, 0 revenue, 5 qualified leads (₹5,000 CPL <= ₹6,750 Max CPL)
      const now = new Date('2026-10-08T00:00:00Z');
      const campaign = createMockCampaign({
        start_date: '2026-10-01T00:00:00Z',
        spend: 25000,
        revenue: 0,
        qualified_leads: 5,
        cpl: 5000,
        roas: 0,
      });

      const alerts = evaluateCampaignUnitEconomics(campaign, b2bAdvisoryProfile, now);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('pipeline_lag');
      expect(alerts[0].title).toContain('IN SALES PIPELINE WINDOW (DAY 7 OF 30d)');
      expect(alerts[0].recommendedAction).toBe('Hold spend steady and monitor lead-to-close progression.');
    });

    it('flags a Leading CPL Breach inside the Sales-Cycle Lag Window when early CPL exceeds ceiling', () => {
      // 7-day-old B2B campaign with ₹25,000 spend and only 1 qualified lead (₹25,000 CPL > ₹6,750 Max CPL * 1.2)
      const now = new Date('2026-10-08T00:00:00Z');
      const campaign = createMockCampaign({
        start_date: '2026-10-01T00:00:00Z',
        spend: 25000,
        revenue: 0,
        qualified_leads: 1,
        cpl: 25000,
        roas: 0,
      });

      const alerts = evaluateCampaignUnitEconomics(campaign, b2bAdvisoryProfile, now);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('warning');
      expect(alerts[0].title).toContain('LEADING CPL BREACH (DAY 7 OF 30d CYCLE)');
      expect(alerts[0].recommendedAction).toBe(
        'Audit ad hook CTR and landing page qualification friction before waiting for full sales cycle.'
      );
    });

    it('evaluates CAC context-relatively: ₹12,000 CAC breaches Local Clinic ceiling (₹3,900) but passes B2B Advisory ceiling (₹45,000)', () => {
      // Mature campaign (45 days old): ₹36,000 spend, 3 customers won (₹12,000 CAC), ₹72,000 revenue (2.0x ROAS > break-even)
      const now = new Date('2026-11-15T00:00:00Z');
      const matureCampaign = createMockCampaign({
        start_date: '2026-10-01T00:00:00Z',
        spend: 36000,
        customers_won: 3,
        cac: 12000,
        revenue: 72000,
        cogs: 15000,
        roas: 2.0,
        net_profit: 21000,
      });

      // Local Clinic: Max CAC is ₹3,900 -> ₹12,000 CAC triggers warning
      const clinicAlerts = evaluateCampaignUnitEconomics(matureCampaign, localClinicProfile, now);
      expect(clinicAlerts).toHaveLength(1);
      expect(clinicAlerts[0].type).toBe('warning');
      expect(clinicAlerts[0].title).toContain('CAC EXCEEDS UNIT ECONOMIC CEILING');

      // B2B Advisory: Max CAC is ₹45,000 -> ₹12,000 CAC is well within ceiling, no warning emitted
      const b2bAlerts = evaluateCampaignUnitEconomics(matureCampaign, b2bAdvisoryProfile, now);
      expect(b2bAlerts.filter((a) => a.type === 'warning')).toHaveLength(0);
    });
  });
});
