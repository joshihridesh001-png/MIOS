# Marketing Intelligence OS (MIOS) — Engineering Changelog

## 1. Executive Summary
This Changelog documents all notable architectural, aesthetic, and functional updates to the Marketing Intelligence OS (MIOS) codebase in reverse-chronological order.

---

## 2. Releases & Task History

### [v1.6.0] — 2026-08-04 — Production & Deployment Readiness: Marketing Intelligence OS Branding & Zero Placeholder Enforcement
- **Files Changed**:
  - `E:\MIOS\app\src\components\layout\app-shell.tsx` & `sidebar.tsx` (updated master branding from PestControl OS to Marketing Intelligence OS)
  - `E:\MIOS\app\src\components\creatives\creative-preview-box.tsx` (replaced legacy niche copy and placeholder indicators with enterprise Marketing Intelligence copy)
  - `E:\MIOS\app\src\app\(dashboard)\dashboard\page.tsx` (standardized executive diagnostic action mandates for enterprise B2B and D2C marketing intelligence)
  - `E:\MIOS\app\src\components\campaigns\campaign-form.tsx` & `quick-paste-card.tsx` (labeled category field as `Market Segment / Category` and updated sample AI Quick-Paste telemetry to Enterprise B2B B2C copy)
  - `E:\MIOS\app\src\app\(dashboard)\campaigns\[id]\page.tsx` (updated details label to `Segment / Vertical`)
  - `E:\MIOS\app\src\components\knowledge\knowledge-form-modal.tsx` (updated insight placeholder examples to Enterprise B2B B2C copy)
  - `E:\MIOS\app\src\app\(auth)\login\page.tsx` (updated login success redirect directly to `/dashboard`)
  - Documentation (`docs/README.md`, `docs/changelog.md`)
- **Summary**:
  - Executed a repository-wide production readiness pass, eliminating all remaining legacy niche branding (`PestControl OS`, `Pest Control`, `Termite`) and placeholder text across all UI components, sample texts, and headers/footers.
  - Standardized the platform identity as **Marketing Intelligence OS (MIOS)** across desktop/mobile navigation, creative preview boxes, form labels, and executive AI diagnostics.
  - Verified static Next.js production build (`npm run build`) — `16/16` routes compiled cleanly with zero TypeScript errors.
- **Breaking Changes**: None.

### [v1.5.0] — 2026-08-03 — The Executive Command Center Dashboard (`/dashboard`)
- **Files Changed**:
  - `E:\MIOS\app\src\app\(dashboard)\dashboard\page.tsx` (master executive command center route)
  - `E:\MIOS\app\src\app\page.tsx` (updated root URL `/` redirect to target `/dashboard`)
  - `E:\MIOS\app\src\components\dashboard\dashboard-header.tsx` (period telemetry filter and channel selector toolbar)
  - `E:\MIOS\app\src\components\dashboard\benchmark-alerts.tsx` (real-time ROAS/Profit rule breach warnings and celebration alerts)
  - `E:\MIOS\app\src\components\dashboard\dashboard-kpis.tsx` (4x2 grid of hardware-accelerated financial and conversion cards)
  - `E:\MIOS\app\src\components\dashboard\pipeline-grid.tsx` (4-pillar interactive intelligence preview across Campaigns, Creatives, LABS, and Intel Vault)
  - `E:\MIOS\app\src\components\layout\sidebar.tsx` & `app-shell.tsx` (enabled `/dashboard` in desktop and mobile executive navigation)
  - `E:\MIOS\app\src\hooks\use-dashboard.ts` (multi-table aggregation hook with blended financial ratios and alert engine)
  - Architectural documentation (`docs/executive-command-center-dashboard.md`, `docs/README.md`, `docs/changelog.md`)
- **Summary**:
  - Built the **Executive Command Center Dashboard (`/dashboard`)** as the unified top-level command cockpit for Marketing Intelligence OS (MIOS).
  - Implemented real-time **Period & Channel Telemetry Filtering** (`ALL TIME`, `30D`, `7D`, `MTD`, across `META ADS`, `GOOGLE ADS`, `WHATSAPP`, `OFFLINE`).
  - Implemented **Benchmark Breach Alerts** highlighting campaigns below minimum target (`ROAS < 1.50×`, negative net profit, `CAC > ₹2,000`) and celebration badges for high performers (`ROAS >= 3.00×`).
  - Integrated Unlumen UI & Anime.js v4.5.0 hardware-accelerated animations (`TextReveal`, `AnimateCount`, `TiltCard`, `AnimatedList`, `MotionAccordion`) to synthesize financial returns and executive diagnostics.
- **Breaking Changes**: None.

### [v1.4.0] — 2026-08-03 — Institutional Knowledge Base & Compounding Intel Vault (`/knowledge`)
- **Files Changed**:
  - `E:\MIOS\app\src\app\(dashboard)\knowledge\page.tsx` (master institutional intel vault route)
  - `E:\MIOS\app\src\app\(dashboard)\learnings\page.tsx` (route redirect to `/knowledge`)
  - `E:\MIOS\app\src\components\knowledge\knowledge-card.tsx` (interactive 3D rule card with real-time confirmation/contradiction scoring)
  - `E:\MIOS\app\src\components\knowledge\knowledge-form-modal.tsx` (widescreen rule logging modal)
  - `E:\MIOS\app\src\components\layout\sidebar.tsx` (enabled `/knowledge` route in executive navigation)
  - `E:\MIOS\app\src\hooks\use-learnings.ts` (added `useAllLearnings()`, `confirmLearning()`, `contradictLearning()`)
  - `E:\MIOS\app\scripts\seed-knowledge.mjs` (seeded 5 CEO-grade Indian pest control marketing/psychology rules)
  - Architectural documentation (`docs/knowledge-base-and-institutional-memory.md`, `docs/README.md`, `docs/changelog.md`)
- **Summary**:
  - Built the **Institutional Knowledge Base & Intel Vault** (`/knowledge`), making compounding organizational memory a first-class architectural primitive.
  - Engineered real-time confidence compounding: every click on **`[ CONFIRM ]`** elevates the rule's statistical confidence score via $\min(100, \text{round}(C / (C + X) \times 100))$.
  - Integrated Unlumen UI hardware-accelerated animations (`AnimateCount`, `AnimatedList`, `TiltCard`, `TextReveal`, `MotionAccordion`) and domain filter tabs (`ALL`, `MARKETING`, `SALES`, `BUYER PSYCHOLOGY`, `FIELD OPERATIONS`, `PRICING`, `COMPETITOR`).
  - Seeded 5 CEO-grade Indian residential/commercial pest control rules via direct Postgres connection (`seed-knowledge.mjs`).
- **Breaking Changes**: None.

---

### [v1.3.0] — 2026-08-03 — Unlumen UI & Anime.js v4 Animation Suite Integration
- **Files Changed**:
  - `E:\MIOS\app\package.json` (added `animejs` v4.5.0 and `@types/animejs`)
  - `E:\MIOS\app\src\components\ui\unlumen\` (`animate-count.tsx`, `animated-list.tsx`, `tilt-card.tsx`, `text-reveal.tsx`, `matrix-background.tsx`, `motion-accordion.tsx`)
  - `E:\MIOS\app\src\components\campaigns\` (`campaign-metrics.tsx`, `campaign-table.tsx`)
  - `E:\MIOS\app\src\components\customers\` (`customer-table.tsx`, `persona-card.tsx`)
  - `E:\MIOS\app\src\components\creatives\` (`creative-card.tsx`)
  - `E:\MIOS\app\src\app\(dashboard)\` (`campaigns/page.tsx`, `experiments/page.tsx`, `creatives/page.tsx`, `customers/page.tsx`)
  - Architectural documentation (`components.md`, `frontend.md`, `dependencies.md`, `changelog.md`)
- **Summary**:
  - Engineered 6 custom hardware-accelerated animation components inspired by **Unlumen UI** and powered by **Anime.js v4.5.0** (`animate`, `stagger`).
  - Integrated `AnimateCount` into campaign metrics, customer financial tables, and telemetry displays for smooth numeric count-ups with Indian currency formatting.
  - Integrated `AnimatedList` and `TiltCard` into campaigns, creatives, experiments, and buyer persona cards for 3D cursor-tracking perspective tilts and radial turquoise spotlight glows.
  - Integrated `TextReveal` for cinematic blur/fade staggered header typography across main dashboard routes.
  - Enforced strict compliance with ADR-001 (**PestControl OS Executive Suite** aesthetic: `rounded-none`, zero emojis, `#00dbe9` turquoise accent, and full `prefers-reduced-motion` accessibility).
- **Breaking Changes**: None.

---

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
