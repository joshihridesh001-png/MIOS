'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CaretLeft } from "@phosphor-icons/react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CampaignForm } from '@/components/campaigns/campaign-form'
import { updateCampaign, useCampaign } from '@/hooks/use-campaigns'
import { toast } from 'sonner'
import { CampaignRow } from '@/lib/types/database'
import { useParams } from 'next/navigation'

export default function EditCampaignPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const { campaign, loading, error } = useCampaign(id)

  const handleSubmit = async (data: Partial<CampaignRow>) => {
    try {
      setSaving(true)
      await updateCampaign(id, data)
      toast.success('Campaign updated successfully')
      router.push(`/campaigns/${id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update campaign')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading campaign...</div>
  }

  if (error || !campaign) {
    return <div className="p-8 text-center text-red-500">Failed to load campaign</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/campaigns/${id}`}>
            <CaretLeft weight="duotone" className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-muted-foreground mt-1">Update campaign details and metrics.</p>
        </div>
      </div>

      <CampaignForm initialData={campaign} onSubmit={handleSubmit} loading={saving} />
    </div>
  )
}
