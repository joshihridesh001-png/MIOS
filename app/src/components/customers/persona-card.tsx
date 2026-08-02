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

interface PersonaCardProps {
  persona: BuyerPersonaRow;
  onEdit?: (persona: BuyerPersonaRow) => void;
}

export function PersonaCard({ persona, onEdit }: PersonaCardProps) {
  const angles = persona.recommended_creative_angles || [];

  return (
    <div className="border border-border/60 bg-card/90 backdrop-blur-xl rounded-none p-6 space-y-6 font-mono">
      {/* 1. Header & Edit Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-none border-[#00dbe9] text-[#00dbe9] uppercase text-xs">
              {persona.property_type}
            </Badge>
            {persona.pest_type && (
              <Badge variant="outline" className="rounded-none border-gray-300 text-gray-300 uppercase text-xs">
                {persona.pest_type}
              </Badge>
            )}
            {persona.is_custom && (
              <Badge variant="outline" className="rounded-none border-amber-500 text-amber-400 text-[10px]">
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
            className="rounded-none border-border hover:border-[#00dbe9] hover:text-[#00dbe9] text-xs font-bold uppercase"
          >
            [ EDIT PERSONA ]
          </Button>
        )}
      </div>

      {/* 2. Statistical Sample & Economics Bar */}
      <div className="grid grid-cols-3 gap-4 border border-border/30 p-4 bg-secondary-fixed/20 text-center">
        <div>
          <span className="text-[10px] text-gray-300 uppercase block">Sample Size</span>
          <span className="text-sm font-bold text-on-background tabular-nums">
            {persona.sample_size} records
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-300 uppercase block">Average LTV</span>
          <span className="text-sm font-bold text-[#00dbe9] tabular-nums">
            {metricFormatters.formatCurrency(persona.avg_ltv || 0)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-300 uppercase block">Avg CX Rating</span>
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
      <div className="border border-[#00dbe9]/40 bg-[#00dbe9]/5 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#00dbe9]/20 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase text-[#00dbe9] tracking-wider">
              [ ACTIVE CREATIVE ANGLE COLLABORATOR ]
            </h4>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Systematic ad angles synthesized from this persona&apos;s fears and objections.
            </p>
          </div>
          <Badge variant="outline" className="rounded-none border-[#00dbe9] text-[#00dbe9] text-[10px]">
            {angles.length} ANGLES READY
          </Badge>
        </div>

        <div className="space-y-3">
          {angles.map((ang, idx) => (
            <div
              key={idx}
              className="border border-border/40 bg-card/90 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-none border-gray-300 text-gray-300 text-[10px] uppercase">
                    {ang.emotion}
                  </Badge>
                  <span className="text-[10px] text-gray-300 uppercase font-semibold">
                    {ang.psych_principle}
                  </span>
                </div>
                <p className="text-xs font-bold text-on-background mt-1 font-sans">
                  &ldquo;{ang.hook}&rdquo;
                </p>
                <p className="text-[11px] text-gray-300 font-sans italic">
                  Rationale: {ang.rationale}
                </p>
              </div>
              <div>
                <Link
                  href={`/creatives/new?hook=${encodeURIComponent(ang.hook)}&headline=${encodeURIComponent(ang.headline)}&angle=${ang.emotion === 'fear' ? 'fear_urgency' : 'authority_guarantee'}`}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-none bg-[#00dbe9] text-black font-bold uppercase tracking-wider hover:bg-[#00dbe9]/80 text-[11px] whitespace-nowrap"
                  >
                    [ BUILD CREATIVE ]
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Operational CX Improvement Feed */}
      <div className="border-t border-border/40 pt-4">
        <span className="text-[10px] text-gray-300 uppercase font-bold block mb-2">
          Top Operational CX Improvement Opportunities (Service & Job Quality)
        </span>
        {persona.top_improvement_opportunities && persona.top_improvement_opportunities.length > 0 ? (
          <div className="space-y-1">
            {persona.top_improvement_opportunities.map((opp, idx) => (
              <div key={idx} className="text-xs text-on-background font-sans flex items-center gap-2">
                <span className="text-[#00dbe9]">⚡</span> {opp}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-300">No recurring operational complaints or CX issues detected.</p>
        )}
      </div>
    </div>
  );
}
