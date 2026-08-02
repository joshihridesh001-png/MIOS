# Marketing Intelligence OS (MIOS) — UX Research & UI Implementation Hypothesis: Customer Profiles & Buyer Personas

## 1. Executive Summary & Core Objective
In conventional SaaS tools, "Buyer Personas" are static documents that do not interact with advertising campaigns or field operations.
In MIOS, **Customer Profiles & Buyer Personas** serve as an active, bidirectional intelligence engine:
1. **Pre-Sale Consumer Psychology**: Why did they contact us? What was their #1 fear and objection? What built trust?
2. **Post-Job CX & Operational Feedback**: What was their 1–5 CX rating? What will improve our job quality on-site? What Annual Maintenance Contract (AMC) or referral opportunities exist?
3. **Active Creative Library Collaboration**: Personas systematically analyze customer fears and objections to generate high-converting **Creative Angle Recommendations** (Hook, Emotion, Psychological Principle) that feed directly into `/creatives/new`.

---

## 2. Executive Workflow Mapping & Persona Journey

```mermaid
graph TD
    subgraph "1. Ingestion & Attribution"
        Lead["New Lead Acquired (/customers/new)"]
        Chat["Paste Raw WhatsApp / Sales Call Notes"]
        Survey["Paste Post-Job CX Survey Notes"]
        Parser["AI Quick-Paste Parser (@/lib/customer-parser.ts)"]
    end

    subgraph "2. Customer Psychology & CX Profile (/customers/[id])"
        Profile["Customer Profile Row"]
        Attribution["Campaign & Creative Attribution Chain"]
        Psych["Pre-Sale Psychology Matrix (Fears, Objections, Trust)"]
        CX["Post-Job CX Matrix (CX Rating, Job Quality, AMC)"]
    end

    subgraph "3. Persona Intelligence Suite (/customers/personas)"
        Cluster["Automatic / Editable Buyer Personas"]
        Angles["Active Creative Angle Generator"]
        Rate["Creative Relevance Rating Weight"]
    end

    subgraph "4. Compounding Organizational Action"
        Learn["[ PROMOTE TO LEARNING ] (/learnings)"]
        Create["[ BUILD CREATIVE FROM ANGLE ] (/creatives/new)"]
        Ops["[ CX IMPROVEMENT OPPORTUNITIES ] (Operations Feed)"]
    end

    Lead --> Chat
    Lead --> Survey
    Chat --> Parser
    Survey --> Parser
    Parser --> Profile
    Profile --> Attribution
    Profile --> Psych
    Profile --> CX
    Psych --> Cluster
    CX --> Cluster
    Cluster --> Angles
    Angles --> Rate
    Angles --> Create
    Psych --> Learn
    CX --> Ops
```

---

## 3. Formal UI Implementation Hypothesis

### The Scientific Hypothesis
> **We believe that** combining individual customer psychological profiles and post-job CX feedback into **Active Buyer Personas that directly recommend and rate ad creative angles** for our marketing and sales executives  
> **will achieve** a **+25% increase in creative CTR and higher repeat AMC conversion**  
> **as measured by** creative efficiency ratings, customer lifetime value (LTV), and reduction in post-job operational complaints.

### Key UX Design Interventions
1. **Widescreen 2-Column Customer Detail View (`/customers/[id]`)**:
   - *Left Column (Economics & Attribution)*: Financial ratios (`Revenue`, `Profit`, `LTV`) and clickable attribution links (`Campaign` → `Creative`).
   - *Right Column (Psychology & CX Gold Mine)*: Distinct terminal cards for Pre-Sale Psychology (`Why Contacted`, `Biggest Fear`, `Biggest Objection`, `Why Chose Us`) and Post-Job CX (`CX Score 1-5`, `Job Quality Feedback`, `Improvement Opportunities`).
   - *Action Bar*: High-contrast **`[ PROMOTE TO LEARNING ]`** and **`[ LOG AMC OPPORTUNITY ]`** terminal buttons.
2. **Active Persona Cards with Creative Collaborator (`/customers/personas`)**:
   - Displays aggregated cluster metrics (`Sample Size`, `Avg LTV`, `Avg CX Rating`).
   - **Active Creative Angles Panel**: Systematically lists 3 recommended creative angles (Hook, Emotion, Rationale) derived from the Persona's #1 Fear and Objection.
   - **`[ BUILD CREATIVE FROM ANGLE ]`** button that pre-populates `/creatives/new` with the recommended Hook, Headline, and Psychological Principle.
3. **Unified AI Quick-Paste Box**:
   - A single multi-purpose paste box that accepts WhatsApp customer chats, sales calls, OR post-job technician debriefs and maps them into both Pre-Sale and Post-Job CX fields.
