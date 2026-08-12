import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CampaignWithMetrics, CampaignRow } from '@/lib/types/database'

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // Note: createClient inside a hook should ideally be memoized,
  // but for simplicity it works if used inside effect or useCallback.
  const fetchCampaigns = useCallback(async () => {
    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('campaigns_with_metrics')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setCampaigns(data as CampaignWithMetrics[])
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  return { campaigns, loading, error, refetch: fetchCampaigns }
}

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<CampaignWithMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCampaign = useCallback(async () => {
    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('campaigns_with_metrics')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setCampaign(data as CampaignWithMetrics)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchCampaign()
    }
  }, [id, fetchCampaign])

  return { campaign, loading, error, refetch: fetchCampaign }
}

export async function createCampaign(data: Partial<CampaignRow>) {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('campaigns')
    .insert([data])
    .select()
    .maybeSingle()
  
  if (error) throw error
  return result
}

export async function updateCampaign(id: string, data: Partial<CampaignRow>) {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', id)
    .select()
    .maybeSingle()
  
  if (error) throw error
  return result
}

export async function deleteCampaign(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}
