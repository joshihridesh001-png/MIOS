import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CampaignStatusBadge } from '@/components/campaigns/campaign-status-badge'
import { CampaignMetrics } from '@/components/campaigns/campaign-metrics'
import { CampaignActions } from '@/components/campaigns/campaign-actions'
import { platformLabels, platformIcons } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { LearningList } from '@/components/learnings/learning-list'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  const { id } = resolvedParams

  const { data: campaign } = await supabase
    .from('campaigns_with_metrics')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) {
    notFound()
  }

  const PlatformIcon = campaign.platform ? platformIcons[campaign.platform] : null

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          {campaign.platform && (
            <div className="flex items-center gap-2 text-muted-foreground">
              {PlatformIcon && <span>{PlatformIcon}</span>}
              <span>{platformLabels[campaign.platform]}</span>
            </div>
          )}
        </div>
        <CampaignActions id={campaign.id} />
      </div>

      {/* Identity & Targeting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Objective & Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Objective</span>
              <span className="font-medium text-right">{campaign.objective || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium text-right">{campaign.service || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Pest Type</span>
              <span className="font-medium text-right">{campaign.pest_type || '—'}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Targeting & Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Audience</span>
              <span className="font-medium text-right">{campaign.target_audience || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium text-right">{campaign.location || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Offer</span>
              <span className="font-medium text-right">{campaign.offer || '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <CampaignMetrics campaign={campaign} />
      </div>

      {/* Reflection Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reflection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Hypothesis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm whitespace-pre-wrap">
              {campaign.hypothesis || <span className="text-muted-foreground italic">No hypothesis recorded</span>}
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Result Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm whitespace-pre-wrap">
              {campaign.result_summary || <span className="text-muted-foreground italic">No results recorded</span>}
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-500">What Worked</CardTitle>
            </CardHeader>
            <CardContent className="text-sm whitespace-pre-wrap">
              {campaign.what_worked || <span className="text-muted-foreground italic">Nothing recorded</span>}
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-500">What Failed</CardTitle>
            </CardHeader>
            <CardContent className="text-sm whitespace-pre-wrap">
              {campaign.what_failed || <span className="text-muted-foreground italic">Nothing recorded</span>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learnings Section */}
      <div className="mt-4 pt-8 border-t border-border/50">
        <LearningList campaignId={campaign.id} />
      </div>
    </div>
  )
}
