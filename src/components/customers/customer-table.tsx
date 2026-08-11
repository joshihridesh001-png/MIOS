// ==============================================================================
// MIOS Customer Directory Table (@/components/customers/customer-table.tsx)
// Powered by Unlumen UI AnimatedList and AnimateCount
// ==============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { CustomerRow } from '@/lib/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedList, AnimateCount } from '@/components/ui/unlumen';

interface CustomerTableProps {
  customers: CustomerRow[];
  onDelete?: (id: string) => Promise<void>;
}

export function CustomerTable({ customers, onDelete }: CustomerTableProps) {
  if (!customers || customers.length === 0) {
    return (
      <div className="p-12 text-center bg-card border border-border shadow-sm border-none p-4 rounded-xl">
        <p className="text-muted-foreground font-bold font-sans text-sm uppercase tracking-wider mb-4">
          [NO CUSTOMER RECORDS DETECTED IN DATABASE]
        </p>
        <Link href="/customers/new">
          <Button variant="default" className="rounded-xl bg-primary text-primary-foreground font-sans font-bold hover:bg-primary/80">
            [ + ACQUIRE FIRST CUSTOMER ]
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-card border border-border shadow-sm border-none p-4 rounded-xl">
      <table className="w-full text-left border-collapse font-bold font-sans text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-secondary-fixed/30 text-foreground font-bold uppercase text-xs tracking-wider">
            <th className="py-3 px-4">Customer Name</th>
            <th className="py-3 px-4">Property</th>
            <th className="py-3 px-4">Attribution</th>
            <th className="py-3 px-4 text-right">Revenue</th>
            <th className="py-3 px-4 text-right">Profit</th>
            <th className="py-3 px-4 text-right">LTV</th>
            <th className="py-3 px-4 text-center">CX Score</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <AnimatedList as="tbody" className="divide-y divide-border/30" staggerDelay={35} distance={12}>
          {customers.map((cust) => {
            const isAmc = cust.amc_opportunity;
            const cxScore = cust.cx_rating || '-';

            return (
              <tr key={cust.id} className="hover:bg-primary/5 transition-colors">
                <td className="py-3 px-4 font-semibold text-foreground">
                  <Link href={`/customers/${cust.id}`} className="hover:text-[#00dbe9] underline decoration-[#00dbe9]/50">
                    {cust.name}
                  </Link>
                  {isAmc && (
                    <Badge variant="outline" className="ml-2 rounded-xl border-primary text-primary text-[10px] px-1 py-0">
                      AMC OPP
                    </Badge>
                  )}
                </td>
                <td className="py-3 px-4 uppercase text-xs text-muted-foreground">
                  {cust.property_type}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {cust.lead_source || 'Direct / Organic'}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-foreground font-bold">
                  <AnimateCount value={cust.revenue || 0} format="currency" />
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-emerald-400 font-bold">
                  <AnimateCount value={cust.profit || 0} format="currency" />
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-primary">
                  <AnimateCount value={cust.ltv || 0} format="currency" />
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 text-xs font-bold ${
                    typeof cxScore === 'number' && cxScore >= 4 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    typeof cxScore === 'number' && cxScore <= 2 ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-secondary-fixed/50 text-muted-foreground'
                  }`}>
                    {cxScore} {typeof cxScore === 'number' ? '/5' : ''}
                  </span>
                </td>
                <td className="py-3 px-4 text-center uppercase text-xs">
                  <Badge variant="outline" className="rounded-xl border-border text-foreground text-[10px]">
                    {cust.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <Link href={`/customers/${cust.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-xl text-xs text-muted-foreground hover:text-[#00dbe9]">
                      [VIEW]
                    </Button>
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(cust.id)}
                      className="rounded-xl text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-950/20"
                    >
                      [DEL]
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </AnimatedList>
      </table>
    </div>
  );
}
