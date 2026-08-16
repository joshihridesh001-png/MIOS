export type PrimaryMetric = 'ctr' | 'cvr' | 'cac' | 'cpm' | 'roi' | 'roas' | 'other' | string;

export interface VariantSamples {
  impressions: number;
  conversions: number;
  customers: number;
}

export interface SampleSizeGuidance {
  isSufficient: boolean;
  current: number;
  recommended: number;
  metricLabel: string;
  warningLevel: 'none' | 'low' | 'high';
  message: string;
}

/**
 * Validates if the given sample size meets the required threshold for the metric.
 * Uses the minimum sample size across all active variants (including control)
 * as the limiting factor for statistical significance.
 */
export function checkSampleSizeSufficiency(
  primaryMetric: PrimaryMetric,
  control: VariantSamples,
  variants: VariantSamples[]
): SampleSizeGuidance {
  const metric = (primaryMetric || 'other').toLowerCase();

  const allActiveGroups = [control, ...variants];

  // Find the minimum sample sizes across all groups (weakest link)
  const minImpressions = Math.min(...allActiveGroups.map(g => g.impressions));
  const minConversions = Math.min(...allActiveGroups.map(g => g.conversions));
  const minCustomers = Math.min(...allActiveGroups.map(g => g.customers));

  switch (metric) {
    case 'ctr':
    case 'cpm': {
      const recommended = 1500;
      const isSufficient = minImpressions >= recommended;
      return {
        isSufficient,
        current: minImpressions,
        recommended,
        metricLabel: 'impressions',
        warningLevel: isSufficient ? 'none' : (minImpressions < 500 ? 'high' : 'low'),
        message: isSufficient
          ? 'Sufficient impressions collected for CTR/CPM analysis.'
          : `Need more impressions. Aim for ${recommended.toLocaleString()} per variant to trust the difference (current lowest: ${minImpressions.toLocaleString()}).`
      };
    }
    case 'cvr':
    case 'leads': {
      const recommended = 60;
      const isSufficient = minConversions >= recommended;
      return {
        isSufficient,
        current: minConversions,
        recommended,
        metricLabel: 'conversions',
        warningLevel: isSufficient ? 'none' : (minConversions < 20 ? 'high' : 'low'),
        message: isSufficient
          ? 'Sufficient conversions collected for CVR analysis.'
          : `Need more conversions. Aim for ${recommended} per variant to trust the conversion rate difference (current lowest: ${minConversions}).`
      };
    }
    case 'cac':
    case 'roi':
    case 'roas': {
      const recommended = 75;
      const isSufficient = minCustomers >= recommended;
      return {
        isSufficient,
        current: minCustomers,
        recommended,
        metricLabel: 'customers',
        warningLevel: isSufficient ? 'none' : (minCustomers < 25 ? 'high' : 'low'),
        message: isSufficient
          ? 'Sufficient customers acquired for financial analysis.'
          : `Need more customers. Aim for ${recommended} per variant to trust the financial metrics (current lowest: ${minCustomers}).`
      };
    }
    default: {
      const recommended = 1500;
      const isSufficient = minImpressions >= recommended;
      return {
        isSufficient,
        current: minImpressions,
        recommended,
        metricLabel: 'impressions',
        warningLevel: isSufficient ? 'none' : (minImpressions < 500 ? 'high' : 'low'),
        message: isSufficient
          ? 'Sufficient baseline sample collected.'
          : `Need more data. Aim for at least ${recommended.toLocaleString()} impressions per variant for general analysis (current lowest: ${minImpressions.toLocaleString()}).`
      };
    }
  }
}

/**
 * Returns a practical planning-time suggestion for the given metric.
 */
export function getPlanningSuggestion(primaryMetric: PrimaryMetric): string {
  const metric = (primaryMetric || 'other').toLowerCase();
  switch (metric) {
    case 'ctr':
    case 'cpm':
      return 'Target: 1,000–2,000 impressions per variant to measure click differences reliably.';
    case 'cvr':
    case 'leads':
      return 'Target: 40–80 conversions per variant to measure conversion rate differences reliably.';
    case 'cac':
    case 'roi':
    case 'roas':
      return 'Target: 50–100 customers per variant to measure financial impact and CAC reliably.';
    default:
      return 'Target: At least 1,500 impressions per variant for a reliable general test.';
  }
}
