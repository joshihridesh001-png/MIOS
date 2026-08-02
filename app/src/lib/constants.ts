import { 
  PlatformType, 
  CampaignStatus, 
  ConfidenceLevel, 
  LearningCategory, 
  LearningSource,
  CreativeFormat,
  CreativeStatus,
  CreativeAngle
} from './types/database';

export const platformLabels: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  whatsapp: 'WhatsApp',
  organic_social: 'Organic Social',
  offline: 'Offline',
  other: 'Other',
};

export const platformIcons: Record<string, string> = {
  meta_ads: 'META',
  google_ads: 'GOOG',
  whatsapp: 'WA',
  organic_social: 'SOC',
  offline: 'OFF',
  other: 'OTH',
};

export const statusLabels: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

export const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-emerald-500/15 text-emerald-500',
  paused: 'bg-amber-500/15 text-amber-500',
  completed: 'bg-blue-500/15 text-blue-500',
  archived: 'bg-muted text-muted-foreground',
};

export const confidenceLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const confidenceColors: Record<string, string> = {
  low: 'text-amber-500',
  medium: 'text-blue-500',
  high: 'text-emerald-500',
};

export const learningCategoryLabels: Record<string, string> = {
  marketing: 'Marketing',
  sales: 'Sales',
  operations: 'Operations',
  customer_psychology: 'Customer Psychology',
  pricing: 'Pricing',
  competitor: 'Competitor',
  other: 'Other',
};

export const learningSourceLabels: Record<string, string> = {
  campaign: 'Campaign',
  creative: 'Creative',
  experiment: 'Experiment',
  customer: 'Customer',
  manual: 'Manual',
};

export const metricFormatters = {
  formatCurrency: (value: number | null | undefined) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  },
  formatPercent: (value: number | null | undefined) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'percent',
      maximumFractionDigits: 2,
    }).format(value / 100);
  },
  formatNumber: (value: number | null | undefined) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);
  },
  formatRoas: (value: number | null | undefined) => {
    if (value == null) return '-';
    return `${value.toFixed(2)}x`;
  },
  formatMetric: (value: number | null | undefined, type: 'currency' | 'percent' | 'number') => {
    switch (type) {
      case 'currency':
        return metricFormatters.formatCurrency(value);
      case 'percent':
        return metricFormatters.formatPercent(value);
      case 'number':
        return metricFormatters.formatNumber(value);
      default:
        return '-';
    }
  },
};

// Slice 2: Creative Constants
export const creativeFormatLabels: Record<string, string> = {
  image: 'Image Ad',
  video: 'Video Ad',
  carousel: 'Carousel',
  text: 'Text / Copy Only',
  other: 'Other Format',
};

export const creativeFormatIcons: Record<string, string> = {
  image: 'IMG',
  video: 'VID',
  carousel: 'CAR',
  text: 'TXT',
  other: 'OTH',
};

export const creativeStatusLabels: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  testing: 'In Testing',
  fatigued: 'Fatigued',
  retired: 'Retired',
};

export const creativeStatusColors: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground border-border',
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  testing: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  fatigued: 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse',
  retired: 'bg-muted text-muted-foreground border-border/50',
};

export const creativeAngleLabels: Record<string, string> = {
  discount_offer: 'Discount & Offer',
  fear_urgency: 'Fear & Urgency',
  social_proof_reviews: 'Social Proof / Reviews',
  educational: 'Educational',
  authority_guarantee: 'Authority & Guarantee',
  before_after: 'Before & After',
  other: 'Other Angle',
};

export const creativeAngleColors: Record<string, string> = {
  discount_offer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  fear_urgency: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  social_proof_reviews: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  educational: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  authority_guarantee: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  before_after: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  other: 'bg-secondary text-secondary-foreground border-border/50',
};

// Experiments (Vertical Slice 3)
export const experimentTypeLabels: Record<string, string> = {
  a_b_test: 'A/B Test',
  multivariate: 'Multivariate',
  landing_page: 'Landing Page',
  pricing: 'Pricing Vector',
  offer: 'Offer Protocol',
  audience: 'Audience Split',
};

export const experimentStatusLabels: Record<string, string> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  aborted: 'Aborted',
};

export const experimentStatusColors: Record<string, string> = {
  queued: 'bg-zinc-800/80 text-zinc-400 border-zinc-700',
  running: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
  completed: 'bg-blue-950/40 text-blue-400 border-blue-500/50',
  aborted: 'bg-rose-950/40 text-rose-400 border-rose-500/50',
};

export const experimentImpactColors: Record<string, string> = {
  low: 'text-zinc-400 border-zinc-700 bg-zinc-900',
  medium: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
  high: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
};


