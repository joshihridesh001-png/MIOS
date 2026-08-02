# Marketing Intelligence OS (MIOS) — Engineering Changelog

## 1. Executive Summary
This Changelog documents all notable architectural, aesthetic, and functional updates to the Marketing Intelligence OS (MIOS) codebase in reverse-chronological order.

---

## 2. Releases & Task History

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
