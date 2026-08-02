// ==============================================================================
// MIOS Persona & Creative Collaborator Engine (@/lib/persona-engine.ts)
// Governed by ADR-001 (ISO/IEC 25010 Reliability, Single Responsibility)
// ==============================================================================

import {
  BuyerPersonaRow,
  CreativeRow,
  CustomerRow,
  RecommendedCreativeAngle,
} from './types/database';

export interface CreativePersonaRating {
  score: number; // 0 to 100
  matchReasons: string[];
  isRecommended: boolean;
}

/**
 * Synthesizes actionable ad creative angles from dominant fears and objections.
 * Cyclomatic complexity <= 10.
 */
export function synthesizeCreativeAngles(
  fears: string[],
  objections: string[],
  trustBuilders: string[]
): RecommendedCreativeAngle[] {
  const angles: RecommendedCreativeAngle[] = [];

  const topFear = fears.length > 0 ? fears[0] : 'Chemical toxicity for children and pets';
  const topObjection = objections.length > 0 ? objections[0] : 'High price compared to local DIY sprays';
  const topTrust = trustBuilders.length > 0 ? trustBuilders[0] : '100% Botanical Non-Toxic Certification';

  // Angle 1: Fear-Driven Protection Hook
  angles.push({
    hook: `Worried about ${topFear.toLowerCase()}? Never spray harsh toxic chemicals in your home again.`,
    headline: `100% Kid & Pet Safe Botanical Eradication — ${topTrust}.`,
    emotion: 'fear',
    psych_principle: 'Loss Aversion & Protection Instinct',
    rationale: `Directly targets the primary buyer fear (${topFear}) while offering immediate psychological relief via ${topTrust}.`,
  });

  // Angle 2: Authority & Objection Overcome
  angles.push({
    hook: `Why cheap pest sprays fail in 2 weeks (and how to fix it permanently).`,
    headline: `Professional Pest Protection — Guaranteed or Your Next Treatment is Free.`,
    emotion: 'authority',
    psych_principle: 'Education & Price Comparison Framing',
    rationale: `Deconstructs ${topObjection.toLowerCase()} by contrasting DIY failure against professional reliability.`,
  });

  // Angle 3: Social Proof & Guarantee
  angles.push({
    hook: `Over 500 local properties trust our ${topTrust} every month.`,
    headline: `Zero Odor. Zero Mess. 180-Day Permanent Elimination Shield.`,
    emotion: 'trust',
    psych_principle: 'Social Proof & Risk Elimination',
    rationale: `Builds executive confidence and eliminates purchase friction for cautious buyers.`,
  });

  return angles;
}

/**
 * Systematically rates an existing ad creative against a Buyer Persona's
 * psychological profile (Fears, Objections, Trust Builders).
 * Returns an efficiency match score (0-100) and explicit match reasons.
 */
export function rateCreativeForPersona(
  creative: CreativeRow,
  persona: BuyerPersonaRow
): CreativePersonaRating {
  let score = 40; // Base score
  const matchReasons: string[] = [];

  const textToScan = `${creative.name} ${creative.headline || ''} ${creative.primary_text || ''} ${creative.hook_hypothesis || ''}`.toLowerCase();

  // Check against dominant fears
  for (const fear of persona.dominant_fears) {
    const keywords = fear.toLowerCase().split(' ').filter((w) => w.length > 4);
    for (const kw of keywords) {
      if (textToScan.includes(kw)) {
        score += 15;
        matchReasons.push(`Directly addresses buyer fear keyword: "${kw}"`);
        break;
      }
    }
  }

  // Check against trust builders
  for (const trust of persona.trust_builders) {
    const keywords = trust.toLowerCase().split(' ').filter((w) => w.length > 4);
    for (const kw of keywords) {
      if (textToScan.includes(kw)) {
        score += 15;
        matchReasons.push(`Reinforces trust builder: "${kw}"`);
        break;
      }
    }
  }

  // Check if creative angle matches fear_urgency or authority_guarantee
  if (creative.angle === 'fear_urgency' && persona.dominant_fears.length > 0) {
    score += 10;
    matchReasons.push('Creative angle "Fear & Urgency" aligns with high-anxiety pest buyer');
  } else if (creative.angle === 'authority_guarantee' && persona.trust_builders.length > 0) {
    score += 10;
    matchReasons.push('Creative angle "Authority & Guarantee" supports executive trust requirements');
  }

  const finalScore = Math.min(100, Math.max(0, score));
  return {
    score: finalScore,
    matchReasons: matchReasons.length > 0 ? matchReasons : ['Standard baseline creative match'],
    isRecommended: finalScore >= 70,
  };
}

/**
 * Computes live aggregation metrics (LTV, CX Rating, Top Improvement Opportunities)
 * from an array of customer records for a specific Persona cluster.
 */
export function computePersonaStats(customers: CustomerRow[]): {
  sampleSize: number;
  avgLtv: number;
  avgCx: number;
  topOpportunities: string[];
} {
  if (!customers || customers.length === 0) {
    return { sampleSize: 0, avgLtv: 0, avgCx: 0, topOpportunities: [] };
  }

  let totalLtv = 0;
  let totalCx = 0;
  let cxCount = 0;
  const oppCounts: Record<string, number> = {};

  for (const c of customers) {
    totalLtv += Number(c.ltv || 0);
    if (c.cx_rating && c.cx_rating >= 1 && c.cx_rating <= 5) {
      totalCx += Number(c.cx_rating);
      cxCount += 1;
    }
    if (Array.isArray(c.improvement_opportunities)) {
      for (const opp of c.improvement_opportunities) {
        oppCounts[opp] = (oppCounts[opp] || 0) + 1;
      }
    }
  }

  const sortedOpps = Object.entries(oppCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([opp]) => opp)
    .slice(0, 3);

  return {
    sampleSize: customers.length,
    avgLtv: Math.round((totalLtv / customers.length) * 100) / 100,
    avgCx: cxCount > 0 ? Math.round((totalCx / cxCount) * 100) / 100 : 0,
    topOpportunities: sortedOpps,
  };
}
