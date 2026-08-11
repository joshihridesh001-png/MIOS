// ==============================================================================
// MIOS Customer Detail & Psychology Telemetry Route (@/app/(dashboard)/customers/[id]/page.tsx)
// Governed by ADR-001 (PestControl OS Aesthetic: #000000, rounded-none)
// ==============================================================================

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomer, useCustomers } from '@/hooks/use-customers';
import { CustomerPsychologyCard } from '@/components/customers/customer-psychology-card';
import { metricFormatters } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = typeof params?.id === 'string' ? params.id : undefined;

  const { customer, loading, error } = useCustomer(customerId);
  const { deleteCustomer } = useCustomers();

  const handleDelete = async () => {
    if (!customer) return;
    if (window.confirm(`Are you sure you want to remove customer record "${customer.name}"?`)) {
      const ok = await deleteCustomer(customer.id);
      if (ok) {
        toast.success('Customer Record Removed');
        router.push('/customers');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-sans font-bold text-xs text-muted-foreground">
        [ LOADING CUSTOMER TELEMETRY & PSYCHOLOGY DATA... ]
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-12 text-center font-sans font-bold text-xs text-rose-500 border border-rose-950 bg-card/80">
        [ ERROR LOADING CUSTOMER PROFILE: {error || 'NOT FOUND'} ]
        <div className="mt-4">
          <Link href="/customers">
            <Button variant="outline" className="rounded-xl text-xs uppercase">
              [ ← BACK TO DIRECTORY ]
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans font-bold">
      {/* 1. Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-xl border-primary text-primary uppercase text-xs">
              {customer.property_type}
            </Badge>
            <Badge variant="outline" className="rounded-xl border-border text-on-background uppercase text-xs">
              STATUS: {customer.status}
            </Badge>
            {customer.amc_opportunity && (
              <Badge variant="outline" className="rounded-xl border-amber-500 text-amber-400 text-xs">
                AMC POTENTIAL
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold uppercase text-on-background mt-2">
            {customer.name}
          </h1>
          {customer.phone && (
            <p className="text-xs text-muted-foreground mt-1">Phone: {customer.phone} | Location: {customer.location || 'N/A'}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="outline" className="rounded-xl border-border text-xs uppercase hover:text-[#00dbe9]">
              [ EDIT RECORD ]
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="rounded-xl border-rose-900/50 text-rose-500 hover:bg-rose-950/20 text-xs uppercase"
          >
            [ DELETE ]
          </Button>
          <Link href="/customers">
            <Button variant="outline" className="rounded-xl border-border text-xs uppercase">
              [ ← DIRECTORY ]
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Lifetime Economics KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-border/50 bg-card/80 p-6 text-center">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Total Revenue Acquired</span>
          <span className="text-xl font-bold text-on-background tabular-nums">
            {metricFormatters.formatCurrency(customer.revenue || 0)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Net Gross Profit</span>
          <span className="text-xl font-bold text-emerald-400 tabular-nums">
            {metricFormatters.formatCurrency(customer.profit || 0)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Lifetime Value (LTV)</span>
          <span className="text-xl font-bold text-primary tabular-nums">
            {metricFormatters.formatCurrency(customer.ltv || 0)}
          </span>
        </div>
      </div>

      {/* 3. Attribution Chain Card */}
      <div className="border border-border/50 bg-card/80 p-4 flex flex-col md:flex-row md:items-center justify-between text-xs">
        <div>
          <span className="text-muted-foreground uppercase">Acquisition Source:</span>{' '}
          <span className="font-bold text-on-background">{customer.lead_source || 'Direct / Unattributed'}</span>
        </div>
        <div className="flex gap-4 mt-2 md:mt-0">
          {customer.campaign_id ? (
            <Link href={`/campaigns/${customer.campaign_id}`} className="text-primary hover:underline">
              [ VIEW ATTRIBUTED CAMPAIGN → ]
            </Link>
          ) : (
            <span className="text-muted-foreground">[ NO CAMPAIGN ID LINKED ]</span>
          )}
        </div>
      </div>

      {/* 4. Pre-Sale Consumer Psychology & Post-Job CX Matrix Card */}
      <CustomerPsychologyCard customer={customer} />
    </div>
  );
}
