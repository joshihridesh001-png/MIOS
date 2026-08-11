"use client"

import { useRouter } from 'next/navigation'
import { CreativeWithMetrics } from '@/lib/types/database'
import {
  creativeFormatLabels,
  creativeFormatIcons,
  creativeStatusLabels,
  creativeStatusColors,
  creativeAngleLabels,
  creativeAngleColors,
  metricFormatters,
  platformIcons,
  platformLabels,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Fire, TrendUp, Warning } from "@phosphor-icons/react"
import { TiltCard } from '@/components/ui/unlumen'

interface CreativeCardProps {
  creative: CreativeWithMetrics
}

export function CreativeCard({ creative }: CreativeCardProps) {
  const router = useRouter()
  const isFatigued = creative.status === 'fatigued' || (creative.fatigue_score || 0) > 70
  const roasVal = creative.roas || 0
  const ctrVal = creative.ctr || 0

  return (
    <TiltCard
      onClick={() => router.push(`/creatives/${creative.id}`)}
      className="group relative cursor-pointer rounded-xl bg-card/90 border border-border/60 hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col font-sans font-bold"
    >
      {/* Top Banner / Angle & Status */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-[10px] bg-muted border border-border px-1.5 py-0.5 text-foreground" title={creativeFormatLabels[creative.format] || 'Format'}>
            {creativeFormatIcons[creative.format] || 'IMG'}
          </span>
          <Badge
            variant="outline"
            className={cn('text-xs font-medium px-2 py-0.5 border', creativeAngleColors[creative.angle] || '')}
          >
            {creativeAngleLabels[creative.angle] || creative.angle}
          </Badge>
        </div>

        <Badge
          variant="outline"
          className={cn('text-xs font-semibold px-2 py-0.5 border', creativeStatusColors[creative.status] || '')}
        >
          {creativeStatusLabels[creative.status] || creative.status}
        </Badge>
      </div>

      {/* Copy / Headline Preview */}
      <div className="p-4 flex-1 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-sans font-bold text-[9px] bg-muted border border-border px-1 text-muted-foreground">{creative.platform ? platformIcons[creative.platform] || 'META' : 'META'}</span>
          <span>{creative.platform ? platformLabels[creative.platform] || creative.platform : 'Meta Ads'}</span>
          <span>•</span>
          <span className="truncate max-w-[150px]">{creative.name}</span>
        </div>

        <h3 className="font-semibold text-base text-foreground group-hover:text-emerald-400 transition-colors line-clamp-2">
          {creative.headline || creative.name}
        </h3>

        {creative.primary_text && (
          <p className="text-xs text-muted-foreground line-clamp-2 italic">
            "{creative.primary_text}"
          </p>
        )}
      </div>

      {/* Fatigue Meter */}
      <div className="px-4 py-2 bg-secondary/30 border-t border-border/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {isFatigued ? (
            <Warning weight="duotone" className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          ) : (
            <Fire weight="duotone" className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="font-medium text-muted-foreground">Fatigue Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isFatigued
                  ? 'bg-card  '
                  : 'bg-card  '
              )}
              style={{ width: `${Math.min(creative.fatigue_score || 0, 100)}%` }}
            />
          </div>
          <span
            className={cn(
              'font-sans font-bold font-semibold',
              isFatigued ? 'text-red-400' : 'text-foreground'
            )}
          >
            {creative.fatigue_score || 0}%
          </span>
        </div>
      </div>

      {/* Footer Metrics Grid */}
      <div className="grid grid-cols-3 border-t border-border/40 divide-x divide-border/30 bg-card/40 text-center py-3 text-xs">
        <div>
          <div className="text-muted-foreground text-[10px] uppercase font-medium">ROAS</div>
          <div
            className={cn(
              'font-sans font-bold font-bold text-sm mt-0.5',
              roasVal >= 1.5 ? 'text-emerald-400' : roasVal >= 1 ? 'text-amber-400' : 'text-rose-400'
            )}
          >
            {roasVal > 0 ? `${roasVal}x` : '-'}
          </div>
        </div>

        <div>
          <div className="text-muted-foreground text-[10px] uppercase font-medium">CTR</div>
          <div className="font-sans font-bold font-bold text-sm text-foreground mt-0.5">
            {ctrVal > 0 ? `${ctrVal}%` : '-'}
          </div>
        </div>

        <div>
          <div className="text-muted-foreground text-[10px] uppercase font-medium">Spend</div>
          <div className="font-sans font-bold font-semibold text-sm text-foreground mt-0.5">
            {metricFormatters.formatCurrency(creative.spend)}
          </div>
        </div>
      </div>
    </TiltCard>
  )
}
