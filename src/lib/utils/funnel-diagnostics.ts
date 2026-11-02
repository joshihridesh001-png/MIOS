// ==============================================================================
// MIOS Funnel Bottleneck Locator, Kill-Switch Evaluator & Assumption Falsification
// (@/lib/utils/funnel-diagnostics.ts)
// Governed by ADR-001 (ISO/IEC 25010 Reliability, Single Responsibility)
// ==============================================================================

import {
  AssumptionLedgerEntry,
  AssumptionStatus,
  CampaignWithMetrics,
  FunnelDiagnosticReport,
  FunnelStageDiagnostic,
  FunnelStageName,
  UnitEconomicsProfile,
} from '@/lib/types/database';
import { computeDerivedThresholds } from './unit-economics';

export type {
  FunnelStageName,
  FunnelStageDiagnostic,
  FunnelDiagnosticReport,
  AssumptionLedgerEntry,
  AssumptionStatus,
};

interface StageSpec {
  stage: FunnelStageName;
  label: string;
  fromCount: number;
  toCount: number;
  benchmarkRatePct: number;
  brokenAssumption: string;
  prescribedIntervention: string;
}

/**
 * Diagnoses a campaign's 5-stage conversion funnel (Impressions -> Clicks -> Inquiries ->
 * Qualified Leads -> Proposals Sent -> Clients Won), isolates the primary bottleneck,
 * and evaluates predefined kill-switch criteria.
 */
export function diagnoseCampaignFunnel(
  campaign: CampaignWithMetrics,
  profile: UnitEconomicsProfile,
  now: Date = new Date()
): FunnelDiagnosticReport {
  const impressions = Math.max(0, Number(campaign.impressions) || 0);
  const clicks = Math.max(0, Number(campaign.clicks) || 0);
  const inquiries = Math.max(
    Number(campaign.inquiries) || 0,
    (Number(campaign.messages) || 0) + (Number(campaign.calls) || 0),
    Number(campaign.qualified_leads) || 0
  );
  const qualified = Math.max(0, Number(campaign.qualified_leads) || 0);
  const quotes = Math.max(
    Number(campaign.quotes_sent) || 0,
    Number(campaign.customers_won) || 0
  );
  const won = Math.max(0, Number(campaign.customers_won) || 0);

  const closeBenchmark = Math.min(
    80,
    Math.max(25, Math.round((Number(profile.target_lead_to_close_rate) || 15) * 1.5))
  );

  const stageSpecs: StageSpec[] = [
    {
      stage: 'impression_to_click',
      label: 'Impressions → Clicks (Hook CTR)',
      fromCount: impressions,
      toCount: clicks,
      benchmarkRatePct: 1.5,
      brokenAssumption:
        'Ad hook and visual stop-power resonate with target audience problem awareness.',
      prescribedIntervention:
        'Test 2 new high-contrast creative hooks addressing core buyer risk before altering landing page.',
    },
    {
      stage: 'click_to_inquiry',
      label: 'Clicks → Inquiries (Landing CVR)',
      fromCount: clicks,
      toCount: inquiries,
      benchmarkRatePct: 8.0,
      brokenAssumption:
        'Landing destination or WhatsApp intake matches ad promise with low friction.',
      prescribedIntervention:
        'Audit headline message-match, page load speed, and reduce form/intake fields.',
    },
    {
      stage: 'inquiry_to_qualified',
      label: 'Inquiries → Qualified Leads (Fit Rate)',
      fromCount: inquiries,
      toCount: qualified,
      benchmarkRatePct: 45.0,
      brokenAssumption:
        'Targeting and ad copy pre-qualify buyers with budget and urgent need.',
      prescribedIntervention:
        'Add explicit segment/pricing qualifier in ad copy or intake questions to filter low-intent leads.',
    },
    {
      stage: 'qualified_to_quote',
      label: 'Qualified → Proposals Sent (Discovery Rate)',
      fromCount: qualified,
      toCount: quotes,
      benchmarkRatePct: 65.0,
      brokenAssumption:
        'Speed-to-lead SLA and discovery call process convert qualified leads into active proposals.',
      prescribedIntervention:
        'Enforce <5 minute lead response SLA and automated calendar booking reminders.',
    },
    {
      stage: 'quote_to_won',
      label: 'Proposals → Clients Won (Close Rate)',
      fromCount: quotes,
      toCount: won,
      benchmarkRatePct: closeBenchmark,
      brokenAssumption:
        'Proposal pricing, SLA risk-reversal guarantee, and case studies overcome buyer objections.',
      prescribedIntervention:
        'Strengthen risk-reversal guarantee and include vertical-specific ROI case studies in proposal follow-up.',
    },
  ];

  let primaryBottleneck: FunnelStageDiagnostic | null = null;
  let lowestRatio = Infinity;

  const stages: FunnelStageDiagnostic[] = stageSpecs.map((spec) => {
    const actualRatePct =
      spec.fromCount > 0
        ? Number(((spec.toCount / spec.fromCount) * 100).toFixed(2))
        : 0;
    const deltaPct = Number((actualRatePct - spec.benchmarkRatePct).toFixed(2));
    const isBottleneck =
      spec.fromCount > 0 && actualRatePct < spec.benchmarkRatePct * 0.85;

    const diagnostic: FunnelStageDiagnostic = {
      stage: spec.stage,
      label: spec.label,
      fromCount: spec.fromCount,
      toCount: spec.toCount,
      actualRatePct,
      benchmarkRatePct: spec.benchmarkRatePct,
      deltaPct,
      isBottleneck,
      brokenAssumption: spec.brokenAssumption,
      prescribedIntervention: spec.prescribedIntervention,
    };

    if (isBottleneck) {
      const ratio = actualRatePct / spec.benchmarkRatePct;
      if (ratio < lowestRatio) {
        lowestRatio = ratio;
        primaryBottleneck = diagnostic;
      }
    }

    return diagnostic;
  });

  // Predefined Kill-Switch Evaluation
  const derived = computeDerivedThresholds(profile);
  const spend = Math.max(0, Number(campaign.spend) || 0);
  const roas =
    campaign.roas !== null && campaign.roas !== undefined
      ? Number(campaign.roas)
      : spend > 0
        ? (Number(campaign.revenue) || 0) / spend
        : 0;

  const rawStartDate = campaign.start_date || campaign.created_at;
  const startMs = rawStartDate ? new Date(rawStartDate).getTime() : now.getTime();
  const diffMs = Number.isFinite(startMs) ? now.getTime() - startMs : 0;
  const daysRunning = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

  let killSwitchTriggered = false;
  let killSwitchReason: string | null = null;

  if (spend >= profile.min_spend_for_evaluation * 1.5 && qualified === 0) {
    killSwitchTriggered = true;
    killSwitchReason = `Kill Criterion Met: Spent ₹${spend.toLocaleString('en-IN')} (>1.5x evaluation floor) with 0 qualified leads.`;
  } else if (
    daysRunning >= profile.avg_sales_cycle_days &&
    spend >= profile.min_spend_for_evaluation * 2 &&
    roas < derived.breakEvenRoas * 0.7
  ) {
    killSwitchTriggered = true;
    killSwitchReason = `Kill Criterion Met: Full ${profile.avg_sales_cycle_days}d sales cycle elapsed with ROAS (${roas.toFixed(2)}x) below 70% of break-even (${derived.breakEvenRoas}x).`;
  }

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    primaryBottleneck,
    stages,
    killSwitchTriggered,
    killSwitchReason,
  };
}

/**
 * Evaluates an Assumption Ledger entry against live campaign telemetry to suggest
 * empirical validation or falsification.
 */
export function evaluateAssumptionFalsification(
  entry: AssumptionLedgerEntry,
  campaigns: CampaignWithMetrics[],
  profile: UnitEconomicsProfile
): { suggestedStatus: AssumptionStatus; diagnosticNote: string } {
  if (entry.entity_id) {
    const matchedCampaign = (campaigns || []).find((c) => c.id === entry.entity_id);
    if (matchedCampaign) {
      const diag = diagnoseCampaignFunnel(matchedCampaign, profile);
      if (diag.killSwitchTriggered) {
        return {
          suggestedStatus: 'falsified',
          diagnosticNote:
            diag.killSwitchReason || 'Kill criterion triggered on linked campaign.',
        };
      }

      const derived = computeDerivedThresholds(profile);
      const spend = Math.max(0, Number(matchedCampaign.spend) || 0);
      const roas =
        matchedCampaign.roas !== null && matchedCampaign.roas !== undefined
          ? Number(matchedCampaign.roas)
          : spend > 0
            ? (Number(matchedCampaign.revenue) || 0) / spend
            : 0;

      if (roas >= derived.breakEvenRoas) {
        return {
          suggestedStatus: 'validated',
          diagnosticNote:
            'Linked campaign achieved profitable unit economics above break-even ROAS.',
        };
      }
    }
  }

  return {
    suggestedStatus: entry.status,
    diagnosticNote:
      'Awaiting sufficient empirical test volume to confirm or falsify.',
  };
}
