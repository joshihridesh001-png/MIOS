'use client';

import { useState } from 'react';
import { Plus, Trash, Brain } from "@phosphor-icons/react";
import { useLearnings } from '@/hooks/use-learnings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { learningCategoryLabels } from '@/lib/constants';
import { LearningForm } from './learning-form';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LearningListProps {
  campaignId?: string;
  sourceId?: string;
  sourceType?: 'campaign' | 'creative' | 'experiment' | 'customer' | 'manual';
  title?: string;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-green-400';
  if (score >= 40) return 'bg-yellow-400';
  if (score >= 20) return 'bg-orange-400';
  return 'bg-red-500';
}

export function LearningList({ campaignId, sourceId, sourceType = 'campaign', title = 'Learnings & Insights' }: LearningListProps) {
  const targetId = sourceId || campaignId;
  const { learnings, loading, deleteLearning } = useLearnings(targetId, sourceType);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning?')) return;
    
    setDeletingId(id);
    try {
      await deleteLearning(id);
      toast.success('Learning deleted');
    } catch (err) {
      toast.error('Failed to delete learning');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain weight="duotone" className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-foreground transition-all shadow-sm"
          size="sm"
        >
          <Plus weight="duotone" className="h-4 w-4 mr-2" />
          Add Learning
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : learnings.length === 0 ? (
        <Card className="border-dashed border-2 bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
            <div className="bg-emerald-500/10 p-3 rounded-full">
              <Brain weight="duotone" className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="space-y-1 max-w-md">
              <p className="font-medium text-foreground">No learnings captured yet.</p>
              <p className="text-sm text-muted-foreground">
                After every campaign, ask: What did we learn? Build your institutional knowledge base to improve future performance.
              </p>
            </div>
            <Button 
              onClick={() => setIsFormOpen(true)}
              variant="outline"
              className="mt-4 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              Capture First Learning
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {learnings.map((learning) => (
            <Card 
              key={learning.id} 
              className="group overflow-hidden border-emerald-500/10 bg-card from-background -[0.02] hover:shadow-md hover:border-emerald-500/30 transition-all duration-300"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <p className="text-base font-medium leading-relaxed">
                      {learning.insight}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
                        {learningCategoryLabels[learning.category]}
                      </Badge>
                      
                      {learning.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                      
                      <div className="flex items-center gap-1.5 ml-2 text-xs text-muted-foreground border-l pl-3 border-border">
                        <div className={cn("h-2 w-2 rounded-full", getScoreColor(learning.confidence_score))} />
                        <span title="Confidence Score">Conf: {learning.confidence_score}%</span>
                      </div>
                      
                      <span className="text-xs text-muted-foreground ml-2">
                        • {formatRelativeTime(learning.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                    onClick={() => handleDelete(learning.id)}
                    disabled={deletingId === learning.id}
                  >
                    <Trash weight="duotone" className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LearningForm 
        sourceId={targetId}
        sourceType={sourceType}
        campaignId={campaignId}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  );
}
