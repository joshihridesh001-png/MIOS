// ==============================================================================
// MIOS Knowledge Base — Knowledge Form Modal (@/components/knowledge/knowledge-form-modal.tsx)
// Governed by ADR-001 (PestControl OS Executive Suite aesthetic)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { LearningCategory } from '@/lib/types/database';

interface KnowledgeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    insight: string;
    category: LearningCategory;
    confidence_score: number;
    avg_improvement: number;
    tags: string[];
  }) => Promise<any>;
}

const CATEGORIES: { value: LearningCategory; label: string }[] = [
  { value: 'marketing', label: 'MARKETING PRINCIPLE' },
  { value: 'sales', label: 'SALES & CLOSING PROTOCOL' },
  { value: 'customer_psychology', label: 'BUYER PSYCHOLOGY & TRUST' },
  { value: 'operations', label: 'FIELD OPERATIONS & CX' },
  { value: 'pricing', label: 'PRICING & AMC OFFERS' },
  { value: 'competitor', label: 'COMPETITOR COUNTER-TACTIC' },
];

export function KnowledgeFormModal({
  open,
  onOpenChange,
  onSubmit,
}: KnowledgeFormModalProps) {
  const [insight, setInsight] = useState('');
  const [category, setCategory] = useState<LearningCategory>('marketing');
  const [confidence, setConfidence] = useState('75');
  const [avgLift, setAvgLift] = useState('0');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insight.trim()) {
      toast.error('Institutional insight statement cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);

      await onSubmit({
        insight: insight.trim(),
        category,
        confidence_score: Math.min(100, Math.max(0, parseInt(confidence, 10) || 75)),
        avg_improvement: parseFloat(avgLift) || 0,
        tags: parsedTags,
      });

      toast.success('Institutional rule permanently logged in Knowledge Base');
      setInsight('');
      setTagsInput('');
      setAvgLift('0');
      onOpenChange(false);
    } catch (err: any) {
      toast.error('Failed to save insight: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none bg-[#0e0e0e] border border-zinc-800 text-zinc-100 max-w-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-mono text-base uppercase tracking-wider text-[#00dbe9]">
            [ + LOG INSTITUTIONAL INSIGHT / RULE ]
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 font-sans">
            Permanently record verified marketing rules, buyer psychology triggers, or operational protocols.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-mono uppercase text-zinc-400">
              INTELLIGENCE DOMAIN / CATEGORY
            </Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as LearningCategory)}
            >
              <SelectTrigger className="rounded-none bg-black border-zinc-800 text-xs font-mono uppercase">
                <SelectValue placeholder="Select Domain" />
              </SelectTrigger>
              <SelectContent className="rounded-none bg-black border-zinc-800">
                {CATEGORIES.map((c) => (
                  <SelectItem
                    key={c.value}
                    value={c.value}
                    className="font-mono text-xs uppercase"
                  >
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Insight Core Statement */}
          <div className="space-y-1.5">
            <Label className="text-xs font-mono uppercase text-zinc-400">
              CORE INSIGHT / OPERATIONAL RULE
            </Label>
            <Textarea
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              placeholder="e.g., Calling residential pest leads within 5 minutes of WhatsApp inquiry increases quote booking rate by 38%..."
              rows={4}
              className="rounded-none bg-black border-zinc-800 text-sm font-sans placeholder:text-zinc-600 focus-visible:ring-[#00dbe9]"
              required
            />
          </div>

          {/* Confidence & Avg Lift Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-zinc-400">
                INITIAL CONFIDENCE SCORE (0-100%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                className="rounded-none bg-black border-zinc-800 font-mono text-sm tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-zinc-400">
                OBSERVED / EXPECTED LIFT (%)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={avgLift}
                onChange={(e) => setAvgLift(e.target.value)}
                placeholder="e.g. 14.5"
                className="rounded-none bg-black border-zinc-800 font-mono text-sm tabular-nums"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-mono uppercase text-zinc-400">
              TAGS (COMMA SEPARATED)
            </Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="META, URGENCY, COCKROACH, AMC, INR"
              className="rounded-none bg-black border-zinc-800 font-mono text-xs uppercase"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-none border-zinc-800 font-mono text-xs uppercase hover:bg-zinc-900"
            >
              [ CANCEL ]
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-none bg-[#00dbe9] text-black hover:bg-[#00dbe9]/90 font-mono text-xs uppercase tracking-wider font-bold"
            >
              {submitting ? '[ LOGGING... ]' : '[ + COMMIT RULE TO VAULT ]'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
