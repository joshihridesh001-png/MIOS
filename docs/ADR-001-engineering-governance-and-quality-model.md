# ADR-001: Adoption of ISO/IEC 25010 and SEI CERT Engineering Governance Charter

## Status
**Accepted** (2026-08-02) — Immutable reference for all future PRs and architectural reviews.

---

## 1. Context & Architectural Motivation
As Marketing Intelligence OS (MIOS) scales to handle executive financial data, experimental telemetry, and multi-tenant marketing metrics, ad-hoc coding conventions and unvalidated shortcuts pose significant risks to **Maintainability**, **Reliability**, **Security**, and **Functional Suitability** (ISO/IEC 25010:2023).

To guarantee that the codebase remains analyzable, testable, and free of preventable technical debt, MIOS requires an authoritative, constitutional quality charter that governs all software lifecycle activities—from pre-implementation reasoning to CI/CD merge gates.

---

## 2. Decision & Constitutional Rules

### 2.1 Quality Model & Design Principles
All production code, components, services, and tests must strictly conform to:
- **ISO/IEC 25010:2023**: Prioritizing Maintainability (modularity, reusability, analyzability), Reliability (fault tolerance, recoverability), and Security (confidentiality, integrity).
- **SOLID / DRY / KISS / YAGNI**:
  - **Single Responsibility Principle (SRP)**: Every function, hook, or component must have exactly one reason to change.
  - **YAGNI & KISS**: Zero speculative features or future-proofing abstractions; target cyclomatic complexity `≤ 10–15` per path.
- **SEI CERT & Google Engineering Practices**: Explicit error handling on all fallible operations, strict input allow-listing, zero magic literals, and no swallowed exceptions.

### 2.2 Mandatory Pre-Implementation Reasoning Protocol
Before writing or refactoring code, engineers must articulate:
1. **Problem & Success Criteria** (what is solved and how it is verified).
2. **Architectural Context** (where it lives within Next.js RSC, Supabase RLS, or UI shells).
3. **Rejected Alternatives** (with concrete YAGNI/KISS rationale).
4. **Assumptions & Trade-offs** (explicitly stating non-obvious dependencies).
5. **Coupling & Complexity Defense** (how SRP is preserved).
6. **Security & Reliability Controls** (RLS enforcement, XSS/CSRF defense, input validation).
7. **Human Judgment Flags** (explicitly highlighting areas requiring domain or executive review).

### 2.3 Repository & Git Governance
- **Conventional Commits 1.0.0**: All commits must follow `type(scope): description` (e.g., `feat(campaigns): add AI quick-paste regex parser`).
- **Semantic Versioning 2.0.0**: Version releases (`MAJOR.MINOR.PATCH`) mapped directly to breaking changes, features, and defect fixes.
- **Branch Protection**: Direct pushes to `main` are prohibited in multi-author environments; pull requests require automated CI quality gates (TypeScript compilation, Turbopack build, linting, security scans) and at least one peer approval.

---

## 3. Alternatives Considered & Rejected
1. **Informal / Best-Effort Style Guides**:
   - *Rejected*: Informal guidelines fail to prevent gradual architectural drift, magic string proliferation, and unchecked edge-case failures.
2. **Heavyweight Enterprise Frameworks (e.g., TOGAF / ITIL)**:
   - *Rejected* (YAGNI/KISS): Overly bureaucratic for a focused executive OS; ISO/IEC 25010 paired with automated CI/CD gates provides higher rigor with lower cognitive overhead.

---

## 4. Consequences & Trade-offs
- **Positive Impact**:
  - Predictable, self-documenting code with zero magic literals.
  - Provable security boundaries via PostgreSQL Row Level Security (RLS) and strict schema validation.
  - Six-month onboarding clarity: any engineer can understand, modify, and test the system without reverse engineering.
- **Accepted Trade-off**:
  - Slightly higher initial effort per pull request due to mandatory pre-implementation reasoning and explicit test rationale.
