/**
 * MIOS MVP Confidence Algorithm
 * Calculates the exact weighted statistical confidence of any extracted learning.
 */

export interface ConfidenceFactors {
  impressions: number;
  conversions: number;
  confirmations: number;
  contradictions: number;
}

export interface ConfidenceResult {
  score: number;
  level: 'low' | 'medium' | 'high';
  breakdown: {
    baseConfidence: number;
    confirmationBonus: number;
    contradictionPenalty: number;
  };
}

/**
 * Calculates the exact confidence score (0-100) based on the MIOS MVP formula.
 */
export function calculateConfidence(factors: ConfidenceFactors): ConfidenceResult {
  // Base formula: (impressions / 10,000 * 40) + (conversions / 100 * 40)
  // Max base is 80.
  const impScore = (factors.impressions / 10000) * 40;
  const convScore = (factors.conversions / 100) * 40;
  const baseConfidence = Math.min(impScore + convScore, 80);

  // Confirmation bonus: +10% per subsequent confirmation, max +20%
  const confirmationBonus = Math.min(factors.confirmations * 10, 20);

  // Contradiction penalty: -25% per contradiction (uncapped penalty)
  const contradictionPenalty = factors.contradictions * 25;

  // Final score bounded between 0 and 100
  const score = Math.max(Math.min(baseConfidence + confirmationBonus - contradictionPenalty, 100), 0);
  
  // Strict rounding
  const finalScore = Math.round(score);

  let level: 'low' | 'medium' | 'high' = 'low';
  if (finalScore >= 80) level = 'high';
  else if (finalScore >= 50) level = 'medium';

  return {
    score: finalScore,
    level,
    breakdown: {
      baseConfidence: Math.round(baseConfidence),
      confirmationBonus: Math.round(confirmationBonus),
      contradictionPenalty: Math.round(contradictionPenalty),
    }
  };
}
