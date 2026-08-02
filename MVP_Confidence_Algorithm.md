# MVP Confidence Algorithm
## Marketing Intelligence OS — Learning Confidence Scoring (V1)

**Version:** 1.0 (MVP)  
**Status:** ✅ Locked  
**Purpose:** Give every Learning a transparent, explainable Confidence Score (0–100)

---

## Goal

Every Learning should answer:

> "How much should we trust this learning when making the next decision?"

The score must be:
- Easy to calculate
- Fully transparent
- Understandable by CEO and CMO
- Easy to upgrade later to Bayesian models

---

## Final Formula

```text
Confidence = (
    Sample Score        × 0.30 +
    Consistency Score   × 0.25 +
    Effect Size Score   × 0.20 +
    Recency Score       × 0.15
) - Contradiction Penalty
```

**Result is clamped between 0 and 100.**

---

## 1. Sample Score (Weight: 30%)

Based on how many supporting data points exist.

| Supporting Campaigns / Evidence | Score |
|--------------------------------|-------|
| 1                              | 20    |
| 2–3                            | 45    |
| 4–6                            | 70    |
| 7–10                           | 85    |
| 11+                            | 100   |

---

## 2. Consistency Score (Weight: 25%)

```text
Consistency Score = (Confirmations / Total Tests) × 100
```

**Example:**  
Confirmed in 5 out of 7 tests → `(5 / 7) × 100 ≈ 71`

---

## 3. Effect Size Score (Weight: 20%)

Use the most relevant metric for that learning (usually CTR lift, ROAS lift, or CAC reduction).

| Average Improvement | Score |
|---------------------|-------|
| < 10%               | 30    |
| 10% – 25%           | 55    |
| 25% – 50%           | 75    |
| 50%+                | 100   |

---

## 4. Recency Score (Weight: 15%)

| Days since last confirming evidence | Score |
|-------------------------------------|-------|
| 0–30 days                           | 100   |
| 31–60 days                          | 80    |
| 61–90 days                          | 60    |
| 91–180 days                         | 40    |
| 180+ days                           | 20    |

---

## 5. Contradiction Penalty

| Number of contradicting results | Penalty |
|--------------------------------|---------|
| 0                              | 0       |
| 1                              | –15     |
| 2                              | –30     |
| 3+                             | –50     |

---

## Implementation Logic (Pseudocode)

```text
function calculateConfidence(learning):

    sample_score     = getSampleScore(learning.supporting_count)
    consistency_score = (learning.confirmations / max(learning.total_tests, 1)) * 100
    effect_score     = getEffectSizeScore(learning.avg_improvement)
    recency_score    = getRecencyScore(learning.last_confirmed_at)
    penalty          = getContradictionPenalty(learning.contradiction_count)

    confidence = (
        sample_score      * 0.30 +
        consistency_score * 0.25 +
        effect_score      * 0.20 +
        recency_score     * 0.15
    ) - penalty

    return clamp(confidence, 0, 100)
```

---

## Database Fields Required

Already included in `learnings` table (see [DATA_MODEL.md](file:///E:/MIOS/DATA_MODEL.md)):

| Field                  | Type        | Description                              |
|------------------------|-------------|------------------------------------------|
| `supporting_count`     | `integer`   | Number of supporting evidences           |
| `confirmations`        | `integer`   | Times the learning was confirmed         |
| `total_tests`          | `integer`   | Total times this pattern was tested      |
| `contradiction_count`  | `integer`   | Times it was contradicted                |
| `avg_improvement`      | `decimal`   | Average % improvement                    |
| `last_confirmed_at`    | `timestamp` | Date of last confirming evidence         |
| `confidence_score`     | `decimal`   | Final calculated score (0–100)           |
| `confidence_breakdown` | `jsonb`     | Stores individual component scores       |

---

## When to Recalculate

Recalculate the confidence score whenever:

- A new campaign result is linked to the learning
- An experiment result is recorded
- A user manually marks a result as confirming or contradicting
- A daily job runs (to update Recency scores)

---

## UI Display Rules

| Score Range | Label         | Color   |
|-------------|---------------|---------|
| 80–100      | High          | Green   |
| 60–79       | Medium-High   | Light Green |
| 40–59       | Medium        | Yellow  |
| 20–39       | Low           | Orange  |
| 0–19        | Very Low      | Red     |

**Best practice:**  
Show both the numeric score and the label.  
On hover or click, show the breakdown (Sample, Consistency, Effect Size, Recency, Penalty) so the score remains explainable.

---

## Example Calculation

**Learning:** "Fear-based hooks outperform educational hooks for termite campaigns"

- Supporting evidence: 6 → Sample Score = 70
- Confirmed 5 out of 6 times → Consistency = 83.3
- Average CTR lift = 38% → Effect Size = 75
- Last confirmation: 22 days ago → Recency = 100
- 1 contradiction → Penalty = –15

**Calculation:**
```text
(70 × 0.30) + (83.3 × 0.25) + (75 × 0.20) + (100 × 0.15) – 15
= 21 + 20.825 + 15 + 15 – 15
= 56.825 → Confidence ≈ 57
```

**Label:** Medium

---

## Future Upgrade Path

| Version | Model                              | When to Implement      |
|---------|------------------------------------|------------------------|
| V1      | Rule-based (this document)         | MVP                    |
| V2      | Independent Bayesian (Beta-Binomial) | After real data flows |
| V3      | Hierarchical / Empirical Bayes     | 100+ learnings         |

---

## Notes

- Keep the formula visible to users. Transparency builds trust.
- Allow CEO/CMO to manually override the score with a required note.
- Store the breakdown so the UI can explain the score at any time.
- This version prioritizes simplicity and explainability over statistical sophistication.
