import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface CurrentBestBaseline {
  ctr: number;
  cvr: number;
  cpa: number;
  cac: number;
  impressions: number;
  spend: number;
  primary_metric_name: string;
}

export function useCurrentBest(primaryMetric: string) {
  const [baseline, setBaseline] = useState<CurrentBestBaseline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBaseline() {
      try {
        const supabase = createClient();
        
        // Fetch experiments that completed in the last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const { data, error } = await supabase
          .from('experiments')
          .select('*')
          .eq('status', 'completed')
          .eq('primary_metric', primaryMetric)
          .gte('updated_at', ninetyDaysAgo.toISOString());
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          setBaseline(null);
          return;
        }

        // Aggregate winning variants to form a baseline
        let totalImpressions = 0;
        let totalSpend = 0;
        let totalClicks = 0;
        let totalConversions = 0;
        let totalCustomers = 0;
        
        data.forEach(exp => {
          // If winner is Variant A
          if (exp.winner_variant === 'variant_a') {
            totalImpressions += exp.variant_a_impressions || 0;
            totalSpend += exp.variant_a_spend || 0;
            totalClicks += exp.variant_a_clicks || 0;
            totalConversions += exp.variant_a_conversions || 0;
            totalCustomers += exp.variant_a_customers || 0;
          } 
          // If winner is Variant B
          else if (exp.winner_variant === 'variant_b') {
            totalImpressions += exp.variant_b_impressions || 0;
            totalSpend += exp.variant_b_spend || 0;
            totalClicks += exp.variant_b_clicks || 0;
            totalConversions += exp.variant_b_conversions || 0;
            totalCustomers += exp.variant_b_customers || 0;
          }
          // Default to control
          else {
            totalImpressions += exp.control_impressions || 0;
            totalSpend += exp.control_spend || 0;
            totalClicks += exp.control_clicks || 0;
            totalConversions += exp.control_conversions || 0;
            totalCustomers += exp.control_customers || 0;
          }
        });
        
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const cvr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const cpa = totalConversions > 0 ? (totalSpend / totalConversions) : 0;
        const cac = totalCustomers > 0 ? (totalSpend / totalCustomers) : 0;
        
        setBaseline({
          ctr: Number(ctr.toFixed(2)),
          cvr: Number(cvr.toFixed(2)),
          cpa: Number(cpa.toFixed(2)),
          cac: Number(cac.toFixed(2)),
          impressions: totalImpressions,
          spend: totalSpend,
          primary_metric_name: primaryMetric
        });
        
      } catch (err) {
        console.error('Error fetching Current Best baseline:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (primaryMetric) {
      fetchBaseline();
    }
  }, [primaryMetric]);

  return { baseline, loading };
}
