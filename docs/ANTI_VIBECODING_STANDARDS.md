# MIOS Implementation Guidelines & Anti-Vibecoding Standards

**Status:** Mandatory for all contributors  
**Audience:** Engineering, Design, and Product Teams  
**Purpose:** To establish and enforce strict structural, visual, and architectural standards for the MIOS platform. This document serves as a mandatory checklist for code reviews, design system integration, and onboarding.

The MIOS platform is an internal executive decision-making tool. Its audience consists of C-suite executives, marketing directors, and senior analysts who rely on this system for high-stakes strategic decisions. The platform must embody **institutional discipline**, not startup velocity or developer experimentation.

---

## 1. Visual and Interface Architecture

All interface surfaces must communicate authority and intentionality. We categorically reject any aesthetic impulse toward decoration, trend, or novelty. 

### Hard Constraints:
- **No Decorative Gradients:** Gradients may only serve functional purposes (e.g., indicating scroll boundaries or depth in data visualization). Any gradient used must be subtle, single-axis, and derived exclusively from the established monochrome palette.
- **Prohibited Aesthetics:** Neon glows, glassmorphism, frosted effects, and cyberpunk/terminal-inspired visual languages are strictly forbidden, regardless of their prevalence in developer communities.
- **No Faux-Technical Embellishments:** Dashboard or console-style embellishments—including simulated system logs, memory indicators, faux-technical readouts, "SYS" prefixes, "ALPHA" or "PROTOCOL" labels, and similar developer-culture signifiers—are forbidden entirely.
- **Strict Motion Rules:** Motion and animation must be reserved exclusively for state transitions that clarify change (e.g., data loading, context switching). Decorative loading spinners, bouncing elements, or ambient motion have no place in this system.
- **Geometry & Shape:** Corner radii must be minimal and consistent. Sharp edges are preferred for data tables, cards, and containers.
- **Color Palette:** The color system is restricted to a monochrome base of grays, whites, and blacks, plus **one** functional accent color reserved strictly for primary actions and critical data highlights.
- **State Design Rigor:** Every screen state (empty, loading, error) must be designed with the same rigor as primary workflows:
  - **Empty States:** Must guide toward next actions without apologetic or playful language.
  - **Loading States:** Must indicate progress honestly without theatricality.
  - **Error States:** Must present actionable information with precise technical references for support escalation.

---

## 2. Codebase Structural Requirements

The codebase must reflect the same discipline as the user interface. Magic is forbidden; explicitness is required.

### Hard Constraints:
- **Strict TypeScript:** TypeScript configuration must enforce strict mode without exception. `any` types are prohibited in all production code; their presence in pull requests constitutes an automatic block.
- **Explicit Typings:** Every type definition must be explicit, exported where shared, and documented when non-obvious.
- **Component Decomposition:** Component architecture must follow single-responsibility principles. If a component exceeds 200 lines, it requires explicit decomposition justification in the pull request description.
- **Naming Conventions:** Function naming must describe action and target precisely. Abbreviations are prohibited except for universally established industry terms.
- **No Clever Abstractions:** Excessive higher-order components, deep composition patterns, or dynamic dispatch systems that obscure execution flow are discouraged. Prefer repetition of explicit patterns over magical consolidation.
- **No Leftover Technical Debt:** No `TODO` comments, `FIXME` markers, or placeholder implementations may be merged to main branches. Feature flags for incomplete functionality must be explicitly scoped and tracked in project management systems with strict removal deadlines.
- **Dependency Control:** The introduction of new UI dependencies or visual libraries requires written architectural review approval. Any library that introduces conflicting design tokens, animation defaults, or component APIs must be rejected or fully adapted before integration.
- **Comment Utility:** All code comments must explain *why*, not *what*. Obvious operations require no annotation, while business logic or non-intuitive constraints must reference decision documentation.

---

## 3. Product Logic and Decision Integrity

The system exists to facilitate executive decision-making. If a feature does not improve a decision, it does not belong in the system.

### Hard Constraints:
- **Written Decision Justification:** Every feature proposal must answer, in writing, the specific decision question it enables. Features that improve engagement metrics, system impressiveness, or developer experience without directly enhancing executive decision quality must be simplified or eliminated.
- **Justified Complexity:** Complexity in data presentation (nested visualizations, multi-axis charts, interactive filtering systems) must be justified by a demonstrated improvement in decision accuracy or speed. If a simpler presentation conveys the same information, it must be preferred.
- **Methodological Transparency:** Statistical indicators (sample size warnings, confidence intervals, comparative metrics) must be displayed with full transparency:
  - The calculation approach must be accessible via inline documentation.
  - Uncertainty must be visible rather than hidden behind confidence thresholds.
  - Comparisons must include explicit temporal or segment scoping.
- **Traceable Insights:** The learning extraction system must present its reasoning chain for human review. No insight should appear without traceable derivation. The system must flag when human judgment is essential versus when pattern recognition is sufficiently robust.
- **Automated Recommendations:** Must be explicitly labeled as automated, with confidence calibration and override affordances always visible.

---

## 4. Language, Labeling, and Tone Standards

All user-facing text and internal documentation must be plain, precise, and verifiable.

### Hard Constraints:
- **No Marketing Fluff:** Marketing terminology—including "unlock," "supercharge," "revolutionize," "synergy," "leverage," and similar promotional constructions—is prohibited in interface copy.
- **Professional Intelligibility:** Labels for features, metrics, and controls must be intelligible to a marketing professional without developer translation (e.g., prefer "Campaign Spend" over "Cost Dimension," "Response Rate" over "Engagement Coefficient").
- **Clinical Error Messaging:** Error messages must state what occurred, what is affected, and what action to take, without personality or reassurance filler.
- **Internal Tone:** Internal documentation and code comments must maintain the same plainness. Jokes, cultural references, or motivational framing have no place in this codebase.

---

## 5. Completion and Acceptance Criteria

A change is considered complete only when it has been validated against four strict criteria by both the implementing engineer and the reviewing architect:

1. **Visual Calm:** A neutral observer must describe the interface as restrained and professional without prompting.
2. **Structural Cleanliness:** The implementation must pass static analysis, type checking, and peer review for clarity and explicitness.
3. **Decision Utility:** A stakeholder must be able to articulate what better decision this change enables, with specificity.
4. **Noise Elimination:** The change must not introduce visual elements, conceptual abstractions, or workflow steps that do not directly serve user goals.

> **The Default is Rejection:** The default disposition toward any choice that feels innovative, impressive, or satisfying to build is rejection. Such choices may proceed only with explicit justification that clarity and trust are preserved or enhanced. 
> 
> **When in doubt between two implementations, select the one that will appear more obvious to a new team member in six months and more trustworthy to an executive user in six seconds.**
