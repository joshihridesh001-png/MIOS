# Marketing Intelligence OS (MIOS) — Testing & Quality Assurance Guide

## 1. Executive Summary & Testing Strategy
Quality assurance in MIOS is divided into three tiers:
1. **Automated Static & Build Verification**: TypeScript compiler validation and Next.js Turbopack build assertion.
2. **Mathematical & Statistical Verification**: Ensuring the Lift calculation engine (`((variant - control) / control) * 100`) and sample-size confidence scoring match expected statistical benchmarks.
3. **Executive UX & Visual Regression Verification**: Ensuring all UI surfaces conform to the zero-emoji, 0px border-radius (`rounded-none`), and widescreen sheet layouts.

## 2. Automated Verification Pipeline
```bash
# Type checking across all App Router pages and Supabase typed queries
npx tsc --noEmit

# Full production compile & route verification
npm run build
```
- **Success Criteria**: `✓ Compiled successfully` with zero type mismatch errors or broken RSC boundaries.

## 3. Mathematical Verification Protocol (Lift & Significance)
When modifying `RecordResultsModal` or statistical helpers, verify these test cases:

| Control CVR | Variant CVR | Expected Lift (%) | Conversions | Expected Confidence Tier |
| :---: | :---: | :---: | :---: | :---: |
| `1.80%` | `2.40%` | `+33.3%` | `189` (`>= 150`) | **`medium`** (`85%`) |
| `1.80%` | `2.70%` | `+50.0%` | `350` (`>= 300`) | **`high`** (`95%`+) |
| `2.00%` | `1.50%` | `-25.0%` | `120` (`< 150`) | **`low`** (`60%`) |
| `0.00%` | `2.50%` | `0.0%` (Zero Guard) | `50` | **`low`** |

## 4. Manual Executive UX Checklist
- [ ] Open `/experiments/[id]` and click **`RECORD RESULTS`**. Verify the modal expands to `1152px` (`sm:!max-w-6xl`) on desktop.
- [ ] Test the **AI Quick-Paste** box in `/creatives/new` by pasting raw Meta Ads text and confirming CTR, CPC, and Spend fields populate automatically.
- [ ] Verify that no emojis render anywhere in the DOM across all tables and toast alerts.
