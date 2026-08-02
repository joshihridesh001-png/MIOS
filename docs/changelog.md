# Marketing Intelligence OS (MIOS) — Engineering Changelog

## 1. Executive Summary
This Changelog documents all notable architectural, aesthetic, and functional updates to the Marketing Intelligence OS (MIOS) codebase in reverse-chronological order.

---

## 2. Releases & Task History

### [v1.2.0] — 2026-07-31 — Widescreen Telemetry Modal Expansion (`1152px`)
- **Files Changed**:
  - `E:\MIOS\app\src\components\experiments\record-results-modal.tsx`
- **Summary**:
  - Overrode shadcn's default `sm:max-w-sm` responsive dialog constraint by applying `!max-w-6xl sm:!max-w-6xl !w-[94vw] sm:!w-[94vw]`.
  - Expanded the 3-column scientific experiment telemetry grid (`Control Baseline`, `Variant A`, `Variant B`) to `1152px` wide, giving each column `~360px` of breathing room.
  - Upgraded numeric inputs from `h-8 text-xs` to `h-10 text-sm` and enhanced bottom action buttons (`RE-CALCULATE LIFT`, `SAVE PROTOCOL DATA`).
- **Breaking Changes**: None.

---

### [v1.1.0] — 2026-07-30 — PestControl OS Executive Suite Aesthetic Migration
- **Files Changed**:
  - `E:\MIOS\app\src\app\globals.css`
  - All UI components in `src/components/campaigns/`, `src/components/experiments/`, `src/components/creatives/`, and `src/components/layout/`.
- **Summary**:
  - Migrated the entire interface to an executive zero-emoji, 0px border-radius (`rounded-none`) theme.
  - Implemented high-contrast `#000000` / `#0e0e0e` dark backgrounds with `#00dbe9` neon turquoise accent indicators.
  - Standardized monospace uppercase typography and tabular numerics (`font-mono tabular-nums`).
- **Breaking Changes**: Removed all emoji icons from status badges and platform tags.

---

### [v1.0.0] — 2026-07-28 — Initial Production Release (MIOS Core)
- **Files Changed**:
  - Initial database schema (`campaigns`, `creatives`, `experiments`, `learnings`, `profiles`).
  - Core App Router layouts and CRUD hooks (`use-campaigns.ts`, `use-experiments.ts`, `use-creatives.ts`).
- **Summary**:
  - Implemented core full-stack Next.js 16 App Router application with Supabase Auth and PostgreSQL RLS.
  - Launched AI Quick-Paste metric parser and compounding organizational learning registry.
- **Breaking Changes**: N/A (Initial Release).
