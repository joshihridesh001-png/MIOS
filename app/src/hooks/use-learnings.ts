import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LearningRow } from '@/lib/types/database';

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
  }, [sourceId, sourceType, supabase]);

  useEffect(() => {
    fetchLearnings();
  }, [fetchLearnings]);

  const createLearning = async (data: Partial<LearningRow>) => {
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
