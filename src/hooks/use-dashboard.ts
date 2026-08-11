// ==============================================================================
// MIOS Hooks — Executive Dashboard Intelligence (@/hooks/use-dashboard.ts)
// Governed by ADR-001 (ISO/IEC 25010 Maintainability & Executive Telemetry)
// ==============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  CampaignWithMetrics,
  ExperimentRow,
  CustomerRow,
  LearningRow,
  CreativeRow,
} from '@/lib/types/database';

export type DateFilter = 'ALL' | '30D' | '7D' | 'MTD';
export type PlatformFilter = 'ALL' | 'meta_ads' | 'google_ads' | 'whatsapp' | 'offline' | 'other';

export interface BenchmarkAlert {
  id: string;
  type: 'warning' | 'celebration';
  title: string;
  message: string;
  campaignId?: string;
  metricValue: string;
}

export function useDashboard(dateFilter: DateFilter = 'ALL', platformFilter: PlatformFilter = 'ALL') {
  const [campaigns, setCampaigns] = useState<CampaignWithMetrics[]>([]);
  const [experiments, setExperiments] = useState<ExperimentRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [learnings, setLearnings] = useState<LearningRow[]>([]);
  const [creatives, setCreatives] = useState<CreativeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);
    try {
      const [campRes, expRes, custRes, learnRes, creatRes] = await Promise.all([
        supabase.from('campaigns_with_metrics').select('*').order('created_at', { ascending: false }),
        supabase.from('experiments').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('learnings').select('*').order('confidence_score', { ascending: false }),
        supabase.from('creatives').select('*').order('created_at', { ascending: false }),
      ]);

      if (campRes.error) throw campRes.error;
      if (expRes.error) throw expRes.error;
      if (custRes.error) throw custRes.error;
      if (learnRes.error) throw learnRes.error;
      if (creatRes.error) throw creatRes.error;

      setCampaigns((campRes.data || []) as CampaignWithMetrics[]);
      setExperiments((expRes.data || []) as ExperimentRow[]);
      setCustomers((custRes.data || []) as CustomerRow[]);
      setLearnings((learnRes.data || []) as LearningRow[]);
      setCreatives((creatRes.data || []) as CreativeRow[]);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filtered campaigns based on dateFilter and platformFilter
  const filteredCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns.filter((camp) => {
      // Platform filter
      if (platformFilter !== 'ALL' && camp.platform !== platformFilter) {
        return false;
      }
      // Date filter
      if (dateFilter === 'ALL') return true;

      const startDate = camp.start_date ? new Date(camp.start_date) : new Date(camp.created_at);
      const diffDays = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

      if (dateFilter === '7D') return diffDays <= 7;
      if (dateFilter === '30D') return diffDays <= 30;
      if (dateFilter === 'MTD') {
        return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [campaigns, dateFilter, platformFilter]);

  // Executive Financial & Conversion Aggregation
  const kpis = useMemo(() => {
    const totalSpend = filteredCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
    const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const totalCogs = filteredCampaigns.reduce((sum, c) => sum + (c.cogs || 0), 0);
    const grossProfit = totalRevenue - totalCogs;
    const netProfit = totalRevenue - totalCogs - totalSpend;
    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const totalLeads = filteredCampaigns.reduce((sum, c) => sum + (c.qualified_leads || 0), 0);
    const totalCustomers = filteredCampaigns.reduce((sum, c) => sum + (c.customers_won || 0), 0);
    const blendedCac = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
    const conversionRate = totalLeads > 0 ? (totalCustomers / totalLeads) * 100 : 0;

    // Cross-module intel stats
    const activeExperimentsCount = experiments.filter((e) => e.status === 'running').length;
    const winningExperimentsCount = experiments.filter((e) => e.status === 'completed').length;
    const totalCustomersCount = customers.length;
    const avgCxRating =
      totalCustomersCount > 0
        ? customers.reduce((sum, c) => sum + (c.cx_rating || 5), 0) / totalCustomersCount
        : 5.0;
    const totalRulesCount = learnings.length;
    const highConfidenceRulesCount = learnings.filter((l) => (l.confidence_score || 0) >= 80).length;

    return {
      totalSpend,
      totalRevenue,
      totalCogs,
      grossProfit,
      netProfit,
      blendedRoas,
      totalLeads,
      totalCustomers,
      blendedCac,
      conversionRate,
      activeExperimentsCount,
      winningExperimentsCount,
      totalCustomersCount,
      avgCxRating,
      totalRulesCount,
      highConfidenceRulesCount,
    };
  }, [filteredCampaigns, experiments, customers, learnings]);

  // Benchmark Alerts & Telemetry Warnings
  const alerts = useMemo(() => {
    const list: BenchmarkAlert[] = [];

    filteredCampaigns.forEach((camp) => {
      const roas = camp.roas || 0;
      const spend = camp.spend || 0;
      const cac = camp.cac || 0;

      // Warnings
      if (spend >= 2000 && roas < 1.5) {
        list.push({
          id: `warn-roas-${camp.id}`,
          type: 'warning',
          title: `ROAS BENCHMARK BREACH: ${camp.name}`,
          message: `Campaign ROAS is below minimum 1.5× target. Consider pausing or testing new hook angle.`,
          campaignId: camp.id,
          metricValue: `${roas.toFixed(2)}× ROAS`,
        });
      } else if (spend >= 5000 && (camp.net_profit || 0) < 0) {
        list.push({
          id: `warn-profit-${camp.id}`,
          type: 'warning',
          title: `NEGATIVE NET PROFIT: ${camp.name}`,
          message: `Campaign is currently operating at a net deficit after spend and COGS.`,
          campaignId: camp.id,
          metricValue: `₹${(camp.net_profit || 0).toLocaleString('en-IN')}`,
        });
      } else if (cac > 2000 && camp.customers_won > 0) {
        list.push({
          id: `warn-cac-${camp.id}`,
          type: 'warning',
          title: `ELEVATED CAC ALERT: ${camp.name}`,
          message: `Customer Acquisition Cost exceeds ₹2,000 threshold. Check lead quality or sales conversion.`,
          campaignId: camp.id,
          metricValue: `₹${Math.round(cac).toLocaleString('en-IN')} CAC`,
        });
      }

      // Celebrations
      if (roas >= 3.0 && spend >= 1000) {
        list.push({
          id: `celeb-roas-${camp.id}`,
          type: 'celebration',
          title: `HIGH ROAS WINNER: ${camp.name}`,
          message: `Campaign is scaling at over 3.0× ROAS. Recommend scaling budget by 20-30%.`,
          campaignId: camp.id,
          metricValue: `${roas.toFixed(2)}× ROAS`,
        });
      }
    });

    return list;
  }, [filteredCampaigns]);

  return {
    campaigns: filteredCampaigns,
    allCampaigns: campaigns,
    experiments,
    customers,
    learnings,
    creatives,
    loading,
    error,
    kpis,
    alerts,
    refetch: fetchDashboardData,
  };
}
