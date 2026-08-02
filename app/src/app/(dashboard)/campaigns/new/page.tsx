'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CampaignForm } from '@/components/campaigns/campaign-form'
import { createCampaign } from '@/hooks/use-campaigns'
import { toast } from 'sonner'
import { CampaignRow } from '@/lib/types/database'

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: Partial<CampaignRow>) => {
    try {
      setLoading(true)
      const newCampaign = await createCampaign(data)
      toast.success('Campaign created successfully')
      router.push(`/campaigns/${newCampaign.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Campaign</h1>
          <p className="text-muted-foreground mt-1">Create a new marketing campaign to track.</p>
        </div>
      </div>

      <CampaignForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
