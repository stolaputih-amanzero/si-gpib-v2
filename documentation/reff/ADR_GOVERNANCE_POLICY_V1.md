# Architecture Decision Record (ADR) Governance Policy v1.0

**Status:** 🔒 **OFFICIAL GOVERNANCE POLICY**  
**Parent Standard:** `R4_GOVERNANCE_CLOSURE_V1` & `PLATFORM_ARCHITECTURE_BASELINE_V2_0_CERTIFICATION_V1`  
**Target Baseline:** `v2.0.0-rc.1` (Architecture Baseline v2.0)  

---

## 01. Absolute Governance Rule

> **ABSOLUTE RULE:** Domain feature modules F15 and beyond may act strictly as **consumers** of the certified F2–F14 architecture contracts. Domain features are strictly prohibited from modifying F2–F14 contracts, database schemas, cryptographic invariants, or cross-cutting boundaries directly.

---

## 02. Architecture Modification Workflow

If a future feature (F15+) establishes an absolute requirement for platform-level changes, the requirement **must** be processed through the formal Architecture Decision Record (ADR) lifecycle:

```text
                  F15+ Feature Requirement
                             │
                             ▼
                    ADR Proposal Created
                  (ADR-XXX-[Feature-Title].md)
                             │
                             ▼
                     Architecture Review
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
       ❌ REJECTED                       🟢 APPROVED
    (Feature redesigned                       │
     as F2–F14 consumer)                      ▼
                                     Baseline Version Bump
                                    (e.g., Baseline v2.1.0)
                                              │
                                              ▼
                                      New Verification
                                    (S1–S4 / R1–R3 Re-run)
                                              │
                                              ▼
                                      New Certification
```

---

## 03. Mandatory ADR Proposal Template & Structure

Any proposed architectural modification must be submitted as a markdown file placed in `documentation/adr/ADR-XXX-[short-title].md` using the following mandatory structure:

```markdown
# ADR-XXX: [Title of Proposed Architecture Change]

**Status:** PROPOSED | APPROVED | REJECTED | SUPERSEDED  
**Date:** [YYYY-MM-DD]  
**Author(s):** [Author Names]  
**Target Baseline Version:** [e.g., Baseline v2.1.0]  

## 1. Context & Problem Statement
Explain the business or technical motivation driving the need for architectural modification.

## 2. Impact Analysis on Frozen Baseline (F2–F14)
Detail which specific baseline components or invariant rules are affected:
- Affected Modules: (e.g., F12 PDP, F13 Audit, F14 Webhooks)
- Invariant Impact: (Explain how cross-cutting invariants are maintained)
- Data Model Impact: (Detailed SQL schema diff analysis)

## 3. Options Considered
Describe at least 2 alternative designs evaluated, including a "Consumer-only (No Change)" option.

## 4. Decision & Proposed Architectural Changes
Specify the exact technical changes approved for implementation.

## 5. Verification & Re-Certification Plan
Outline how Gate S1–S4 and Step R1–R3 tests will be executed to re-certify the new baseline version.
```

---

## 04. Baseline Versioning Strategy

Architectural changes govern the platform baseline version independently of application UI versions:

| ADR Scope | Baseline Version Delta | Required Re-Verification |
|---|---|---|
| Non-breaking invariant enhancement or audit metadata extension | **Patch Bump** (e.g. `v2.0.1`) | Re-run Gate S4 regression + R3 operational suite |
| New platform capability or baseline contract extension (e.g., new outbox channel) | **Minor Bump** (e.g. `v2.1.0`) | Full Gate S1–S5 + Step R1–R4 re-certification |
| Breaking change to F2–F14 core contracts, RLS policy model, or SHA-256 chain schema | **Major Bump** (e.g. `v3.0.0`) | Full architecture redesign + clean-room snapshot re-baseline |
