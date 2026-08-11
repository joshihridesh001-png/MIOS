// ==============================================================================
// MIOS Dashboard KPIs Component (@/components/dashboard/dashboard-kpis.tsx)
// ==============================================================================

'use client';

import React from 'react';
import { AnimateCount } from '@/components/ui/unlumen/animate-count';
import { TiltCard } from '@/components/ui/unlumen/tilt-card';
import { TrendUp, CurrencyDollar, Pulse, Users, Flask, BookOpen, Trophy, ShieldCheck } from "@phosphor-icons/react";


interface DashboardKPIsProps {
  kpis: {
    totalSpend: number;
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    netProfit: number;
    blendedRoas: number;
    totalLeads: number;
    totalCustomers: number;
    blendedCac: number;
    conversionRate: number;
    activeExperimentsCount: number;
    winningExperimentsCount: number;
    totalCustomersCount: number;
    avgCxRating: number;
    totalRulesCount: number;
    highConfidenceRulesCount: number;
  };
}

export function DashboardKPIs({ kpis }: DashboardKPIsProps) {
  const isNetProfitPositive = kpis.netProfit >= 0;
  const isRoasHealthy = kpis.blendedRoas >= 2.0;



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Revenue Generated */}
      <div className="h-full">
        <TiltCard className="h-full">
        <div className="p-5 bg-card border border-border shadow-sm border-none rounded-3xl hover:border-border transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground font-bold">
                TOTAL REVENUE GENERATED
              </span>
              <TrendUp weight="duotone" className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-bold text-foreground font-bold tabular-nums">
              <AnimateCount value={kpis.totalRevenue} format="currency" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-sans font-bold">
            <span className="text-muted-foreground font-bold uppercase">GROSS PROFIT:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              ₹{kpis.grossProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        </TiltCard>
      </div>

      {/* 2. Net Profit */}
      <div className="h-full">
        <TiltCard className="h-full">
        <div className="p-5 bg-card border border-border shadow-sm border-none rounded-3xl hover:border-border transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground font-bold">
                NET PROFIT (POST-SPEND)
              </span>
              <Trophy weight="duotone"
                className={`w-4 h-4 ${
                  isNetProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              />
            </div>
            <div
              className={`mt-3 text-2xl md:text-3xl font-bold tabular-nums ${
                isNetProfitPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <AnimateCount value={kpis.netProfit} format="currency" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-sans font-bold">
            <span className="text-muted-foreground font-bold uppercase">NET MARGIN:</span>
            <span
              className={`font-bold tabular-nums ${
                isNetProfitPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {kpis.totalRevenue > 0
                ? ((kpis.netProfit / kpis.totalRevenue) * 100).toFixed(1)
                : '0.0'}
              %
            </span>
          </div>
        </div>
        </TiltCard>
      </div>

      {/* 3. Blended ROAS */}
      <div className="h-full">
        <TiltCard className="h-full">
        <div className="p-5 bg-card border border-border shadow-sm border-none rounded-3xl hover:border-border transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground font-bold">
                BLENDED ROAS
              </span>
              <Pulse weight="duotone"
                className={`w-4 h-4 ${
                  isRoasHealthy ? 'text-primary' : 'text-amber-400'
                }`}
              />
            </div>
            <div
              className={`mt-3 text-2xl md:text-3xl font-bold tabular-nums ${
                isRoasHealthy ? 'text-primary' : 'text-amber-400'
              }`}
            >
              <AnimateCount
                value={kpis.blendedRoas}
                format="number"
                decimals={2}
                suffix="×"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-sans font-bold">
            <span className="text-muted-foreground font-bold uppercase">TARGET MULTIPLIER:</span>
            <span className="text-foreground font-bold">&gt;= 2.00×</span>
          </div>
        </div>
        </TiltCard>
      </div>

      {/* 4. Total Marketing Spend */}
      <div className="h-full">
        <TiltCard className="h-full">
        <div className="p-5 bg-card border border-border shadow-sm border-none rounded-3xl hover:border-border transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground font-bold">
                TOTAL MARKETING SPEND
              </span>
              <CurrencyDollar weight="duotone" className="w-4 h-4 text-muted-foreground font-bold" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-bold text-foreground font-bold tabular-nums">
              <AnimateCount value={kpis.totalSpend} format="currency" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-sans font-bold">
            <span className="text-muted-foreground font-bold uppercase">AVG BLENDED CAC:</span>
            <span className="text-foreground font-bold tabular-nums">
              ₹{Math.round(kpis.blendedCac).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        </TiltCard>
      </div>

      {/* 5. Customers Won & Conversion Rate */}
      <div className="h-full">
        <TiltCard className="h-full">
        <div className="p-5 bg-card border border-border shadow-sm border-none rounded-3xl hover:border-border transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground font-bold">
                CUSTOMERS WON / CVR
              </span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-foreground font-bold tabular-nums">
                <AnimateCount value={kpis.totalCustomers} format="number" />
              </span>
              <span className="text-xs font-sans font-bold text-primary">
                ({kpis.conversionRate.toFixed(1)}% CVR)
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-sans font-bold">
            <span className="text-muted-foreground font-bold uppercase">QUALIFIED LEADS:</span>
            <span className="text-foreground font-bold tabular-nums">
              {kpis.totalLeads}
            </span>
          </div>
        </div>
        </TiltCard>
      </div>

      {/* 6. Active Experiments (LABS) */}
      <div className="h-full">
        <TiltCard className="h-full">
        <div className="p-5 bg-card border border-border shadow-sm border-none rounded-3xl hover:border-border transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground font-bold">
                ACTIVE LABS EXPERIMENTS
              </span>
              <Flask weight="duotone" className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-bold text-purple-400 tabular-nums">
              <AnimateCount value={kpis.activeExperimentsCount} format="number" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-sans font-bold">
            <span className="text-muted-foreground font-bold uppercase">PROVEN WINNERS:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {kpis.winningExperimentsCount} WINNERS
            </span>
          </div>
        </div>
        </TiltCard>
      </div>

      {/* 7. Verified Institutional Rules (/knowledge) */}
      <div className="h-full">
        <TiltCard className="h-full">
        <div className="p-5 bg-card border border-border shadow-sm border-none rounded-3xl hover:border-border transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground font-bold">
                VERIFIED RULES (&gt;=80%)
              </span>
              <ShieldCheck weight="duotone" className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-bold text-primary tabular-nums">
              <AnimateCount
                value={kpis.highConfidenceRulesCount}
                format="number"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-sans font-bold">
            <span className="text-muted-foreground font-bold uppercase">TOTAL RULES IN VAULT:</span>
            <span className="text-foreground font-bold tabular-nums">
              {kpis.totalRulesCount} RULES
            </span>
          </div>
        </div>
        </TiltCard>
      </div>

      {/* 8. Post-Job CX Rating Score */}
      <div className="h-full">
        <TiltCard className="h-full">
        <div className="p-5 bg-card border border-border shadow-sm border-none rounded-3xl hover:border-border transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground font-bold">
                POST-JOB CX DATA
              </span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-bold text-amber-400 tabular-nums">
              <AnimateCount
                value={kpis.avgCxRating}
                format="number"
                decimals={1}
                suffix=" / 5.0"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-sans font-bold">
            <span className="text-muted-foreground font-bold uppercase">SAMPLE SIZE:</span>
            <span className="text-foreground font-bold tabular-nums">
              {kpis.totalCustomersCount} PROFILES
            </span>
          </div>
        </div>
        </TiltCard>
      </div>
    </div>
  );
}
