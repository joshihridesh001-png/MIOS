// ==============================================================================
// MIOS Customers & Buyer Personas Directory Route (@/app/(dashboard)/customers/page.tsx)
// Governed by ADR-001 (PestControl OS Aesthetic: #000000, rounded-none)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCustomers, useBuyerPersonas } from '@/hooks/use-customers';
import { CustomerTable } from '@/components/customers/customer-table';
import { PersonaCard } from '@/components/customers/persona-card';
import { PersonaEditModal } from '@/components/customers/persona-edit-modal';
import { BuyerPersonaRow, BuyerPersonaUpdate } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { TextReveal } from '@/components/ui/unlumen';

export default function CustomersPage() {
  const { customers, loading: loadingCust, deleteCustomer } = useCustomers();
  const { personas, loading: loadingPers, updatePersona } = useBuyerPersonas();
  const [activeTab, setActiveTab] = useState<'directory' | 'personas'>('directory');
  const [editingPersona, setEditingPersona] = useState<BuyerPersonaRow | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this customer record?')) {
      await deleteCustomer(id);
    }
  };

  const handleSavePersona = async (id: string, update: BuyerPersonaUpdate) => {
    await updatePersona(id, update);
  };

  return (
    <div className="space-y-6 font-sans font-bold">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-foreground">
            <TextReveal text="[ CONSUMER PSYCHOLOGY & BUYER RESEARCH ENGINE ]" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Customer attribution, post-job CX telemetry & active growth experiment collaborator (LABS)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/customers/new">
            <Button
              variant="default"
              className="rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/80 text-xs px-4"
            >
              [ + ACQUIRE CUSTOMER ]
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Executive Navigation Tabs */}
      <div className="flex border-b border-border/40 space-x-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-6 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'directory'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card/40 text-muted-foreground hover:text-white'
          }`}
        >
          [ CUSTOMER DIRECTORY ({customers.length}) ]
        </button>
        <button
          onClick={() => setActiveTab('personas')}
          className={`px-6 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'personas'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card/40 text-muted-foreground hover:text-white'
          }`}
        >
          [ BUYER PERSONAS & EXPERIMENT COLLABORATOR ({personas.length}) ]
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'directory' ? (
        <div className="space-y-4">
          {loadingCust ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              [ LOADING CUSTOMER TELEMETRY... ]
            </div>
          ) : (
            <CustomerTable customers={customers} onDelete={handleDelete} />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {loadingPers ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              [ SYNTHESIZING BUYER PERSONAS... ]
            </div>
          ) : personas.length === 0 ? (
            <div className="p-12 text-center border border-border/50 bg-card/80 rounded-xl text-muted-foreground text-xs">
              [ NO BUYER PERSONAS FOUND — SEED MIGRATION REQUIRED ]
            </div>
          ) : (
            <div className="space-y-6">
              {personas.map((pers) => (
                <PersonaCard
                  key={pers.id}
                  persona={pers}
                  onEdit={(p) => setEditingPersona(p)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Edit Modal */}
      <PersonaEditModal
        persona={editingPersona}
        isOpen={!!editingPersona}
        onClose={() => setEditingPersona(null)}
        onSave={handleSavePersona}
      />
    </div>
  );
}
