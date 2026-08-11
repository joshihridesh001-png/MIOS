"use client"

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCreative, deleteCreative } from '@/hooks/use-creatives'
import { CreativePreviewBox } from '@/components/creatives/creative-preview-box'
import { LearningList } from '@/components/learnings/learning-list'
import {
  creativeFormatLabels,
  creativeFormatIcons,
  creativeAngleLabels,
  creativeAngleColors,
  creativeStatusLabels,
  creativeStatusColors,
  metricFormatters,
  platformIcons,
  platformLabels,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, PencilSimple, Trash, Fire, Warning, TrendUp, CurrencyDollar, Lightbulb, CheckCircle, Question } from "@phosphor-icons/react"
import { toast } from 'sonner'

interface CreativeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CreativeDetailPage({ params }: CreativeDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { creative, loading, error } = useCreative(id)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!creative) return
    const confirmed = window.confirm(
      `Are you sure you want to delete creative "${creative.name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteCreative(id)
      toast.success('🎨 Creative asset deleted.')
      router.push('/creatives')
    } catch (err: any) {
      toast.error(`Failed to delete creative: ${err.message}`)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-10 w-64 bg-card/60 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-card/60 rounded-xl border border-border/40" />
          <div className="h-96 bg-card/60 rounded-xl border border-border/40" />
        </div>
      </div>
    )
  }

  if (error || !creative) {
    return (
      <div className="p-8 text-center bg-card/60 rounded-xl border border-border/40">
        <p className="text-red-400 font-semibold text-sm">
          {error ? error.message : 'Creative asset not found.'}
        </p>
        <Link href="/creatives" className="inline-block mt-4 text-xs text-emerald-400 hover:underline">
          ← Back to Ad Library
        </Link>
      </div>
    )
  }

  const fatigueScore = creative.fatigue_score || 0
  const isFatigued = creative.status === 'fatigued' || fatigueScore > 70
  const isTesting = fatigueScore >= 30 && fatigueScore <= 70
  const roasVal = creative.roas || 0
  const profit = (creative.revenue || 0) - (creative.spend || 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Link
            href="/creatives"
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft weight="duotone" className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl" title={creativeFormatLabels[creative.format] || 'Format'}>
                {creativeFormatIcons[creative.format] || '🖼️'}
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {creative.name}
              </h1>

              <Badge
                variant="outline"
                className={cn('text-xs font-semibold px-2.5 py-0.5 border', creativeStatusColors[creative.status] || '')}
              >
                {creativeStatusLabels[creative.status] || creative.status}
              </Badge>

              <Badge
                variant="outline"
                className={cn('text-xs font-medium px-2.5 py-0.5 border', creativeAngleColors[creative.angle] || '')}
              >
                {creativeAngleLabels[creative.angle] || creative.angle}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{creative.platform ? platformIcons[creative.platform] || '📱' : '📱'}</span>
              <span>{creative.platform ? platformLabels[creative.platform] || creative.platform : 'Meta Ads'}</span>
              <span>•</span>
              <span>Created {new Date(creative.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/creatives/${id}/PencilSimple`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 px-4 border-border/60 hover:bg-secondary"
            >
              <PencilSimple className="w-3.5 h-3.5 mr-1.5" />
              PencilSimple Creative
            </Button>
          </Link>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs h-9 px-3"
          >
            <Trash weight="duotone" className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Two-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (5 cols): Authentic Live Ad Feed Preview & Copy Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Live Feed Preview ({creative.platform ? platformLabels[creative.platform] || creative.platform : 'Meta Ads'})
          </div>

          <CreativePreviewBox creative={creative} />

          {/* Ad Copy Specification Box */}
          <Card className="bg-card/80 backdrop-blur-xl border border-border/60 shadow-md">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold text-foreground">
                📝 Ad Copy Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <div className="text-muted-foreground font-medium mb-0.5">Headline (Hook):</div>
                <div className="font-semibold text-foreground bg-secondary/40 p-2 rounded-2xl">
                  {creative.headline || creative.name}
                </div>
              </div>

              {creative.primary_text && (
                <div>
                  <div className="text-muted-foreground font-medium mb-0.5">Primary Text (Body):</div>
                  <div className="text-foreground bg-secondary/40 p-2.5 rounded-2xl whitespace-pre-wrap">
                    {creative.primary_text}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-border/30">
                <span className="text-muted-foreground">CTA Button:</span>
                <Badge variant="outline" className="font-sans font-bold text-xs">
                  {creative.cta_text || 'Learn More'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (7 cols): Performance Metrics, Fatigue Diagnosis & Reflection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ad Fatigue Diagnosis Card (Special Visual Treatment) */}
          <Card
            className={cn(
              'border shadow-lg transition-all',
              isFatigued
                ? 'bg-red-950/20 border-red-500/40 shadow-red-950/20'
                : isTesting
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-950/10'
            )}
          >
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {isFatigued ? (
                    <Warning weight="duotone" className="w-4 h-4 text-red-400 animate-pulse" />
                  ) : isTesting ? (
                    <Fire weight="duotone" className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle weight="duotone" className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Ad Fatigue & Psychological Diagnosis</span>
                </CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-sans font-bold text-xs font-bold border',
                    isFatigued
                      ? 'text-red-400 border-red-500/40 bg-red-500/10'
                      : isTesting
                      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                      : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                  )}
                >
                  Fatigue: {fatigueScore}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Fatigue Progress Bar */}
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/40">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    isFatigued
                      ? 'bg-gradient-to-r from-red-500 to-rose-600'
                      : isTesting
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  )}
                  style={{ width: `${Math.min(fatigueScore, 100)}%` }}
                />
              </div>

              {/* AI Diagnostic Advice */}
              <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-xs leading-relaxed">
                <div className="font-semibold text-foreground mb-1">
                  {isFatigued
                    ? '🚨 High Audience Burnout Detected'
                    : isTesting
                    ? '⚖️ In Active Testing & Scaling Phase'
                    : '🌱 Fresh High-Engagement Creative'}
                </div>
                <p className="text-muted-foreground">
                  {isFatigued
                    ? 'CTR is showing signs of frequency decay and audience saturation. We recommend rotating your visual asset or testing a new psychological angle immediately.'
                    : isTesting
                    ? 'Engagement is steady. Monitor CPC and CVR over the next 48 hours to determine if this angle can scale to a evergreen ad.'
                    : 'Audience receptivity is high. Keep budget allocated and document what makes this hook work in your permanent Learnings.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial & Conversion Metrics Grid */}
          <Card className="bg-card/80 backdrop-blur-xl border border-border/60 shadow-lg">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendUp weight="duotone" className="w-4 h-4 text-emerald-400" />
                Financial & Conversion Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">Spend</div>
                  <div className="font-sans font-bold font-bold text-base text-foreground mt-1">
                    {metricFormatters.formatCurrency(creative.spend)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">Revenue</div>
                  <div className="font-sans font-bold font-bold text-base text-emerald-400 mt-1">
                    {metricFormatters.formatCurrency(creative.revenue)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">Net Profit</div>
                  <div
                    className={cn(
                      'font-sans font-bold font-bold text-base mt-1',
                      profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {metricFormatters.formatCurrency(profit)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">ROAS</div>
                  <div
                    className={cn(
                      'font-sans font-bold font-bold text-base mt-1',
                      roasVal >= 1.5 ? 'text-emerald-400' : roasVal >= 1 ? 'text-amber-400' : 'text-rose-400'
                    )}
                  >
                    {roasVal > 0 ? `${roasVal}x` : '-'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">CTR</div>
                  <div className="font-sans font-bold font-bold text-base text-foreground mt-1">
                    {creative.ctr ? `${creative.ctr}%` : '-'}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {creative.clicks || 0} clicks
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">Inquiries</div>
                  <div className="font-sans font-bold font-bold text-base text-foreground mt-1">
                    {creative.inquiries || 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Leads / Messages
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">Customers Won</div>
                  <div className="font-sans font-bold font-bold text-base text-emerald-400 mt-1">
                    {creative.customers_won || 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Paid sales
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">Conversion Rate</div>
                  <div className="font-sans font-bold font-bold text-base text-emerald-400 mt-1">
                    {creative.conversion_rate ? `${creative.conversion_rate}%` : '-'}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Won / Inquiries
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hook Hypothesis & Reflection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/80 border border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Lightbulb weight="duotone" className="w-3.5 h-3.5" />
                  Hook Hypothesis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {creative.hook_hypothesis || (
                  <span className="text-muted-foreground italic">No hypothesis documented</span>
                )}
              </CardContent>
            </Card>

            <Card className="bg-emerald-950/15 border border-emerald-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-emerald-400">
                  What Worked
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {creative.what_worked || (
                  <span className="text-muted-foreground italic">Nothing recorded yet</span>
                )}
              </CardContent>
            </Card>

            <Card className="bg-rose-950/15 border border-rose-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-rose-400">
                  What Failed
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {creative.what_failed || (
                  <span className="text-muted-foreground italic">Nothing recorded yet</span>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Permanent Knowledge / Learnings Linked to This Creative */}
      <div className="pt-8 border-t border-border/60">
        <LearningList
          sourceId={creative.id}
          sourceType="creative"
          title={`Permanent Learnings from "${creative.name}"`}
        />
      </div>
    </div>
  )
}
