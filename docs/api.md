# Marketing Intelligence OS (MIOS) — API & Server Actions Reference

## 1. Executive Summary & Architecture
MIOS communicates with its PostgreSQL backend primarily through Next.js 16 App Router Server Actions and typed Supabase client hooks (`@/hooks/use-campaigns.ts`, `@/hooks/use-experiments.ts`, `@/hooks/use-creatives.ts`).
This architecture eliminates unnecessary REST boilerplate while preserving strict TypeScript validation and Supabase Row Level Security (RLS).

## 2. Authentication & Session Headers
All data fetching and mutation requests must include an authenticated Supabase JWT session cookie:
- **Cookie Name**: `sb-<project-ref>-auth-token`
- **Validation**: Verified server-side via `@/lib/supabase/server.ts` before executing database queries.
- **Unauthorized Response**: `401 Unauthorized` with automatic client redirect to `/login`.

## 3. Core Data Mutations & Hooks

### 3.1 Campaign Operations (`use-campaigns.ts`)
- `useCampaigns(filters?: CampaignFilters)`
  - **Method**: Supabase RPC / Table View Query on `campaigns_with_metrics`
  - **Returns**: `CampaignWithMetrics[]`
  - **Usage**: Populates the master campaigns table and financial dashboard cards.
- `createCampaign(payload: CampaignInsert)`
  - **Method**: `INSERT INTO campaigns`
  - **Validation**: Verifies non-negative spend and valid `platform_type` enum values.
- `updateCampaign(id: string, payload: CampaignUpdate)`
  - **Method**: `UPDATE campaigns WHERE id = :id`
  - **Validation**: Protects immutable IDs and logs audit timestamps.
- `deleteCampaign(id: string)`
  - **Method**: `DELETE FROM campaigns WHERE id = :id`

### 3.2 Experiment & Telemetry Operations (`use-experiments.ts`)
- `useExperiments()` / `useExperiment(id: string)`
  - **Method**: Query `experiments` table with JSONB metric vectors.
- `updateExperiment(id: string, payload: Partial<ExperimentRow>)`
  - **Purpose**: Persists real-time statistical lift, confidence score, winner variant, and decision protocol stream logs.
  - **Payload Structure**:
    ```json
    {
      "control_metrics": { "ctr": 2.4, "cvr": 1.8, "conversions": 142 },
      "variant_a_metrics": { "ctr": 3.1, "cvr": 2.4, "conversions": 189 },
      "variant_b_metrics": { "ctr": 2.1, "cvr": 1.5, "conversions": 110 },
      "actual_lift": 33.3,
      "confidence_score": 94,
      "decision_protocol_notes": [
        "> [SYNC 2026-08-02 14:30] Recorded metrics — Control (1.8% CVR) | Variant A (2.4% CVR) | Variant B (1.5% CVR). Lift: +33.3% [Confidence: 94%]"
      ]
    }
    ```

### 3.3 Creative & AI Quick-Paste Parser (`use-creatives.ts`)
- `useCreatives()` / `createCreative(data: CreativeInsert)`
- **AI Quick-Paste Parser Helper**:
  - **Purpose**: Parses unstructured ad platform copy-paste text (e.g., from Meta Marketing API or Ads Manager) into structured CTR, CPC, Spend, and Impressions figures.
  - **Function**: `parseAdMetricsFromText(rawText: string)`
  - **Validation**: Regex matching for currency symbols (`₹`, `$`, `EUR`), percentage marks (`%`), and metric keywords.

## 4. Error Handling & Validation Standard
- All mutations use try/catch blocks that surface human-readable errors via `sonner` toast alerts:
  - *Success*: `toast.success("Protocol status updated: [ COMPLETED ]")`
  - *Failure*: `toast.error("Failed to update: Insufficient RLS permissions")`
- Server-side exceptions are logged to the system audit stream and never expose raw SQL stack traces to the browser.
