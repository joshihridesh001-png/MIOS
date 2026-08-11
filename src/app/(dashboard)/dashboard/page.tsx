// ==============================================================================
// MIOS Master Executive Dashboard Page (@/app/(dashboard)/dashboard/page.tsx)
// Governed by ADR-001 (PestControl OS Executive Suite aesthetic)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { useDashboard, type DateFilter, type PlatformFilter } from '@/hooks/use-dashboard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardKPIs } from '@/components/dashboard/dashboard-kpis';
import { BenchmarkAlerts } from '@/components/dashboard/benchmark-alerts';
import { PipelineGrid } from '@/components/dashboard/pipeline-grid';
import { MotionAccordion } from '@/components/ui/unlumen/motion-accordion';
import { Badge } from '@/components/ui/badge';
import { Cpu, TerminalWindow } from "@phosphor-icons/react";

interface DiagnosticItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

const EXECUTIVE_DIAGNOSTICS: DiagnosticItem[] = [
  {
    id: 'diag-1',
    title: 'WHY IS OUR BLENDED CAC AT THIS LEVEL AND HOW DO WE LOWER IT?',
    content: (
      <div className="space-y-2 text-xs font-sans text-foreground leading-relaxed">
        <p>
          Blended Customer Acquisition Cost (CAC) is heavily influenced by first-touch conversion speed. According to institutional rule <strong className="text-primary">#MKT-001</strong>, calling residential WhatsApp leads within 5 minutes increases quote booking by 38%.
        </p>
        <p>
          <strong className="text-foreground font-bold">Action Mandate:</strong> Enforce 5-minute SLA on all Meta Ads WhatsApp click-to-chat campaigns to reduce blended CAC by an estimated 15-22%.
        </p>
      </div>
    ),
  },
  {
    id: 'diag-2',
    title: 'WHICH BUYER PSYCHOLOGY TRIGGERS ARE YIELDING THE HIGHEST ROAS?',
    content: (
      <div className="space-y-2 text-xs font-sans text-foreground leading-relaxed">
        <p>
          Across enterprise residential and B2B commercial marketing telemetry, <strong className="text-emerald-400">&quot;100% Performance Guarantee&quot;</strong> and <strong className="text-emerald-400">&quot;180-Day Retention Warranty&quot;</strong> convert at 2.3× higher ROAS than generic price-discount offers.
        </p>
        <p>
          <strong className="text-foreground font-bold">Action Mandate:</strong> Rotate out all price-discount creatives in favor of trust-verification and guarantee-led hooks in the Creative Library.
        </p>
      </div>
    ),
  },
  {
    id: 'diag-3',
    title: 'HOW DO INSTITUTIONAL RULES PREVENT WASTED AD SPEND?',
    content: (
      <div className="space-y-2 text-xs font-sans text-foreground leading-relaxed">
        <p>
          Whenever an A/B test in <strong className="text-purple-400">LABS</strong> or an ad campaign fails, its root cause is permanently logged in the Knowledge Base (`/knowledge`). Rules with over 80% confidence automatically flag conflicting campaign proposals before spend is committed.
        </p>
        <p>
          <strong className="text-foreground font-bold">Action Mandate:</strong> Review high-confidence rules monthly during executive debriefs to ensure media buyers obey proven historical constraints.
        </p>
      </div>
    ),
  },
  {
    id: 'diag-4',
    title: 'WHAT ARE THE HIGH-LEVERAGE SCALE VECTORS FOR THIS QUARTER?',
    content: (
      <div className="space-y-2 text-xs font-sans text-foreground leading-relaxed">
        <p>
          Enterprise annual marketing intelligence contracts generate an average ticket size of ₹45,000 with 78% annual renewal. Scaling Google Ads search intent campaigns for high-intent enterprise keywords offers the highest net profit potential.
        </p>
        <p>
          <strong className="text-foreground font-bold">Action Mandate:</strong> Reallocate 25% of top-of-funnel display budget into high-intent enterprise search campaigns.
        </p>
      </div>
    ),
  },
];

export default function DashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('ALL');

  const {
    allCampaigns,
    experiments,
    customers,
    learnings,
    loading,
    error,
    kpis,
    alerts,
  } = useDashboard(dateFilter, platformFilter);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* 1. Dashboard Header with Filters */}
      <DashboardHeader
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
      />

      {/* 2. Realtime Benchmark Breaches & Scale Opportunities */}
      <BenchmarkAlerts alerts={alerts} />

      {/* 3. Executive Financial & Conversion KPIs */}
      {loading ? (
        <div className="p-12 text-center neo-flat border-none">
          <div className="font-sans font-bold text-xs uppercase text-primary animate-pulse">
            [ SYNCHRONIZING REALTIME MARKETING TELEMETRY... ]
          </div>
        </div>
      ) : (
        <DashboardKPIs kpis={kpis} />
      )}

      {/* 4. Cross-Module Intelligence Cockpit (4 Pillars) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu weight="duotone" className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              [ REALTIME ENTERPRISE INTELLIGENCE PIPELINES ]
            </span>
          </div>
          <Badge
            variant="outline"
            className="rounded-xl font-sans font-bold text-[10px] uppercase neo-pressed border-none text-muted-foreground"
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
            [ EXECUTIVE DIAGNOSTICS & TELEMETRY SYNTHESIS ]
          </span>
        </div>

        <div className="neo-flat border-none p-4 space-y-3">
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
