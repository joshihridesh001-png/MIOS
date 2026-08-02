import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CampaignTable } from '@/components/campaigns/campaign-table'
import { Button } from '@/components/ui/button'

export default async function CampaignsPage() {
  const supabase = await createClient()
  
  const { data: campaigns } = await supabase
    .from('campaigns_with_metrics')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage and track your marketing campaigns.</p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new" className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      <CampaignTable campaigns={campaigns || []} />
    </div>
  )
}
