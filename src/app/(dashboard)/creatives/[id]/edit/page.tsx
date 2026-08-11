"use client"

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useCreative, updateCreative } from '@/hooks/use-creatives'
import { CreativeForm } from '@/components/creatives/creative-form'
import { CreativeRow } from '@/lib/types/database'
import { toast } from 'sonner'
import { ArrowLeft } from "@phosphor-icons/react"
import Link from 'next/link'

interface EditCreativePageProps {
  params: Promise<{ id: string }>
}

export default function EditCreativePage({ params }: EditCreativePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { creative, loading: fetching } = useCreative(id)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: Partial<CreativeRow>) => {
    try {
      setLoading(true)
      await updateCreative(id, data)
      toast.success('🎨 Creative asset updated successfully!')
      router.push(`/creatives/${id}`)
    } catch (err: any) {
      toast.error(`Failed to update creative: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-10 w-64 bg-card/60 rounded-lg" />
        <div className="h-96 bg-card/60 rounded-xl border border-border/40" />
      </div>
    )
  }

  if (!creative) {
    return (
      <div className="p-8 text-center bg-card/60 rounded-xl border border-border/40">
        <p className="text-red-400 font-semibold text-sm">Creative asset not found.</p>
        <Link href="/creatives" className="inline-block mt-4 text-xs text-emerald-400 hover:underline">
          ← Back to Ad Library
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/creatives/${id}`}
          className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft weight="duotone" className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Edit Creative: {creative.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update ad copy, performance metrics, and psychological angle tracking.
          </p>
        </div>
      </div>

      <CreativeForm initialData={creative} onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
