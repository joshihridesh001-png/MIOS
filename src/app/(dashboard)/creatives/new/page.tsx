// ==============================================================================
// MIOS New Creative Route (@/app/(dashboard)/creatives/new/page.tsx)
// Governed by ADR-001 (ISO/IEC 25010 Maintainability, Query Param Hydration)
// ==============================================================================

"use client"

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreativeForm } from '@/components/creatives/creative-form'
import { createCreative } from '@/hooks/use-creatives'
import { CreativeRow, CreativeAngle } from '@/lib/types/database'
import { toast } from 'sonner'
import { ArrowLeft } from "@phosphor-icons/react"
import Link from 'next/link'

function NewCreativeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const initialHook = searchParams?.get('hook') || ''
  const initialHeadline = searchParams?.get('headline') || ''
  const initialAngle = (searchParams?.get('angle') as CreativeAngle) || 'discount_offer'

  const handleSubmit = async (data: Partial<CreativeRow>) => {
    try {
      setLoading(true)
      const created = await createCreative(data)
      toast.success('Creative asset created successfully!')
      router.push(`/creatives/${created.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed to create creative: ${msg}`)
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
          className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft weight="duotone" className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase">
            [ CREATE AD CREATIVE ASSET ]
          </h1>
          {initialHook && (
            <p className="text-xs text-primary mt-1">
              ⚡ HYDRATED FROM BUYER PERSONA RECOMMENDATION
            </p>
          )}
        </div>
      </div>

      <CreativeForm
        initialData={{
          hook_hypothesis: initialHook,
          headline: initialHeadline,
          angle: initialAngle,
        }}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}

export default function NewCreativePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-secondary">[ LOADING CREATIVE BUILDER... ]</div>}>
      <NewCreativeContent />
    </Suspense>
  )
}
