# Marketing Intelligence OS (MIOS) — Performance Optimization & Caching

## 1. Executive Summary & Performance Budgets
MIOS is engineered to open and render within **250ms** on desktop executive terminals.
To achieve this, the system combines database-level index optimizations, SQL view calculation offloading, and Next.js React Server Component (RSC) bundle trimming.

## 2. Database Optimization & Indexing Strategy
To prevent slow sequential scans on large marketing Metrics tables, the PostgreSQL schema enforces explicit indexing:
- `idx_campaigns_status_platform` on `campaigns(status, platform)`: Accelerates dashboard filtering by active campaign status and advertising platform.
- `idx_learnings_confidence` on `learnings(confidence_score DESC)`: Ensures the top organizational insights appear instantly in the knowledge base.
- **SQL View Calculation**: Financial efficiency ratios (`CTR`, `CPC`, `ROAS`, `CAC`, `Gross Profit`) are calculated inside `campaigns_with_metrics` rather than JavaScript `.map()` loops, reducing Node.js memory pressure.

## 3. Frontend & Bundle Optimization
1. **Server-First Components**:
   - Master tables and detail layouts are server-rendered. Client JavaScript is shipped only for interactive boundaries (`'use client'`) such as forms, modals, and sorting controls.
2. **Tabular Numerics (`tabular-nums`)**:
   - By rendering numbers in monospace tabular format, browser layout recalculations (reflows) are minimized when live Metrics updates animate.
3. **Modal Responsiveness**:
   - The widescreen `RecordResultsModal` (`1152px` max-width) uses CSS Flex and Grid with hardware-accelerated transitions to ensure smooth opening/closing without frame drops.

## 4. Known Performance Bottlenecks & Mitigations
- **Large Dataset Sorting**: Sorting campaigns by ROAS client-side is limited to active memory sets. For tables exceeding 5,000 rows, future releases will offload column sorting to Supabase PostgreSQL server queries.
