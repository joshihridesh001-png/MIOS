"use client";

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ExperimentRow, ExperimentInsert, ExperimentUpdate } from '@/lib/types/database';

export function useExperiments() {
  const [experiments, setExperiments] = useState<ExperimentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setExperiments((data || []) as ExperimentRow[]);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  return {
    experiments,
    loading,
    error,
    refetch: fetchExperiments,
  };
}

export function useExperiment(id: string) {
  const [experiment, setExperiment] = useState<ExperimentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchExperiment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', id)
        .single();

      if (err) throw err;
      setExperiment(data as ExperimentRow);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchExperiment();
  }, [fetchExperiment]);

  return {
    experiment,
    loading,
    error,
    refetch: fetchExperiment,
  };
}

export async function createExperiment(data: ExperimentInsert): Promise<ExperimentRow> {
  const supabase = createClient();
  const { data: newExp, error } = await supabase
    .from('experiments')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) throw error;
  return newExp as ExperimentRow;
}

export async function updateExperiment(id: string, data: ExperimentUpdate): Promise<ExperimentRow> {
  const supabase = createClient();
  const { data: updated, error } = await supabase
    .from('experiments')
    .update(data)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return updated as ExperimentRow;
}

export async function deleteExperiment(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('experiments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
