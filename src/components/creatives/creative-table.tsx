"use client"

import { useRouter } from 'next/navigation'
import { CreativeWithMetrics } from '@/lib/types/database'
import {
  creativeFormatIcons,
  creativeStatusLabels,
  creativeStatusColors,
  creativeAngleLabels,
  creativeAngleColors,
  metricFormatters,
  platformIcons,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Fire, Warning } from "@phosphor-icons/react"

interface CreativeTableProps {
  creatives: CreativeWithMetrics[]
}

export function CreativeTable({ creatives }: CreativeTableProps) {
  const router = useRouter()

  if (creatives.length === 0) {
    return (
      <div className="text-center py-16 bg-card/40 rounded-xl border border-border/40">
        <div className="w-12 h-12 mx-auto rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground font-sans font-bold text-xs font-bold mb-3">
          ASSET
        </div>
        <h3 className="text-base font-semibold text-foreground">No creatives found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Add your first creative asset or paste ad copy to start tracking psychological angles and ad fatigue.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/30 text-muted-foreground font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Creative / Headline</th>
            <th className="py-3 px-4">Angle</th>
            <th className="py-3 px-4">Format</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Spend</th>
            <th className="py-3 px-4 text-right">ROAS</th>
            <th className="py-3 px-4 text-right">CTR</th>
            <th className="py-3 px-4 text-right">CVR</th>
            <th className="py-3 px-4 text-center">Fatigue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {creatives.map((creative) => {
            const isFatigued = creative.status === 'fatigued' || (creative.fatigue_score || 0) > 70
            const roasVal = creative.roas || 0
            const ctrVal = creative.ctr || 0
            const cvrVal = creative.conversion_rate || 0

            return (
              <tr
                key={creative.id}
                onClick={() => router.push(`/creatives/${creative.id}`)}
                className="hover:bg-zinc-800/50 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 px-4 max-w-[240px]">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-[9px] bg-muted border border-border px-1 py-0.5 text-muted-foreground">{creative.platform ? platformIcons[creative.platform] || 'META' : 'META'}</span>
                    <div className="truncate">
                      <div className="font-semibold text-foreground group-hover:text-emerald-400 transition-colors truncate">
                        {creative.headline || creative.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {creative.name}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] font-medium px-2 py-0.5 border', creativeAngleColors[creative.angle] || '')}
                  >
                    {creativeAngleLabels[creative.angle] || creative.angle}
                  </Badge>
                </td>

                <td className="py-3.5 px-4 font-medium text-foreground">
                  <span className="font-sans font-bold text-[10px] bg-muted border border-border px-1.5 py-0.5 text-foreground mr-1">{creativeFormatIcons[creative.format] || 'IMG'}</span>
                  <span className="capitalize">{creative.format}</span>
                </td>

                <td className="py-3.5 px-4">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] font-semibold px-2 py-0.5 border', creativeStatusColors[creative.status] || '')}
                  >
                    {creativeStatusLabels[creative.status] || creative.status}
                  </Badge>
                </td>

                <td className="py-3.5 px-4 text-right font-sans font-bold font-medium text-foreground">
                  {metricFormatters.formatCurrency(creative.spend)}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <span
                    className={cn(
                      'font-sans font-bold font-bold',
                      roasVal >= 1.5 ? 'text-emerald-400' : roasVal >= 1 ? 'text-amber-400' : 'text-rose-400'
                    )}
                  >
                    {roasVal > 0 ? `${roasVal}x` : '-'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right font-sans font-bold text-foreground">
                  {ctrVal > 0 ? `${ctrVal}%` : '-'}
                </td>

                <td className="py-3.5 px-4 text-right font-sans font-bold text-foreground">
                  {cvrVal > 0 ? `${cvrVal}%` : '-'}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/80 border border-border/60">
                    {isFatigued ? (
                      <Warning weight="duotone" className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    ) : (
                      <Fire weight="duotone" className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span
                      className={cn(
                        'font-sans font-bold font-semibold text-[11px]',
                        isFatigued ? 'text-red-400' : 'text-foreground'
                      )}
                    >
                      {creative.fatigue_score || 0}%
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
