// ==============================================================================
// MIOS Customer Psychology & CX Feedback Card (@/components/customers/customer-psychology-card.tsx)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { CustomerRow } from '@/lib/types/database';
import { useLearnings } from '@/hooks/use-learnings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CustomerPsychologyCardProps {
  customer: CustomerRow;
}

export function CustomerPsychologyCard({ customer }: CustomerPsychologyCardProps) {
  const { createLearning } = useLearnings(customer.id, 'customer');
  const [promoting, setPromoting] = useState(false);

  const handlePromoteToLearning = async () => {
    try {
      setPromoting(true);
      const insightText = `Buyer Psychology (${customer.property_type.toUpperCase()}): Contacted due to "${
        customer.why_contacted || 'Infestation trigger'
      }". Biggest fear was "${customer.biggest_fear || 'Chemical toxicity'}". Overcame objection "${
        customer.biggest_objection || 'Price'
      }" via "${customer.what_built_trust || 'Botanical guarantee'}".`;

      const newLearning = await createLearning({
        insight: insightText,
        source_type: 'customer',
        source_id: customer.id,
        category: 'customer_psychology',
        confidence_score: 85,
        supporting_count: 1,
        confirmations: 1,
        total_tests: 1,
        contradiction_count: 0,
        avg_improvement: 15,
        is_active: true,
        tags: ['customer_psychology', customer.property_type, 'verified_buyer'],
      });

      if (newLearning) {
        toast.success('Promoted to Organizational Knowledge Base!', {
          description: 'Insight is now compounding across all future campaigns and creatives.',
        });
      } else {
        throw new Error('Failed to create learning record');
      }
    } catch (err: unknown) {
      console.error('[CustomerPsychologyCard] Error promoting learning:', err);
      toast.error('Failed to promote learning', {
        description: err instanceof Error ? err.message : 'Please check database permissions.',
      });
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="bg-card border border-border shadow-sm border-none p-4 rounded-xl p-6 space-y-6 font-sans font-bold">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h3 className="text-sm font-bold tracking-wider uppercase text-primary">
            PRE-SALE CONSUMER PSYCHOLOGY & POST-JOB CX
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Buyer trigger analysis, objection handling & quality improvement DATA
          </p>
        </div>
        <Button
          onClick={handlePromoteToLearning}
          disabled={promoting}
          className="rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/80 text-xs px-4"
        >
          {promoting ? 'PROMOTING...' : 'PROMOTE TO LEARNING'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Pre-Sale Psychology */}
        <div className="space-y-4 border border-border/30 p-4 bg-secondary-fixed/10">
          <div className="text-xs font-bold uppercase text-on-background border-b border-border/30 pb-2">
            Pre-Sale Acquisition Triggers
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Why Contacted Us (Trigger)</span>
            <p className="text-xs text-on-background mt-1 font-sans">
              {customer.why_contacted || 'No trigger recorded'}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-rose-400 uppercase block">Biggest Buyer Fear</span>
            <p className="text-xs text-on-background mt-1 font-sans">
              {customer.biggest_fear || 'No primary fear recorded'}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-amber-400 uppercase block">Biggest Objection Overcome</span>
            <p className="text-xs text-on-background mt-1 font-sans">
              {customer.biggest_objection || 'No primary objection recorded'}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-emerald-400 uppercase block">What Built Executive Trust</span>
            <p className="text-xs text-on-background mt-1 font-sans">
              {customer.what_built_trust || 'No trust builder recorded'}
            </p>
          </div>
        </div>

        {/* Right Column: Post-Job CX & Operational Feedback */}
        <div className="space-y-4 border border-border/30 p-4 bg-secondary-fixed/10">
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <span className="text-xs font-bold uppercase text-on-background">
              Post-Job CX DATA
            </span>
            <span className={`px-2 py-0.5 text-xs font-bold ${
              customer.cx_rating && customer.cx_rating >= 4 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              customer.cx_rating && customer.cx_rating <= 2 ? 'bg-rose-950 text-rose-400 border border-rose-800' :
              'bg-secondary-fixed text-muted-foreground'
            }`}>
              CX SCORE: {customer.cx_rating || 'N/A'}/5
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Job Quality Feedback</span>
            <p className="text-xs text-on-background mt-1 font-sans italic">
              {customer.job_quality_feedback ? `"${customer.job_quality_feedback}"` : 'No technician survey debrief recorded.'}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-primary uppercase block mb-2">CX Improvement Opportunities</span>
            {customer.improvement_opportunities && customer.improvement_opportunities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {customer.improvement_opportunities.map((opp, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-xl border-primary/50 text-on-background text-[11px] font-sans"
                  >
                    • {opp}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No operational opportunities flagged.</span>
            )}
          </div>

          <div className="pt-2 border-t border-border/20 flex flex-wrap gap-3">
            {customer.amc_opportunity && (
              <Badge variant="outline" className="rounded-xl border-primary text-primary text-xs">
                AMC CONTRACT POTENTIAL
              </Badge>
            )}
            {customer.has_review && (
              <Badge variant="outline" className="rounded-xl border-emerald-600 text-emerald-400 text-xs">
                5-STAR REVIEW VERIFIED
              </Badge>
            )}
            {customer.has_referral && (
              <Badge variant="outline" className="rounded-xl border-blue-600 text-blue-400 text-xs">
                REFERRAL SOURCE
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
