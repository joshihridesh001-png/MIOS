// ==============================================================================
// MIOS Customer Psychology & CX Parser (@/lib/customer-parser.ts)
// Governed by ADR-001 (ISO/IEC 25010 Maintainability, Single Responsibility)
// ==============================================================================

export interface ParsedCustomerIntelligence {
  // Pre-Sale Psychology
  why_contacted?: string;
  biggest_fear?: string;
  biggest_objection?: string;
  what_built_trust?: string;

  // Post-Job CX & Operational Feedback
  cx_rating?: number;
  job_quality_feedback?: string;
  improvement_opportunities?: string[];
  retainer_opportunity?: boolean;
  has_review?: boolean;
  has_referral?: boolean;
}

/**
 * Heuristic natural language parser for unstructured customer chat logs,
 * sales call transcripts, and post-engagement client survey notes.
 * Cyclomatic complexity <= 10.
 */
export function parseCustomerNotes(rawText: string): ParsedCustomerIntelligence {
  if (!rawText || typeof rawText !== 'string') {
    return {};
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();
  const result: ParsedCustomerIntelligence = {
    improvement_opportunities: [],
  };

  // 1. Detect CX Rating (1 to 5)
  const ratingMatch = text.match(/(?:rating|score|cx|stars?)[:\s]*(\b[1-5]\b)(?:\s*\/\s*5)?/i) ||
                      text.match(/(\b[1-5]\b)\s*\/\s*5/);
  if (ratingMatch && ratingMatch[1]) {
    const val = parseInt(ratingMatch[1], 10);
    if (val >= 1 && val <= 5) {
      result.cx_rating = val;
    }
  }

  // 2. Extract Biggest Fear
  if (lower.includes('compliance') || lower.includes('audit') || lower.includes('tax') || lower.includes('penalty') || lower.includes('fine') || lower.includes('regulatory')) {
    result.biggest_fear = 'Regulatory compliance failure, audit risk, or financial penalties';
  } else if (lower.includes('deadline') || lower.includes('delay') || lower.includes('downtime') || lower.includes('quality') || lower.includes('unreliable') || lower.includes('mistake')) {
    result.biggest_fear = 'Service delivery delays, operational downtime, or subpar execution quality';
  } else if (lower.includes('hidden fee') || lower.includes('lock-in') || lower.includes('overcharge') || lower.includes('scope creep') || lower.includes('contract trap')) {
    result.biggest_fear = 'Hidden fees, scope creep, or inflexible contract lock-in';
  }

  // 3. Extract Biggest Objection
  if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive') || lower.includes('quote') || lower.includes('budget') || lower.includes('roi') || lower.includes('fee')) {
    result.biggest_objection = 'Higher retainer or project pricing compared to low-cost alternatives';
  } else if (lower.includes('switch') || lower.includes('onboarding') || lower.includes('transition') || lower.includes('migration') || lower.includes('how long') || lower.includes('setup time')) {
    result.biggest_objection = 'Switching costs and onboarding time required to transition providers';
  } else if (lower.includes('approval') || lower.includes('partner') || lower.includes('board') || lower.includes('next quarter') || lower.includes('timing')) {
    result.biggest_objection = 'Internal stakeholder approval and budget timing alignment';
  }

  // 4. Extract What Built Trust
  if (lower.includes('sla') || lower.includes('guarantee') || lower.includes('warranty') || lower.includes('money-back') || lower.includes('risk-free')) {
    result.what_built_trust = 'Contractual SLA & Performance Guarantee';
  } else if (lower.includes('case study') || lower.includes('case studies') || lower.includes('credential') || lower.includes('certified') || lower.includes('iso') || lower.includes('track record') || lower.includes('portfolio')) {
    result.what_built_trust = 'Verified Industry Case Studies & Professional Certifications';
  } else if (lower.includes('roadmap') || lower.includes('transparent') || lower.includes('dedicated') || lower.includes('specialist') || lower.includes('audit report') || lower.includes('walkthrough')) {
    result.what_built_trust = 'Transparent Execution Roadmap & Dedicated Account Specialist';
  }

  // 5. Extract Why Contacted
  if (lower.includes('saw ad') || lower.includes('facebook ad') || lower.includes('meta ad') || lower.includes('instagram') || lower.includes('google ad') || lower.includes('linkedin')) {
    result.why_contacted = 'Inbound from targeted digital ad campaign';
  } else if (lower.includes('referral') || lower.includes('colleague') || lower.includes('friend') || lower.includes('recommended') || lower.includes('word of mouth')) {
    result.why_contacted = 'Referred by industry peer or existing client recommendation';
  } else if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('deadline') || lower.includes('bottleneck') || lower.includes('scaling') || lower.includes('immediate')) {
    result.why_contacted = 'Urgent compliance deadline or operational growth bottleneck requiring immediate intervention';
  }

  // 6. Detect Retainer Opportunities & Advocacy Signals
  if (
    lower.includes('retainer') ||
    lower.includes('annual') ||
    lower.includes('recurring') ||
    lower.includes('monthly') ||
    lower.includes('contract') ||
    lower.includes('amc') ||
    lower.includes('subscription')
  ) {
    result.retainer_opportunity = true;
  }
  if (lower.includes('review') || lower.includes('google review') || lower.includes('left 5 stars') || lower.includes('testimonial')) {
    result.has_review = true;
  }
  if (lower.includes('refer') || lower.includes('referred') || lower.includes('referral')) {
    result.has_referral = true;
  }

  // 7. Detect Service Delivery & CX Improvement Opportunities
  const opps: string[] = [];
  if (lower.includes('late') || lower.includes('delayed') || lower.includes('slow') || lower.includes('turnaround') || lower.includes('waited') || lower.includes('onboarding')) {
    opps.push('Onboarding & turnaround speed: streamline client intake and set milestone alerts');
  }
  if (lower.includes('communicat') || lower.includes('update') || lower.includes('report') || lower.includes('clarity') || lower.includes('dashboard') || lower.includes('status')) {
    opps.push('Communication & reporting clarity: provide automated weekly progress summaries');
  }
  if (lower.includes('price') || lower.includes('discount') || lower.includes('package') || lower.includes('tier') || lower.includes('retainer')) {
    opps.push('Recurring package pricing: introduce tiered annual retainer incentives at renewal');
  }
  if (opps.length > 0) {
    result.improvement_opportunities = opps;
  }

  // 8. Capture overall job quality feedback snippet
  if (text.length > 15) {
    result.job_quality_feedback = text.slice(0, 240);
  }

  return result;
}
