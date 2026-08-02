"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreativeForm } from '@/components/creatives/creative-form'
import { createCreative } from '@/hooks/use-creatives'
import { CreativeRow } from '@/lib/types/database'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCreativePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: Partial<CreativeRow>) => {
    try {
      setLoading(true)
      const created = await createCreative(data)
      toast.success('🎨 Creative asset created successfully!')
      router.push(`/creatives/${created.id}`)
    } catch (err: any) {
      toast.error(`Failed to create creative: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/creatives"
          className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Add New Creative Asset
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log ad copy, headlines, visual formats, and psychological angles to build your ad library.
          </p>
        </div>
      </div>

      <CreativeForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
