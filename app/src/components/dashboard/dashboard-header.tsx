// ==============================================================================
// MIOS Dashboard Header Component (@/components/dashboard/dashboard-header.tsx)
// Governed by ADR-001 (PestControl OS Executive Suite aesthetic)
// ==============================================================================

'use client';

import React from 'react';
import { TextReveal } from '@/components/ui/unlumen/text-reveal';
import { Badge } from '@/components/ui/badge';
import type { DateFilter, PlatformFilter } from '@/hooks/use-dashboard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, ShieldCheck } from 'lucide-react';

interface DashboardHeaderProps {
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  platformFilter: PlatformFilter;
  onPlatformFilterChange: (filter: PlatformFilter) => void;
}

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'ALL', label: 'ALL TIME TELEMETRY' },
  { value: '30D', label: 'LAST 30 DAYS' },
  { value: '7D', label: 'LAST 7 DAYS' },
  { value: 'MTD', label: 'MONTH TO DATE' },
];

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string }[] = [
  { value: 'ALL', label: 'ALL PLATFORMS' },
  { value: 'meta_ads', label: 'META ADS' },
  { value: 'google_ads', label: 'GOOGLE ADS' },
  { value: 'whatsapp', label: 'WHATSAPP' },
  { value: 'offline', label: 'OFFLINE' },
];

export function DashboardHeader({
  dateFilter,
  onDateFilterChange,
  platformFilter,
  onPlatformFilterChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
      {/* Title & Metadata */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="rounded-none font-mono text-[10px] uppercase tracking-wider border-[#00dbe9]/50 text-[#00dbe9] bg-[#00dbe9]/10"
          >
            [ SYSTEM ONLINE • REALTIME TELEMETRY SYNCED ]
          </Badge>
          <span className="font-mono text-xs text-zinc-500 uppercase">
            ISO/IEC 25010 EXECUTIVE SUITE
          </span>
        </div>

        <TextReveal
          text="[ MIOS EXECUTIVE COMMAND CENTER ]"
          mode="word"
          staggerDelay={40}
          className="text-2xl md:text-3xl font-mono uppercase tracking-tight text-white font-bold"
        />

        <p className="text-sm text-zinc-400 font-sans mt-1 max-w-2xl">
          Unified command cockpit synthesizing financial returns, compounding customer psychology, field A/B experiments, and verified institutional rules.
        </p>
      </div>

      {/* Date & Platform Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-black p-2 border border-zinc-800">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            PERIOD:
          </span>
          <div className="flex items-center gap-1">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onDateFilterChange(opt.value)}
                className={`px-2.5 py-1 text-xs font-mono uppercase transition-all ${
                  dateFilter === opt.value
                    ? 'bg-[#00dbe9] text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                [ {opt.label.split(' ')[0]} ]
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            CHANNEL:
          </span>
          <Select
            value={platformFilter}
            onValueChange={(v) => onPlatformFilterChange(v as PlatformFilter)}
          >
            <SelectTrigger className="w-36 h-8 rounded-none bg-zinc-900 border-zinc-800 font-mono text-xs uppercase text-zinc-200">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent className="rounded-none bg-black border-zinc-800">
              {PLATFORM_OPTIONS.map((p) => (
                <SelectItem
                  key={p.value}
                  value={p.value}
                  className="font-mono text-xs uppercase"
                >
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
