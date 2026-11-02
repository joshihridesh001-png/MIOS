# MIOS Systems Thinking Engineering Worklog & Decision Ledger

> **Framework Applied:** *How Hridesh Thinks About Systems — A Practical Systemisation & System-Design Manual*  
> **Architecture Standard:** *Anti-Vibecoding Standards (`docs/ANTI_VIBECODING_STANDARDS.md`)*  
> **Date:** 2026-11-02  
> **Scope:** Complete transformation of MIOS from a single-vertical (pest control) static tracker into an **Industry-Agnostic Marketing Intelligence & Data Science Capital Allocation OS** for service businesses.

---

## 0. Core Philosophy & Desired State (Manual Sections 0–3)

### The Premise
A marketing intelligence system cannot be designed around static, hardcoded industry rules (`cac > 2000`, `roas < 1.5`, `pest_type`). Service businesses operate across radically different economic and temporal realities:
- **B2B Accounting / Advisory Firm:** ₹1,80,000+ LTV, 75% gross margin, 30–45 day sales cycle ($\Delta t$), ₹45,000 Max Allowable CAC.
- **Brick-and-Mortar Clinic / Studio:** ₹18,000 LTV, 65% gross margin, 5-day sales cycle ($\Delta t$), ₹3,900 Max Allowable CAC.
- **Home & Field Services:** ₹12,000 LTV, 60% gross margin, 3-day sales cycle ($\Delta t$), ₹2,400 Max Allowable CAC.

### The Desired State
Any service business operator can open MIOS and immediately know:
1. **Where to allocate the next rupee/dollar of ad spend** (`Exploit` proven winners vs. `Explore` new hooks vs. `Hold` for sales-cycle maturation vs. `Reallocate/Kill`).
2. **Whether a campaign is genuinely failing or simply inside its Sales-Cycle Lag Window ($\Delta t$)** via leading indicator (`CPL`) evaluation.
3. **Which exact stage and underlying assumption in their funnel just broke** (`Impression → Click → Inquiry → Qualified → Proposal → Won`), and what counterfactual experiment to run next.

---

## 1. Orchestration Architecture & Subagent Delegation (Manual Sections 15 & 26)

To obey **Section 15 (Design Through Small Systems)** and **Section 31 Improvement 5 (Complexity Budget)**, work was decomposed into **4 sequential phases** executed by **3 specialized subagents** operating under strict file-isolation boundaries:

| Subagent | Role & Responsibility | Owned Boundary |
| :--- | :--- | :--- |
| **[`ontology_schema_engineer`](conversation://27adc0e0-fcc0-41ef-88c4-c9bd058b7755)** | Data model ontology, Postgres migrations (self-hosted VPS ready), TypeScript interfaces, and domain constants. | `src/lib/types/database.ts`, `src/lib/constants.ts`, `supabase/migrations/*.sql`, `docs/DATA_MODEL.md`, `docs/DECISIONS.md` |
| **[`quant_decision_engineer`](conversation://6467eafc-3318-432e-a965-9617818f3abf)** | Pure mathematical & statistical decision engines, heuristic NLP parsers, and adversarial Vitest unit suites. | `src/lib/utils/unit-economics.ts`, `src/lib/utils/capital-allocator.ts`, `src/lib/utils/funnel-diagnostics.ts`, `src/lib/persona-engine.ts`, `src/lib/*-parser.ts`, `src/lib/__tests__/*.test.ts` |
| **[`executive_ui_engineer`](conversation://1a037dd9-2063-4ade-89fa-c27ea9d1c276)** | Restrained executive React components, calibration controls, local + DB hybrid hooks, and telemetry views. | `src/hooks/*.ts`, `src/components/**/*.tsx`, `src/app/**/*.tsx` |

---

## 2. Phase-by-Phase Worklog & Systems Decisions

### Phase 0: Complete Pest-Control Eradication & Schema Sanitization
- **Problem Attacked:** Legacy vertical assumptions (`pest_type`, `property_type`, `amc_opportunity`, termite/bedbug/cockroach seed data, botanical spray hooks, technician odor checklists) polluted both the database schema and frontend UI.
- **Decisions Made:**
  1. **Database Schema Generalization:** Replaced `campaigns.pest_type` with `market_segment`, `customers.property_type` with `client_segment` (`'b2c' | 'b2b_smb' | 'b2b_mid_market' | 'b2b_enterprise' | 'local_service' | 'other'`), `customers.amc_opportunity` with `retainer_opportunity`, and `buyer_personas.pest_type` with `service_category`.
  2. **Idempotent Live VPS Migration (`006_industry_agnostic_schema.sql`):** Engineered a non-destructive `DO $$ ... END $$` migration that renames legacy columns in place, refreshes the `campaigns_with_metrics` view, deletes the legacy bedbug/rodent personas, and seeds two universal personas (*High-Intent B2B Retainer Decision Maker* and *Local Brick-and-Mortar High-LTV Client*).
  3. **Universal NLP Psychology Parsers (`persona-engine.ts`, `customer-parser.ts`, `campaign-parser.ts`):** Rewrote keyword extraction and creative angle synthesis around universal service-business psychology: Cost of Inaction / Compliance Risk, Switching Cost / Retainer ROI Objections, SLA & Case-Study Trust Builders, and Recurring Retainer Opportunities.
- **Commit:** `969ac05` (`26 files changed`)

---

### Module 1 (Step 1): First-Principles Unit Economics & Sales-Cycle Lag ($\Delta t$) Engine
- **Problem Attacked:** Static dashboard alerts (`cac > 2000`, `roas < 1.5`) triggered false-positive panic on high-ticket B2B services and prematurely told operators to pause campaigns before leads had time to close through a multi-week sales cycle.
- **Objective Truths Encoded (`src/lib/utils/unit-economics.ts`):**
  1. **Lifetime Gross Profit:**
     $$\text{Lifetime Gross Profit} = \text{Avg LTV} \times \left(\frac{\text{Gross Margin \%}}{100}\right)$$
  2. **Max Allowable CAC:**
     $$\text{Max Allowable CAC} = \frac{\text{Lifetime Gross Profit}}{\text{Target LTV:CAC Ratio}}$$
  3. **Max Allowable CPL (Leading Indicator Ceiling):**
     $$\text{Max Allowable CPL} = \text{Max Allowable CAC} \times \left(\frac{\text{Target Lead-to-Close \%}}{100}\right)$$
  4. **Break-Even ROAS:**
     $$\text{Break-Even ROAS} = \frac{1}{\text{Gross Margin \%} / 100}$$
- **Decisions Made:**
  - **Sales-Cycle Lag Protection ($\Delta t$):** When `daysRunning < avg_sales_cycle_days`, the engine suppresses lagging ROAS/CAC breach warnings and instead evaluates `CPL` against `Max Allowable CPL`. Healthy early campaigns receive an amber `IN SALES PIPELINE WINDOW` status (`pipeline_lag`), while early CPL overruns trigger an immediate `LEADING CPL BREACH` warning.
  - **Hybrid Persistence (`use-unit-economics.ts` + `007_business_unit_economics.sql`):** Instant zero-latency `localStorage` hydration paired with `public.business_unit_economics` Postgres persistence and 4 one-click industry presets on the Dashboard (`unit-economics-bar.tsx`).
- **Verification:** `5/5` unit test suites added in `unit-economics.test.ts`.
- **Commit:** `1b65d15` (`10 files changed`)

---

### Module 2 (Step 2): Data Science Capital Allocator (Explore vs. Exploit & Impact Scoring)
- **Problem Attacked:** Dashboards show what happened in the past, but leave capital allocation, creative fatigue diagnosis, and prioritization to human guesswork.
- **Systems Manual Improvements Encoded (`src/lib/utils/capital-allocator.ts`):**
  1. **Improvement 1 — Explicit Impact Scoring:**
     $$\text{Impact Score} = \text{Outcome Impact} \times \text{Statistical Confidence} \times \text{Relevance} \times \text{Urgency}$$
     Normalized to `1–100` to rank every campaign and creative decision by expected value.
  2. **Improvement 2 — Separate Signal Detection From Causal Attribution:**
     Every recommendation in `capital-allocator-panel.tsx` explicitly separates:
     - **Observed Signal:** Objective telemetry vs. unit-economic thresholds.
     - **Causal Hypothesis:** Distinguishes *Top-of-Funnel Creative Fatigue* from *Downstream Offer / Sales Qualification Leakage* (e.g., when CPL is below Max Allowable CPL, but closed ROAS lags Break-Even ROAS).
     - **Counterfactual Action:** Concrete budget delta (`+25%` scale, `0%` pipeline hold, `-20%` creative hook refresh, or `-100%` pause & redeploy).
  3. **Improvement 10 — Dynamic Exploration vs. Exploitation Split:**
     Automatically shifts portfolio guidance between `80% Exploit / 20% Explore` (stable high-performing regime), `70% / 30%` (balanced growth), and `55% Exploit / 45% Explore` (when at-risk spend exceeds 35% of portfolio).
- **Verification:** `7/7` unit test suites added in `capital-allocator.test.ts`.
- **Commit:** `fb05c4a` (`7 files changed`)

---

### Module 3 (Step 3): Assumption Ledger, Predefined Kill Criteria & Funnel Bottleneck Locator
- **Problem Attacked:** Teams get emotionally attached to losing campaigns (sunk-cost fallacy), treat irreversible pricing/positioning changes the same as reversible ad-copy tests, and patch symptoms instead of attacking underlying assumptions.
- **Systems Manual Improvements Encoded (`src/lib/utils/funnel-diagnostics.ts` & `assumption-ledger-panel.tsx`):**
  1. **5-Stage Causal Funnel Bottleneck Locator (`diagnoseCampaignFunnel`):**
     Evaluates `Impressions → Clicks (1.5%)`, `Clicks → Inquiries (8.0%)`, `Inquiries → Qualified Leads (45.0%)`, `Qualified → Proposals Sent (65.0%)`, and `Proposals → Clients Won (Dynamic Close Benchmark)`. Isolates the primary bottleneck stage and outputs the exact **Broken Assumption** and **Prescribed Intervention**.
  2. **Improvement 8 — Predefined Kill Criteria (`killSwitchTriggered`):**
     Automatically triggers an executive Kill-Switch alert when a campaign spends $>1.5\times$ the evaluation floor with `0` qualified leads, or completes its full $\Delta t$ sales cycle with $>2\times$ evaluation spend at $<70\%$ of Break-Even ROAS.
  3. **Improvements 3, 4, & 7 — Assumption Ledger & Reversibility Tagging (`008_assumption_ledger_and_kill_criteria.sql`):**
     Tracks `Assumption → Evidence → Confidence → Reversibility (2-Way Door vs. 1-Way Door) → Consequence if Wrong → Falsification Test → Predefined Kill Criteria`, and automatically suggests `'validated'` or `'falsified'` based on linked campaign telemetry.
- **Verification:** `6/6` unit test suites added in `funnel-diagnostics.test.ts`.

---

## 3. Final Verification & Test Matrix

| Test Suite | File | Tests | Status |
| :--- | :--- | :---: | :---: |
| **Statistical Lift & Z-Score Engine** | [`src/lib/__tests__/statistical-lift.test.ts`](file:///E:/MIOS/src/lib/__tests__/statistical-lift.test.ts) | 11 | ✅ PASS |
| **Multi-Channel Sample Size Engine** | [`src/lib/__tests__/sample-size-calculator.test.ts`](file:///E:/MIOS/src/lib/__tests__/sample-size-calculator.test.ts) | 7 | ✅ PASS |
| **Unit Economics & Sales-Cycle Lag ($\Delta t$)** | [`src/lib/__tests__/unit-economics.test.ts`](file:///E:/MIOS/src/lib/__tests__/unit-economics.test.ts) | 5 | ✅ PASS |
| **Capital Allocator & Impact Score** | [`src/lib/__tests__/capital-allocator.test.ts`](file:///E:/MIOS/src/lib/__tests__/capital-allocator.test.ts) | 7 | ✅ PASS |
| **Funnel Diagnostics & Kill-Switch** | [`src/lib/__tests__/funnel-diagnostics.test.ts`](file:///E:/MIOS/src/lib/__tests__/funnel-diagnostics.test.ts) | 6 | ✅ PASS |
| **Total Automated Verification** | **5 Suites (`npx tsc --noEmit` + `vitest`)** | **36** | **✅ 100% PASS** |
