// ==============================================================================
// MIOS Dashboard — Executive Capital Allocator & Explore / Exploit Engine
// (@/components/dashboard/capital-allocator-panel.tsx)
// ==============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type {
  PortfolioAllocationSummary,
  CapitalAllocationDecision,
  AllocationRegime,
} from '@/lib/types/database';
import {
  allocationRegimeLabels,
  allocationRegimeColors,
  metricFormatters,
} from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartPolar,
  ArrowUpRight,
  TrendUp,
  Flask,
  HourglassHigh,
  WarningOctagon,
} from '@phosphor-icons/react';

interface CapitalAllocatorPanelProps {
  summary: PortfolioAllocationSummary;
}

type RegimeFilter = 'ALL' | AllocationRegime;
type EntityFilter = 'ALL' | 'campaign' | 'creative';

export function CapitalAllocatorPanel({ summary }: CapitalAllocatorPanelProps) {
  const [regimeFilter, setRegimeFilter] = useState<RegimeFilter>('ALL');
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('ALL');

  const filteredDecisions = useMemo(() => {
    return [...(summary.decisions || [])]
      .filter((d) => {
        if (regimeFilter !== 'ALL' && d.regime !== regimeFilter) return false;
        if (entityFilter !== 'ALL' && d.entityType !== entityFilter) return false;
        return true;
      })
      .sort((a, b) => b.impactScore.compositeScore - a.impactScore.compositeScore);
  }, [summary.decisions, regimeFilter, entityFilter]);

  const regimeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: summary.decisions?.length || 0,
      exploit: 0,
      explore: 0,
      hold_pipeline: 0,
      reallocate_kill: 0,
    };
    (summary.decisions || []).forEach((d) => {
      counts[d.regime] = (counts[d.regime] || 0) + 1;
    });
    return counts;
  }, [summary.decisions]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
      {/* 1. Header & Regime Guidance Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ChartPolar weight="duotone" className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Capital Allocation &amp; Explore / Exploit Engine
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-sans">
            {summary.portfolioRegimeNote}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="rounded-xl border-primary/40 bg-primary/10 text-primary text-xs font-sans font-bold px-3 py-1 tabular-nums"
          >
            Mandate Split: {summary.targetExploitRatioPct}% Exploit /{' '}
            {summary.targetExploreRatioPct}% Explore
          </Badge>
        </div>
      </div>

      {/* 2. 4-Card Capital Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Exploit Capital (Scale)
            </span>
            <TrendUp weight="duotone" className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-sans font-bold text-foreground tabular-nums">
            {metricFormatters.formatCurrency(summary.exploitSpend)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Explore Capital (Test)
            </span>
            <Flask weight="duotone" className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-base font-sans font-bold text-foreground tabular-nums">
            {metricFormatters.formatCurrency(summary.exploreSpend)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              In Pipeline Window (Hold)
            </span>
            <HourglassHigh weight="duotone" className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-base font-sans font-bold text-foreground tabular-nums">
            {metricFormatters.formatCurrency(summary.holdSpend)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Redeployable Capital (At Risk)
            </span>
            <WarningOctagon weight="duotone" className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-base font-sans font-bold text-rose-400 tabular-nums">
            {metricFormatters.formatCurrency(summary.redeployableCapital)}
          </p>
        </div>
      </div>

      {/* 3. Regime Filter Tabs & Entity Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `All (${regimeCounts.ALL})` },
            { id: 'exploit', label: `Exploit (${regimeCounts.exploit || 0})` },
            { id: 'explore', label: `Explore (${regimeCounts.explore || 0})` },
            { id: 'hold_pipeline', label: `Hold (Pipeline) (${regimeCounts.hold_pipeline || 0})` },
            {
              id: 'reallocate_kill',
              label: `Reallocate / Pause (${regimeCounts.reallocate_kill || 0})`,
            },
          ].map((tab) => {
            const active = regimeFilter === tab.id;
            return (
              <Button
                key={tab.id}
                type="button"
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRegimeFilter(tab.id as RegimeFilter)}
                className="h-7 rounded-xl text-[11px] font-sans font-bold px-2.5"
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: 'ALL', label: 'All Entities' },
            { id: 'campaign', label: 'Campaigns' },
            { id: 'creative', label: 'Creatives' },
          ].map((ent) => {
            const active = entityFilter === ent.id;
            return (
              <Button
                key={ent.id}
                type="button"
                variant={active ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setEntityFilter(ent.id as EntityFilter)}
                className="h-7 rounded-xl text-[11px] font-sans font-bold px-2.5"
              >
                {ent.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 4. Impact-Ordered Decision Cards */}
      {filteredDecisions.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-muted/20 border border-border/50 text-xs font-sans font-bold text-muted-foreground uppercase">
          No active capital decisions match the selected regime filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDecisions.map((decision: CapitalAllocationDecision) => {
            const deltaSign = decision.recommendedSpendDeltaPct > 0 ? '+' : '';
            const entityHref =
              decision.entityType === 'campaign'
                ? `/campaigns/${decision.entityId}`
                : `/creatives`;

            return (
              <div
                key={`${decision.entityType}-${decision.entityId}`}
                className="p-4 rounded-xl bg-muted/25 border border-border/70 space-y-3 hover:border-border transition-colors"
              >
                {/* Card Top Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/50">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-lg border-border bg-background text-muted-foreground text-[10px] font-sans font-bold uppercase px-2 py-0.5"
                    >
                      {decision.entityType.toUpperCase()}
                    </Badge>
                    <Link
                      href={entityHref}
                      className="text-xs font-sans font-bold text-foreground hover:text-primary flex items-center gap-1"
                    >
                      <span>{decision.entityName}</span>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                    </Link>
                    <Badge
                      variant="outline"
                      className={`rounded-lg text-[10px] font-sans font-bold px-2 py-0.5 ${
                        allocationRegimeColors[decision.regime] || ''
                      }`}
                    >
                      {allocationRegimeLabels[decision.regime] || decision.regime}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Capital Mandate */}
                    <div className="text-xs font-sans font-bold tabular-nums px-2.5 py-1 rounded-lg bg-background border border-border">
                      <span className="text-muted-foreground">Mandate: </span>
                      <span className="text-foreground">
                        {metricFormatters.formatCurrency(decision.currentSpend)}
                      </span>
                      <span className="text-muted-foreground mx-1">→</span>
                      <span className="text-primary">
                        {metricFormatters.formatCurrency(decision.recommendedSpendAmount)}
                      </span>{' '}
                      <span
                        className={
                          decision.recommendedSpendDeltaPct > 0
                            ? 'text-emerald-400'
                            : decision.recommendedSpendDeltaPct < 0
                            ? 'text-rose-400'
                            : 'text-muted-foreground'
                        }
                      >
                        ({deltaSign}
                        {decision.recommendedSpendDeltaPct}%)
                      </span>
                    </div>

                    {/* Impact Score Pill */}
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="rounded-lg border-primary/40 bg-primary/10 text-primary text-[11px] font-sans font-bold tabular-nums px-2.5 py-1"
                      >
                        Impact Score: {decision.impactScore.compositeScore}/100
                      </Badge>
                      <div className="text-[10px] text-muted-foreground font-sans mt-0.5 tabular-nums">
                        Outcome {decision.impactScore.outcomeImpact}/10 • Conf{' '}
                        {Math.round(decision.impactScore.statisticalConfidence * 100)}% • Urgency{' '}
                        {Math.round(decision.impactScore.urgency * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Layer Systems Thinking Diagnostic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      1. Observed Signal
                    </span>
                    <p className="text-foreground leading-relaxed">{decision.primarySignal}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      2. Causal Hypothesis
                    </span>
                    <p className="text-foreground leading-relaxed">{decision.causalHypothesis}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                      3. Counterfactual Action
                    </span>
                    <p className="text-foreground leading-relaxed">
                      {decision.counterfactualAction}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
