'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { CampaignWithMetrics } from '@/lib/types/database'
import { metricFormatters, platformIcons, platformLabels } from '@/lib/constants'
import { CampaignStatusBadge } from './campaign-status-badge'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AnimatedList, AnimateCount } from '@/components/ui/unlumen'
import { cn } from '@/lib/utils'

interface CampaignTableProps {
  campaigns: CampaignWithMetrics[]
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const { formatCurrency, formatRoas } = metricFormatters

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card/50 backdrop-blur border border-border/40 rounded-xl border-dashed">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">[ NO STRATEGYS LOGGED ]</h3>
        <p className="text-xs text-muted-foreground">Initialize a new campaign STRATEGY to start tracking DATA.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/60 bg-background/40">
            <TableHead className="font-sans font-bold text-xs uppercase text-muted-foreground">Name</TableHead>
            <TableHead className="hidden sm:table-cell font-sans font-bold text-xs uppercase text-muted-foreground">Platform</TableHead>
            <TableHead className="font-sans font-bold text-xs uppercase text-muted-foreground">Status</TableHead>
            <TableHead className="hidden md:table-cell font-sans font-bold text-xs uppercase text-muted-foreground">Dates</TableHead>
            <TableHead className="hidden sm:table-cell text-right font-sans font-bold text-xs uppercase text-muted-foreground">Spend</TableHead>
            <TableHead className="text-right font-sans font-bold text-xs uppercase text-muted-foreground">Revenue</TableHead>
            <TableHead className="hidden md:table-cell text-right font-sans font-bold text-xs uppercase text-muted-foreground">ROAS</TableHead>
            <TableHead className="hidden lg:table-cell text-right font-sans font-bold text-xs uppercase text-muted-foreground">CAC</TableHead>
          </TableRow>
        </TableHeader>
        <AnimatedList as="tbody" className="[&_tr:last-child]:border-0" staggerDelay={35} distance={12}>
          {campaigns.map((campaign) => {
            const Icon = campaign.platform ? platformIcons[campaign.platform] : null
            const roas = campaign.roas ?? 0

            return (
              <TableRow
                key={campaign.id}
                className="group border-b border-border/40 hover:bg-primary/5 transition-colors"
              >
                <TableCell className="font-bold text-foreground">
                  <Link href={`/campaigns/${campaign.id}`} className="hover:text-[#00dbe9] transition-colors">
                    {campaign.name}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {campaign.platform && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {Icon && <span className="font-sans font-bold text-[10px] bg-muted border border-border px-1.5 py-0.5 text-foreground">{Icon}</span>}
                      <span className="text-xs">{platformLabels[campaign.platform]}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-sans font-bold">
                  {campaign.start_date ? format(new Date(campaign.start_date), 'MMM d, yy') : '—'}
                  {' - '}
                  {campaign.end_date ? format(new Date(campaign.end_date), 'MMM d, yy') : 'Present'}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right tabular-nums text-foreground">
                  <AnimateCount value={campaign.spend ?? 0} format="currency" />
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold text-foreground">
                  <AnimateCount value={campaign.revenue ?? 0} format="currency" />
                </TableCell>
                <TableCell className={cn(
                  "hidden md:table-cell text-right tabular-nums font-bold",
                  roas > 1 ? "text-emerald-400" : (roas > 0 ? "text-red-400" : "text-muted-foreground")
                )}>
                  <AnimateCount value={roas} format="number" decimals={2} suffix="x" />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right tabular-nums text-muted-foreground">
                  <AnimateCount value={campaign.cac ?? 0} format="currency" />
                </TableCell>
              </TableRow>
            )
          })}
        </AnimatedList>
      </Table>
    </div>
  )
}
