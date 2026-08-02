'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { CampaignWithMetrics } from '@/lib/types/database'
import { metricFormatters, platformIcons, platformLabels } from '@/lib/constants'
import { CampaignStatusBadge } from './campaign-status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface CampaignTableProps {
  campaigns: CampaignWithMetrics[]
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const { formatCurrency, formatRoas } = metricFormatters

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card/50 backdrop-blur border rounded-xl border-dashed">
        <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
        <p className="text-muted-foreground">Create your first one to start tracking performance.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card/80 backdrop-blur overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Platform</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Dates</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Spend</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="hidden md:table-cell text-right">ROAS</TableHead>
            <TableHead className="hidden lg:table-cell text-right">CAC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const Icon = campaign.platform ? platformIcons[campaign.platform] : null
            const roas = campaign.roas ?? 0

            return (
              <TableRow key={campaign.id} className="group hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <Link href={`/campaigns/${campaign.id}`} className="hover:underline underline-offset-4">
                    {campaign.name}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {campaign.platform && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {Icon && <span className="font-mono text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-zinc-300">{Icon}</span>}
                      <span>{platformLabels[campaign.platform]}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {campaign.start_date ? format(new Date(campaign.start_date), 'MMM d, yy') : '—'}
                  {' - '}
                  {campaign.end_date ? format(new Date(campaign.end_date), 'MMM d, yy') : 'Present'}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right tabular-nums">
                  {formatCurrency(campaign.spend)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatCurrency(campaign.revenue)}
                </TableCell>
                <TableCell className={cn(
                  "hidden md:table-cell text-right tabular-nums",
                  roas > 1 ? "text-emerald-500" : (roas > 0 ? "text-red-500" : "")
                )}>
                  {formatRoas(campaign.roas)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right tabular-nums">
                  {formatCurrency(campaign.cac)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
