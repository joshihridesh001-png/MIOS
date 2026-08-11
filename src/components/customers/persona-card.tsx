// ==============================================================================
// MIOS Active Buyer Persona & Creative Collaborator Card (@/components/customers/persona-card.tsx)
// Governed by ADR-001 (ISO/IEC 25010 Maintainability, Single Responsibility)
// ==============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { BuyerPersonaRow } from '@/lib/types/database';
import { metricFormatters } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TiltCard, AnimatedList } from '@/components/ui/unlumen';

interface PersonaCardProps {
  persona: BuyerPersonaRow;
  onEdit?: (persona: BuyerPersonaRow) => void;
}

export function PersonaCard({ persona, onEdit }: PersonaCardProps) {
  const angles = persona.recommended_creative_angles || [];

  return (
    <TiltCard className="border border-border/60 bg-card/90 backdrop-blur-xl rounded-xl p-6 space-y-6 font-sans font-bold">
      {/* 1. Header & Edit Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-xl border-primary text-primary uppercase text-xs">
              {persona.property_type}
            </Badge>
            {persona.pest_type && (
              <Badge variant="outline" className="rounded-xl border-gray-300 text-muted-foreground uppercase text-xs">
                {persona.pest_type}
              </Badge>
            )}
            {persona.is_custom && (
              <Badge variant="outline" className="rounded-xl border-amber-500 text-amber-400 text-[10px]">
                CUSTOM OVERRIDE
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold uppercase text-on-background mt-2">
            {persona.name}
          </h3>
        </div>
        {onEdit && (
          <Button
            onClick={() => onEdit(persona)}
            variant="outline"
            className="rounded-xl border-border hover:border-[#00dbe9] hover:text-[#00dbe9] text-xs font-bold uppercase"
          >
            [ EDIT PERSONA ]
          </Button>
        )}
      </div>

      {/* 2. Statistical Sample & Economics Bar */}
      <div className="grid grid-cols-3 gap-4 border border-border/30 p-4 bg-secondary-fixed/20 text-center">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Sample Size</span>
          <span className="text-sm font-bold text-on-background tabular-nums">
            {persona.sample_size} records
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Average LTV</span>
          <span className="text-sm font-bold text-primary tabular-nums">
            {metricFormatters.formatCurrency(persona.avg_ltv || 0)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Avg CX Rating</span>
          <span className="text-sm font-bold text-emerald-400 tabular-nums">
            {persona.avg_cx_rating || '4.80'}/5
          </span>
        </div>
      </div>

      {/* 3. Pre-Sale Psychology Clusters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border/30 p-3 bg-card/60">
          <span className="text-[10px] text-rose-400 uppercase font-bold block mb-2">Dominant Buyer Fears</span>
          <ul className="space-y-1">
            {persona.dominant_fears.map((fear, idx) => (
              <li key={idx} className="text-xs text-on-background font-sans">
                • {fear}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-border/30 p-3 bg-card/60">
          <span className="text-[10px] text-amber-400 uppercase font-bold block mb-2">Dominant Objections</span>
          <ul className="space-y-1">
            {persona.dominant_objections.map((obj, idx) => (
              <li key={idx} className="text-xs text-on-background font-sans">
                • {obj}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-border/30 p-3 bg-card/60">
          <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-2">What Builds Trust</span>
          <ul className="space-y-1">
            {persona.trust_builders.map((trust, idx) => (
              <li key={idx} className="text-xs text-on-background font-sans">
                • {trust}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Active Creative Collaborator Panel (Core Feature) */}
      <div className="border border-primary/40 bg-primary/5 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-primary/20 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase text-primary tracking-wider">
              [ ACTIVE GROWTH EXPERIMENT COLLABORATOR (LABS) ]
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Systematic growth hypotheses and ad angle vectors synthesized from buyer fears & objections to test in LABS.
            </p>
          </div>
          <Badge variant="outline" className="rounded-xl border-primary text-primary text-[10px]">
            {angles.length} HYPOTHESES READY
          </Badge>
        </div>

        <AnimatedList className="space-y-3" staggerDelay={45}>
          {angles.map((ang, idx) => (
            <div
              key={idx}
              className="border border-border/40 bg-card/90 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-xl border-gray-300 text-muted-foreground text-[10px] uppercase">
                    {ang.emotion}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    {ang.psych_principle}
                  </span>
                </div>
                <p className="text-xs font-bold text-on-background mt-1 font-sans">
                  &ldquo;{ang.hook}&rdquo;
                </p>
                <p className="text-[11px] text-muted-foreground font-sans italic">
                  Rationale: {ang.rationale}
                </p>
              </div>
              <div>
                <Link
                  href={`/experiments/new?name=${encodeURIComponent('BUYER ANGLE TEST: ' + ang.headline)}&hypothesis=${encodeURIComponent('$ IF buyer_fear == "' + ang.emotion + '" THEN test("' + ang.hook + '") WILL increase(cvr) BY 25%')}&variant=${encodeURIComponent('Angle: ' + ang.headline)}`}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/80 text-[11px] whitespace-nowrap"
                  >
                    [ LAUNCH EXPERIMENT ]
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </AnimatedList>
      </div>

      {/* 5. Operational CX Improvement Feed */}
      <div className="border-t border-border/40 pt-4">
        <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-2">
          Top Operational CX Improvement Opportunities (Service & Job Quality)
        </span>
        {persona.top_improvement_opportunities && persona.top_improvement_opportunities.length > 0 ? (
          <div className="space-y-1">
            {persona.top_improvement_opportunities.map((opp, idx) => (
              <div key={idx} className="text-xs text-on-background font-sans flex items-center gap-2">
                <span className="text-primary">⚡</span> {opp}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No recurring operational complaints or CX issues detected.</p>
        )}
      </div>
    </TiltCard>
  );
}
