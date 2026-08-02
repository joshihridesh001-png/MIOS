# Marketing Intelligence OS (MIOS) — Engineering Architecture

## 1. Executive Summary & Purpose
Marketing Intelligence OS (MIOS) is an enterprise-grade, internal operating system designed to transform ephemeral marketing campaign performance into permanent, compounding organizational knowledge.
Unlike traditional dashboards that only display historical metrics, MIOS enforces an engineering-driven feedback loop:
`Hypothesis -> Campaign Execution -> Observed Telemetry -> Statistical Validation -> Persistent Organizational Learning`

## 2. High-Level Architectural Design
MIOS uses a modern serverless, edge-optimized architecture built around Next.js App Router (React Server Components + Client Components) and Supabase (PostgreSQL, Row Level Security, and real-time subscription pipelines).

```mermaid
graph TD
    subgraph "Client Tier (Web Browser)"
        UI["PestControl OS Executive Suite (0px Borders, Monospace, #00dbe9)"]
        Forms["Client Forms & Quick-Paste AI Parser"]
        Modals["Live Telemetry Modal (RecordResultsModal)"]
    end

    subgraph "Next.js 16 App Router (Node / Edge Tier)"
        RSC["React Server Components (RSC)"]
        API["Next.js Server Actions & API Routes"]
        Proxy["Next.js Proxy / Middleware (Auth Session Guard)"]
    end

    subgraph "Supabase / Database Tier (PostgreSQL 15+)"
        Auth["Supabase Auth (JWT & Session Cookies)"]
        RLS["Row Level Security (RLS) Policies"]
        PG["PostgreSQL Tables & Materialized Views"]
        RPC["Database Views: campaigns_with_metrics, experiments_with_variants"]
    end

    UI -->|HTTPS / RSC Payload| RSC
    Forms -->|RPC / Server Action| API
    Modals -->|Async Mutation| API
    RSC -->|Supabase Server Client| RLS
    API -->|Supabase Service / Client| RLS
    RLS -->|Validated Query| PG
    PG -->|Structured Data| RPC
```

## 3. Core Design Principles & Tradeoffs
1. **Server-First Data Fetching vs. Client Reactivity**:
   - *Decision*: Core page layouts and initial data reads are handled via React Server Components (`@/lib/supabase/server.ts`), while interactive mutations (crud, telemetry recording, live calculators) use Client Components (`'use client'`) with optimistic updates.
   - *Why*: Minimizes client JavaScript bundle size and eliminates waterfall network requests while preserving instantaneous UX feedback for data entry.
2. **Zero-Emoji Executive Aesthetics**:
   - *Decision*: Strict adherence to a 0px border-radius (`rounded-none`), deep `#000000` dark mode palette, `#00dbe9` neon turquoise accent indicators, and monospace uppercase typography.
   - *Why*: Reduces cognitive clutter and elevates the interface from a standard web app to a mission-critical operating system for executive decision making.
3. **Automated Statistical Matrix Synchronization**:
   - *Decision*: A/B and Multivariate experiments recalculate lift and statistical confidence both on the client preview and upon persistence to the database.
   - *Why*: Ensures executives can evaluate test significance without leaving the workflow or relying on external spreadsheets.

## 4. Module Responsibilities & System Topography
- `@/app/(auth)`: Authentication boundaries, login card, and session initialization.
- `@/app/(dashboard)`: Authenticated shell layout containing vertical slices:
  - `/campaigns`: Campaign registry, performance telemetry, and hypothesis tracking.
  - `/creatives`: Creative asset library with AI Quick-Paste performance parsing.
  - `/experiments`: Scientific testing protocols (A/B, Multivariate), traffic split matrices, and live telemetry entry.
  - `/learnings`: Compounding organizational knowledge base derived from validated experiments.
- `@/components/layout`: AppShell, Executive Navigation Sidebar, and status command headers.
- `@/lib/supabase`: Typed client (`client.ts`) and server (`server.ts`) Supabase SDK instantiations.

## 5. Request & Lifecycle Flow
```mermaid
sequenceDiagram
    autonumber
    actor CEO as Executive User
    participant App as Next.js UI (Client)
    participant Server as Next.js Server (RSC/Actions)
    participant Auth as Supabase Auth
    participant DB as PostgreSQL (RLS)

    CEO->>App: Request Dashboard /experiments/[id]
    App->>Server: HTTP GET /experiments/[id]
    Server->>Auth: Validate JWT Session Token
    Auth-->>Server: User Identity (Role: Executive)
    Server->>DB: Query `experiment_rows` + RLS Policy
    DB-->>Server: Return Validated Experiment Matrix
    Server-->>App: Rendered HTML + RSC State
    CEO->>App: Open "RECORD RESULTS" Modal & Save Telemetry
    App->>DB: RPC / Table UPDATE (CTR, CVR, Lift, Confidence)
    DB-->>App: Return Updated Record + Trigger Re-fetch
    App-->>CEO: Toast Confirmation & Synchronized UI
```

## 6. Future Architectural Improvements
- **Edge LLM Endpoint Integration**: Replace regex/heuristic parsing in AI Quick-Paste with a dedicated edge-hosted LLM worker for unstructured agency email summaries.
- **Real-Time Webhook Pipeline**: Stream ad platform spend and conversion metrics directly from Meta Marketing API and Google Ads API into `campaigns_with_metrics`.
