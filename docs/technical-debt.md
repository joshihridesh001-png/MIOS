# Marketing Intelligence OS (MIOS) — Technical Debt & Refactoring Register

## 1. Executive Summary
This document registers architectural shortcuts, temporary trade-offs, and scheduled technical debt remediation across the MIOS codebase.
Every item is categorized by risk, priority, and clear engineering criteria for its ideal solution.

---

## 2. Technical Debt Register

### [DEBT-001] Client-Side Campaign List Sorting & Filtering
- **Shortcut**: Campaign list filtering and sorting by ROAS / Spend are performed in client memory within `CampaignTable` after fetching the full campaign dataset.
- **Reason**: Rapid MVP prototyping and avoiding complex dynamic RPC order-by clauses.
- **Risk**: Low for current organizational datasets (< 1,000 campaigns), but will degrade browser memory and initial load speed as campaign archives grow beyond 5,000 rows.
- **Priority**: Medium
- **Ideal Solution**: Implement server-side cursor pagination and dynamic order-by query parameters in `useCampaigns()` / Supabase RPC functions.

---

### [DEBT-002] Regex-Based AI Quick-Paste Ad Metric Parser
- **Shortcut**: `parseAdMetricsFromText()` relies on regular expressions to identify keywords (`Spend`, `CTR`, `CPC`) and currency symbols.
- **Reason**: Operates instantaneously with zero external API latency or LLM token costs.
- **Risk**: Susceptible to breaking if ad networks change their default copy-paste table formatting or export headers.
- **Priority**: Low
- **Ideal Solution**: Provide an optional fallback switch to a fine-tuned edge LLM worker (`@cloudflare/ai` or Google Gemini Flash Lite) for ambiguous text dumps.

---

### [DEBT-003] Next.js `middleware.ts` to `proxy.ts` Convention Migration
- **Shortcut**: Authentication session checking uses Next.js `middleware.ts` convention.
- **Reason**: Legacy compatibility with standard Next.js 14/15 Supabase Auth templates.
- **Risk**: Low (currently triggers a non-fatal deprecation warning during build).
- **Priority**: Low
- **Ideal Solution**: Migrate auth session interception to the new `proxy.ts` convention introduced in Next.js 16.2+.
