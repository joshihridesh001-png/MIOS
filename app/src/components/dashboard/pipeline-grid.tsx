// ==============================================================================
// MIOS Dashboard Pipeline Grid (@/components/dashboard/pipeline-grid.tsx)
// Governed by ADR-001 (PestControl OS Executive Suite aesthetic)
// ==============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatedList } from '@/components/ui/unlumen/animated-list';
import { TiltCard } from '@/components/ui/unlumen/tilt-card';
import { Badge } from '@/components/ui/badge';
import type {
  CampaignWithMetrics,
  ExperimentRow,
  LearningRow,
  CustomerRow,
} from '@/lib/types/database';
import {
  Megaphone,
  FlaskConical,
  BookOpen,
  Users,
  ArrowUpRight,
} from 'lucide-react';

interface PipelineGridProps {
  campaigns: CampaignWithMetrics[];
  experiments: ExperimentRow[];
  learnings: LearningRow[];
  customers: CustomerRow[];
}

export function PipelineGrid({
  campaigns,
  experiments,
  learnings,
  customers,
}: PipelineGridProps) {
  const topCampaigns = campaigns.slice(0, 3);
  const activeExperiments = experiments.slice(0, 3);
  const topRules = learnings.slice(0, 3);
  const recentCustomers = customers.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pillar 1: Top Performing Campaigns */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#00dbe9]" />
                <span className="text-xs font-mono font-bold uppercase text-white">
                  TOP CAMPAIGNS
                </span>
              </div>
              <Link
                href="/campaigns"
                className="text-[10px] font-mono text-zinc-500 hover:text-[#00dbe9] flex items-center gap-0.5 uppercase"
              >
                <span>[ ALL ]</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <AnimatedList
              direction="up"
              distance={10}
              staggerDelay={30}
              className="mt-4 space-y-3"
            >
              {topCampaigns.length === 0 ? (
                <p className="text-xs font-mono text-zinc-600 uppercase py-4 text-center">
                  [ NO CAMPAIGNS IN WINDOW ]
                </p>
              ) : (
                topCampaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-mono text-zinc-200 truncate font-bold">
                        {camp.name}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">
                        {camp.platform} • ₹{(camp.spend || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-none font-mono text-[10px] uppercase text-[#00dbe9] border-[#00dbe9]/40 bg-[#00dbe9]/10 shrink-0"
                    >
                      {(camp.roas || 0).toFixed(2)}× ROAS
                    </Badge>
                  </div>
                ))
              )}
            </AnimatedList>
          </div>

          <div className="mt-4 pt-2 border-t border-zinc-800 text-right">
            <Link
              href="/campaigns/new"
              className="text-[10px] font-mono uppercase text-[#00dbe9] hover:underline"
            >
              [ + LAUNCH NEW CAMPAIGN ]
            </Link>
          </div>
        </div>
      </TiltCard>

      {/* Pillar 2: Active A/B Experiments (LABS) */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-bold uppercase text-white">
                  A/B LABS ENGINE
                </span>
              </div>
              <Link
                href="/experiments"
                className="text-[10px] font-mono text-zinc-500 hover:text-purple-400 flex items-center gap-0.5 uppercase"
              >
                <span>[ LABS ]</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <AnimatedList
              direction="up"
              distance={10}
              staggerDelay={30}
              className="mt-4 space-y-3"
            >
              {activeExperiments.length === 0 ? (
                <p className="text-xs font-mono text-zinc-600 uppercase py-4 text-center">
                  [ NO EXPERIMENTS IN LABS ]
                </p>
              ) : (
                activeExperiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-mono text-zinc-200 truncate font-bold">
                        {exp.name}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">
                        {exp.hypothesis_query?.substring(0, 28)}...
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-none font-mono text-[10px] uppercase shrink-0 ${
                        exp.status === 'completed'
                          ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                          : 'text-purple-400 border-purple-500/40 bg-purple-500/10'
                      }`}
                    >
                      {exp.status === 'completed' ? 'WINNER' : exp.status.toUpperCase()}
                    </Badge>
                  </div>
                ))
              )}
            </AnimatedList>
          </div>

          <div className="mt-4 pt-2 border-t border-zinc-800 text-right">
            <Link
              href="/experiments/new"
              className="text-[10px] font-mono uppercase text-purple-400 hover:underline"
            >
              [ + CREATE TEST HYPOTHESIS ]
            </Link>
          </div>
        </div>
      </TiltCard>

      {/* Pillar 3: Verified Rules (/knowledge) */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00dbe9]" />
                <span className="text-xs font-mono font-bold uppercase text-white">
                  INTEL VAULT
                </span>
              </div>
              <Link
                href="/knowledge"
                className="text-[10px] font-mono text-zinc-500 hover:text-[#00dbe9] flex items-center gap-0.5 uppercase"
              >
                <span>[ VAULT ]</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <AnimatedList
              direction="up"
              distance={10}
              staggerDelay={30}
              className="mt-4 space-y-3"
            >
              {topRules.length === 0 ? (
                <p className="text-xs font-mono text-zinc-600 uppercase py-4 text-center">
                  [ VAULT EMPTY ]
                </p>
              ) : (
                topRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-mono text-zinc-200 truncate font-bold">
                        [{rule.category.toUpperCase()}]
                      </p>
                      <p className="text-[10px] font-sans text-zinc-400 truncate">
                        {rule.insight}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-none font-mono text-[10px] uppercase text-[#00dbe9] border-[#00dbe9]/40 bg-[#00dbe9]/10 shrink-0 font-bold"
                    >
                      {rule.confidence_score}%
                    </Badge>
                  </div>
                ))
              )}
            </AnimatedList>
          </div>

          <div className="mt-4 pt-2 border-t border-zinc-800 text-right">
            <Link
              href="/knowledge"
              className="text-[10px] font-mono uppercase text-[#00dbe9] hover:underline"
            >
              [ OPEN KNOWLEDGE VAULT ]
            </Link>
          </div>
        </div>
      </TiltCard>

      {/* Pillar 4: Customer Psychology Profiles (/customers) */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase text-white">
                  BUYER PERSONAS
                </span>
              </div>
              <Link
                href="/customers"
                className="text-[10px] font-mono text-zinc-500 hover:text-amber-400 flex items-center gap-0.5 uppercase"
              >
                <span>[ PERSONAS ]</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <AnimatedList
              direction="up"
              distance={10}
              staggerDelay={30}
              className="mt-4 space-y-3"
            >
              {recentCustomers.length === 0 ? (
                <p className="text-xs font-mono text-zinc-600 uppercase py-4 text-center">
                  [ NO CUSTOMER TELEMETRY ]
                </p>
              ) : (
                recentCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-mono text-zinc-200 truncate font-bold">
                        {cust.name}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">
                        {cust.property_type} • {cust.location}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-none font-mono text-[10px] uppercase text-amber-400 border-amber-500/40 bg-amber-500/10 shrink-0"
                    >
                      {cust.cx_rating}/5 CX
                    </Badge>
                  </div>
                ))
              )}
            </AnimatedList>
          </div>

          <div className="mt-4 pt-2 border-t border-zinc-800 text-right">
            <Link
              href="/customers/new"
              className="text-[10px] font-mono uppercase text-amber-400 hover:underline"
            >
              [ + LOG CUSTOMER TELEMETRY ]
            </Link>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
