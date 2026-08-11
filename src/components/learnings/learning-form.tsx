'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLearnings } from '@/hooks/use-learnings';
import { learningCategoryLabels } from '@/lib/constants';
import { calculateConfidence } from '@/lib/utils/confidence-calculator';
import type { LearningCategory } from '@/lib/types/database';
import { Warning, TrendUp } from "@phosphor-icons/react";
import { cn } from '@/lib/utils';

interface LearningFormProps {
  campaignId?: string;
  sourceId?: string;
  sourceType?: 'campaign' | 'creative' | 'experiment' | 'customer' | 'manual';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LearningForm({ campaignId, sourceId, sourceType = 'campaign', open, onOpenChange, onSuccess }: LearningFormProps) {
  const targetId = sourceId || campaignId;
  const { createLearning } = useLearnings(targetId, sourceType);
  
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const [category, setCategory] = useState<LearningCategory>('marketing');
  const [tags, setTags] = useState('');
  
  // Statistical Inputs
  const [impressions, setImpressions] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [confirmations, setConfirmations] = useState(0);
  const [contradictions, setContradictions] = useState(0);

  // Dynamic Confidence Recalculation
  const confidence = useMemo(() => {
    return calculateConfidence({ impressions, conversions, confirmations, contradictions });
  }, [impressions, conversions, confirmations, contradictions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insight.trim()) {
      toast.error('Insight is required');
      return;
    }

    if (confidence.score < 50 && contradictions > 0) {
      const confirmed = window.confirm(
        'Warning: High contradictions have resulted in a low confidence score. Are you sure you want to extract this learning?'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      await createLearning({
        insight: insight.trim(),
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        source_type: sourceType,
        source_id: targetId,
        confidence_score: confidence.score,
        supporting_count: impressions,
        confirmations: confirmations,
        contradiction_count: contradictions,
        total_tests: 1 + confirmations + contradictions,
        confidence_breakdown: confidence.breakdown as Record<string, unknown>
      });
      
      toast.success('Learning captured successfully');
      
      // Reset form
      setInsight('');
      setCategory('marketing');
      setTags('');
      setImpressions(0);
      setConversions(0);
      setConfirmations(0);
      setContradictions(0);
      
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create learning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Extract Learning</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Document a validated hypothesis. Required fields determine institutional confidence weighting.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="insight" className="text-foreground">Insight Description</Label>
            <Textarea
              id="insight"
              placeholder="State exactly what was learned and how it impacts future campaigns..."
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              className="min-h-[100px] resize-none text-sm bg-muted border-border focus:border-emerald-500"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as LearningCategory)} disabled={loading}>
                <SelectTrigger id="category" className="bg-muted border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  {Object.entries(learningCategoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="focus:bg-zinc-800">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-foreground">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g. creative, hook, urgency"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
                className="bg-muted border-border focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 border border-border bg-muted/50 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm font-semibold text-foreground">Statistical Weights</span>
              <span className="text-xs text-muted-foreground">Drives automated confidence scoring</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="impressions" className="text-xs text-muted-foreground">Total Impressions</Label>
                <Input type="number" id="impressions" value={impressions} onChange={(e) => setImpressions(parseInt(e.target.value) || 0)} className="bg-card border-border h-8 text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversions" className="text-xs text-muted-foreground">Total Conversions</Label>
                <Input type="number" id="conversions" value={conversions} onChange={(e) => setConversions(parseInt(e.target.value) || 0)} className="bg-card border-border h-8 text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmations" className="text-xs text-muted-foreground">Past Confirmations</Label>
                <Input type="number" id="confirmations" value={confirmations} onChange={(e) => setConfirmations(parseInt(e.target.value) || 0)} className="bg-card border-border h-8 text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contradictions" className="text-xs text-muted-foreground">Past Contradictions</Label>
                <Input type="number" id="contradictions" value={contradictions} onChange={(e) => setContradictions(parseInt(e.target.value) || 0)} className="bg-card border-border h-8 text-xs" />
              </div>
            </div>
          </div>

          {/* Dynamic Confidence Recalculation Indicator */}
          <div className={cn(
            "p-4 rounded-xl border flex items-center justify-between",
            confidence.level === 'high' ? "bg-emerald-950/20 border-emerald-900" :
            confidence.level === 'medium' ? "bg-amber-950/20 border-amber-900" :
            "bg-rose-950/20 border-rose-900"
          )}>
            <div className="flex items-center gap-3">
              {contradictions > 0 && confidence.level === 'low' ? (
                <Warning weight="duotone" className="w-5 h-5 text-rose-500" />
              ) : (
                <TrendUp weight="duotone" className={cn(
                  "w-5 h-5",
                  confidence.level === 'high' ? "text-emerald-500" : "text-amber-500"
                )} />
              )}
              <div>
                <div className={cn(
                  "text-sm font-bold",
                  confidence.level === 'high' ? "text-emerald-500" :
                  confidence.level === 'medium' ? "text-amber-500" :
                  "text-rose-500"
                )}>
                  Confidence Score: {confidence.score}%
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Base: {confidence.breakdown.baseConfidence} | Bonus: +{confidence.breakdown.confirmationBonus} | Penalty: -{confidence.breakdown.contradictionPenalty}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="bg-transparent border-border hover:bg-zinc-800 text-foreground rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-foreground rounded-xl font-medium"
            >
              {loading ? 'Committing...' : 'Commit Learning'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
