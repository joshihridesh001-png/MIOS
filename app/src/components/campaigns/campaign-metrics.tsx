'use client'

import { CampaignWithMetrics } from '@/lib/types/database'
import { TiltCard, AnimateCount, AnimatedList } from '@/components/ui/unlumen'
import { cn } from '@/lib/utils'

interface CampaignMetricsProps {
  campaign: CampaignWithMetrics
}

interface MetricCardProps {
  label: string
  value: number
  format?: 'currency' | 'percent' | 'number'
  decimals?: number
  suffix?: string
  isPositive?: boolean
  isNegative?: boolean
}

function MetricCard({
  label,
  value,
  format = 'currency',
  decimals = 0,
  suffix = '',
  isPositive,
  isNegative,
}: MetricCardProps) {
  return (
    <TiltCard className="p-6">
      <p className="text-sm font-medium text-gray-300 uppercase font-mono tracking-wider">{label}</p>
      <div
        className={cn(
          'mt-2 text-2xl font-bold tracking-tight',
          isPositive && 'text-emerald-400',
          isNegative && 'text-red-400',
          !isPositive && !isNegative && 'text-white'
        )}
      >
        <AnimateCount
          value={value}
          format={format}
          decimals={decimals}
          suffix={suffix}
        />
      </div>
    </TiltCard>
  )
}

export function CampaignMetrics({ campaign }: CampaignMetricsProps) {
  const roas = campaign.roas ?? 0

  return (
    <AnimatedList
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
      staggerDelay={45}
      distance={14}
    >
      <MetricCard
        label="Spend"
        value={campaign.spend ?? 0}
        format="currency"
      />
      <MetricCard
        label="Revenue"
        value={campaign.revenue ?? 0}
        format="currency"
      />
      <MetricCard
        label="Gross Profit"
        value={campaign.gross_profit ?? 0}
        format="currency"
        isPositive={(campaign.gross_profit ?? 0) > 0}
        isNegative={(campaign.gross_profit ?? 0) < 0}
      />
      <MetricCard
        label="Net Profit"
        value={campaign.net_profit ?? 0}
        format="currency"
        isPositive={(campaign.net_profit ?? 0) > 0}
        isNegative={(campaign.net_profit ?? 0) < 0}
      />
      <MetricCard
        label="ROAS"
        value={roas}
        format="number"
        decimals={2}
        suffix="x"
        isPositive={roas > 1}
        isNegative={roas > 0 && roas < 1}
      />
      <MetricCard
        label="Conversion Rate"
        value={campaign.conversion_rate ?? 0}
        format="percent"
        decimals={1}
      />
      <MetricCard
        label="CTR"
        value={campaign.ctr ?? 0}
        format="percent"
        decimals={2}
      />
      <MetricCard
        label="CPC"
        value={campaign.cpc ?? 0}
        format="currency"
        decimals={2}
      />
      <MetricCard
        label="CPL"
        value={campaign.cpl ?? 0}
        format="currency"
        decimals={2}
      />
      <MetricCard
        label="CAC"
        value={campaign.cac ?? 0}
        format="currency"
        decimals={2}
      />
    </AnimatedList>
  )
}
