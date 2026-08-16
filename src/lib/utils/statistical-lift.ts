/**
 * Statistical Lift Calculator
 *
 * Pure utility for calculating performance lift between a control
 * and variant value. Extracted from record-results-modal.tsx for
 * testability and reuse across the experiments module.
 *
 * Formula: Lift % = ((Variant - Control) / Control) * 100
 */

export type MetricDirection = 'higher_is_better' | 'lower_is_better';

export interface LiftResult {
  /** Raw lift percentage, null if control is zero or inputs are invalid */
  liftPercent: number | null;
  /** Absolute difference (variant - control), null if inputs are invalid */
  absoluteDifference: number | null;
  /** Whether the change represents an improvement for the given metric direction */
  isImprovement: boolean | null;
  /** Human-readable label for display, e.g. "+33.3%" or "n/a" */
  displayLabel: string;
}

/**
 * Calculates the percentage lift between a control and variant value.
 *
 * @param controlValue - The baseline (control) metric value
 * @param variantValue - The challenger (variant) metric value
 * @param metricDirection - Whether a higher or lower value is better (default: "higher_is_better")
 * @returns LiftResult with percentage, absolute diff, improvement flag, and display label
 */
export function calculateLift(
  controlValue: number | null | undefined,
  variantValue: number | null | undefined,
  metricDirection: MetricDirection = 'higher_is_better'
): LiftResult {
  // Handle null/undefined inputs
  if (controlValue == null || variantValue == null) {
    return {
      liftPercent: null,
      absoluteDifference: null,
      isImprovement: null,
      displayLabel: 'n/a',
    };
  }

  // Handle zero control (division by zero guard)
  if (controlValue === 0) {
    return {
      liftPercent: null,
      absoluteDifference: variantValue,
      isImprovement: null,
      displayLabel: 'n/a',
    };
  }

  const absoluteDifference = variantValue - controlValue;
  const liftPercent = (absoluteDifference / controlValue) * 100;

  // Round to 1 decimal for display
  const roundedLift = Math.round(liftPercent * 10) / 10;

  // Determine if the change is an improvement based on metric direction
  let isImprovement: boolean;
  if (metricDirection === 'higher_is_better') {
    isImprovement = liftPercent > 0;
  } else {
    // For lower-is-better metrics (CAC, CPC, CPM), negative lift = improvement
    isImprovement = liftPercent < 0;
  }

  const sign = roundedLift > 0 ? '+' : '';
  const displayLabel = `${sign}${roundedLift.toFixed(1)}%`;

  return {
    liftPercent,
    absoluteDifference,
    isImprovement,
    displayLabel,
  };
}
