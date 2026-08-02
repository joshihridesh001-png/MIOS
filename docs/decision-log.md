# Marketing Intelligence OS (MIOS) — Engineering Decision Log

## 1. Executive Summary
This document serves as the immutable architectural Decision Log for MIOS. Every significant engineering, aesthetic, or data-modeling decision is recorded here with context, alternatives considered, and long-term consequences.

---

## 2. Decision Log Entries

### [DEC-001] Adoption of Next.js 16 App Router (RSC + Server Actions)
- **Date**: 2026-07-28
- **Decision**: Use Next.js 16 App Router with React Server Components (RSC) and Server Actions as the unified full-stack framework.
- **Reason**: Eliminates the need to build, deploy, and synchronize a separate Node/Express backend API service. Allows direct, secure database reads on the server while minimizing client JavaScript bundles.
- **Alternatives Considered**: 
  - Separate React SPA (Vite) + Node.js Express backend.
  - Remix framework.
- **Tradeoffs**: Requires careful separation of `'use client'` interactive boundaries from server-rendered layouts.
- **Consequences**: Fast initial page loads and zero client API waterfalls for executive dashboards.

---

### [DEC-002] Widescreen Modal Override (`!max-w-6xl` / `1152px`) for Telemetry Entry
- **Date**: 2026-07-31
- **Decision**: Override shadcn's default `sm:max-w-sm` dialog container in `RecordResultsModal` using `!max-w-6xl sm:!max-w-6xl !w-[94vw] sm:!w-[94vw]`.
- **Reason**: A 3-column scientific experiment matrix (`Control Baseline`, `Variant A`, `Variant B`) was severely cramped and unreadable inside standard 384px or 768px modals.
- **Alternatives Considered**: 
  - Vertical accordion layout (one variant at a time).
  - Separate full-page URL route for telemetry entry.
- **Tradeoffs**: Requires widescreen desktop viewports (>=1024px) for optimal horizontal side-by-side comparison.
- **Consequences**: Executives can record CTR, CVR, Conversions, and Lift side-by-side with zero text wrapping.

---

### [DEC-003] Zero-Emoji & `rounded-none` Executive Aesthetic (PestControl OS)
- **Date**: 2026-07-30
- **Decision**: Globally ban emojis and enforce `rounded-none` (0px border-radius) across all UI cards, buttons, badges, and modals.
- **Reason**: Elevates MIOS from a casual marketing tool into a serious, high-precision executive terminal (`PestControl OS | CEO Dashboard`).
- **Alternatives Considered**: 
  - Standard SaaS styling with rounded cards and emoji icons.
- **Tradeoffs**: Stricter styling rules for developers when adding new components.
- **Consequences**: A cohesive, industrial-grade visual identity with high-contrast `#000000` surfaces and `#00dbe9` neon turquoise indicators.

---

### [DEC-004] SQL View Offloading for Financial Efficiency Ratios (`campaigns_with_metrics`)
- **Date**: 2026-07-29
- **Decision**: Compute `CTR`, `CPC`, `CPL`, `CAC`, `ROAS`, `Gross Profit`, and `Net Profit` inside a PostgreSQL view (`campaigns_with_metrics`) rather than in JavaScript frontend utilities.
- **Reason**: Ensures mathematical ratios are evaluated identically across all dashboard views, server actions, and future BI integrations.
- **Alternatives Considered**: 
  - Client-side calculation in React components.
- **Tradeoffs**: Slight SQL database CPU overhead during view reads.
- **Consequences**: Single source of truth for all efficiency ratios and zero client calculation discrepancies.
