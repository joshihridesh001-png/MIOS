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
  target_confidence: number;
  minimum_lift: number;
  
  control_name: string;
  control_spend: number;
  control_impressions: number;
  control_clicks: number;
  control_conversions: number;
  control_customers: number;
  control_revenue: number;

  variant_a_name: string;
  variant_a_spend: number;
  variant_a_impressions: number;
  variant_a_clicks: number;
  variant_a_conversions: number;
  variant_a_customers: number;
  variant_a_revenue: number;

  variant_b_name: string;
  variant_b_spend: number;
  variant_b_impressions: number;
  variant_b_clicks: number;
  variant_b_conversions: number;
  variant_b_customers: number;
  variant_b_revenue: number;
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

// ==========================================================
// 4. CUSTOMER & BUYER PERSONA TYPES (Governed by ADR-001)
// ==========================================================

export type CustomerPropertyType = 'residential' | 'commercial' | 'industrial' | 'other';
export type CustomerStatus = 'lead' | 'quoted' | 'won' | 'lost' | 'churned';

export interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  property_type: CustomerPropertyType;
  lead_source: string | null;
  campaign_id: string | null;
  campaign_creative_id: string | null;
  revenue: number;
  profit: number;
  ltv: number;
  why_contacted: string | null;
  biggest_fear: string | null;
  biggest_objection: string | null;
  why_chose_us: string | null;
  what_built_trust: string | null;
  questions_asked: string | null;
  cx_rating: number | null;
  job_quality_feedback: string | null;
  improvement_opportunities: string[];
  has_review: boolean;
  has_referral: boolean;
  amc_opportunity: boolean;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CustomerWithAttribution extends CustomerRow {
  campaign_name?: string;
  creative_name?: string;
}

export type CustomerInsert = Omit<CustomerRow, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
export type CustomerUpdate = Partial<CustomerInsert>;

export interface RecommendedCreativeAngle {
  hook: string;
  headline: string;
  emotion: string;
  psych_principle: string;
  rationale: string;
}

export interface BuyerPersonaRow {
  id: string;
  name: string;
  property_type: CustomerPropertyType;
  pest_type: string | null;
  dominant_fears: string[];
  dominant_objections: string[];
  trust_builders: string[];
  recommended_creative_angles: RecommendedCreativeAngle[];
  avg_cx_rating: number;
  top_improvement_opportunities: string[];
  avg_ltv: number;
  sample_size: number;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type BuyerPersonaInsert = Omit<BuyerPersonaRow, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
export type BuyerPersonaUpdate = Partial<BuyerPersonaInsert>;
