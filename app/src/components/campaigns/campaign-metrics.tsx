'use client'

import { CampaignWithMetrics } from '@/lib/types/database'
import { metricFormatters } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface CampaignMetricsProps {
  campaign: CampaignWithMetrics
}

function MetricCard({ 
  label, 
  value, 
  isPositive, 
  isNegative 
}: { 
  label: string; 
  value: string; 
  isPositive?: boolean; 
  isNegative?: boolean 
}) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="bg-card/80 backdrop-blur-xl border border-border/50 transition-all hover:bg-card/90">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn(
          "mt-2 text-2xl font-semibold tracking-tight transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          isPositive && "text-emerald-500",
          isNegative && "text-red-500"
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export function CampaignMetrics({ campaign }: CampaignMetricsProps) {
  const { formatCurrency, formatPercent, formatRoas } = metricFormatters

  const roas = campaign.roas ?? 0
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricCard 
        label="Spend" 
        value={formatCurrency(campaign.spend)} 
      />
      <MetricCard 
        label="Revenue" 
        value={formatCurrency(campaign.revenue)} 
      />
      <MetricCard 
        label="Gross Profit" 
        value={formatCurrency(campaign.gross_profit)}
        isPositive={(campaign.gross_profit ?? 0) > 0}
        isNegative={(campaign.gross_profit ?? 0) < 0}
      />
      <MetricCard 
        label="Net Profit" 
        value={formatCurrency(campaign.net_profit)}
        isPositive={(campaign.net_profit ?? 0) > 0}
        isNegative={(campaign.net_profit ?? 0) < 0}
      />
      <MetricCard 
        label="ROAS" 
        value={formatRoas(campaign.roas)}
        isPositive={roas > 1}
        isNegative={roas > 0 && roas < 1}
      />
      <MetricCard 
        label="Conversion Rate" 
        value={formatPercent(campaign.conversion_rate)} 
      />
      <MetricCard 
        label="CTR" 
        value={formatPercent(campaign.ctr)} 
      />
      <MetricCard 
        label="CPC" 
        value={formatCurrency(campaign.cpc)} 
      />
      <MetricCard 
        label="CPL" 
        value={formatCurrency(campaign.cpl)} 
      />
      <MetricCard 
        label="CAC" 
        value={formatCurrency(campaign.cac)} 
      />
    </div>
  )
}
