// ==============================================================================
// MIOS Customer Directory Table (@/components/customers/customer-table.tsx)
// Governed by ADR-001 (PestControl OS Aesthetic: #000000, rounded-none)
// ==============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { CustomerRow } from '@/lib/types/database';
import { metricFormatters } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CustomerTableProps {
  customers: CustomerRow[];
  onDelete?: (id: string) => Promise<void>;
}

export function CustomerTable({ customers, onDelete }: CustomerTableProps) {
  if (!customers || customers.length === 0) {
    return (
      <div className="p-12 text-center border border-border/50 bg-card/80 backdrop-blur-xl rounded-none">
        <p className="text-gray-300 font-mono text-sm uppercase tracking-wider mb-4">
          [NO CUSTOMER RECORDS DETECTED IN DATABASE]
        </p>
        <Link href="/customers/new">
          <Button variant="default" className="rounded-none bg-[#00dbe9] text-black font-mono font-bold hover:bg-[#00dbe9]/80">
            [ + ACQUIRE FIRST CUSTOMER ]
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border/50 bg-card/80 backdrop-blur-xl rounded-none">
      <table className="w-full text-left border-collapse font-mono text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-secondary-fixed/30 text-gray-200 font-bold uppercase text-xs tracking-wider">
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
        <tbody className="divide-y divide-border/30">
          {customers.map((cust) => {
            const isAmc = cust.amc_opportunity;
            const cxScore = cust.cx_rating || '-';

            return (
              <tr key={cust.id} className="hover:bg-card/90 transition-colors">
                <td className="py-3 px-4 font-semibold text-on-background">
                  <Link href={`/customers/${cust.id}`} className="hover:text-[#00dbe9] underline decoration-[#00dbe9]/50">
                    {cust.name}
                  </Link>
                  {isAmc && (
                    <Badge variant="outline" className="ml-2 rounded-none border-[#00dbe9] text-[#00dbe9] text-[10px] px-1 py-0">
                      AMC OPP
                    </Badge>
                  )}
                </td>
                <td className="py-3 px-4 uppercase text-xs text-gray-300">
                  {cust.property_type}
                </td>
                <td className="py-3 px-4 text-xs text-gray-300">
                  {cust.lead_source || 'Direct / Organic'}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-on-background">
                  {metricFormatters.formatCurrency(cust.revenue || 0)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-emerald-400">
                  {metricFormatters.formatCurrency(cust.profit || 0)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-[#00dbe9]">
                  {metricFormatters.formatCurrency(cust.ltv || 0)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 text-xs font-bold ${
                    typeof cxScore === 'number' && cxScore >= 4 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    typeof cxScore === 'number' && cxScore <= 2 ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-secondary-fixed/50 text-gray-300'
                  }`}>
                    {cxScore} {typeof cxScore === 'number' ? '/5' : ''}
                  </span>
                </td>
                <td className="py-3 px-4 text-center uppercase text-xs">
                  <Badge variant="outline" className="rounded-none border-border text-on-background text-[10px]">
                    {cust.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <Link href={`/customers/${cust.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-none text-xs hover:text-[#00dbe9]">
                      [VIEW]
                    </Button>
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(cust.id)}
                      className="rounded-none text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-950/20"
                    >
                      [DEL]
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
