// ==============================================================================
// MIOS Persona Executive Edit Modal (@/components/customers/persona-edit-modal.tsx)
// Governed by ADR-001 (ISO/IEC 25010 Reliability, Explicit Input Validation)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { BuyerPersonaRow, BuyerPersonaUpdate } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PersonaEditModalProps {
  persona: BuyerPersonaRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, update: BuyerPersonaUpdate) => Promise<void>;
}

export function PersonaEditModal({ persona, isOpen, onClose, onSave }: PersonaEditModalProps) {
  const [fears, setFears] = useState(persona?.dominant_fears.join('\n') || '');
  const [objections, setObjections] = useState(persona?.dominant_objections.join('\n') || '');
  const [trust, setTrust] = useState(persona?.trust_builders.join('\n') || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !persona) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedFears = fears.split('\n').map((s) => s.trim()).filter(Boolean);
      const updatedObjections = objections.split('\n').map((s) => s.trim()).filter(Boolean);
      const updatedTrust = trust.split('\n').map((s) => s.trim()).filter(Boolean);

      await onSave(persona.id, {
        dominant_fears: updatedFears,
        dominant_objections: updatedObjections,
        trust_builders: updatedTrust,
        is_custom: true,
      });

      toast.success('Persona Customized Successfully!', {
        description: 'Executive overrides applied to psychological cluster.',
      });
      onClose();
    } catch (err: unknown) {
      console.error('[PersonaEditModal] Error saving persona:', err);
      toast.error('Failed to update persona');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl border border-border/60 bg-card p-6 rounded-xl space-y-6 font-sans font-bold">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="text-sm font-bold uppercase text-primary">
            [ EXECUTIVE PERSONA OVERRIDE: {persona.name} ]
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white text-lg font-bold">
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label className="text-xs uppercase text-rose-400">Dominant Fears (One per line)</Label>
            <Textarea
              rows={3}
              value={fears}
              onChange={(e) => setFears(e.target.value)}
              className="rounded-xl text-xs mt-1"
            />
          </div>

          <div>
            <Label className="text-xs uppercase text-amber-400">Dominant Objections (One per line)</Label>
            <Textarea
              rows={3}
              value={objections}
              onChange={(e) => setObjections(e.target.value)}
              className="rounded-xl text-xs mt-1"
            />
          </div>

          <div>
            <Label className="text-xs uppercase text-emerald-400">Trust Builders (One per line)</Label>
            <Textarea
              rows={3}
              value={trust}
              onChange={(e) => setTrust(e.target.value)}
              className="rounded-xl text-xs mt-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs uppercase"
            >
              [ CANCEL ]
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary text-primary-foreground font-bold uppercase hover:bg-primary/80 text-xs px-6"
            >
              {saving ? '[ SAVING... ]' : '[ APPLY OVERRIDES ]'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
