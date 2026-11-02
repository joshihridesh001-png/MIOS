// ==============================================================================
// MIOS Data Science Capital Allocator Engine (@/lib/utils/capital-allocator.ts)
// Explore vs. Exploit, Multi-Factor Impact Scoring & 3-Layer Causal Attribution
// Governed by ADR-001 (ISO/IEC 25010 Reliability, Single Responsibility)
// ==============================================================================

import {
  AllocationRegime,
  CampaignWithMetrics,
  CapitalAllocationDecision,
  CreativeRow,
  ImpactScoreBreakdown,
  PortfolioAllocationSummary,
  UnitEconomicsProfile,
} from '@/lib/types/database';
import { computeDerivedThresholds } from './unit-economics';

export type {
  AllocationRegime,
  ImpactScoreBreakdown,
  CapitalAllocationDecision,
  PortfolioAllocationSummary,
};

/**
 * Multi-factor quantitative prioritization formula:
 * ImpactScore = OutcomeImpact × StatisticalConfidence × Relevance × Urgency
 * Normalized to a [1, 100] composite score.
 */
export function computeImpactScore(
  outcomeImpact: number,
  statisticalConfidence: number,
  relevance: number,
  urgency: number
): ImpactScoreBreakdown {
  const clampedOutcome = Math.min(
    10,
    Math.max(0, Number.isFinite(outcomeImpact) ? outcomeImpact : 0)
  );
  const clampedConfidence = Math.min(
    1.0,
    Math.max(0.1, Number.isFinite(statisticalConfidence) ? statisticalConfidence : 0.1)
  );
  const clampedRelevance = Math.min(
    1.0,
    Math.max(0.1, Number.isFinite(relevance) ? relevance : 0.1)
  );
  const clampedUrgency = Math.min(
    1.0,
    Math.max(0.1, Number.isFinite(urgency) ? urgency : 0.1)
  );

  const raw = clampedOutcome * clampedConfidence * clampedRelevance * clampedUrgency;
  const compositeScore = Math.min(100, Math.max(1, Math.round(raw * 10)));

  return {
    outcomeImpact: Number(clampedOutcome.toFixed(2)),
    statisticalConfidence: Number(clampedConfidence.toFixed(2)),
    relevance: Number(clampedRelevance.toFixed(2)),
    urgency: Number(clampedUrgency.toFixed(2)),
    compositeScore,
  };
}

/**
 * Evaluates a campaign's unit economics, sales-cycle lag window, and top-of-funnel
 * signals to classify it into an Explore/Exploit regime with 3-layer causal attribution.
 */
export function evaluateCampaignAllocation(
  campaign: CampaignWithMetrics,
  profile: UnitEconomicsProfile,
  now: Date = new Date()
): CapitalAllocationDecision {
  const derived = computeDerivedThresholds(profile);

  const spend = Math.max(0, Number(campaign.spend) || 0);
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
  const ctr =
    campaign.ctr !== null && campaign.ctr !== undefined
      ? Number(campaign.ctr)
      : campaign.impressions > 0
        ? ((Number(campaign.clicks) || 0) / campaign.impressions) * 100
        : 0;
  const cpl =
    campaign.cpl !== null && campaign.cpl !== undefined
      ? Number(campaign.cpl)
      : campaign.qualified_leads > 0
        ? spend / campaign.qualified_leads
        : null;

  const rawStartDate = campaign.start_date || campaign.created_at;
  const startMs = rawStartDate ? new Date(rawStartDate).getTime() : now.getTime();
  const diffMs = Number.isFinite(startMs) ? now.getTime() - startMs : 0;
  const daysRunning = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

  const minSpend = Math.max(1, Number(profile.min_spend_for_evaluation) || 1);
  const statisticalConfidence = Math.min(
    1,
    Math.max(0.2, spend / Math.max(1, minSpend * 2))
  );

  // 1. EXPLOIT (Scale Winner)
  if (
    spend >= profile.min_spend_for_evaluation &&
    roas >= derived.targetScalingRoas &&
    (campaign.customers_won === 0 || cac <= derived.maxAllowableCac)
  ) {
    const recommendedSpendAmount = Math.round(spend * 1.25);
    const outcomeImpact = Math.min(10, 8.0 + Math.min(2.0, (roas - derived.targetScalingRoas) * 0.5));
    return {
      entityId: campaign.id,
      entityName: campaign.name,
      entityType: 'campaign',
      platform: campaign.platform,
      regime: 'exploit',
      currentSpend: spend,
      recommendedSpendDeltaPct: 25,
      recommendedSpendAmount,
      impactScore: computeImpactScore(outcomeImpact, statisticalConfidence, 0.95, 0.9),
      primarySignal: `ROAS at ${roas.toFixed(2)}x beats ${derived.targetScalingRoas}x scaling threshold (CAC ₹${Math.round(cac).toLocaleString('en-IN')} vs ₹${derived.maxAllowableCac.toLocaleString('en-IN')} ceiling).`,
      causalHypothesis: `Offer and audience targeting have achieved unit-economic product-market fit with positive net margin contribution.`,
      counterfactualAction: `Scale budget by +25% (to ₹${recommendedSpendAmount.toLocaleString('en-IN')}) while monitoring marginal CAC for diminishing returns.`,
    };
  }

  // 2. HOLD PIPELINE (Sales-Cycle Lag Protection or Insufficient Spend)
  if (
    spend < profile.min_spend_for_evaluation ||
    (daysRunning < profile.avg_sales_cycle_days &&
      campaign.qualified_leads > 0 &&
      cpl !== null &&
      cpl <= derived.maxAllowableCpl * 1.2)
  ) {
    return {
      entityId: campaign.id,
      entityName: campaign.name,
      entityType: 'campaign',
      platform: campaign.platform,
      regime: 'hold_pipeline',
      currentSpend: spend,
      recommendedSpendDeltaPct: 0,
      recommendedSpendAmount: spend,
      impactScore: computeImpactScore(4.5, statisticalConfidence, 0.75, 0.5),
      primarySignal: `Day ${Math.max(1, Math.floor(daysRunning))} of ${profile.avg_sales_cycle_days}d sales cycle; leading CPL is ₹${Math.round(cpl || 0).toLocaleString('en-IN')} (within ₹${derived.maxAllowableCpl.toLocaleString('en-IN')} max).`,
      causalHypothesis: `Lagging revenue is unrecorded due to natural ${profile.avg_sales_cycle_days}-day conversion lag, not funnel failure.`,
      counterfactualAction: `Hold budget steady at ₹${spend.toLocaleString('en-IN')} until cohort exits the ${profile.avg_sales_cycle_days}-day conversion window.`,
    };
  }

  // 3. EXPLORE (Diagnose Funnel Split / Test Alternative)
  if (
    (ctr >= 1.5 &&
      cpl !== null &&
      cpl <= derived.maxAllowableCpl &&
      roas < derived.breakEvenRoas) ||
    (roas >= derived.breakEvenRoas && roas < derived.targetScalingRoas)
  ) {
    if (roas < derived.breakEvenRoas && cpl !== null && cpl <= derived.maxAllowableCpl) {
      return {
        entityId: campaign.id,
        entityName: campaign.name,
        entityType: 'campaign',
        platform: campaign.platform,
        regime: 'explore',
        currentSpend: spend,
        recommendedSpendDeltaPct: 0,
        recommendedSpendAmount: spend,
        impactScore: computeImpactScore(7.0, statisticalConfidence, 0.9, 0.8),
        primarySignal: `Healthy top-of-funnel CPL (₹${Math.round(cpl).toLocaleString('en-IN')}), but closed ROAS (${roas.toFixed(2)}x) lags ${derived.breakEvenRoas}x break-even.`,
        causalHypothesis: `Ad hook and lead capture work, but downstream sales qualification, proposal follow-up, or offer framing is leaking conversions.`,
        counterfactualAction: `Maintain spend but launch an A/B experiment on landing page qualification or sales follow-up SLA.`,
      };
    }

    return {
      entityId: campaign.id,
      entityName: campaign.name,
      entityType: 'campaign',
      platform: campaign.platform,
      regime: 'explore',
      currentSpend: spend,
      recommendedSpendDeltaPct: 0,
      recommendedSpendAmount: spend,
      impactScore: computeImpactScore(6.5, statisticalConfidence, 0.85, 0.75),
      primarySignal: `Profitable baseline ROAS (${roas.toFixed(2)}x vs ${derived.breakEvenRoas}x break-even), but below ${derived.targetScalingRoas}x scaling velocity.`,
      causalHypothesis: `Current creative angle captures core demand but lacks a high-leverage hook to unlock lower CPC/CPL.`,
      counterfactualAction: `Allocate 20% of campaign budget to test 2 new creative hook angles in LABS.`,
    };
  }

  // 4. REALLOCATE / KILL (Unit-Economic Breach)
  return {
    entityId: campaign.id,
    entityName: campaign.name,
    entityType: 'campaign',
    platform: campaign.platform,
    regime: 'reallocate_kill',
    currentSpend: spend,
    recommendedSpendDeltaPct: -100,
    recommendedSpendAmount: 0,
    impactScore: computeImpactScore(9.0, statisticalConfidence, 0.95, 0.95),
    primarySignal: `Spend of ₹${spend.toLocaleString('en-IN')} breached unit boundaries (ROAS ${roas.toFixed(2)}x vs ${derived.breakEvenRoas}x min; CPL ${cpl ? '₹' + Math.round(cpl).toLocaleString('en-IN') : 'No Leads'} vs ₹${derived.maxAllowableCpl.toLocaleString('en-IN')} max).`,
    causalHypothesis: `Fundamental mismatch between target audience, hook relevance, and unit-economic cost ceiling.`,
    counterfactualAction: `Pause campaign immediately and redeploy ₹${spend.toLocaleString('en-IN')} into Exploit winners or new Explore experiments.`,
  };
}

/**
 * Evaluates an individual ad creative across unit economics and audience fatigue
 * to prescribe Explore/Exploit allocation and creative refresh interventions.
 */
export function evaluateCreativeAllocation(
  creative: CreativeRow,
  profile: UnitEconomicsProfile
): CapitalAllocationDecision {
  const derived = computeDerivedThresholds(profile);
  const spend = Math.max(0, Number(creative.spend) || 0);
  const revenue = Math.max(0, Number(creative.revenue) || 0);
  const roas = spend > 0 ? revenue / spend : 0;
  const ctr =
    creative.impressions > 0
      ? ((Number(creative.clicks) || 0) / creative.impressions) * 100
      : 0;
  const fatigue = Math.max(0, Number(creative.fatigue_score) || 0);

  const minCreativeSpend = Math.max(1, (Number(profile.min_spend_for_evaluation) || 1) * 0.5);
  const statisticalConfidence = Math.min(1, Math.max(0.2, spend / (minCreativeSpend * 2)));

  if (roas >= derived.targetScalingRoas && fatigue < 60 && spend >= minCreativeSpend) {
    const recommendedSpendAmount = Math.round(spend * 1.25);
    return {
      entityId: creative.id,
      entityName: creative.name,
      entityType: 'creative',
      platform: creative.platform,
      regime: 'exploit',
      currentSpend: spend,
      recommendedSpendDeltaPct: 25,
      recommendedSpendAmount,
      impactScore: computeImpactScore(8.0, statisticalConfidence, 0.9, 0.85),
      primarySignal: `Creative achieves ${roas.toFixed(2)}x ROAS (${ctr.toFixed(2)}% CTR) with low audience fatigue (${fatigue}/100).`,
      causalHypothesis: `Hook hypothesis and visual format resonate strongly with buyer persona without saturation.`,
      counterfactualAction: `Increase creative spend weight by +25% (to ₹${recommendedSpendAmount.toLocaleString('en-IN')}).`,
    };
  }

  if (roas >= derived.breakEvenRoas && fatigue >= 60) {
    const recommendedSpendAmount = Math.round(spend * 0.8);
    return {
      entityId: creative.id,
      entityName: creative.name,
      entityType: 'creative',
      platform: creative.platform,
      regime: 'explore',
      currentSpend: spend,
      recommendedSpendDeltaPct: -20,
      recommendedSpendAmount,
      impactScore: computeImpactScore(7.5, statisticalConfidence, 0.9, 0.85),
      primarySignal: `Creative remains profitable (${roas.toFixed(2)}x ROAS), but fatigue score reached ${fatigue}/100.`,
      causalHypothesis: `Creative angle converts profitably, but audience saturation (fatigue score ${fatigue}/100) is degrading marginal efficiency`,
      counterfactualAction: `Spin up a fresh visual/hook iteration preserving the same psychological principle`,
    };
  }

  if (spend < minCreativeSpend) {
    return {
      entityId: creative.id,
      entityName: creative.name,
      entityType: 'creative',
      platform: creative.platform,
      regime: 'hold_pipeline',
      currentSpend: spend,
      recommendedSpendDeltaPct: 0,
      recommendedSpendAmount: spend,
      impactScore: computeImpactScore(4.0, statisticalConfidence, 0.7, 0.45),
      primarySignal: `Creative spend (₹${spend.toLocaleString('en-IN')}) is below minimum evaluation threshold (₹${Math.round(minCreativeSpend).toLocaleString('en-IN')}).`,
      causalHypothesis: `Insufficient impression and click volume to reach statistical confidence on creative conversion rate.`,
      counterfactualAction: `Hold delivery steady until creative accumulates ₹${Math.round(minCreativeSpend).toLocaleString('en-IN')} in test spend.`,
    };
  }

  if (roas >= derived.breakEvenRoas && roas < derived.targetScalingRoas) {
    return {
      entityId: creative.id,
      entityName: creative.name,
      entityType: 'creative',
      platform: creative.platform,
      regime: 'explore',
      currentSpend: spend,
      recommendedSpendDeltaPct: 0,
      recommendedSpendAmount: spend,
      impactScore: computeImpactScore(6.0, statisticalConfidence, 0.8, 0.7),
      primarySignal: `Creative generates ${roas.toFixed(2)}x ROAS (${ctr.toFixed(2)}% CTR), above ${derived.breakEvenRoas}x break-even but below ${derived.targetScalingRoas}x scale target.`,
      causalHypothesis: `Messaging validates baseline buyer interest but requires stronger call-to-action or social proof framing.`,
      counterfactualAction: `Test a headline and first-3-second hook variant against this baseline control.`,
    };
  }

  return {
    entityId: creative.id,
    entityName: creative.name,
    entityType: 'creative',
    platform: creative.platform,
    regime: 'reallocate_kill',
    currentSpend: spend,
    recommendedSpendDeltaPct: -100,
    recommendedSpendAmount: 0,
    impactScore: computeImpactScore(8.2, statisticalConfidence, 0.9, 0.9),
    primarySignal: `Creative ROAS (${roas.toFixed(2)}x) is below ${derived.breakEvenRoas}x break-even after ₹${spend.toLocaleString('en-IN')} spend.`,
    causalHypothesis: `Creative angle fails to convert target segment within allowable unit acquisition cost.`,
    counterfactualAction: `Pause creative delivery and reallocate ₹${spend.toLocaleString('en-IN')} to top-performing Exploit creatives.`,
  };
}

/**
 * Aggregates campaign and creative allocation decisions into a portfolio-level
 * Explore vs. Exploit capital distribution and ranked decision queue.
 */
export function buildPortfolioAllocationSummary(
  campaigns: CampaignWithMetrics[],
  creatives: CreativeRow[],
  profile: UnitEconomicsProfile,
  now: Date = new Date()
): PortfolioAllocationSummary {
  const activeCampaigns = (campaigns || []).filter((c) => (Number(c.spend) || 0) > 0);
  const campaignsToEvaluate = activeCampaigns.length > 0 ? activeCampaigns : campaigns || [];
  const activeCreatives = (creatives || []).filter((cr) => (Number(cr.spend) || 0) > 0);

  const campaignDecisions = campaignsToEvaluate.map((c) =>
    evaluateCampaignAllocation(c, profile, now)
  );
  const creativeDecisions = activeCreatives.map((cr) =>
    evaluateCreativeAllocation(cr, profile)
  );

  let totalCurrentSpend = 0;
  let exploitSpend = 0;
  let exploreSpend = 0;
  let holdSpend = 0;
  let atRiskSpend = 0;

  for (const dec of campaignDecisions) {
    totalCurrentSpend += dec.currentSpend;
    if (dec.regime === 'exploit') {
      exploitSpend += dec.currentSpend;
    } else if (dec.regime === 'explore') {
      exploreSpend += dec.currentSpend;
    } else if (dec.regime === 'hold_pipeline') {
      holdSpend += dec.currentSpend;
    } else if (dec.regime === 'reallocate_kill') {
      atRiskSpend += dec.currentSpend;
    }
  }

  const redeployableCapital = atRiskSpend;

  let targetExploitRatioPct = 70;
  let targetExploreRatioPct = 30;
  let portfolioRegimeNote =
    'Balanced growth regime — allocate 70% to proven winners and 30% to structured experiments.';

  if (
    totalCurrentSpend > 0 &&
    exploitSpend >= totalCurrentSpend * 0.5 &&
    atRiskSpend < totalCurrentSpend * 0.2
  ) {
    targetExploitRatioPct = 80;
    targetExploreRatioPct = 20;
    portfolioRegimeNote =
      'Stable high-performing portfolio — prioritize exploiting proven winners (80/20).';
  } else if (totalCurrentSpend > 0 && atRiskSpend >= totalCurrentSpend * 0.35) {
    targetExploitRatioPct = 55;
    targetExploreRatioPct = 45;
    portfolioRegimeNote =
      'Elevated portfolio inefficiency detected — increase exploration of new hooks and offers (55/45).';
  }

  const decisions = [...campaignDecisions, ...creativeDecisions].sort(
    (a, b) => b.impactScore.compositeScore - a.impactScore.compositeScore
  );

  return {
    totalCurrentSpend,
    exploitSpend,
    exploreSpend,
    holdSpend,
    atRiskSpend,
    redeployableCapital,
    targetExploitRatioPct,
    targetExploreRatioPct,
    portfolioRegimeNote,
    decisions,
  };
}
