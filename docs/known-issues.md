# Marketing Intelligence OS (MIOS) — Known Issues & Limitations

## 1. Executive Summary
This document catalogs current known technical limitations, edge cases, and recommended workarounds in the MIOS runtime environment.

---

## 2. Active Known Issues

### [KI-001] AI Quick-Paste Parser Heuristic Accuracy on Non-English Ads Manager Dumps
- **Description**: The regular-expression engine in `parseAdMetricsFromText()` is optimized for English Meta Ads and Google Ads summaries (matching keywords like `Spend`, `CTR`, `CPC`, `Impressions`). If an executive pastes a text dump in a non-English locale (e.g., French or Hindi ads interface), some metrics may fail to auto-populate.
- **Workaround**: Manually enter numeric figures in the input fields if automatic extraction returns zero values.
- **Status**: Tracked for enhancement with an edge LLM parsing endpoint.

---

### [KI-002] Mobile Viewport Horizontal Scrolling on Widescreen Telemetry Modal
- **Description**: On mobile or narrow tablet viewports (< 640px), the widescreen `RecordResultsModal` (`!w-[94vw]`) requires horizontal scrolling to inspect all three columns (`Control`, `Variant A`, `Variant B`).
- **Workaround**: Rotate mobile device to landscape or perform telemetry data entry on desktop executive viewports (>= 1024px).
- **Status**: By Design (widescreen comparison matrix prioritizes desktop CEO workflow).

---

### [KI-003] Next.js Proxy/Middleware Convention Deprecation Warning in Turbopack
- **Description**: During `npm run build`, Next.js 16 emits a warning: `The "middleware" file convention is deprecated. Please use "proxy" instead.`
- **Workaround**: No functional workaround needed; route protection operates normally.
- **Status**: Scheduled for refactor in future Next.js major release.
