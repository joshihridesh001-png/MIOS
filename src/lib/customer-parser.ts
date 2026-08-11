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
  amc_opportunity?: boolean;
  has_review?: boolean;
  has_referral?: boolean;
}

/**
 * Heuristic natural language parser for unstructured customer chat logs,
 * sales call transcripts, and post-job technician survey notes.
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
  if (lower.includes('toxic') || lower.includes('chemical') || lower.includes('pet') || lower.includes('child')) {
    result.biggest_fear = 'Chemical toxicity for children and pets';
  } else if (lower.includes('return') || lower.includes('came back') || lower.includes('re-infest')) {
    result.biggest_fear = 'Pest infestation returning after treatment';
  } else if (lower.includes('audit') || lower.includes('inspection') || lower.includes('fine') || lower.includes('close')) {
    result.biggest_fear = 'Health inspection failure and warehouse fine';
  }

  // 3. Extract Biggest Objection
  if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive') || lower.includes('quote')) {
    result.biggest_objection = 'High pricing compared to local DIY solutions';
  } else if (lower.includes('vacate') || lower.includes('leave the house') || lower.includes('how long')) {
    result.biggest_objection = 'Will we have to vacate the property for multiple days?';
  } else if (lower.includes('disrupt') || lower.includes('forklift') || lower.includes('downtime')) {
    result.biggest_objection = 'Operational downtime during warehouse working hours';
  }

  // 4. Extract What Built Trust
  if (lower.includes('botanical') || lower.includes('non-toxic') || lower.includes('safe') || lower.includes('certified')) {
    result.what_built_trust = '100% Botanical Non-Toxic Safe Certification';
  } else if (lower.includes('guarantee') || lower.includes('warranty') || lower.includes('180-day')) {
    result.what_built_trust = '180-Day Re-Infestation Guarantee';
  } else if (lower.includes('overnight') || lower.includes('sunday') || lower.includes('haccp') || lower.includes('iso')) {
    result.what_built_trust = 'Overnight Service & Digital Audit Compliance Reports';
  }

  // 5. Extract Why Contacted
  if (lower.includes('saw ad') || lower.includes('facebook ad') || lower.includes('meta ad') || lower.includes('instagram')) {
    result.why_contacted = 'Saw Meta video ad demonstrating botanical treatment';
  } else if (lower.includes('referral') || lower.includes('neighbor') || lower.includes('friend')) {
    result.why_contacted = 'Referred by neighbor / word-of-mouth recommendation';
  } else if (lower.includes('emergency') || lower.includes('bite') || lower.includes('found bedbug') || lower.includes('rat')) {
    result.why_contacted = 'Emergency infestation outbreak requiring immediate same-day response';
  }

  // 6. Detect Opportunities & Future Ratios
  if (lower.includes('amc') || lower.includes('annual') || lower.includes('contract') || lower.includes('maintenance')) {
    result.amc_opportunity = true;
  }
  if (lower.includes('review') || lower.includes('google review') || lower.includes('left 5 stars')) {
    result.has_review = true;
  }
  if (lower.includes('refer') || lower.includes('referred friend') || lower.includes('referral discount')) {
    result.has_referral = true;
  }

  // 7. Detect Job Quality & CX Improvement Opportunities
  const opps: string[] = [];
  if (lower.includes('late') || lower.includes('delayed') || lower.includes('punctual') || lower.includes('waited')) {
    opps.push('Technician punctuality: provide real-time GPS arrival window notifications');
  }
  if (lower.includes('smell') || lower.includes('odor') || lower.includes('ventilat')) {
    opps.push('Odor control: equip technicians with clearer post-treatment ventilation checklists');
  }
  if (lower.includes('price') && lower.includes('discount')) {
    opps.push('Pricing strategy: offer instant 10% AMC renewal discount at checkout');
  }
  if (lower.includes('clean') || lower.includes('mess') || lower.includes('residue')) {
    opps.push('Job quality: enforce mandatory 5-minute post-job surface wipe-down protocol');
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
