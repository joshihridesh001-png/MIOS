// ==============================================================================
// MIOS Hooks — useLearnings & useAllLearnings (@/hooks/use-learnings.ts)
// Governed by ADR-001 (ISO/IEC 25010 Maintainability & Institutional Memory)
// ==============================================================================

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LearningRow, LearningCategory, LearningSource } from '@/lib/types/database';

export function useLearnings(sourceId?: string, sourceType: string = 'campaign') {
  const [learnings, setLearnings] = useState<LearningRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClient();

  const fetchLearnings = useCallback(async () => {
    if (!sourceId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('learnings')
        .select('*')
        .eq('source_type', sourceType)
        .eq('source_id', sourceId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setLearnings(data as LearningRow[]);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [sourceId, sourceType]);

  useEffect(() => {
    fetchLearnings();
  }, [fetchLearnings]);

  const createLearning = async (data: Partial<LearningRow>) => {
    const supabase = createClient();
    const { data: newLearning, error: err } = await supabase
      .from('learnings')
      .insert([data])
      .select()
      .single();

    if (err) throw err;
    setLearnings(prev => [newLearning as LearningRow, ...prev]);
    return newLearning;
  };

  const updateLearning = async (id: string, data: Partial<LearningRow>) => {
    const supabase = createClient();
    const { data: updatedLearning, error: err } = await supabase
      .from('learnings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (err) throw err;
    setLearnings(prev => prev.map(l => l.id === id ? updatedLearning as LearningRow : l));
    return updatedLearning;
  };

  const deleteLearning = async (id: string) => {
    const supabase = createClient();
    const { error: err } = await supabase
      .from('learnings')
      .delete()
      .eq('id', id);

    if (err) throw err;
    setLearnings(prev => prev.filter(l => l.id !== id));
  };

  return {
    learnings,
    loading,
    error,
    refetch: fetchLearnings,
    createLearning,
    updateLearning,
    deleteLearning
  };
}

export function useAllLearnings(categoryFilter?: string) {
  const [learnings, setLearnings] = useState<LearningRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllLearnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from('learnings')
        .select('*')
        .order('confidence_score', { ascending: false })
        .order('confirmations', { ascending: false });

      if (categoryFilter && categoryFilter !== 'ALL') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setLearnings((data || []) as LearningRow[]);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchAllLearnings();
  }, [fetchAllLearnings]);

  const createLearning = async (data: Partial<LearningRow>) => {
    const supabase = createClient();
    const defaultData = {
      confidence_score: 50,
      confirmations: 1,
      contradiction_count: 0,
      total_tests: 1,
      avg_improvement: 0,
      is_active: true,
      tags: [],
      source_type: 'manual' as LearningSource,
      category: 'marketing' as LearningCategory,
      ...data,
    };

    const { data: newLearning, error: err } = await supabase
      .from('learnings')
      .insert([defaultData])
      .select()
      .single();

    if (err) throw err;
    setLearnings(prev => [newLearning as LearningRow, ...prev]);
    return newLearning;
  };

  const updateLearning = async (id: string, data: Partial<LearningRow>) => {
    const supabase = createClient();
    const { data: updatedLearning, error: err } = await supabase
      .from('learnings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (err) throw err;
    setLearnings(prev => prev.map(l => l.id === id ? updatedLearning as LearningRow : l));
    return updatedLearning;
  };

  const deleteLearning = async (id: string) => {
    const supabase = createClient();
    const { error: err } = await supabase
      .from('learnings')
      .delete()
      .eq('id', id);

    if (err) throw err;
    setLearnings(prev => prev.filter(l => l.id !== id));
  };

  const confirmLearning = async (id: string) => {
    const target = learnings.find(l => l.id === id);
    if (!target) return null;

    const newConfirmations = (target.confirmations || 1) + 1;
    const newTotal = (target.total_tests || 1) + 1;
    const contradictions = target.contradiction_count || 0;
    const newConfidence = Math.min(
      100,
      Math.round((newConfirmations / Math.max(1, newConfirmations + contradictions)) * 100)
    );

    return updateLearning(id, {
      confirmations: newConfirmations,
      total_tests: newTotal,
      confidence_score: newConfidence,
      last_confirmed_at: new Date().toISOString(),
    });
  };

  const contradictLearning = async (id: string) => {
    const target = learnings.find(l => l.id === id);
    if (!target) return null;

    const newContradictions = (target.contradiction_count || 0) + 1;
    const newTotal = (target.total_tests || 1) + 1;
    const confirmations = target.confirmations || 1;
    const newConfidence = Math.max(
      0,
      Math.round((confirmations / Math.max(1, confirmations + newContradictions)) * 100)
    );

    return updateLearning(id, {
      contradiction_count: newContradictions,
      total_tests: newTotal,
      confidence_score: newConfidence,
    });
  };

  return {
    learnings,
    loading,
    error,
    refetch: fetchAllLearnings,
    createLearning,
    updateLearning,
    deleteLearning,
    confirmLearning,
    contradictLearning,
  };
}
