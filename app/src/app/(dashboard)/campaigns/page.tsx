import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CampaignTable } from '@/components/campaigns/campaign-table'
import { Button } from '@/components/ui/button'
import { TextReveal } from '@/components/ui/unlumen'

export default async function CampaignsPage() {
  const supabase = await createClient()
  
  const { data: campaigns } = await supabase
    .from('campaigns_with_metrics')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full font-mono">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-white">
            <TextReveal text="[ CAMPAIGN TELEMETRY & OPERATIONS ]" />
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Manage, execute, and monitor real-time marketing protocol performance.
          </p>
        </div>
        <Button asChild className="rounded-none bg-[#00dbe9] text-black font-bold uppercase tracking-wider hover:bg-[#00dbe9]/80 text-xs px-4">
          <Link href="/campaigns/new" className="gap-2">
            <Plus className="w-4 h-4" />
            [ + NEW CAMPAIGN ]
          </Link>
        </Button>
      </div>

      <CampaignTable campaigns={campaigns || []} />
    </div>
  )
}
