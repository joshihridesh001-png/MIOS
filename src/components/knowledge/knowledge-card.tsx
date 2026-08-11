// ==============================================================================
// MIOS Knowledge Base — Knowledge Card Component (@/components/knowledge/knowledge-card.tsx)
// ==============================================================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { LearningRow } from '@/lib/types/database';
import { TiltCard } from '@/components/ui/unlumen/tilt-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, TrendUp, Tag } from "@phosphor-icons/react";
import { toast } from 'sonner';

interface KnowledgeCardProps {
  learning: LearningRow;
  onConfirm?: (id: string) => Promise<any>;
  onContradict?: (id: string) => Promise<any>;
  onDelete?: (id: string) => Promise<void>;
}

export function KnowledgeCard({
  learning,
  onConfirm,
  onContradict,
  onDelete,
}: KnowledgeCardProps) {
  const confidence = learning.confidence_score || 50;
  const confirmations = learning.confirmations || 1;
  const contradictions = learning.contradiction_count || 0;
  const avgLift = learning.avg_improvement || 0;

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-primary border-primary/50 bg-primary/10';
    if (score >= 60) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  };

  const handleConfirm = async () => {
    if (!onConfirm) return;
    toast.loading('Confirming institutional insight...');
    try {
      await onConfirm(learning.id);
      toast.success('Confidence score elevated');
    } catch (e: any) {
      toast.error('Failed to confirm insight');
    }
  };

  const handleContradict = async () => {
    if (!onContradict) return;
    toast.loading('Logging contradictory evidence...');
    try {
      await onContradict(learning.id);
      toast.success('Confidence score recalibrated');
    } catch (e: any) {
      toast.error('Failed to log contradiction');
    }
  };

  return (
    <TiltCard className="h-full">
      <div className="flex flex-col justify-between p-5 h-full bg-background/90 border border-border hover:border-zinc-700 transition-colors">
        {/* Header Metadata */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-xl font-sans font-bold text-[10px] uppercase tracking-wider bg-muted border-border text-foreground"
              >
                {learning.category.replace('_', ' ')}
              </Badge>
              <span className="font-sans font-bold text-[10px] text-muted-foreground uppercase">
                [{learning.source_type}]
              </span>
            </div>

            <Badge
              variant="outline"
              className={cn(
                'rounded-xl font-sans font-bold text-[11px] font-bold tracking-tight px-2 py-0.5',
                getConfidenceColor(confidence)
              )}
            >
              {confidence}% CONFIDENCE
            </Badge>
          </div>

          {/* Insight Core Statement */}
          <p className="text-sm font-medium text-foreground leading-relaxed font-sans">
            {learning.insight}
          </p>
        </div>

        {/* Statistical Evidence & Tags */}
        <div className="mt-6 pt-4 border-t border-border/80 space-y-4">
          <div className="flex items-center justify-between text-xs font-sans font-bold tabular-nums">
            <div className="flex items-center gap-3">
              <span className="text-primary">
                CONFIRMED: {confirmations}x
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-muted-foreground">
                CONTRADICTED: {contradictions}x
              </span>
            </div>

            {avgLift !== 0 && (
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <TrendUp weight="duotone" className="w-3.5 h-3.5" />
                <span>+{avgLift.toFixed(1)}% LIFT</span>
              </div>
            )}
          </div>

          {/* Confidence Progress Meter */}
          <div className="w-full bg-muted h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>

          {/* Tags */}
          {learning.tags && learning.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {learning.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-sans font-bold uppercase bg-muted/80 border border-border text-muted-foreground"
                >
                  <Tag weight="duotone" className="w-2.5 h-2.5 text-zinc-600" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirm}
                className="h-7 px-2.5 rounded-xl font-sans font-bold text-[10px] tracking-wider border-border bg-muted/60 hover:bg-primary/10 hover:border-[#00dbe9] hover:text-[#00dbe9] transition-all"
              >
                <Check weight="duotone" className="w-3 h-3 mr-1" />
                CONFIRM
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleContradict}
                className="h-7 px-2.5 rounded-xl font-sans font-bold text-[10px] tracking-wider border-border bg-muted/40 text-muted-foreground hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 transition-all"
              >
                <X weight="duotone" className="w-3 h-3 mr-1" />
                CONTRADICT
              </Button>
            </div>

            {onDelete && (
              <button
                onClick={() => onDelete(learning.id)}
                className="text-[10px] font-sans font-bold uppercase text-zinc-600 hover:text-rose-500 transition-colors px-2 py-1"
              >
                REMOVE
              </button>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
