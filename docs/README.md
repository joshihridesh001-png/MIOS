# Marketing Intelligence OS (MIOS) — Engineering Knowledge Base Index

Welcome to the **Marketing Intelligence OS (MIOS)** Engineering Knowledge Base.
This directory contains comprehensive, human-readable documentation describing the architecture, database schema, API design, frontend/backend implementation, security model, and engineering decisions of MIOS.

---

## Documentation Sitemap

### Core Architecture & Design
- **[Architecture](architecture.md)**: Executive summary, system topography, RSC/client data flow, and Mermaid architecture diagrams.
- **[Database Schema](database.md)**: PostgreSQL 15+ ER diagrams, table columns, indexes, `campaigns_with_metrics` SQL views, and Row Level Security (RLS) policies.
- **[Customer Psychology & Buyer Personas](customer-psychology-and-personas.md)**: Institutional intelligence engine, pre-sale acquisition triggers, post-job CX telemetry, and active creative angle collaborator.
- **[Institutional Knowledge Base & Intel Vault](knowledge-base-and-institutional-memory.md)**: Compounding confidence algorithms, executive campaign mandates (`>= 80% Confidence`), confirmation compounding loops, and `/knowledge` route topography.
- **[API & Server Actions](api.md)**: Next.js Server Actions, Supabase RPC hooks, request/response validation, and telemetry payload schemas.

### Frontend, Backend & Component Implementation
- **[Frontend Architecture](frontend.md)**: App Router route topography, **PestControl OS Executive Suite** aesthetic (`rounded-none`, zero emojis, `#00dbe9`), and widescreen modal capabilities.
- **[UX Research: Customer Personas & Creative Collaborator](ux-research-customer-personas.md)**: UI implementation hypothesis, CX feedback storage, and active creative angle generation.
- **[Backend Architecture](backend.md)**: Next.js Node/Edge Server Components, `@/lib/supabase/server.ts`, and statistical calculation rules.
- **[Component Library](components.md)**: Reference guide for core UI components (`AppShell`, `CampaignTable`, widescreen `RecordResultsModal`, `LearningList`).
- **[Services & Algorithms](services.md)**: Mathematical lift engine, confidence algorithms, **AI Quick-Paste** heuristic parser, and tabular formatters.
- **[Event Architecture](events.md)**: Timestamped telemetry audit logs (`[SYNC]`, `[TERMINATED]`) and Supabase Realtime subscription pipelines.
- **[State Management](state-management.md)**: Server state vs. local UI state, custom query hooks (`useCampaigns`, `useExperiments`), and cache invalidation.

### Security, Auth & Integration
- **[Authentication](authentication.md)**: Supabase GoTrue JWT cookie flows, CEO credentials (`CEO@Hridesh`), and middleware route protection.
- **[Authorization & RBAC](authorization.md)**: Role-based access control matrix (`CEO`, `ADMIN`, `ANALYST`) and PostgreSQL RLS policy enforcement.
- **[External Integrations](integrations.md)**: Meta Ads, Google Ads, WhatsApp connectors, and the AI Quick-Paste ingestion bridge.
- **[Security & Threat Defense](security.md)**: Attack vector analysis, XSS/CSRF cookie protection, and SQL injection mitigations.

### DevOps, Quality Assurance & Environment
- **[Deployment Guide](deployment.md)**: Vercel/Node edge hosting, environment variables, build verification (`npm run build`), and production checklists.
- **[Testing & Quality Assurance](testing.md)**: Static TypeScript checks, statistical lift test cases, and executive UX verification checklists.
- **[Performance Optimization](performance.md)**: Database indexing strategy, RSC bundle trimming, and 250ms load budgets.
- **[Environment Setup](environment.md)**: `.env.local` specifications, local dev commands (`npm run dev`), and environment difference matrices.
- **[Dependencies](dependencies.md)**: Comprehensive register of runtime and styling packages (`next`, `react 19`, `@supabase/ssr`, `tailwindcss v4`, `sonner`).

### Engineering History & Governance
- **[ADR-001: Engineering Governance & Quality Charter](ADR-001-engineering-governance-and-quality-model.md)**: Constitutional quality model (ISO/IEC 25010, SOLID, KISS, YAGNI, SEI CERT) and repository governance rules.
- **[Decision Log](decision-log.md)**: Immutable record of significant engineering decisions (`DEC-001` to `DEC-004`) with rationale and tradeoffs.
- **[Changelog](changelog.md)**: Reverse-chronological release history (`v1.2.0` widescreen modal expansion, `v1.1.0` zero-emoji aesthetic migration).
- **[Known Issues](known-issues.md)**: Current technical limitations and recommended executive workarounds.
- **[Technical Debt Register](technical-debt.md)**: Tracked architectural shortcuts, risk ratings, and ideal remediation paths.
- **[Glossary](glossary.md)**: Domain-specific marketing, financial, and engineering definitions (CAC, COGS, ROAS, Lift, AI Quick-Paste, RLS, RSC).

---

## Core Engineering Rule
> A task is considered complete **only** when BOTH the implementation and documentation are updated. Never leave documentation outdated.
