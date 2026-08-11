// ==============================================================================
// MIOS Dashboard Header Component (@/components/dashboard/dashboard-header.tsx)
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
import { Pulse, ShieldCheck } from "@phosphor-icons/react";

interface DashboardHeaderProps {
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  platformFilter: PlatformFilter;
  onPlatformFilterChange: (filter: PlatformFilter) => void;
}

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'ALL', label: 'ALL TIME DATA' },
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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-6">
      {/* Title & Metadata */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="rounded-none font-sans font-bold text-[10px] uppercase tracking-wider border-primary/50 text-primary bg-primary/10"
          >
            [ SYSTEM ONLINE • REALTIME DATA SYNCED ]
          </Badge>
          <span className="font-bold text-xs text-muted-foreground uppercase">
             
          </span>
        </div>

        <TextReveal
          text="Dashboard"
          mode="word"
          staggerDelay={40}
          className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground"
        />

        <p className="text-sm text-muted-foreground font-sans mt-1 max-w-2xl">
          Unified command cockpit synthesizing financial returns, compounding customer psychology, field A/B experiments, and verified institutional rules.
        </p>
      </div>

      {/* Date & Platform Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border shadow-sm p-2 border-none rounded-2xl">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            PERIOD:
          </span>
          <div className="flex items-center gap-1">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onDateFilterChange(opt.value)}
                className={`px-2.5 py-1 text-xs font-sans font-bold uppercase transition-all ${
                  dateFilter === opt.value
                    ? 'bg-primary text-primary-foreground font-bold bg-accent text-accent-foreground rounded-xl'
                    : 'bg-transparent text-muted-foreground hover:text-foreground font-bold hover:bg-muted rounded-xl'
                }`}
              >
                [ {opt.value} ]
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            CHANNEL:
          </span>
          <Select
            value={platformFilter}
            onValueChange={(v) => onPlatformFilterChange(v as PlatformFilter)}
          >
            <SelectTrigger className="w-36 h-8 bg-accent text-accent-foreground border-none font-bold text-xs uppercase text-foreground rounded-xl">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border shadow-sm border-none rounded-xl">
              {PLATFORM_OPTIONS.map((p) => (
                <SelectItem
                  key={p.value}
                  value={p.value}
                  className="font-sans font-bold text-xs uppercase"
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
