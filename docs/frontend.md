# Marketing Intelligence OS (MIOS) — Frontend Architecture & Executive Suite Design

## 1. Executive Summary & Purpose
The frontend of MIOS is engineered to feel like an authentic, high-speed executive terminal ("PestControl OS | CEO Dashboard") rather than a generic SaaS web app.
Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and shadcn/ui, the UI enforces strict aesthetic and functional standards.

## 2. Design System & Aesthetic Mandates
MIOS operates under a strict set of visual rules designed for CEO-level speed and precision:
1. **Zero Emojis Globally**:
   - *Rule*: Never render emojis anywhere in the interface.
   - *Implementation*: All status badges, platform tags, creative formats, and alert banners use crisp monospace uppercase tags (e.g., `[ COMPLETED ]`, `META`, `GOOG`, `IMG`, `VID`, `SYNC`, `MVT-0X92C`).
2. **0px Architectural Corners (`rounded-none`)**:
   - *Rule*: All cards, modals, buttons, badges, inputs, and tables use `rounded-none`.
   - *Why*: Creates a sharp, precision-machined industrial terminal aesthetic.
3. **High-Contrast Dark Surface Palette**:
   - *Backgrounds*: `#000000` (pure black) and `#0e0e0e` (deep charcoal).
   - *Borders*: Crisp 1px borders using `border-zinc-800` or `border-zinc-800/80`.
   - *Accent & Interactive Glow*: `#00dbe9` neon turquoise (`bg-[#00dbe9]`, `border-[#00dbe9]`) with subtle cyan box shadows (`shadow-[0_0_15px_rgba(0,219,233,0.35)]`).
4. **Monospace Tabular Numerics**:
   - *Rule*: All monetary values (`₹`), percentages (`%`), lift figures, and CTR/CVR stats use monospace fonts with `tabular-nums` so numbers align perfectly in columns.

## 3. App Router Route Topography
- `/(auth)/login`: Executive authentication card with glassmorphic `#0e0e0e` surface.
- `/(dashboard)`: Master shell wrapped in `AppShell` with fixed left `Sidebar`:
  - `/campaigns`: Master campaigns list and `/campaigns/[id]` deep performance analysis.
  - `/creatives`: Creative library and `/creatives/new` with **AI Quick-Paste** auto-parser.
  - `/experiments`: Scientific testing protocols and `/experiments/[id]` with **RecordResultsModal** telemetry synchronizer.
  - `/learnings`: Compounding organizational knowledge base.
  - `/customers`: Persona and customer psychology intelligence.

## 4. Key Interactive Capabilities
- **Widescreen Telemetry Modal (`RecordResultsModal`)**:
  - Uses `!max-w-6xl sm:!max-w-6xl !w-[94vw] sm:!w-[94vw]` to override default shadcn dialog constraints (`sm:max-w-sm`).
  - Provides a 3-column widescreen grid (`Control Baseline`, `Variant A`, `Variant B`) for live input of CTR, CVR, and Conversions.
  - Includes a real-time **`RE-CALCULATE LIFT`** engine that derives actual lift %, detects winner vectors, and estimates sample size confidence.
- **AI Quick-Paste Input**:
  - Allows executives to paste raw Meta Ads or Google Ads text dumps directly into a text area to instantly populate form metrics.

## 5. Responsive Design Behavior
- **Desktop (>= 1024px)**: Full 256px (`w-64`) left navigation sidebar with sticky top header command bar.
- **Tablet / Mobile (< 1024px)**: Collapsible hamburger menu sheet with horizontal overflow-x scrolling for comparison matrices.

## 6. Animation Engine & Hardware Acceleration (Anime.js v4 & Unlumen UI)
MIOS implements high-performance animations using **Anime.js v4.5.0** and custom Unlumen UI components (`@/components/ui/unlumen/`):
- **Named Import Architecture**: In Anime.js v4, all animation functions are imported as named exports (`import { animate, stagger } from 'animejs'`) with TypeScript type verification via `AnimationParams`.
- **Accessibility & Motion Preference (`prefers-reduced-motion`)**: Every animation hook checks `window.matchMedia('(prefers-reduced-motion: reduce)')`. If enabled, animations immediately settle to their final visual state without motion.
- **Hardware-Accelerated Properties**: Transitions strictly target GPU-friendly properties (`opacity`, `translateY`, `translateX`, `rotateX`, `rotateY`, `scale`, and `filter: blur()`).
- **Telemetry Counter Rollup (`AnimateCount`)**: Automatically formats Indian currency (`₹1,00,000`) and percentages while running `outExpo` count-up easing.
