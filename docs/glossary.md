# Marketing Intelligence OS (MIOS) — Engineering & Marketing Glossary

## 1. Executive Summary
This Glossary defines essential marketing, mathematical, and software engineering terminology used throughout the MIOS codebase, schema, and documentation.

---

## 2. Financial & Marketing Efficiency Terms

- **CAC (Customer Acquisition Cost)**: Total marketing spend divided by the number of new customers won (`Spend / Customers Won`).
- **COGS (Cost of Goods Sold)**: Direct fulfillment and operational cost required to service a customer after acquisition.
- **CPC (Cost Per Click)**: Marketing spend divided by total link clicks (`Spend / Clicks`).
- **CPL (Cost Per Lead)**: Marketing spend divided by total qualified leads (`Spend / Qualified Leads`).
- **CTR (Click-Through Rate)**: Percentage of impressions that result in a link click (`(Clicks / Impressions) * 100`).
- **CVR (Conversion Rate)**: In MIOS, defined explicitly as the percentage of qualified inquiries or leads that convert into won customers (`(Customers Won / Qualified Leads) * 100`).
- **Gross Profit**: Total campaign revenue minus Cost of Goods Sold (`Revenue - COGS`).
- **Net Profit**: Gross profit minus advertising spend (`(Revenue - COGS) - Spend`).
- **ROAS (Return on Ad Spend)**: Gross revenue generated per rupee of advertising spend (`Revenue / Spend`). A value > 1.0 represents positive top-line return.

---

## 3. Experimental & Mathematical Terms

- **Control Baseline**: The incumbent marketing vector (creative, audience, or offer) against which experimental variations are tested.
- **Lift**: Percentage change in conversion performance between an experimental variant and the control baseline (`((Variant CVR - Control CVR) / Control CVR) * 100`).
- **Statistical Confidence**: Estimated mathematical probability that the observed lift between Control and Variant is not due to random sample variance.
- **Variant A / Variant B**: Challenger marketing vectors tested concurrently against Control.

---

## 4. Engineering & System Terms

- **AI Quick-Paste**: The heuristic parsing engine that converts unstructured ad platform clipboard text into structured numeric form fields.
- **PestControl OS**: The executive zero-emoji, 0px border-radius (`rounded-none`), high-contrast dark industrial design system used across MIOS.
- **RBAC (Role-Based Access Control)**: Authorization model assigning permissions by user profile role (`CEO`, `ADMIN`, `ANALYST`).
- **RLS (Row Level Security)**: PostgreSQL database-level security policy that filters row access based on the authenticated user session (`auth.uid()`).
- **RSC (React Server Components)**: Next.js components that render exclusively on the Node/Edge server, emitting HTML and zero client JavaScript unless wrapped in `'use client'`.
