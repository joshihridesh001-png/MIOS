// ==============================================================================
// MIOS Acquire New Customer Route (@/app/(dashboard)/customers/new/page.tsx)
// Governed by ADR-001 (ISO/IEC 25010 Maintainability)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomers } from '@/hooks/use-customers';
import { CustomerForm } from '@/components/customers/customer-form';
import { CustomerInsert } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewCustomerPage() {
  const router = useRouter();
  const { createCustomer } = useCustomers();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CustomerInsert) => {
    try {
      setLoading(true);
      const res = await createCustomer(data);
      if (res) {
        toast.success('Customer Recorded Successfully!', {
          description: 'Psychology triggers and CX telemetry indexed.',
        });
        router.push(`/customers/${res.id}`);
      } else {
        throw new Error('Database returned null record');
      }
    } catch (err: unknown) {
      console.error('[NewCustomerPage] Error saving customer:', err);
      toast.error('Failed to commit customer record', {
        description: err instanceof Error ? err.message : 'Please check permissions.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-on-background">
            [ ACQUIRE / REGISTER CUSTOMER RECORD ]
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Log financial economics, pre-sale psychology & post-job CX survey notes
          </p>
        </div>
        <Link href="/customers">
          <Button variant="outline" className="rounded-none border-border text-xs uppercase">
            [ ← BACK TO DIRECTORY ]
          </Button>
        </Link>
      </div>

      <CustomerForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
