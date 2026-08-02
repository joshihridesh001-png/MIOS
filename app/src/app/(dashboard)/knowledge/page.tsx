// ==============================================================================
// MIOS Knowledge Base — Master Vault Page (@/app/(dashboard)/knowledge/page.tsx)
// Governed by ADR-001 (PestControl OS Executive Suite aesthetic)
// ==============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useAllLearnings } from '@/hooks/use-learnings';
import { KnowledgeCard } from '@/components/knowledge/knowledge-card';
import { KnowledgeFormModal } from '@/components/knowledge/knowledge-form-modal';
import { TextReveal } from '@/components/ui/unlumen/text-reveal';
import { AnimateCount } from '@/components/ui/unlumen/animate-count';
import { AnimatedList } from '@/components/ui/unlumen/animated-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const FILTER_DOMAINS = [
  { key: 'ALL', label: 'ALL DOMAINS' },
  { key: 'marketing', label: 'MARKETING' },
  { key: 'sales', label: 'SALES' },
  { key: 'customer_psychology', label: 'BUYER PSYCHOLOGY' },
  { key: 'operations', label: 'FIELD OPERATIONS' },
  { key: 'pricing', label: 'PRICING' },
  { key: 'competitor', label: 'COMPETITORS' },
];

export default function KnowledgeBasePage() {
  const [activeDomain, setActiveDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    learnings,
    loading,
    error,
    createLearning,
    deleteLearning,
    confirmLearning,
    contradictLearning,
  } = useAllLearnings(activeDomain);

  // Filter by search query
  const filteredLearnings = useMemo(() => {
    if (!searchQuery.trim()) return learnings;
    const q = searchQuery.toLowerCase();
    return learnings.filter(
      (l) =>
        l.insight.toLowerCase().includes(q) ||
        (l.tags && l.tags.some((t) => t.toLowerCase().includes(q))) ||
        l.category.toLowerCase().includes(q)
    );
  }, [learnings, searchQuery]);

  // Aggregate KPI Calculations
  const stats = useMemo(() => {
    const total = learnings.length;
    const highConf = learnings.filter((l) => (l.confidence_score || 0) >= 80).length;
    const totalConfirmations = learnings.reduce(
      (acc, l) => acc + (l.confirmations || 1),
      0
    );
    const avgLift =
      total > 0
        ? learnings.reduce((acc, l) => acc + (l.avg_improvement || 0), 0) / total
        : 0;

    return { total, highConf, totalConfirmations, avgLift };
  }, [learnings]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="rounded-none font-mono text-[10px] uppercase tracking-wider border-[#00dbe9]/50 text-[#00dbe9] bg-[#00dbe9]/10"
            >
              [ KNOWLEDGE VAULT • COMPOUNDING INTEL ]
            </Badge>
            <span className="font-mono text-xs text-zinc-500">
              ISO/IEC 25010 INSTITUTIONAL MEMORY
            </span>
          </div>

          <TextReveal
            text="[ INSTITUTIONAL KNOWLEDGE BASE & INTEL VAULT ]"
            mode="word"
            staggerDelay={40}
            className="text-2xl md:text-3xl font-mono uppercase tracking-tight text-white font-bold"
          />

          <p className="text-sm text-zinc-400 font-sans mt-1 max-w-2xl">
            Compounding executive rules, verified customer psychology triggers, and historical A/B test winners. Rules with confirmations over 80% confidence govern all new MIOS campaigns.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-none bg-[#00dbe9] text-black hover:bg-[#00dbe9]/90 font-mono text-xs uppercase tracking-wider font-bold h-10 px-5 shadow-[0_0_15px_rgba(0,219,233,0.35)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          [ + LOG INSTITUTIONAL RULE ]
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-black border border-zinc-800 rounded-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400">
              TOTAL RULES LOGGED
            </span>
            <BookOpen className="w-4 h-4 text-[#00dbe9]" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white tabular-nums">
            <AnimateCount value={stats.total} format="number" />
          </div>
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            INSTITUTIONAL RULES IN VAULT
          </p>
        </div>

        <div className="p-4 bg-black border border-zinc-800 rounded-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400">
              HIGH CONFIDENCE (&gt;=80%)
            </span>
            <ShieldCheck className="w-4 h-4 text-[#00dbe9]" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-[#00dbe9] tabular-nums">
            <AnimateCount value={stats.highConf} format="number" />
          </div>
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            VERIFIED CAMPAIGN MANDATES
          </p>
        </div>

        <div className="p-4 bg-black border border-zinc-800 rounded-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400">
              AVG VERIFIED LIFT
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            <AnimateCount value={stats.avgLift} format="percent" decimals={1} prefix="+" />
          </div>
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            COMPOUNDED REVENUE LIFT
          </p>
        </div>

        <div className="p-4 bg-black border border-zinc-800 rounded-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400">
              TOTAL CONFIRMATIONS
            </span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-amber-400 tabular-nums">
            <AnimateCount value={stats.totalConfirmations} format="number" />
          </div>
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            FIELD EXPERIMENT VALIDATIONS
          </p>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-black p-3 border border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_DOMAINS.map((d) => (
            <button
              key={d.key}
              onClick={() => setActiveDomain(d.key)}
              className={`px-3 py-1.5 text-xs font-mono uppercase transition-all ${
                activeDomain === d.key
                  ? 'bg-[#00dbe9] text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              [ {d.label} ]
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH RULES OR TAGS..."
            className="rounded-none bg-zinc-900 border-zinc-800 pl-9 font-mono text-xs uppercase placeholder:text-zinc-600 focus-visible:ring-[#00dbe9]"
          />
        </div>
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="p-12 text-center border border-zinc-800 bg-black">
          <div className="font-mono text-xs uppercase text-[#00dbe9] animate-pulse">
            [ SYNCHRONIZING INSTITUTIONAL KNOWLEDGE BASE... ]
          </div>
        </div>
      ) : filteredLearnings.length === 0 ? (
        <div className="p-16 text-center border border-zinc-800 bg-black space-y-4">
          <div className="font-mono text-sm uppercase text-zinc-400">
            [ NO RULES MATCHING SPECIFIED FILTER IN VAULT ]
          </div>
          <p className="text-xs text-zinc-600 font-sans max-w-md mx-auto">
            Log your first marketing rule, customer psychology trigger, or operational protocol to start compounding institutional intelligence.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-none bg-[#00dbe9] text-black hover:bg-[#00dbe9]/90 font-mono text-xs uppercase font-bold"
          >
            [ + LOG FIRST INSTITUTIONAL RULE ]
          </Button>
        </div>
      ) : (
        /* Knowledge Cards Grid */
        <AnimatedList
          direction="up"
          distance={15}
          staggerDelay={40}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredLearnings.map((l) => (
            <KnowledgeCard
              key={l.id}
              learning={l}
              onConfirm={confirmLearning}
              onContradict={contradictLearning}
              onDelete={deleteLearning}
            />
          ))}
        </AnimatedList>
      )}

      {/* Form Modal */}
      <KnowledgeFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={async (data) => {
          await createLearning(data);
        }}
      />
    </div>
  );
}
