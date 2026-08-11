// ==============================================================================
// MIOS Dashboard Benchmark Alerts (@/components/dashboard/benchmark-alerts.tsx)
// ==============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatedList } from '@/components/ui/unlumen/animated-list';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BenchmarkAlert } from '@/hooks/use-dashboard';
import { Warning, Trophy, ArrowRight } from "@phosphor-icons/react";

interface BenchmarkAlertsProps {
  alerts: BenchmarkAlert[];
}

export function BenchmarkAlerts({ alerts }: BenchmarkAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="p-4 bg-card border border-border shadow-sm border-none rounded-2xl flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
        <div className="flex items-center gap-2">
          <Trophy weight="duotone" className="w-4 h-4 text-primary" />
          <span>ALL CAMPAIGN DATA COMPLIANT WITH EXECUTIVE BENCHMARKS </span>
        </div>
        <span className="text-primary">ZERO ALERTS </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Alerts
        </span>
        <Badge
          variant="outline"
          className="rounded-xl font-sans font-bold text-[10px] uppercase bg-accent text-accent-foreground border-none text-muted-foreground"
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
              className={`p-4 border-none bg-card border border-border shadow-sm rounded-2xl flex flex-col justify-between ${
                isWarning
                  ? 'bg-rose-500/10 border-rose-500/40 hover:border-rose-500'
                  : 'bg-primary/10 border-primary/40 hover:border-[#00dbe9]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isWarning ? (
                      <Warning weight="duotone" className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Trophy weight="duotone" className="w-4 h-4 text-primary shrink-0" />
                    )}
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isWarning ? 'text-rose-400' : 'text-primary'
                      }`}
                    >
                      {alert.title}
                    </span>
                  </div>

                  <p className="text-xs text-foreground font-sans leading-relaxed pt-1">
                    {alert.message}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={`rounded-xl font-sans font-bold text-[11px] font-bold shrink-0 ${
                    isWarning
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                      : 'bg-primary/20 border-primary/60 text-primary'
                  }`}
                >
                  {alert.metricValue}
                </Badge>
              </div>

              {alert.campaignId && (
                <div className="mt-4 pt-2 border-t border-border flex items-center justify-end">
                  <Link href={`/campaigns/${alert.campaignId}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-7 px-3 rounded-xl font-sans font-bold text-[10px] tracking-wider uppercase transition-all ${
                        isWarning
                          ? 'border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-black'
                          : 'border-primary/50 text-primary hover:bg-[#00dbe9] hover:text-black font-bold'
                      }`}
                    >
                      <span>Review campaign</span>
                      <ArrowRight weight="duotone" className="w-3 h-3 ml-1" />
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
