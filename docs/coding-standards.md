# Marketing Intelligence OS (MIOS) — Engineering & Coding Standards

## 1. Executive Summary & Core Engineering Rules
All code contributed to MIOS must conform to strict TypeScript, React 19, and **PestControl OS Executive Suite** design standards.
Clean engineering, predictable naming, and rigorous documentation are mandatory for all pull requests.

## 2. Visual & Aesthetic Standards (PestControl OS Mandate)
1. **Zero-Emoji Policy**:
   - ❌ **Forbidden**: `🚀 Active`, `📈 +33%`, `🔥 High Confidence`, `⚠️ Warning`
   - ✅ **Required**: `[ ACTIVE ]`, `+33.0% LIFT`, `HIGH CONFIDENCE (94%)`, `[ SYNC WARNING ]`
2. **Zero Border-Radius (`rounded-none`)**:
   - ❌ **Forbidden**: `rounded-md`, `rounded-lg`, `rounded-full` (except for small indicator dots if specified).
   - ✅ **Required**: Explicitly apply `rounded-none` to all cards, modals, buttons, badges, inputs, and sheets.
3. **Tabular Numerics**:
   - Always use `font-mono tabular-nums` for numeric inputs and table cells to prevent horizontal layout jiggle.

## 3. TypeScript & Data Typing Standards
1. **No `any` or Unchecked Types**:
   - Always import database row interfaces (`CampaignRow`, `ExperimentRow`, `LearningRow`) from `@/lib/types/database.ts`.
2. **Strict Null & Undefined Handling**:
   - Financial efficiency ratios (`CTR`, `CPC`, `ROAS`) can be `null` when spend or clicks are 0. Always format using helper functions (`formatCurrency`, `formatPercent`) that gracefully handle `null | undefined`.

## 4. Next.js 16 App Router Conventions
1. **Server vs. Client Components**:
   - Keep page roots (`page.tsx`, `layout.tsx`) as **React Server Components** by default.
   - Only add `'use client'` at the top of leaf interactive components (e.g., forms, modals, tables with sorting hooks).
2. **CSS / Tailwind Class Ordering**:
   - Order utility classes logically: layout/positioning -> box model (width/height/padding) -> colors -> typography -> custom overrides (`!max-w-6xl`).
