// ==============================================================================
// MIOS Dashboard — Assumption Ledger, Kill Criteria & Funnel Bottleneck Panel
// (@/components/dashboard/assumption-ledger-panel.tsx)
// ==============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  CampaignWithMetrics,
  UnitEconomicsProfile,
  AssumptionLedgerEntry,
  AssumptionStatus,
  DecisionReversibility,
  ConfidenceLevel,
} from '@/lib/types/database';
import {
  DEFAULT_ASSUMPTION_LEDGER_SEED,
  reversibilityLabels,
  assumptionStatusLabels,
  assumptionStatusColors,
  confidenceLabels,
} from '@/lib/constants';
import {
  diagnoseCampaignFunnel,
  evaluateAssumptionFalsification,
} from '@/lib/utils/funnel-diagnostics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Funnel,
  ShieldWarning,
  Plus,
  CheckCircle,
  WarningOctagon,
  GitBranch,
  ArrowRight,
} from '@phosphor-icons/react';

interface AssumptionLedgerPanelProps {
  campaigns: CampaignWithMetrics[];
  profile: UnitEconomicsProfile;
}

const STORAGE_KEY = 'mios_assumption_ledger_v1';

type ActiveTab = 'funnel' | 'ledger';

export function AssumptionLedgerPanel({ campaigns, profile }: AssumptionLedgerPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('funnel');
  const [entries, setEntries] = useState<AssumptionLedgerEntry[]>(DEFAULT_ASSUMPTION_LEDGER_SEED);
  const [showForm, setShowForm] = useState(false);

  // New Assumption Form State
  const [entityName, setEntityName] = useState('');
  const [assumption, setAssumption] = useState('');
  const [evidence, setEvidence] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium');
  const [reversibility, setReversibility] =
    useState<DecisionReversibility>('reversible_two_way');
  const [consequenceIfWrong, setConsequenceIfWrong] = useState('');
  const [falsificationTest, setFalsificationTest] = useState('');
  const [killCriteria, setKillCriteria] = useState('');

  // Load from localStorage & best-effort Supabase sync
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as AssumptionLedgerEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    }

    let isMounted = true;
    const syncRemote = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('assumption_ledger')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0 && isMounted) {
          setEntries(data as AssumptionLedgerEntry[]);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {
            // Ignore storage write errors
          }
        }
      } catch {
        // Silently ignore if table has not been migrated yet
      }
    };

    syncRemote();
    return () => {
      isMounted = false;
    };
  }, []);

  const persistEntries = useCallback((next: AssumptionLedgerEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const handleAddAssumption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName.trim() || !assumption.trim() || !killCriteria.trim()) return;

    const newEntry: AssumptionLedgerEntry = {
      id: `asm-${Date.now()}`,
      entity_type: 'campaign',
      entity_id: null,
      entity_name: entityName.trim(),
      assumption: assumption.trim(),
      evidence: evidence.trim() || 'Initial operational hypothesis pending empirical test.',
      confidence,
      reversibility,
      consequence_if_wrong:
        consequenceIfWrong.trim() || 'Suboptimal capital allocation during test window.',
      falsification_test:
        falsificationTest.trim() || 'Measure stage conversion rate against historical baseline.',
      kill_criteria: killCriteria.trim(),
      status: 'validating',
      created_at: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    persistEntries(updated);

    try {
      const supabase = createClient();
      await supabase.from('assumption_ledger').insert(newEntry);
    } catch {
      // Best-effort remote insert
    }

    setEntityName('');
    setAssumption('');
    setEvidence('');
    setConsequenceIfWrong('');
    setFalsificationTest('');
    setKillCriteria('');
    setShowForm(false);
  };

  const handleStatusChange = async (id: string, nextStatus: AssumptionStatus) => {
    const updated = entries.map((item) =>
      item.id === id ? { ...item, status: nextStatus } : item
    );
    persistEntries(updated);

    try {
      const supabase = createClient();
      await supabase
        .from('assumption_ledger')
        .update({ status: nextStatus })
        .eq('id', id);
    } catch {
      // Best-effort remote update
    }
  };

  // Compute Funnel Bottleneck Reports
  const reports = useMemo(() => {
    return (campaigns || [])
      .filter((c) => (c.spend || 0) > 0 || (c.impressions || 0) > 0)
      .map((c) => diagnoseCampaignFunnel(c, profile));
  }, [campaigns, profile]);

  const killSwitchReports = useMemo(
    () => reports.filter((r) => r.killSwitchTriggered),
    [reports]
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
      {/* Header & Two-Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Funnel weight="duotone" className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Funnel Bottleneck Diagnostics &amp; Assumption Ledger
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-sans">
            Pinpoint exact conversion stage leaks, enforce predefined kill criteria, and separate reversible 2-way doors from high-commitment 1-way decisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant={activeTab === 'funnel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('funnel')}
            className="h-8 rounded-xl text-xs font-sans font-bold px-3"
          >
            Funnel Bottleneck &amp; Kill-Switch Diagnostics ({reports.length})
          </Button>
          <Button
            type="button"
            variant={activeTab === 'ledger' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ledger')}
            className="h-8 rounded-xl text-xs font-sans font-bold px-3"
          >
            Assumption Ledger &amp; Kill Criteria ({entries.length})
          </Button>
        </div>
      </div>

      {/* TAB 1: Funnel Bottleneck & Kill-Switch Diagnostics */}
      {activeTab === 'funnel' && (
        <div className="space-y-4">
          {/* Triggered Kill-Switch Alerts */}
          {killSwitchReports.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 space-y-2.5">
              <div className="flex items-center gap-2">
                <WarningOctagon weight="duotone" className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Predefined Kill-Switch Triggered ({killSwitchReports.length})
                </span>
              </div>
              <div className="space-y-2">
                {killSwitchReports.map((kr) => (
                  <div
                    key={`kill-${kr.campaignId}`}
                    className="p-2.5 rounded-lg bg-background/70 border border-rose-500/30 text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <strong className="text-foreground font-bold">{kr.campaignName}:</strong>{' '}
                      <span className="text-rose-200">{kr.killSwitchReason}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-lg border-rose-500/50 bg-rose-500/20 text-rose-300 text-[10px] font-sans font-bold uppercase shrink-0"
                    >
                      ABORT / REALLOCATE
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign 5-Stage Pipeline Diagnostics */}
          {reports.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-muted/20 border border-border/50 text-xs font-sans font-bold text-muted-foreground uppercase">
              No active campaigns with impression or spend telemetry to diagnose.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.campaignId}
                  className="p-4 rounded-xl bg-muted/25 border border-border/70 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans font-bold text-foreground">
                        {report.campaignName}
                      </span>
                      {report.primaryBottleneck ? (
                        <Badge
                          variant="outline"
                          className="rounded-lg border-amber-500/40 bg-amber-500/15 text-amber-300 text-[10px] font-sans font-bold"
                        >
                          Primary Bottleneck: {report.primaryBottleneck.label}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="rounded-lg border-emerald-500/40 bg-emerald-500/15 text-emerald-400 text-[10px] font-sans font-bold"
                        >
                          All Stages Above Benchmark
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 5-Stage Pipeline Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {report.stages.map((stg) => (
                      <div
                        key={stg.stage}
                        className={`p-2.5 rounded-lg border text-xs font-sans space-y-1 ${
                          stg.isBottleneck
                            ? 'bg-rose-500/10 border-rose-500/40'
                            : 'bg-background/60 border-border/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                            {stg.label}
                          </span>
                          {stg.isBottleneck && (
                            <span className="text-[9px] font-bold uppercase text-rose-400">
                              LEAK
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline justify-between pt-0.5 tabular-nums">
                          <span
                            className={`text-sm font-bold ${
                              stg.isBottleneck ? 'text-rose-400' : 'text-foreground'
                            }`}
                          >
                            {stg.actualRatePct.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            vs {stg.benchmarkRatePct.toFixed(1)}% bench
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground tabular-nums">
                          {stg.fromCount.toLocaleString('en-IN')} <ArrowRight className="inline w-2.5 h-2.5" />{' '}
                          {stg.toCount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Primary Bottleneck Broken Assumption & Intervention */}
                  {report.primaryBottleneck && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-sans">
                      <div className="p-2.5 rounded-lg bg-background/60 border border-border/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                          Broken Assumption ({report.primaryBottleneck.label})
                        </span>
                        <p className="text-foreground leading-relaxed">
                          {report.primaryBottleneck.brokenAssumption}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-background/60 border border-border/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-0.5">
                          Prescribed Intervention
                        </span>
                        <p className="text-foreground leading-relaxed">
                          {report.primaryBottleneck.prescribedIntervention}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Assumption Ledger & Kill Criteria */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Explicit Beliefs, Reversibility &amp; Predefined Kill Criteria
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm((prev) => !prev)}
              className="h-8 rounded-xl border-border text-xs font-sans font-bold gap-1.5"
            >
              <Plus weight="duotone" className="w-3.5 h-3.5" />
              <span>{showForm ? 'Cancel' : '+ Log Assumption'}</span>
            </Button>
          </div>

          {/* Inline Form to Log New Assumption */}
          {showForm && (
            <form
              onSubmit={handleAddAssumption}
              className="p-4 rounded-xl bg-muted/30 border border-border space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-sans font-bold text-muted-foreground">
                    Entity / Scope Name *
                  </Label>
                  <Input
                    required
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="e.g. Q4 CFO Audit Carousel"
                    className="h-8 rounded-xl text-xs font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-sans font-bold text-muted-foreground">
                    Confidence Level
                  </Label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
                    className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs font-sans font-bold text-foreground"
                  >
                    {Object.entries(confidenceLabels).map(([k, lbl]) => (
                      <option key={k} value={k}>
                        {lbl} Confidence
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-sans font-bold text-muted-foreground">
                    Decision Reversibility
                  </Label>
                  <select
                    value={reversibility}
                    onChange={(e) =>
                      setReversibility(e.target.value as DecisionReversibility)
                    }
                    className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs font-sans font-bold text-foreground"
                  >
                    {Object.entries(reversibilityLabels).map(([k, lbl]) => (
                      <option key={k} value={k}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-sans font-bold text-muted-foreground">
                    Core Assumption *
                  </Label>
                  <Input
                    required
                    value={assumption}
                    onChange={(e) => setAssumption(e.target.value)}
                    placeholder="What must be true for this campaign or test to work?"
                    className="h-8 rounded-xl text-xs font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-sans font-bold text-muted-foreground">
                    Supporting Evidence
                  </Label>
                  <Input
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Prior experiment data, buyer interviews, or benchmark"
                    className="h-8 rounded-xl text-xs font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-sans font-bold text-muted-foreground">
                    Consequence if Wrong
                  </Label>
                  <Input
                    value={consequenceIfWrong}
                    onChange={(e) => setConsequenceIfWrong(e.target.value)}
                    placeholder="Downside blast radius if this belief is false"
                    className="h-8 rounded-xl text-xs font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-sans font-bold text-muted-foreground">
                    Falsification Test
                  </Label>
                  <Input
                    value={falsificationTest}
                    onChange={(e) => setFalsificationTest(e.target.value)}
                    placeholder="How will we empirically test if this assumption is false?"
                    className="h-8 rounded-xl text-xs font-sans"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <Label className="text-[11px] font-sans font-bold text-rose-400">
                    Predefined Kill Criteria (&quot;If X happens, we stop&quot;) *
                  </Label>
                  <Input
                    required
                    value={killCriteria}
                    onChange={(e) => setKillCriteria(e.target.value)}
                    placeholder="e.g. Abort if qualified CPL exceeds ₹4,500 after ₹15,000 spend"
                    className="h-8 rounded-xl text-xs font-sans"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="h-8 rounded-xl font-sans font-bold text-xs px-4"
                >
                  Save Assumption
                </Button>
              </div>
            </form>
          )}

          {/* Assumption Cards */}
          <div className="space-y-3">
            {entries.map((item) => {
              const evalResult = evaluateAssumptionFalsification(item, campaigns, profile);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-muted/25 border border-border/70 space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/50">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-sans font-bold text-foreground">
                          {item.entity_name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`rounded-lg text-[10px] font-sans font-bold px-2 py-0.5 ${
                            assumptionStatusColors[item.status] || ''
                          }`}
                        >
                          {assumptionStatusLabels[item.status] || item.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-lg border-border bg-background text-muted-foreground text-[10px] font-sans font-bold px-2 py-0.5"
                        >
                          <GitBranch className="w-3 h-3 mr-1 inline" />
                          {reversibilityLabels[item.reversibility] || item.reversibility}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-lg border-border bg-background text-foreground text-[10px] font-sans font-bold px-2 py-0.5"
                        >
                          Confidence: {confidenceLabels[item.confidence] || item.confidence}
                        </Badge>
                      </div>
                      <p className="text-xs font-sans font-semibold text-primary pt-0.5">
                        Assumption: &ldquo;{item.assumption}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        aria-label={`Update status for ${item.entity_name}`}
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value as AssumptionStatus)
                        }
                        className="h-7 rounded-lg border border-border bg-background px-2 text-[11px] font-sans font-bold text-foreground"
                      >
                        {Object.entries(assumptionStatusLabels).map(([k, lbl]) => (
                          <option key={k} value={k}>
                            Status: {lbl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4-Column Assumption Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-sans">
                    <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Supporting Evidence
                      </span>
                      <p className="text-foreground leading-relaxed">{item.evidence}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        Consequence if Wrong
                      </span>
                      <p className="text-foreground leading-relaxed">
                        {item.consequence_if_wrong}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                        Falsification Test
                      </span>
                      <p className="text-foreground leading-relaxed">
                        {item.falsification_test}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                        Predefined Kill Criteria
                      </span>
                      <p className="text-foreground leading-relaxed">{item.kill_criteria}</p>
                    </div>
                  </div>

                  {evalResult.suggestedStatus !== item.status && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-xs font-sans flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-300">
                        <ShieldWarning weight="duotone" className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{evalResult.diagnosticNote}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(item.id, evalResult.suggestedStatus)}
                        className="h-6 rounded-lg border-rose-500/50 text-rose-300 text-[10px] font-sans font-bold uppercase"
                      >
                        Apply Suggested ({evalResult.suggestedStatus})
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
