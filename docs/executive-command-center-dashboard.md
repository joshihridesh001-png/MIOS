# MIOS — Executive Command Center Dashboard (`/dashboard`)

The **Executive Command Center Dashboard** (`/dashboard`) is the top-level synthesis cockpit of **Marketing Intelligence OS (MIOS)**. Designed in strict compliance with `ADR-001` (ISO/IEC 25010 Quality Model, tabular numerics, zero-emoji aesthetic, and high-contrast `#000000` / `#00dbe9` terminal styling), `/dashboard` unifies all five functional pillars of MIOS into a single real-time command console.

---

## 1. Executive Suite Topography & Architecture

```
                       +-----------------------------------+
                       |    /dashboard (Master Cockpit)    |
                       +-----------------+-----------------+
                                         |
         +-------------------------------+-------------------------------+
         |               |               |               |               |
         v               v               v               v               v
  +--------------+ +--------------+ +--------------+ +--------------+ +--------------+
  |  /campaigns  | |  /creatives  | | /experiments | |  /customers  | |  /knowledge  |
  |  (Spend/ROAS)| |  (Ad Assets) | |  (LABS A/B)  | |  (Personas)  | |  (Intel Rule)|
  +--------------+ +--------------+ +--------------+ +--------------+ +--------------+
```

### Key Components
1. **`<DashboardHeader />` (`@/components/dashboard/dashboard-header.tsx`)**:
   - Features Unlumen UI `<TextReveal />` header animation: `" [ MIOS EXECUTIVE COMMAND CENTER ] "`.
   - Displays real-time **Period Telemetry Filter**: `[ ALL TIME ]`, `[ 30D ]`, `[ 7D ]`, `[ MTD ]`.
   - Displays **Channel / Platform Selector**: `[ ALL PLATFORMS ]`, `[ META ADS ]`, `[ GOOGLE ADS ]`, `[ WHATSAPP ]`, `[ OFFLINE ]`.

2. **`<BenchmarkAlerts />` (`@/components/dashboard/benchmark-alerts.tsx`)**:
   - Real-time rule-engine telemetry warnings for active campaigns breaching executive thresholds:
     - **ROAS Benchmark Breach**: `ROAS < 1.50×` when `Spend >= ₹2,000`.
     - **Negative Net Profit Alert**: `Net Profit < ₹0` when `Spend >= ₹5,000`.
     - **Elevated CAC Warning**: `CAC > ₹2,000`.
     - **High ROAS Winner Celebration**: `ROAS >= 3.00×` indicating budget scale opportunities.
   - Provides direct **`[ AUDIT CAMPAIGN ]`** links jumping to `/campaigns/[id]`.

3. **`<DashboardKPIs />` (`@/components/dashboard/dashboard-kpis.tsx`)**:
   - 4x2 grid of 3D `<TiltCard />` components powered by `<AnimateCount />` with Indian currency formatting (`₹1,00,000`):
     - **Total Revenue Generated** & Gross Profit
     - **Net Profit (Post-Spend)** & Net Margin %
     - **Blended ROAS** (with `>= 2.00×` target benchmark)
     - **Total Marketing Spend** & Blended CAC
     - **Customers Won** & Lead-to-Customer CVR %
     - **Active LABS Experiments** & Statistically Significant Winners
     - **Verified Institutional Rules** (`>= 80% Confidence`)
     - **Post-Job CX Telemetry** (Average out of 5.0)

4. **`<PipelineGrid />` (`@/components/dashboard/pipeline-grid.tsx`)**:
   - 4-Pillar interactive intelligence preview powered by `<AnimatedList />`:
     - Pillar 1: Top Campaigns by ROAS & Profit (`/campaigns`)
     - Pillar 2: Active A/B Test Hypotheses & Winners (`/experiments`)
     - Pillar 3: High-Confidence Institutional Mandates (`/knowledge`)
     - Pillar 4: Recent Customer Psychology Profiles & LTV (`/customers`)

5. **Executive AI Diagnostics & Strategy Mandates (`<MotionAccordion />`)**:
   - Synthesizes cross-module learnings into four executive action mandates:
     - *Mandate 1*: Lowering blended CAC via 5-minute WhatsApp call SLA (`#MKT-001`).
     - *Mandate 2*: Rotating odourless chemical guarantee creatives for 2.3× higher ROAS.
     - *Mandate 3*: Using `>=80%` confidence rules to flag conflicting campaign proposals.
     - *Mandate 4*: Reallocating top-of-funnel display spend into commercial termite AMC search intent.

---

## 2. Telemetry Aggregation Engine (`useDashboard`)

The custom hook `@/hooks/use-dashboard.ts` fetches data in parallel across all Supabase tables (`campaigns_with_metrics`, `experiments`, `customers`, `learnings`, `creatives`), applies client-side date and platform filtering, and computes blended financial ratios:

$$\text{Blended ROAS} = \frac{\sum \text{Revenue}}{\sum \text{Spend}}, \quad \text{Blended CAC} = \frac{\sum \text{Spend}}{\sum \text{Customers Won}}, \quad \text{CVR} = \frac{\sum \text{Customers Won}}{\sum \text{Qualified Leads}} \times 100$$

---

## 3. Compliance & Architectural Verification

| Standard / Verification | Implementation Details | Status |
|---|---|---|
| **ADR-001 Zero-Emoji Rule** | Strict terminal text badges (`[ AUDIT CAMPAIGN ]`, `[ SYSTEM ONLINE ]`) | ✅ PASS |
| **ISO/IEC 25010 Usability** | Full-screen responsive grid with period and platform filters | ✅ PASS |
| **Production Bundle Test** | Validated via `npm run build` (`16/16` routes compiled in `347ms`) | ✅ PASS |
