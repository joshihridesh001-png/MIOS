'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLearnings } from '@/hooks/use-learnings';
import { learningCategoryLabels } from '@/lib/constants';
import type { LearningCategory } from '@/lib/types/database';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insight.trim()) {
      toast.error('Insight is required');
      return;
    }

    setLoading(true);
    try {
      await createLearning({
        insight: insight.trim(),
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        source_type: sourceType,
        source_id: targetId,
        confidence_score: 0,
        supporting_count: 1,
        confirmations: 0,
        total_tests: 1,
      });
      
      toast.success('Learning captured successfully');
      
      // Reset form
      setInsight('');
      setCategory('marketing');
      setTags('');
      
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
      <DialogContent className="sm:max-w-[500px] p-6 backdrop-blur-md bg-background/95">
        <DialogHeader>
          <DialogTitle className="text-xl text-emerald-500 font-semibold tracking-tight">Capture Learning</DialogTitle>
          <DialogDescription>
            What did we learn from this campaign? Document it to build institutional knowledge.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="insight">Insight</Label>
            <Textarea
              id="insight"
              placeholder="What did we learn? Be specific and actionable..."
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              className="min-h-[120px] resize-none text-base"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as LearningCategory)}
                disabled={loading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(learningCategoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g. creative, copy, q3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
            >
              {loading ? 'Saving...' : 'Save Learning'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
