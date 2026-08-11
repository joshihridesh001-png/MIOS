# DECISIONS.md — Marketing Intelligence OS

> Living document. Every significant decision is recorded here.

---

## Decision Log

### DEC-001: Core Data Model Scope
- **Date:** 2026-07-30
- **Decision:** 10 tables for MVP — profiles, campaigns, creatives, creative_assets, campaign_creatives, experiments, customers, learnings, knowledge_entries, audit_log
- **Rationale:** Minimum viable set that supports the full intelligence chain (Campaign → Creative → Customer → Revenue → Learning → Knowledge)
- **Status:** ✅ Locked

### DEC-002: Pest / Service Fields — Free Text
- **Date:** 2026-07-30
- **Decision:** `pest_type` and `service` are free-text fields, not lookup tables
- **Rationale:** Faster to ship, avoids premature normalization. Can promote to reference tables later if filtering/grouping demands it.
- **Status:** ✅ Locked

### DEC-003: Campaign Revenue vs Customer Revenue — Independent
- **Date:** 2026-07-30
- **Decision:** `campaigns.revenue` and `customers.revenue` are entered independently, no enforced sum constraint
- **Rationale:** Attribution is rarely perfect in real-world pest control marketing. Not all revenue maps cleanly to individual customers (e.g., bulk commercial contracts).
- **Status:** ✅ Locked

### DEC-004: Per-Creative Metrics — Optional
- **Date:** 2026-07-30
- **Decision:** `campaign_creatives` join table has optional metric columns (impressions, clicks, spend, etc.)
- **Rationale:** Many teams only have campaign-level data from Meta Ads initially. Keeps the door open without forcing data entry.
- **Status:** ✅ Locked

### DEC-005: Phone Uniqueness — Not Unique
- **Date:** 2026-07-30
- **Decision:** `customers.phone` is NOT a unique constraint
- **Rationale:** Real-world data is messy — same customer from multiple campaigns, family members sharing numbers, etc. Deduplication is a future concern.
- **Status:** ✅ Locked

### DEC-006: Tags — Free-form JSONB
- **Date:** 2026-07-30
- **Decision:** Tags on `learnings` and `knowledge_entries` use `jsonb` arrays, not a controlled vocabulary / separate tags table
- **Rationale:** Flexibility over structure in early days. A tag taxonomy can emerge organically and be formalized later.
- **Status:** ✅ Locked

### DEC-007: Currency — INR Only
- **Date:** 2026-07-30
- **Decision:** All monetary fields assume INR. No multi-currency support.
- **Rationale:** Eradicant operates in India. Avoid unnecessary abstraction.
- **Status:** ✅ Locked

### DEC-008: Learning Confidence — Numeric Score (0–100) with Breakdown
- **Date:** 2026-07-30
- **Decision:** Replace simple `low/medium/high` enum with a calculated `confidence_score` (0–100) plus `confidence_breakdown` jsonb field
- **Formula:** `Confidence = (Sample×0.30 + Consistency×0.25 + EffectSize×0.20 + Recency×0.15) - ContradictionPenalty`
- **Rationale:** Transparent, explainable scoring that CEO/CMO can trust. Supports future upgrade to Bayesian models. See `MVP_Confidence_Algorithm.md` for full spec.
- **Status:** ✅ Locked

### DEC-009: Calculated Metrics — Postgres Views, Not Stored
- **Date:** 2026-07-30
- **Decision:** CTR, CPC, CAC, ROAS, Gross/Net Profit are computed via a Postgres view (`campaigns_with_metrics`), not stored as columns
- **Rationale:** Always fresh, never stale. No sync bugs. Trivial to add new calculations.
- **Status:** ✅ Locked

### DEC-010: Audit Strategy — Audit Log Table with Triggers
- **Date:** 2026-07-30
- **Decision:** Single `audit_log` table with `old_values` / `new_values` jsonb, populated by Postgres trigger function
- **Rationale:** Centralized, zero app-code overhead, covers all tables with one mechanism. Full row versioning is overkill for MVP.
- **Status:** ✅ Locked

### DEC-011: Tech Stack
- **Date:** 2026-07-30
- **Decision:** Next.js + TypeScript + Tailwind + shadcn/ui frontend, Supabase backend (Postgres + Auth + Storage), dark mode default, mobile-first
- **Rationale:** Per PRD requirements. Modern, well-supported, fast to ship.
- **Status:** ✅ Locked

### DEC-012: Anti-Vibecoding UI Standards
- **Date:** 2026-08-10
- **Decision:** Strict ban on purely aesthetic "cyberpunk" or terminal-inspired UI decorations. UI must reflect a clinical, B2B executive suite tool.
- **Rationale:** Ensures authority, trust, and usability for C-suite decision-makers. See `ANTI_VIBECODING_STANDARDS.md`.
- **Status:** ❌ Deprecated (Superseded by DEC-014)

### DEC-014: Neumorphic (Soft UI) Design System
- **Date:** 2026-08-10
- **Decision:** Pivot the entire application to a Light Mode Neumorphic aesthetic.
- **Rationale:** Requested by CTO. Replaces dark mode severity with soft, tactile pastel colors (sage green, lavender) and prominent 3D extruded/inset shadowing on interactive elements (buttons, inputs) for a modern, physical feel.
- **Status:** ✅ Locked

### DEC-013: Demo Mode Architecture
- **Date:** 2026-08-10
- **Decision:** Demo Mode blocks all mutating database queries at the Supabase client wrapper level when `NEXT_PUBLIC_DEMO_MODE=true`.
- **Rationale:** Prevents accidental data corruption during sales calls or public demonstrations while allowing full read-only exploration of the UI.
- **Status:** ✅ Locked

---

## Pending Decisions

_None at this time._
