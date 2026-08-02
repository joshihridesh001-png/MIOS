import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreativeWithMetrics, CreativeRow } from '@/lib/types/database'

export function useCreatives(campaignId?: string) {
  const [creatives, setCreatives] = useState<CreativeWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchCreatives = useCallback(async () => {
    const supabase = createClient()
    try {
      setLoading(true)
      let query = supabase
        .from('creatives_with_metrics')
        .select('*')
        .order('created_at', { ascending: false })

      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setCreatives(data as CreativeWithMetrics[])
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchCreatives()
  }, [fetchCreatives])

  return { creatives, loading, error, refetch: fetchCreatives }
}

export function useCreative(id: string) {
  const [creative, setCreative] = useState<CreativeWithMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCreative = useCallback(async () => {
    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('creatives_with_metrics')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setCreative(data as CreativeWithMetrics)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchCreative()
    }
  }, [id, fetchCreative])

  return { creative, loading, error, refetch: fetchCreative }
}

export async function createCreative(data: Partial<CreativeRow>) {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('creatives')
    .insert([data])
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function updateCreative(id: string, data: Partial<CreativeRow>) {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('creatives')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function deleteCreative(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('creatives')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}
