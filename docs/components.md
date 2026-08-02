# Marketing Intelligence OS (MIOS) — Component Library Reference

## 1. Executive Summary & Design System
All UI components in MIOS follow the **PestControl OS Executive Suite** aesthetic:
- **0px Corner Radius**: Every card, modal, input, button, and table uses `rounded-none`.
- **Zero Emojis**: Crisp monospace uppercase tags (`META`, `GOOG`, `IMG`, `VID`, `SYNC`, `[ COMPLETED ]`).
- **High-Contrast Palette**: `#000000` / `#0e0e0e` dark surfaces with `#00dbe9` neon turquoise accent indicators.
- **Tabular Numerics**: `font-mono tabular-nums` for precise alignment of monetary and percentage metrics.

## 2. Core Layout Components

### 2.1 `AppShell` (`@/components/layout/app-shell.tsx`)
- **Purpose**: Wraps authenticated pages in a responsive executive terminal layout.
- **Props**: `{ user: ProfileRow; children: ReactNode }`
- **Behavior**: Renders a fixed left `Sidebar` on desktop (>=1024px) and a slide-out `Sheet` navigation drawer on mobile.

### 2.2 `Sidebar` (`@/components/layout/sidebar.tsx`)
- **Purpose**: Executive navigation menu linking to Campaigns, Creative Library, Experiments, and Knowledge Base.
- **Visuals**: Active routes are highlighted in bright neon turquoise `#00dbe9` with a left border accent.

## 3. Campaign & Creative Components

### 3.1 `CampaignTable` (`@/components/campaigns/campaign-table.tsx`)
- **Purpose**: Master tabular view of campaigns with live financial efficiency ratios (Spend, Revenue, ROAS, CAC).
- **Features**: Interactive sortable columns and color-coded ROAS indicators (`> 1.0` green, `< 1.0` amber/red).

### 3.2 `CreativeForm` (`@/components/creatives/creative-form.tsx`)
- **Purpose**: Form for creating/editing marketing assets.
- **Key Feature**: Embeds an **AI Quick-Paste** window that automatically extracts CTR, CPC, Spend, and Conversions from raw clipboard text pasted from Ads Manager.

## 4. Scientific Testing & Telemetry Components

### 4.1 `RecordResultsModal` (`@/components/experiments/record-results-modal.tsx`)
- **Purpose**: Interactive widescreen sheet (`!max-w-6xl sm:!max-w-6xl !w-[94vw] sm:!w-[94vw]`) for recording live experiment telemetry.
- **Props**: `{ experiment: ExperimentRow; open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void }`
- **Key Capabilities**:
  - Displays a spacious 3-column grid (`Control Baseline`, `Variant A`, `Variant B`) with tall `h-10 text-sm` inputs.
  - Contains a **`RE-CALCULATE LIFT`** button that dynamically calculates lift %, determines `winner_variant`, and estimates sample size confidence %.
  - Appends timestamped sync notes (`> [SYNC YYYY-MM-DD HH:MM] ...`) into the experiment's decision protocol stream.
- **Why Widescreen (`1152px` max width)**: Eliminates cramped input boxes and text wrapping by overriding shadcn's default `sm:max-w-sm` responsive constraint.

### 4.2 `LearningList` (`@/components/learnings/learning-list.tsx`)
- **Purpose**: Renders immutable, compounding organizational insights attached to campaigns or experiments.
- **Visuals**: Displays statistical confidence ratings and verified historical lift improvements.

## 5. Unlumen UI & Anime.js v4 Animation Suite
Located in `@/components/ui/unlumen/`, these components provide high-performance, hardware-accelerated animations inspired by Unlumen UI designs and powered by Anime.js v4 (`animate`, `stagger`).

### 5.1 `AnimateCount` (`@/components/ui/unlumen/animate-count.tsx`)
- **Purpose**: Smooth numerical count-up animation for financial and conversion metrics.
- **Props**: `{ value: number; format?: 'currency' | 'percent' | 'number' | 'raw'; decimals?: number; duration?: number; prefix?: string; suffix?: string }`
- **Behavior**: Uses `outExpo` easing to roll up to target numbers; supports Indian currency formatting (`₹1,00,000`) and percentage signs. Automatically disables animation if `prefers-reduced-motion: reduce` is enabled.

### 5.2 `AnimatedList` (`@/components/ui/unlumen/animated-list.tsx`)
- **Purpose**: Staggered entrance animations for lists, table rows, and grid cards.
- **Props**: `{ children: ReactNode; staggerDelay?: number; duration?: number; direction?: 'up' | 'down' | 'left' | 'right'; distance?: number }`
- **Behavior**: Uses Anime.js v4 `stagger()` to animate children sequentially with configurable directional slide-in and fade-in effects.

### 5.3 `TiltCard` (`@/components/ui/unlumen/tilt-card.tsx`)
- **Purpose**: Interactive 3D card wrapper with cursor-tracking spotlight glow.
- **Props**: `{ children: ReactNode; maxTilt?: number; scale?: number; glowColor?: string }`
- **Behavior**: Tracks mouse position over the card to calculate 3D perspective tilt (`rotateX`, `rotateY`) and renders a radial turquoise spotlight (`rgba(0, 219, 233, 0.18)`). Reverts smoothly on mouse leave.

### 5.4 `TextReveal` (`@/components/ui/unlumen/text-reveal.tsx`)
- **Purpose**: Cinematic character-by-character or word-by-word blur-fade text reveal for page titles and section headers.
- **Props**: `{ text: string; mode?: 'word' | 'char'; staggerDelay?: number; duration?: number }`
- **Behavior**: Splits text into tokens and animates opacity, Y-translation, and blur filters with `staggerDelay`.

### 5.5 `MatrixBackground` (`@/components/ui/unlumen/matrix-background.tsx`)
- **Purpose**: Subtle cyber-grid canvas background for terminal landing zones and modal backdrops.
- **Props**: `{ color?: string; spacing?: number; speed?: number; opacity?: number }`

### 5.6 `MotionAccordion` (`@/components/ui/unlumen/motion-accordion.tsx`)
- **Purpose**: Smooth expandable drawer for FAQs, customer psychology protocols, and collapsible telemetry sections.
- **Props**: `{ title: ReactNode; children: ReactNode; defaultOpen?: boolean; badgeText?: string }`
- **Behavior**: Uses `outCubic` easing to smoothly transition height between zero and scrollHeight while rotating the chevron indicator.
