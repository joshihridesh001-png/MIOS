// ==============================================================================
// MIOS Master Executive Dashboard Page (@/app/(dashboard)/dashboard/page.tsx)
// ==============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useDashboard, type DateFilter, type PlatformFilter } from '@/hooks/use-dashboard';
import { useUnitEconomics } from '@/hooks/use-unit-economics';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { UnitEconomicsBar } from '@/components/dashboard/unit-economics-bar';
import { DashboardKPIs } from '@/components/dashboard/dashboard-kpis';
import { CapitalAllocatorPanel } from '@/components/dashboard/capital-allocator-panel';
import { AssumptionLedgerPanel } from '@/components/dashboard/assumption-ledger-panel';
import { BenchmarkAlerts } from '@/components/dashboard/benchmark-alerts';
import { PipelineGrid } from '@/components/dashboard/pipeline-grid';
import { MotionAccordion } from '@/components/ui/unlumen/motion-accordion';
import { Badge } from '@/components/ui/badge';
import { metricFormatters } from '@/lib/constants';
import { Cpu, TerminalWindow } from '@phosphor-icons/react';

interface DiagnosticItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function DashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('ALL');

  const { profile, derived, selectPreset, updateProfile } = useUnitEconomics();

  const {
    allCampaigns,
    experiments,
    customers,
    learnings,
    loading,
    kpis,
    alerts,
    portfolioAllocation,
  } = useDashboard(dateFilter, platformFilter, profile);

  const EXECUTIVE_DIAGNOSTICS: DiagnosticItem[] = useMemo(
    () => [
      {
        id: 'diag-1',
        title: 'WHY IS OUR BLENDED CAC AT THIS LEVEL AND HOW DO WE STAY BELOW OUR CEILING?',
        content: (
          <div className="space-y-2 text-xs font-sans text-foreground leading-relaxed">
            <p>
              Under your calibrated <strong className="text-primary">{profile.business_name}</strong> unit economics, your maximum allowable Customer Acquisition Cost is{' '}
              <strong className="text-primary tabular-nums">
                {metricFormatters.formatCurrency(derived.maxAllowableCac)}
              </strong>{' '}
              and your maximum allowable Cost Per Qualified Lead (CPL) is{' '}
              <strong className="text-primary tabular-nums">
                {metricFormatters.formatCurrency(derived.maxAllowableCpl)}
              </strong>. First-touch speed is the primary lever for protecting these ceilings: contacting inbound leads within 5 minutes increases discovery-call and quote conversion by 38%.
            </p>
            <p>
              <strong className="text-foreground font-bold">RECOMMENDATION:</strong> Enforce a 5-minute response SLA across all inbound lead channels to keep CPL below{' '}
              {metricFormatters.formatCurrency(derived.maxAllowableCpl)} and blended CAC within{' '}
              {metricFormatters.formatCurrency(derived.maxAllowableCac)}.
            </p>
          </div>
        ),
      },
      {
        id: 'diag-2',
        title: 'HOW DOES OUR SALES CYCLE LAG (Δt) PROTECT ACTIVE CAMPAIGNS FROM PREMATURE PAUSING?',
        content: (
          <div className="space-y-2 text-xs font-sans text-foreground leading-relaxed">
            <p>
              Your calibrated sales cycle window (<strong className="text-amber-400">Δt = {profile.avg_sales_cycle_days} days</strong>) accounts for the natural delay between ad spend and closed-won revenue. Campaigns younger than {profile.avg_sales_cycle_days} days are evaluated on upstream lead efficiency (CPL ≤{' '}
              <strong className="text-emerald-400 tabular-nums">
                {metricFormatters.formatCurrency(derived.maxAllowableCpl)}
              </strong>) rather than immediate closed ROAS.
            </p>
            <p>
              <strong className="text-foreground font-bold">RECOMMENDATION:</strong> Do not terminate campaigns inside the {profile.avg_sales_cycle_days}-day pipeline maturation window if qualified leads are converting below {metricFormatters.formatCurrency(derived.maxAllowableCpl)}. Focus on accelerating mid-funnel follow-ups.
            </p>
          </div>
        ),
      },
      {
        id: 'diag-3',
        title: 'WHICH BUYER PSYCHOLOGY TRIGGERS YIELD THE HIGHEST RETURN ABOVE BREAK-EVEN ROAS?',
        content: (
          <div className="space-y-2 text-xs font-sans text-foreground leading-relaxed">
            <p>
              With a gross margin of <strong className="text-primary tabular-nums">{profile.gross_margin_pct}%</strong>, your break-even ROAS floor is{' '}
              <strong className="text-emerald-400 tabular-nums">{derived.breakEvenRoas.toFixed(2)}×</strong> and your target scaling ROAS is{' '}
              <strong className="text-emerald-400 tabular-nums">{derived.targetScalingRoas.toFixed(2)}×</strong>. Across B2B and high-trust service segments, <strong className="text-emerald-400">&quot;SLA &amp; Case-Study Guarantee&quot;</strong> and quantified diagnostic hooks consistently outperform generic price-discount offers.
            </p>
            <p>
              <strong className="text-foreground font-bold">RECOMMENDATION:</strong> Rotate out generic discount creatives in favor of SLA-backed proof and diagnostic audit hooks in the Creative Library.
            </p>
          </div>
        ),
      },
      {
        id: 'diag-4',
        title: 'HOW DO INSTITUTIONAL RULES COMPOUND MARGIN AND LTV?',
        content: (
          <div className="space-y-2 text-xs font-sans text-foreground leading-relaxed">
            <p>
              Whenever an A/B experiment in <strong className="text-purple-400">LABS</strong> or an acquisition campaign concludes, its verified learning is logged in the Knowledge Base (`/knowledge`). High-confidence rules prevent repeat spend on underperforming angles and systematically lift your{' '}
              <strong className="text-primary tabular-nums">
                {metricFormatters.formatCurrency(profile.avg_ltv)}
              </strong>{' '}
              average client LTV through recurring retainer expansion.
            </p>
            <p>
              <strong className="text-foreground font-bold">RECOMMENDATION:</strong> Review high-confidence learnings before launching new campaigns to ensure media allocation aligns with verified buyer psychology.
            </p>
          </div>
        ),
      },
    ],
    [profile, derived]
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* 1. Dashboard Header with Filters */}
      <DashboardHeader
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
      />

      {/* 1B. Executive Unit Economics Calibration Bar */}
      <UnitEconomicsBar
        profile={profile}
        derived={derived}
        onSelectPreset={selectPreset}
        onUpdateProfile={updateProfile}
      />

      {/* 2. Alerts */}
      <BenchmarkAlerts alerts={alerts} />

      {/* 3. Executive Financial & Conversion KPIs */}
      {loading ? (
        <div className="p-12 text-center bg-card border border-border shadow-sm border-none">
          <div className="font-sans font-bold text-xs uppercase text-primary animate-pulse">
            SYNCHRONIZING REALTIME MARKETING DATA...
          </div>
        </div>
      ) : (
        <DashboardKPIs kpis={kpis} />
      )}

      {/* 3B. Executive Capital Allocator & Explore / Exploit Engine */}
      <CapitalAllocatorPanel summary={portfolioAllocation} />

      {/* 3C. Funnel Bottleneck Diagnostics & Assumption Ledger */}
      <AssumptionLedgerPanel campaigns={allCampaigns} profile={profile} />

      {/* 4. Cross-Module Intelligence Cockpit (4 Pillars) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu weight="duotone" className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              REALTIME ENTERPRISE INTELLIGENCE PIPELINES
            </span>
          </div>
          <Badge
            variant="outline"
            className="rounded-xl font-sans font-bold text-[10px] uppercase bg-accent text-accent-foreground border-none text-muted-foreground"
          >
            4 PILLARS ACTIVE
          </Badge>
        </div>

        <PipelineGrid
          campaigns={allCampaigns}
          experiments={experiments}
          learnings={learnings}
          customers={customers}
        />
      </div>

      {/* 5. Executive AI Diagnostics & Strategy Mandates (MotionAccordion) */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <TerminalWindow weight="duotone" className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            EXECUTIVE DIAGNOSTICS & DATA SYNTHESIS
          </span>
        </div>

        <div className="bg-card border border-border shadow-sm border-none p-4 space-y-3">
          {EXECUTIVE_DIAGNOSTICS.map((item, idx) => (
            <MotionAccordion
              key={item.id}
              title={<span className="text-xs font-bold text-primary">{item.title}</span>}
              defaultOpen={idx === 0}
              badgeText={`MANDATE #${idx + 1}`}
            >
              <div className="pt-2">{item.content}</div>
            </MotionAccordion>
          ))}
        </div>
      </div>
    </div>
  );
}
