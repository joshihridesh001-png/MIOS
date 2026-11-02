// ==============================================================================
// MIOS First-Principles Unit Economics & Sales-Cycle Lag Engine
// (@/lib/utils/unit-economics.ts)
// Governed by ADR-001 (ISO/IEC 25010 Reliability, Single Responsibility)
// ==============================================================================

import { CampaignWithMetrics } from '../types/database';

export interface UnitEconomicsProfile {
  id?: string;
  business_name?: string;
  vertical?: string;
  avg_ltv: number;
  gross_margin_pct: number;
  target_ltv_cac_ratio: number;
  avg_sales_cycle_days: number;
  target_lead_to_close_rate: number;
  min_spend_for_evaluation: number;
  updated_at?: string;
}

export interface DerivedUnitEconomics {
  maxAllowableCac: number;
  maxAllowableCpl: number;
  breakEvenRoas: number;
  targetScalingRoas: number;
  lifetimeGrossProfit: number;
}

export interface CampaignEconomicAlert {
  id: string;
  type: 'warning' | 'celebration' | 'pipeline_lag';
  title: string;
  message: string;
  campaignId?: string;
  metricValue: string;
  recommendedAction?: string;
}

/**
 * Computes first-principles unit economic thresholds from a business profile.
 * Guards against zero, negative, or non-finite inputs to guarantee NaN/Infinity safety.
 */
export function computeDerivedThresholds(
  profile: UnitEconomicsProfile
): DerivedUnitEconomics {
  const avgLtv = Math.max(0, Number.isFinite(Number(profile?.avg_ltv)) ? Number(profile.avg_ltv) : 0);
  const grossMarginPct = Math.min(
    100,
    Math.max(
      1,
      Number.isFinite(Number(profile?.gross_margin_pct)) && Number(profile.gross_margin_pct) > 0
        ? Number(profile.gross_margin_pct)
        : 1
    )
  );
  const targetLtvCacRatio = Math.max(
    0.5,
    Number.isFinite(Number(profile?.target_ltv_cac_ratio)) && Number(profile.target_ltv_cac_ratio) > 0
      ? Number(profile.target_ltv_cac_ratio)
      : 0.5
  );
  const targetLeadToCloseRate = Math.min(
    100,
    Math.max(
      1,
      Number.isFinite(Number(profile?.target_lead_to_close_rate)) && Number(profile.target_lead_to_close_rate) > 0
        ? Number(profile.target_lead_to_close_rate)
        : 1
    )
  );

  const marginFraction = grossMarginPct / 100;
  const closeRateFraction = targetLeadToCloseRate / 100;

  const lifetimeGrossProfit = Math.round(avgLtv * marginFraction);
  const maxAllowableCac = Math.round(lifetimeGrossProfit / targetLtvCacRatio);
  const maxAllowableCpl = Math.round(maxAllowableCac * closeRateFraction);
  const breakEvenRoas = Number((1 / marginFraction).toFixed(2));
  const targetScalingRoas = Number(Math.max(2.0, breakEvenRoas * 1.8).toFixed(2));

  return {
    maxAllowableCac,
    maxAllowableCpl,
    breakEvenRoas,
    targetScalingRoas,
    lifetimeGrossProfit,
  };
}

/**
 * Evaluates a campaign against derived unit economic thresholds while accounting
 * for the Sales-Cycle Lag Window (Δt = avg_sales_cycle_days).
 */
export function evaluateCampaignUnitEconomics(
  campaign: CampaignWithMetrics,
  profile: UnitEconomicsProfile,
  now: Date = new Date()
): CampaignEconomicAlert[] {
  const alerts: CampaignEconomicAlert[] = [];
  const derived = computeDerivedThresholds(profile);

  const spend = Math.max(0, Number(campaign.spend) || 0);
  const minSpend = Math.max(0, Number(profile.min_spend_for_evaluation) || 0);

  if (spend < minSpend) {
    return alerts;
  }

  const rawStartDate = campaign.start_date || campaign.created_at;
  const startMs = rawStartDate ? new Date(rawStartDate).getTime() : now.getTime();
  const diffMs = Number.isFinite(startMs) ? now.getTime() - startMs : 0;
  const daysRunning = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
  const avgSalesCycleDays = Math.max(0, Number(profile.avg_sales_cycle_days) || 0);

  const roas =
    campaign.roas !== null && campaign.roas !== undefined
      ? Number(campaign.roas)
      : spend > 0
        ? (Number(campaign.revenue) || 0) / spend
        : 0;

  const cac =
    campaign.cac !== null && campaign.cac !== undefined
      ? Number(campaign.cac)
      : campaign.customers_won > 0
        ? spend / campaign.customers_won
        : 0;

  const cpl =
    campaign.cpl !== null && campaign.cpl !== undefined
      ? Number(campaign.cpl)
      : campaign.qualified_leads > 0
        ? spend / campaign.qualified_leads
        : null;

  // 1. Inside Sales-Cycle Lag Window (Δt)
  if (daysRunning < avgSalesCycleDays) {
    const currentDay = Math.max(1, Math.floor(daysRunning));

    if (roas >= derived.targetScalingRoas) {
      alerts.push({
        id: `early-velocity-${campaign.id}`,
        type: 'celebration',
        title: `EARLY VELOCITY WINNER: ${campaign.name}`,
        message: `Campaign achieved ${roas.toFixed(2)}x ROAS inside the ${avgSalesCycleDays}-day sales cycle window, surpassing the ${derived.targetScalingRoas}x scaling threshold ahead of schedule.`,
        campaignId: campaign.id,
        metricValue: `${roas.toFixed(2)}x ROAS`,
        recommendedAction: 'Scale daily budget by 20% while monitoring lead qualification velocity.',
      });
    } else if (
      campaign.qualified_leads === 0 ||
      (cpl !== null && cpl > derived.maxAllowableCpl * 1.2)
    ) {
      const cplMetric =
        cpl !== null ? `₹${Math.round(cpl).toLocaleString('en-IN')} CPL` : '0 Qualified Leads';
      alerts.push({
        id: `leading-cpl-breach-${campaign.id}`,
        type: 'warning',
        title: `LEADING CPL BREACH (DAY ${currentDay} OF ${avgSalesCycleDays}d CYCLE): ${campaign.name}`,
        message: `Closed revenue is still inside the ${avgSalesCycleDays}-day sales cycle, but early CPL (${cplMetric}) exceeds Max Allowable CPL (₹${derived.maxAllowableCpl.toLocaleString('en-IN')}).`,
        campaignId: campaign.id,
        metricValue: cplMetric,
        recommendedAction:
          'Audit ad hook CTR and landing page qualification friction before waiting for full sales cycle.',
      });
    } else if (roas < derived.breakEvenRoas) {
      const cplFormatted = `₹${Math.round(cpl || 0).toLocaleString('en-IN')}`;
      alerts.push({
        id: `pipeline-lag-${campaign.id}`,
        type: 'pipeline_lag',
        title: `IN SALES PIPELINE WINDOW (DAY ${currentDay} OF ${avgSalesCycleDays}d): ${campaign.name}`,
        message: `ROAS judgment is deferred until the ${avgSalesCycleDays}-day sales cycle matures. Leading CPL (${cplFormatted}) is within the ₹${derived.maxAllowableCpl.toLocaleString('en-IN')} threshold.`,
        campaignId: campaign.id,
        metricValue: `${cplFormatted} CPL`,
        recommendedAction: 'Hold spend steady and monitor lead-to-close progression.',
      });
    }

    return alerts;
  }

  // 2. Mature Campaign (daysRunning >= avg_sales_cycle_days)
  if (roas < derived.breakEvenRoas) {
    alerts.push({
      id: `below-breakeven-roas-${campaign.id}`,
      type: 'warning',
      title: `BELOW BREAK-EVEN ROAS (${derived.breakEvenRoas}x): ${campaign.name}`,
      message: `Campaign has matured past the ${avgSalesCycleDays}-day sales cycle at ${roas.toFixed(2)}x ROAS, below the ${derived.breakEvenRoas}x break-even requirement for a ${profile.gross_margin_pct}% gross margin business.`,
      campaignId: campaign.id,
      metricValue: `${roas.toFixed(2)}x ROAS`,
      recommendedAction: 'Pause underperforming ad sets or reallocate budget to higher-converting segments.',
    });
  } else if (campaign.customers_won > 0 && cac > derived.maxAllowableCac) {
    const cacFormatted = `₹${Math.round(cac).toLocaleString('en-IN')}`;
    const maxCacFormatted = `₹${derived.maxAllowableCac.toLocaleString('en-IN')}`;
    alerts.push({
      id: `cac-ceiling-breach-${campaign.id}`,
      type: 'warning',
      title: `CAC EXCEEDS UNIT ECONOMIC CEILING: ${campaign.name}`,
      message: `Actual acquisition cost (${cacFormatted}) exceeds Max Allowable CAC (${maxCacFormatted}) required to sustain a ${profile.target_ltv_cac_ratio}x LTV:CAC ratio.`,
      campaignId: campaign.id,
      metricValue: `${cacFormatted} CAC`,
      recommendedAction: 'Tighten audience targeting and improve sales close rate to bring CAC below ceiling.',
    });
  } else if ((campaign.net_profit || 0) < 0) {
    const lossFormatted = `₹${Math.abs(Math.round(campaign.net_profit || 0)).toLocaleString('en-IN')}`;
    alerts.push({
      id: `negative-net-profit-${campaign.id}`,
      type: 'warning',
      title: `NEGATIVE NET CONTRIBUTION: ${campaign.name}`,
      message: `After accounting for COGS and ad spend, net contribution is negative (-${lossFormatted}).`,
      campaignId: campaign.id,
      metricValue: `-${lossFormatted} Net`,
      recommendedAction: 'Review service delivery COGS and offer pricing structure.',
    });
  } else if (roas >= derived.targetScalingRoas) {
    alerts.push({
      id: `scaling-candidate-${campaign.id}`,
      type: 'celebration',
      title: `SCALING CANDIDATE: ${campaign.name}`,
      message: `ROAS (${roas.toFixed(2)}x) exceeds ${derived.targetScalingRoas}x scaling threshold with healthy unit economics.`,
      campaignId: campaign.id,
      metricValue: `${roas.toFixed(2)}x ROAS`,
      recommendedAction: 'Increase budget allocation by 20-30% while monitoring marginal CAC.',
    });
  }

  return alerts;
}
