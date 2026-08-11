# MIOS Customer Psychology & Buyer Personas Suite (Engineering Documentation)

**Governance**: Governed by `ANTI_VIBECODING_STANDARDS.md` (ISO/IEC 25010 Quality Model, SEI CERT Secure Coding, SOLID, YAGNI, KISS)  
**Status**: ACTIVE / PRODUCTION READY  
**Primary Architect**: MIOS Senior Engineering Team  

---

## 1. What Exists

The **Customer Psychology & Buyer Personas Suite** is the institutional intelligence engine of MIOS. Unlike conventional CRM systems that record static demographic contact info, MIOS focuses on **"Psychological Gold"**—capturing the emotional triggers, fears, objections, and trust builders that drive actual purchase decisions in the professional pest control industry.

### Key Components Built
1. **Database Schema (`004_customers_and_personas.sql`)**:
   - `public.customers`: Stores individual customer financial economics (INR ₹ Revenue, Profit, LTV), attribution chain (`campaign_id`, `campaign_creative_id`), pre-sale psychology (`why_contacted`, `biggest_fear`, `biggest_objection`, `why_chose_us`, `what_built_trust`), and post-job CX Metrics (`cx_rating`, `job_quality_feedback`, `improvement_opportunities`, `amc_opportunity`).
   - `public.buyer_personas`: Aggregated and customizable buyer persona clusters (`dominant_fears`, `dominant_objections`, `trust_builders`, `recommended_creative_angles`, `avg_ltv`, `avg_cx_rating`, `sample_size`, `is_custom`).
2. **AI Quick-Paste Parser (`@/lib/customer-parser.ts`)**:
   - Heuristic natural language parsing engine that allows executives to paste unstructured WhatsApp chat logs, sales call notes, or post-job technician survey debriefs directly into the UI.
   - Automatically detects 1–5 CX ratings, extracts fear/objection keywords, identifies AMC renewal opportunities, and tags operational improvement areas.
3. **Active Creative Angle Collaborator (`@/lib/persona-engine.ts`)**:
   - Synthesizes actionable ad creative angles (`hook`, `headline`, `emotion`, `psych_principle`, `rationale`) directly from a persona's dominant fears and trust builders.
   - Provides a 1-click **`[ BUILD CREATIVE FROM ANGLE ]`** button that hydrates query parameters into `/creatives/new?hook=...&headline=...&angle=...`, closing the loop between consumer research and ad production.
4. **Executive UI Components (`@/components/customers/`)**:
   - `<CustomerTable />`: High-density directory showing INR (₹) economics, LTV, CX score badges, and AMC flags.
   - `<CustomerPsychologyCard />`: Dual-column matrix displaying Pre-Sale Acquisition Triggers and Post-Job CX Metrics, featuring a **`[ PROMOTE TO LEARNING ]`** button that promotes verified customer insights into the organization-wide `learnings` table.
   - `<PersonaCard />` & `<PersonaEditModal />`: Executive view and editor supporting **Option A** (Automatic Statistical Clustering) and **Option B** (Manual Executive Overrides).
5. **App Router Pages (`app/src/app/(dashboard)/customers/`)**:
   - `/customers`: Main suite directory with executive tab switcher (`[ CUSTOMER DIRECTORY ]` vs `[ BUYER PERSONAS & CREATIVE COLLABORATOR ]`).
   - `/customers/new`: Acquisition form with embedded AI Quick-Paste Parser Box.
   - `/customers/[id]`: Detailed customer Metrics view with 1-click learning promotion.
   - `/customers/[id]/edit`: Full edit capability for existing records.

---

## 2. Why It Exists

As articulated by the CEO, the primary strategic objective of tracking customers in MIOS is **"understanding why they bought — compounded learning to further improve our consumer research and buyer psychology."**

1. **Compounding Institutional Memory**: In traditional marketing agencies, why a customer converted is locked in a salesperson's notebook or a technician's memory. When staff leave, that knowledge evaporates. MIOS indexes these reasons into permanent, queryable database columns.
2. **Eliminating Guesswork in Experiment & Ad Hypothesis Creation**: By linking `buyer_personas.recommended_creative_angles` directly to the `/experiments/new` Labs Strategy builder, new creative angles and hooks are systematically tested as growth hypotheses rather than drafted from subjective intuition. Once validated in Experiments, winning angles transition to Creatives for ongoing performance assessment.
3. **Closing the Post-Job CX Feedback Loop**: Post-service survey debriefs flag operational deficiencies (e.g. late arrival, odor complaints) and commercial opportunities (AMC renewals, referral sources). These are surfaced in the executive persona feed to improve job quality.

---

## 3. How It Works (Intelligence Flow)

```
+-----------------------------------------------------------------------------------+
|  1. RAW Metrics INPUT                                                           |
|     - WhatsApp Chat Logs / Call Transcripts / Post-Job Survey Notes                |
|     - AI Quick-Paste Parser (@/lib/customer-parser.ts)                            |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|  2. INDIVIDUAL CUSTOMER RECORD (public.customers)                                 |
|     - Attribution: lead_source -> campaign_id -> campaign_creative_id             |
|     - Pre-Sale Psychology: why_contacted, biggest_fear, biggest_objection          |
|     - Post-Job CX: cx_rating (1-5), job_quality_feedback, improvement_opportunities|
+-----------------------------------------------------------------------------------+
                   |                                             |
                   | (Promote 1-Click)                           | (Statistical Aggregation)
                   v                                             v
+---------------------------------------+   +---------------------------------------+
|  3A. ORGANIZATIONAL LEARNING          |   |  3B. BUYER PERSONA CLUSTERS           |
|      (public.learnings)               |   |      (public.buyer_personas)          |
|      - source_type: 'customer'        |   |      - dominant_fears & objections     |
|      - Compounds across campaigns     |   |      - avg_ltv & avg_cx_rating         |
+---------------------------------------+   +---------------------------------------+
                                                                 |
                                                                 v
                                            +---------------------------------------+
                                            |  4. ACTIVE EXPERIMENT COLLABORATOR    |
|      - Synthesizes Hook & Headline    |
|      - Hydrates /experiments/new      |
                                            +---------------------------------------+
```

---

## 4. ISO/IEC 25010 Quality & Compliance Record

- **Maintainability**: Pure functional helpers in `@/lib/customer-parser.ts` and `@/lib/persona-engine.ts` have cyclomatic complexity $\le 10$ and are decoupled from React UI components.
- **Reliability**: All Supabase database mutations handle fallible operations explicitly with typed error boundaries and toast feedback via `sonner`.
- **Usability (Visual Contrast & Typography)**: Complies with WCAG AA/AAA and executive readability standards by rendering descriptive subtitles, table headers, property labels, and attribution text in bright, high-contrast grey (`text-gray-300` / `text-gray-200`, luminance matched with white foreground text) on deep dark backgrounds (`#000000` / `oklch(0.13 0.02 260)`), eliminating dim or dull unreadable text.
- **Security (SEI CERT)**: RLS policies are enabled on both `public.customers` and `public.buyer_personas`. Input parsing sanitizes and validates numeric ratings ($1 \le \text{cx\_rating} \le 5$).
- **Functional Suitability**: Supports **Option A** (statistical aggregation), **Option B** (manual executive overrides via modal), and **Option C** (AI Quick-Paste form entry) simultaneously without mutual exclusion.
