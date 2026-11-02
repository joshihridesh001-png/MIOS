// ==============================================================================
// MIOS Dashboard — Executive Unit Economics Calibration Bar
// (@/components/dashboard/unit-economics-bar.tsx)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { industryPresetLabels, metricFormatters } from '@/lib/constants';
import type { UnitEconomicsProfile, IndustryPresetKey } from '@/lib/types/database';
import type { DerivedUnitEconomics } from '@/lib/utils/unit-economics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal } from '@phosphor-icons/react';

interface UnitEconomicsBarProps {
  profile: UnitEconomicsProfile;
  derived: DerivedUnitEconomics;
  onSelectPreset: (presetKey: IndustryPresetKey) => void;
  onUpdateProfile: (profile: UnitEconomicsProfile) => void;
}

const PRESET_KEYS: IndustryPresetKey[] = [
  'b2b_advisory',
  'local_clinic',
  'home_field_services',
  'custom',
];

export function UnitEconomicsBar({
  profile,
  derived,
  onSelectPreset,
  onUpdateProfile,
}: UnitEconomicsBarProps) {
  const [expanded, setExpanded] = useState(false);

  const handleFieldChange = (field: keyof UnitEconomicsProfile, rawValue: string) => {
    const numeric = Math.max(0, Number(rawValue) || 0);
    onUpdateProfile({
      ...profile,
      industry_preset: 'custom',
      business_name: industryPresetLabels.custom || 'Custom Service Business',
      [field]: numeric,
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      {/* Top Row: Preset Selector, Objective Truth Badges & Calibration Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal weight="duotone" className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Unit Economics Model:
            </span>
          </div>

          <select
            aria-label="Business Model Preset Selector"
            value={profile.industry_preset}
            onChange={(e) => onSelectPreset(e.target.value as IndustryPresetKey)}
            className="h-8 rounded-xl border border-border bg-background px-3 text-xs font-sans font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {PRESET_KEYS.map((key) => (
              <option key={key} value={key}>
                {industryPresetLabels[key] || key}
              </option>
            ))}
          </select>
        </div>

        {/* Derived Objective Truth Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-xl border-border bg-muted/40 text-foreground text-[11px] font-sans font-bold px-2.5 py-1 tabular-nums"
          >
            Max Allowable CAC: {metricFormatters.formatCurrency(derived.maxAllowableCac)}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-xl border-border bg-muted/40 text-foreground text-[11px] font-sans font-bold px-2.5 py-1 tabular-nums"
          >
            Max Allowable CPL: {metricFormatters.formatCurrency(derived.maxAllowableCpl)}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-xl border-border bg-muted/40 text-foreground text-[11px] font-sans font-bold px-2.5 py-1 tabular-nums"
          >
            Break-Even ROAS: {derived.breakEvenRoas.toFixed(2)}x
          </Badge>
          <Badge
            variant="outline"
            className="rounded-xl border-primary/40 bg-primary/10 text-primary text-[11px] font-sans font-bold px-2.5 py-1 tabular-nums"
          >
            Sales Cycle Window (Δt): {profile.avg_sales_cycle_days} Days
          </Badge>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
            className="h-8 rounded-xl border-border text-xs font-sans font-bold uppercase tracking-wider px-3"
          >
            {expanded ? 'Close Calibration' : 'Calibrate Economics'}
          </Button>
        </div>
      </div>

      {/* Expandable Inline Editor Grid */}
      {expanded && (
        <div className="pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ue-avg-ltv" className="text-[11px] font-sans font-bold text-muted-foreground">
              Average Client LTV (₹)
            </Label>
            <Input
              id="ue-avg-ltv"
              type="number"
              min="0"
              step="1000"
              value={profile.avg_ltv}
              onChange={(e) => handleFieldChange('avg_ltv', e.target.value)}
              className="h-8 rounded-xl text-xs font-sans font-bold tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ue-gross-margin" className="text-[11px] font-sans font-bold text-muted-foreground">
              Gross Margin (%)
            </Label>
            <Input
              id="ue-gross-margin"
              type="number"
              min="1"
              max="100"
              step="1"
              value={profile.gross_margin_pct}
              onChange={(e) => handleFieldChange('gross_margin_pct', e.target.value)}
              className="h-8 rounded-xl text-xs font-sans font-bold tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ue-ltv-cac" className="text-[11px] font-sans font-bold text-muted-foreground">
              Target LTV:CAC Ratio
            </Label>
            <Input
              id="ue-ltv-cac"
              type="number"
              min="1"
              step="0.5"
              value={profile.target_ltv_cac_ratio}
              onChange={(e) => handleFieldChange('target_ltv_cac_ratio', e.target.value)}
              className="h-8 rounded-xl text-xs font-sans font-bold tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ue-sales-cycle" className="text-[11px] font-sans font-bold text-muted-foreground">
              Sales Cycle Lag Δt (Days)
            </Label>
            <Input
              id="ue-sales-cycle"
              type="number"
              min="0"
              step="1"
              value={profile.avg_sales_cycle_days}
              onChange={(e) => handleFieldChange('avg_sales_cycle_days', e.target.value)}
              className="h-8 rounded-xl text-xs font-sans font-bold tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ue-close-rate" className="text-[11px] font-sans font-bold text-muted-foreground">
              Lead-to-Close Rate (%)
            </Label>
            <Input
              id="ue-close-rate"
              type="number"
              min="1"
              max="100"
              step="1"
              value={profile.target_lead_to_close_rate}
              onChange={(e) => handleFieldChange('target_lead_to_close_rate', e.target.value)}
              className="h-8 rounded-xl text-xs font-sans font-bold tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ue-min-spend" className="text-[11px] font-sans font-bold text-muted-foreground">
              Min Spend to Evaluate (₹)
            </Label>
            <Input
              id="ue-min-spend"
              type="number"
              min="0"
              step="500"
              value={profile.min_spend_for_evaluation}
              onChange={(e) => handleFieldChange('min_spend_for_evaluation', e.target.value)}
              className="h-8 rounded-xl text-xs font-sans font-bold tabular-nums"
            />
          </div>
        </div>
      )}
    </div>
  );
}
