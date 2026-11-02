// ==============================================================================
// MIOS Hooks — Executive Unit Economics Calibration (@/hooks/use-unit-economics.ts)
// ==============================================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { INDUSTRY_UNIT_ECONOMICS_PRESETS } from '@/lib/constants';
import { computeDerivedThresholds } from '@/lib/utils/unit-economics';
import type { UnitEconomicsProfile, IndustryPresetKey } from '@/lib/types/database';

const STORAGE_KEY = 'mios_unit_economics_v1';

export function useUnitEconomics() {
  const [profile, setProfile] = useState<UnitEconomicsProfile>(
    INDUSTRY_UNIT_ECONOMICS_PRESETS.b2b_advisory
  );
  const [loading, setLoading] = useState(false);

  // Instant zero-latency localStorage hydration + silent Supabase sync
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<UnitEconomicsProfile>;
        if (parsed && typeof parsed.avg_ltv === 'number') {
          setProfile((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Ignore storage read errors
    }

    let isMounted = true;
    const syncRemote = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('business_unit_economics')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data && isMounted) {
          const remoteProfile: UnitEconomicsProfile = {
            id: data.id,
            industry_preset: (data.industry_preset as IndustryPresetKey) || 'custom',
            business_name: data.business_name || 'Custom Service Business',
            avg_ltv: Number(data.avg_ltv) || INDUSTRY_UNIT_ECONOMICS_PRESETS.b2b_advisory.avg_ltv,
            gross_margin_pct:
              Number(data.gross_margin_pct) ||
              INDUSTRY_UNIT_ECONOMICS_PRESETS.b2b_advisory.gross_margin_pct,
            target_ltv_cac_ratio:
              Number(data.target_ltv_cac_ratio) ||
              INDUSTRY_UNIT_ECONOMICS_PRESETS.b2b_advisory.target_ltv_cac_ratio,
            avg_sales_cycle_days:
              Number(data.avg_sales_cycle_days) ||
              INDUSTRY_UNIT_ECONOMICS_PRESETS.b2b_advisory.avg_sales_cycle_days,
            target_lead_to_close_rate:
              Number(data.target_lead_to_close_rate) ||
              INDUSTRY_UNIT_ECONOMICS_PRESETS.b2b_advisory.target_lead_to_close_rate,
            min_spend_for_evaluation:
              Number(data.min_spend_for_evaluation) ||
              INDUSTRY_UNIT_ECONOMICS_PRESETS.b2b_advisory.min_spend_for_evaluation,
          };
          setProfile(remoteProfile);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteProfile));
          } catch {
            // Ignore storage write errors
          }
        }
      } catch {
        // Silently ignore if table has not been migrated yet
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    syncRemote();
    return () => {
      isMounted = false;
    };
  }, []);

  const persistProfile = useCallback(async (next: UnitEconomicsProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore localStorage quota/privacy errors
    }

    try {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from('business_unit_economics')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from('business_unit_economics')
          .update({
            industry_preset: next.industry_preset,
            business_name: next.business_name,
            avg_ltv: next.avg_ltv,
            gross_margin_pct: next.gross_margin_pct,
            target_ltv_cac_ratio: next.target_ltv_cac_ratio,
            avg_sales_cycle_days: next.avg_sales_cycle_days,
            target_lead_to_close_rate: next.target_lead_to_close_rate,
            min_spend_for_evaluation: next.min_spend_for_evaluation,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('business_unit_economics').insert({
          industry_preset: next.industry_preset,
          business_name: next.business_name,
          avg_ltv: next.avg_ltv,
          gross_margin_pct: next.gross_margin_pct,
          target_ltv_cac_ratio: next.target_ltv_cac_ratio,
          avg_sales_cycle_days: next.avg_sales_cycle_days,
          target_lead_to_close_rate: next.target_lead_to_close_rate,
          min_spend_for_evaluation: next.min_spend_for_evaluation,
        });
      }
    } catch {
      // Silently ignore if table has not been migrated yet
    }
  }, []);

  const updateProfile = useCallback(
    (next: UnitEconomicsProfile) => {
      setProfile(next);
      void persistProfile(next);
    },
    [persistProfile]
  );

  const selectPreset = useCallback(
    (presetKey: IndustryPresetKey) => {
      const preset = INDUSTRY_UNIT_ECONOMICS_PRESETS[presetKey];
      if (preset) {
        setProfile(preset);
        void persistProfile(preset);
      }
    },
    [persistProfile]
  );

  const derived = useMemo(() => computeDerivedThresholds(profile), [profile]);

  return {
    profile,
    derived,
    loading,
    updateProfile,
    selectPreset,
  };
}
