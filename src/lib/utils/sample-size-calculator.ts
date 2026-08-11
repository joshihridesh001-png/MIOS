/**
 * Utility functions for determining statistical sample size sufficiency
 * Based on MIOS Experiments Upgrade Specification.
 */

export type PrimaryMetric = 'ctr' | 'cvr' | 'cac' | 'cpm' | 'roi' | 'other';

export interface SampleSizeCheck {
  isSufficient: boolean;
  current: number;
  required: number;
  metricType: string;
}

/**
 * Validates if the given sample size meets the required threshold for the metric.
 * 
 * Thresholds:
 * - CTR differences: 1500 impressions
 * - CVR / Lead differences: 60 conversions
 * - CAC / Customer differences: 75 customers
 * 
 * @param primaryMetric The metric being tested
 * @param impressions Number of impressions gathered
 * @param conversions Number of conversions gathered 
 * @param customers Number of customers won
 * @returns SampleSizeCheck result
 */
export function checkSampleSizeSufficiency(
  primaryMetric: PrimaryMetric,
  impressions: number,
  conversions: number,
  customers: number
): SampleSizeCheck {
  // Normalize custom metric inputs
  const metric = (primaryMetric || 'other').toLowerCase();

  switch (metric) {
    case 'ctr':
      // 1000 - 2000 impressions required. We use 1500 as the baseline minimum.
      return {
        isSufficient: impressions >= 1500,
        current: impressions,
        required: 1500,
        metricType: 'Impressions'
      };
      
    case 'cvr':
      // 40 - 80 conversions required. We use 60 as the baseline minimum.
      return {
        isSufficient: conversions >= 60,
        current: conversions,
        required: 60,
        metricType: 'Conversions'
      };
      
    case 'cac':
    case 'roi':
      // 50 - 100 customers required. We use 75 as the baseline minimum.
      return {
        isSufficient: customers >= 75,
        current: customers,
        required: 75,
        metricType: 'Customers'
      };
      
    default:
      // Fallback relies on impressions
      return {
        isSufficient: impressions >= 1500,
        current: impressions,
        required: 1500,
        metricType: 'Impressions'
      };
  }
}
