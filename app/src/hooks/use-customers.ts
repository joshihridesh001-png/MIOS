// ==============================================================================
// MIOS Customer & Buyer Persona React Hooks (@/hooks/use-customers.ts)
// Governed by ADR-001 (ISO/IEC 25010 Reliability, Explicit Fallible Operations)
// ==============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  CustomerRow,
  CustomerInsert,
  CustomerUpdate,
  BuyerPersonaRow,
  BuyerPersonaUpdate,
} from '@/lib/types/database';

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }
      setCustomers((data as CustomerRow[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customers';
      setError(msg);
      console.error('[useCustomers] Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (input: CustomerInsert): Promise<CustomerRow | null> => {
    try {
      const supabase = createClient();
      const { data, error: insertErr } = await supabase
        .from('customers')
        .insert(input)
        .select()
        .single();

      if (insertErr) {
        throw insertErr;
      }
      await fetchCustomers();
      return data as CustomerRow;
    } catch (err: unknown) {
      console.error('[useCustomers] Error creating customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (id: string, input: CustomerUpdate): Promise<CustomerRow | null> => {
    try {
      const supabase = createClient();
      const { data, error: updateErr } = await supabase
        .from('customers')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) {
        throw updateErr;
      }
      await fetchCustomers();
      return data as CustomerRow;
    } catch (err: unknown) {
      console.error('[useCustomers] Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { error: deleteErr } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (deleteErr) {
        throw deleteErr;
      }
      await fetchCustomers();
      return true;
    } catch (err: unknown) {
      console.error('[useCustomers] Error deleting customer:', err);
      return false;
    }
  };

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

export function useCustomer(id?: string) {
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr) {
        throw fetchErr;
      }
      setCustomer(data as CustomerRow);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customer details';
      setError(msg);
      console.error('[useCustomer] Error fetching customer details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return { customer, loading, error, refetch: fetchCustomer };
}

export function useBuyerPersonas() {
  const [personas, setPersonas] = useState<BuyerPersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from('buyer_personas')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }
      setPersonas((data as BuyerPersonaRow[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load buyer personas';
      setError(msg);
      console.error('[useBuyerPersonas] Error fetching buyer personas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const updatePersona = async (id: string, input: BuyerPersonaUpdate): Promise<BuyerPersonaRow | null> => {
    try {
      const supabase = createClient();
      const { data, error: updateErr } = await supabase
        .from('buyer_personas')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) {
        throw updateErr;
      }
      await fetchPersonas();
      return data as BuyerPersonaRow;
    } catch (err: unknown) {
      console.error('[useBuyerPersonas] Error updating buyer persona:', err);
      throw err;
    }
  };

  return {
    personas,
    loading,
    error,
    refetch: fetchPersonas,
    updatePersona,
  };
}
