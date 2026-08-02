# Marketing Intelligence OS (MIOS) — Service Layer & Mathematical Engines

## 1. Executive Summary & Purpose
The service layer of MIOS encapsulates core mathematical formulas, statistical confidence algorithms, and text-parsing heuristics.
By isolating these rules from individual UI components, MIOS ensures that financial efficiency ratios and experimental significance scores are calculated consistently across all views and modals.

## 2. Statistical Lift & Significance Service
- **Location**: Evaluated inside `RecordResultsModal` and database triggers/helpers.
- **Lift Calculation**:
  ```typescript
  export function calculateLift(controlCvr: number, variantCvr: number): number {
    if (controlCvr <= 0) return 0;
    const lift = ((variantCvr - controlCvr) / controlCvr) * 100;
    return Number(lift.toFixed(1));
  }
  ```
- **Confidence Scoring Algorithm**:
  - *Input*: `controlConversions`, `variantConversions`, `actualLift`
  - *Logic*:
    1. If `totalConversions >= 300` and `Math.abs(lift) >= 15%`, assign **`high`** confidence (`95%`+ score).
    2. If `totalConversions >= 150` and `Math.abs(lift) >= 10%`, assign **`medium`** confidence (`85%` score).
    3. Otherwise, assign **`low`** confidence (`60%` directional indicator).

## 3. AI Quick-Paste Ad Metric Parser Service
- **Purpose**: Converts unstructured copy-pasted text from ad platforms (Meta Ads Manager, Google Ads summaries) into structured form input fields.
- **Parsing Rules**:
  - Extracted metrics include: Spend (`spend`), Clicks (`clicks`), Impressions (`impressions`), CTR (`ctr`), and CPC (`cpc`).
  - Regex Engine matches currency symbols (`₹`, `$`, `EUR`), comma-separated thousands (`1,234.56`), and keyword labels (`Amount Spent`, `CPC (Cost per Link Click)`, `CTR (Link Click-Through Rate)`).
  - Automatically sanitizes non-numeric characters and formats numbers into tabular floats.

## 4. Financial & Metric Formatting Utilities (`@/lib/constants.ts`)
- **`formatCurrency(value: number | null)`**:
  - Converts numbers into Indian Rupee (`₹`) strings using `en-IN` locale formatting (e.g., `₹ 1,50,000`).
- **`formatPercent(value: number | null)`**:
  - Appends a monospace `%` symbol with fixed decimal precision (e.g., `24.5%`).
- **`formatNumber(value: number | null)`**:
  - Formats large impression or reach figures with Indian decimal groupings.

## 5. Failure Cases & Edge Condition Handling
- **Division by Zero Protection**: All ratio calculators wrap denominators in `NULLIF(val, 0)` in SQL or conditional `if (val === 0) return 0` in TypeScript to prevent `NaN` or `Infinity` exceptions.
- **Null Telemetry Handling**: Empty metric vectors default to `{ ctr: 0, cvr: 0, conversions: 0 }` during calculations.
