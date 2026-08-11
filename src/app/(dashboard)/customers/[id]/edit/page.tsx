// ==============================================================================
// MIOS Edit Customer Route (@/app/(dashboard)/customers/[id]/edit/page.tsx)
// Governed by ADR-001 (ISO/IEC 25010 Maintainability)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomer, useCustomers } from '@/hooks/use-customers';
import { CustomerForm } from '@/components/customers/customer-form';
import { CustomerInsert } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = typeof params?.id === 'string' ? params.id : undefined;

  const { customer, loading, error } = useCustomer(customerId);
  const { updateCustomer } = useCustomers();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: CustomerInsert) => {
    if (!customer) return;
    try {
      setSaving(true);
      const res = await updateCustomer(customer.id, data);
      if (res) {
        toast.success('Customer Record Updated!', {
          description: 'Psychology and CX telemetry synchronized.',
        });
        router.push(`/customers/${customer.id}`);
      } else {
        throw new Error('Update returned null record');
      }
    } catch (err: unknown) {
      console.error('[EditCustomerPage] Error updating customer:', err);
      toast.error('Failed to update customer record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-sans font-bold text-xs text-muted-foreground">
        [ LOADING RECORD FOR EDITING... ]
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-12 text-center font-sans font-bold text-xs text-rose-500 border border-rose-950 bg-card/80">
        [ ERROR LOADING CUSTOMER: {error || 'NOT FOUND'} ]
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
    <div className="space-y-6 font-sans font-bold max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-on-background">
            [ EDIT CUSTOMER RECORD: {customer.name} ]
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Update financial economics, acquisition triggers & CX survey debriefs
          </p>
        </div>
        <Link href={`/customers/${customer.id}`}>
          <Button variant="outline" className="rounded-xl border-border text-xs uppercase">
            [ ← CANCEL EDIT ]
          </Button>
        </Link>
      </div>

      <CustomerForm
        initialData={customer}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
