// ==============================================================================
// MIOS Dashboard KPIs Component (@/components/dashboard/dashboard-kpis.tsx)
// Governed by ADR-001 (PestControl OS Executive Suite aesthetic)
// ==============================================================================

'use client';

import React from 'react';
import { AnimateCount } from '@/components/ui/unlumen/animate-count';
import { TiltCard } from '@/components/ui/unlumen/tilt-card';
import {
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  FlaskConical,
  BookOpen,
  Award,
  ShieldCheck,
} from 'lucide-react';

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
      <TiltCard className="h-full">
        <div className="p-5 bg-black/90 border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">
                TOTAL REVENUE GENERATED
              </span>
              <TrendingUp className="w-4 h-4 text-[#00dbe9]" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-mono font-bold text-white tabular-nums">
              <AnimateCount value={kpis.totalRevenue} format="currency" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">GROSS PROFIT:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              ₹{kpis.grossProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </TiltCard>

      {/* 2. Net Profit */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black/90 border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">
                NET PROFIT (POST-SPEND)
              </span>
              <Award
                className={`w-4 h-4 ${
                  isNetProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              />
            </div>
            <div
              className={`mt-3 text-2xl md:text-3xl font-mono font-bold tabular-nums ${
                isNetProfitPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <AnimateCount value={kpis.netProfit} format="currency" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">NET MARGIN:</span>
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

      {/* 3. Blended ROAS */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black/90 border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">
                BLENDED ROAS
              </span>
              <Activity
                className={`w-4 h-4 ${
                  isRoasHealthy ? 'text-[#00dbe9]' : 'text-amber-400'
                }`}
              />
            </div>
            <div
              className={`mt-3 text-2xl md:text-3xl font-mono font-bold tabular-nums ${
                isRoasHealthy ? 'text-[#00dbe9]' : 'text-amber-400'
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
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">TARGET MULTIPLIER:</span>
            <span className="text-zinc-300 font-bold">&gt;= 2.00×</span>
          </div>
        </div>
      </TiltCard>

      {/* 4. Total Marketing Spend */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black/90 border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">
                TOTAL MARKETING SPEND
              </span>
              <DollarSign className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-mono font-bold text-white tabular-nums">
              <AnimateCount value={kpis.totalSpend} format="currency" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">AVG BLENDED CAC:</span>
            <span className="text-zinc-300 font-bold tabular-nums">
              ₹{Math.round(kpis.blendedCac).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </TiltCard>

      {/* 5. Customers Won & Conversion Rate */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black/90 border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">
                CUSTOMERS WON / CVR
              </span>
              <Users className="w-4 h-4 text-[#00dbe9]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-mono font-bold text-white tabular-nums">
                <AnimateCount value={kpis.totalCustomers} format="number" />
              </span>
              <span className="text-xs font-mono text-[#00dbe9]">
                ({kpis.conversionRate.toFixed(1)}% CVR)
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">QUALIFIED LEADS:</span>
            <span className="text-zinc-300 font-bold tabular-nums">
              {kpis.totalLeads}
            </span>
          </div>
        </div>
      </TiltCard>

      {/* 6. Active Experiments (LABS) */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black/90 border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">
                ACTIVE LABS EXPERIMENTS
              </span>
              <FlaskConical className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-mono font-bold text-purple-400 tabular-nums">
              <AnimateCount value={kpis.activeExperimentsCount} format="number" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">PROVEN WINNERS:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {kpis.winningExperimentsCount} WINNERS
            </span>
          </div>
        </div>
      </TiltCard>

      {/* 7. Verified Institutional Rules (/knowledge) */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black/90 border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">
                VERIFIED RULES (&gt;=80%)
              </span>
              <ShieldCheck className="w-4 h-4 text-[#00dbe9]" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-mono font-bold text-[#00dbe9] tabular-nums">
              <AnimateCount
                value={kpis.highConfidenceRulesCount}
                format="number"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">TOTAL RULES IN VAULT:</span>
            <span className="text-zinc-300 font-bold tabular-nums">
              {kpis.totalRulesCount} RULES
            </span>
          </div>
        </div>
      </TiltCard>

      {/* 8. Post-Job CX Rating Score */}
      <TiltCard className="h-full">
        <div className="p-5 bg-black/90 border border-zinc-800 hover:border-zinc-700 transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">
                POST-JOB CX TELEMETRY
              </span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-mono font-bold text-amber-400 tabular-nums">
              <AnimateCount
                value={kpis.avgCxRating}
                format="number"
                decimals={1}
                suffix=" / 5.0"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">SAMPLE SIZE:</span>
            <span className="text-zinc-300 font-bold tabular-nums">
              {kpis.totalCustomersCount} PROFILES
            </span>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
