export type PlatformType = 'meta_ads' | 'google_ads' | 'whatsapp' | 'organic_social' | 'offline' | 'other';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type LearningSource = 'campaign' | 'creative' | 'experiment' | 'customer' | 'manual';
export type LearningCategory = 'marketing' | 'sales' | 'operations' | 'customer_psychology' | 'pricing' | 'competitor' | 'other';

export interface CampaignRow { 
    id: string; 
    name: string; 
    platform: PlatformType | null; 
    objective: string | null; 
    status: CampaignStatus; 
    start_date: string | null; 
    end_date: string | null; 
    owner_id: string | null; 
    target_audience: string | null; 
    service: string | null; 
    pest_type: string | null; 
    location: string | null; 
    offer: string | null; 
    cta: string | null; 
    landing_destination: string | null; 
    spend: number; 
    reach: number; 
    impressions: number; 
    clicks: number; 
    messages: number; 
    calls: number; 
    site_visits: number; 
    inquiries: number;
    qualified_leads: number; 
    quotes_sent: number; 
    customers_won: number; 
    revenue: number; 
    cogs: number; 
    hypothesis: string | null; 
    result_summary: string | null; 
    what_worked: string | null; 
    what_failed: string | null; 
    next_experiment: string | null; 
    confidence: ConfidenceLevel | null; 
    created_at: string; 
    updated_at: string; 
    created_by: string | null; 
    updated_by: string | null; 
}

export interface CampaignWithMetrics extends CampaignRow { 
    ctr: number | null; 
    cpm: number | null; 
    cpc: number | null; 
    cpl: number | null; 
    cac: number | null; 
    roas: number | null; 
    gross_profit: number | null; 
    net_profit: number | null; 
    conversion_rate: number | null; 
}

export interface LearningRow { 
    id: string; 
    insight: string; 
    source_type: LearningSource; 
    source_id: string | null; 
    category: LearningCategory; 
    confidence_score: number; 
    supporting_count: number; 
    confirmations: number; 
    total_tests: number; 
    contradiction_count: number; 
    avg_improvement: number; 
    last_confirmed_at: string | null; 
    confidence_breakdown: Record<string, unknown>; 
    tags: string[]; 
    is_active: boolean; 
    superseded_by: string | null; 
    created_at: string; 
    updated_at: string; 
    updated_by: string | null; 
}

// Slice 2: Creatives
export type CreativeFormat = 'image' | 'video' | 'carousel' | 'text' | 'other';
export type CreativeStatus = 'draft' | 'active' | 'testing' | 'fatigued' | 'retired';
export type CreativeAngle = 
  | 'discount_offer'
  | 'fear_urgency'
  | 'social_proof_reviews'
  | 'educational'
  | 'authority_guarantee'
  | 'before_after'
  | 'other';

export interface CreativeRow {
  id: string;
  name: string;
  format: CreativeFormat;
  status: CreativeStatus;
  angle: CreativeAngle;
  platform: PlatformType | null;
  campaign_id: string | null;
  headline: string | null;
  primary_text: string | null;
  cta_text: string | null;
  asset_url: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  inquiries: number;
  customers_won: number;
  revenue: number;
  fatigue_score: number;
  hook_hypothesis: string | null;
  what_worked: string | null;
  what_failed: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreativeWithMetrics extends CreativeRow {
  ctr: number | null;
  cpc: number | null;
  roas: number | null;
  net_profit: number | null;
  conversion_rate: number | null;
}

export type CreativeInsert = Omit<CreativeRow, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
export type CreativeUpdate = Partial<CreativeInsert>;

// Experiments (Vertical Slice 3)
export type ExperimentType = 'a_b_test' | 'multivariate' | 'landing_page' | 'pricing' | 'offer' | 'audience';
export type ExperimentStatus = 'queued' | 'running' | 'completed' | 'aborted';
export type ExperimentImpact = 'low' | 'medium' | 'high';

export interface ExperimentVariantMetrics {
  ctr: number;
  cvr: number;
  conversions: number;
}

export interface ExperimentRow {
  id: string;
  name: string;
  test_code: string;
  type: ExperimentType;
  status: ExperimentStatus;
  impact: ExperimentImpact;
  hypothesis_query: string;
  primary_metric: string;
  target_lift: number;
  actual_lift: number;
  traffic_split: string;
  sample_size: number;
  runtime_hours: number;
  confidence_score: number;
  decision_protocol_notes: string[];
  control_name: string;
  control_metrics: ExperimentVariantMetrics;
  variant_a_name: string;
  variant_a_metrics: ExperimentVariantMetrics;
  variant_b_name: string;
  variant_b_metrics: ExperimentVariantMetrics;
  winner_variant: string | null;
  campaign_id: string | null;
  creative_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type ExperimentInsert = Omit<ExperimentRow, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
export type ExperimentUpdate = Partial<ExperimentInsert>;


