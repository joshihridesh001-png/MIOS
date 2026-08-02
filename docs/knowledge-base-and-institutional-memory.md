# Marketing Intelligence OS (MIOS) — Institutional Knowledge Base & Intel Vault

## 1. Executive Summary & Why This Exists
In standard SaaS dashboards, marketing insights are ephemeral—buried inside ad hoc Slack threads, forgotten campaign debriefs, or individual media buyer spreadsheets. When an employee leaves, institutional memory vanishes.

MIOS solves this by making **compounding institutional memory** a first-class architectural primitive. Every time a campaign, creative, experiment, or buyer persona reveals a verified customer psychology trigger or operational truth, it is promoted to the **Institutional Knowledge Base** (`/knowledge`).
The Knowledge Base operates as an **executive decision-enforcement engine**: no campaign may be launched without consulting verified rules that have achieved **>= 80% Confidence**.

---

## 2. Compounding Confidence & Confirmation Engine
Every entry in `public.learnings` is governed by an immutable statistical scoring loop:
- **`confirmations`**: Number of times an insight was validated in subsequent campaigns or field experiments.
- **`contradiction_count`**: Number of times empirical evidence disproved or weakened the hypothesis.
- **`confidence_score`**: Automatically calibrated on a 0–100% scale:
  $$\text{Confidence} = \min\left(100, \text{round}\left(\frac{\text{confirmations}}{\max(1, \text{confirmations} + \text{contradictions})} \times 100\right)\right)$$
- **`avg_improvement`**: Mean percentage revenue or conversion lift (`+X.X%`) attributable to applying the rule.

### Visual Confidence Tiers
- **`>= 80% CONFIDENCE`**: **Verified Campaign Mandate** (`#00dbe9` neon turquoise border & badge). Must be obeyed in all new campaigns.
- **`60–79% CONFIDENCE`**: **Confirmed Hypothesis** (`emerald-400` border & badge). Recommended for standard test vectors.
- **`40–59% CONFIDENCE`**: **Experimental Theory** (`amber-400` border & badge). Requires further A/B validation in `LABS`.
- **`< 40% CONFIDENCE`**: **Contradicted / Weak Claim** (`rose-400` border & badge). Candidate for retirement.

---

## 3. Route Topography & Component Architecture
- **`/knowledge` (`KnowledgeBasePage`)**:
  - Displays **`[ INSTITUTIONAL KNOWLEDGE BASE & INTEL VAULT ]`** with Unlumen UI `<TextReveal />`.
  - Executive KPI Summary Cards (`Total Rules Logged`, `High Confidence >=80%`, `Avg Verified Lift`, `Total Confirmations`) animated via `<AnimateCount />`.
  - Domain Filter Toolbar switching between `ALL DOMAINS`, `MARKETING`, `SALES`, `BUYER PSYCHOLOGY`, `FIELD OPERATIONS`, `PRICING`, and `COMPETITORS`.
  - Real-time tag and keyword search input.
- **`<KnowledgeCard />` (`@/components/knowledge/knowledge-card.tsx`)**:
  - Displays category badges, source type tags, confidence progress gauges, and average lift stats.
  - Contains **`[ CONFIRM ]`** and **`[ CONTRADICT ]`** buttons that increment validation counts and dynamically recalibrate `confidence_score` in real time.
  - Wrapped in `<TiltCard />` for interactive 3D perspective tilt and radial turquoise spotlight glow.
- **`<KnowledgeFormModal />` (`@/components/knowledge/knowledge-form-modal.tsx`)**:
  - Interactive widescreen sheet for logging new institutional rules, expected lift %, and tags.
- **`/learnings`**:
  - Lightweight redirection route that immediately sends users to `/knowledge`.

---

## 4. ISO/IEC 25010:2023 Quality Model Compliance
- **Functional Suitability (Completeness)**: Synthesizes data across all 5 input vectors (`campaign`, `creative`, `experiment`, `customer`, `manual`).
- **Maintainability (Modularity & Reusability)**: Hook logic is encapsulated in `useAllLearnings()` inside `use-learnings.ts`, serving both local campaign lists and the global vault.
- **Reliability & Security**: Enforced via PostgreSQL RLS policies; direct administrative seeding is isolated inside safe Node server scripts (`seed-knowledge.mjs`).
