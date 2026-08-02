// ==============================================================================
// MIOS Dashboard Benchmark Alerts (@/components/dashboard/benchmark-alerts.tsx)
// Governed by ADR-001 (PestControl OS Executive Suite aesthetic)
// ==============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatedList } from '@/components/ui/unlumen/animated-list';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BenchmarkAlert } from '@/hooks/use-dashboard';
import { AlertTriangle, Award, ArrowRight } from 'lucide-react';

interface BenchmarkAlertsProps {
  alerts: BenchmarkAlert[];
}

export function BenchmarkAlerts({ alerts }: BenchmarkAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="p-4 bg-black border border-zinc-800 flex items-center justify-between text-xs font-mono uppercase text-zinc-500">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#00dbe9]" />
          <span>[ ALL CAMPAIGN TELEMETRY COMPLIANT WITH EXECUTIVE BENCHMARKS ]</span>
        </div>
        <span className="text-[#00dbe9]">[ ZERO ALERTS ]</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          [ REALTIME BENCHMARK BREACHES & SCALE OPPORTUNITIES ]
        </span>
        <Badge
          variant="outline"
          className="rounded-none font-mono text-[10px] uppercase bg-zinc-900 border-zinc-700 text-zinc-300"
        >
          {alerts.length} ACTIVE SIGNAL{alerts.length === 1 ? '' : 'S'}
        </Badge>
      </div>

      <AnimatedList
        direction="up"
        distance={15}
        staggerDelay={35}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {alerts.map((alert) => {
          const isWarning = alert.type === 'warning';
          return (
            <div
              key={alert.id}
              className={`p-4 border transition-colors flex flex-col justify-between ${
                isWarning
                  ? 'bg-rose-500/10 border-rose-500/40 hover:border-rose-500'
                  : 'bg-[#00dbe9]/10 border-[#00dbe9]/40 hover:border-[#00dbe9]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Award className="w-4 h-4 text-[#00dbe9] shrink-0" />
                    )}
                    <span
                      className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        isWarning ? 'text-rose-400' : 'text-[#00dbe9]'
                      }`}
                    >
                      {alert.title}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed pt-1">
                    {alert.message}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={`rounded-none font-mono text-[11px] font-bold shrink-0 ${
                    isWarning
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                      : 'bg-[#00dbe9]/20 border-[#00dbe9]/60 text-[#00dbe9]'
                  }`}
                >
                  {alert.metricValue}
                </Badge>
              </div>

              {alert.campaignId && (
                <div className="mt-4 pt-2 border-t border-zinc-800/80 flex items-center justify-end">
                  <Link href={`/campaigns/${alert.campaignId}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-7 px-3 rounded-none font-mono text-[10px] tracking-wider uppercase transition-all ${
                        isWarning
                          ? 'border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-black'
                          : 'border-[#00dbe9]/50 text-[#00dbe9] hover:bg-[#00dbe9] hover:text-black font-bold'
                      }`}
                    >
                      <span>[ AUDIT CAMPAIGN ]</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </AnimatedList>
    </div>
  );
}
