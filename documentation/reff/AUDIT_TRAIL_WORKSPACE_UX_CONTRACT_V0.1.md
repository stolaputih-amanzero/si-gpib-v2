# Audit Trail Workspace UX / IA Contract v0.1 — LOCKED

**Status:** 🔒 **LOCKED & APPROVED FOR GATE 5**  
**Target Route:** `/dashboard/developer/audit-trail`  
**Reference Standard:** `WORKSPACE_PATTERN_V1.1` & `ARCHITECTURE_COVERAGE_MATRIX_V1.7`

---

## 01. Core UX Invariant Statement

> **Invariant:** *"UI IS NOT EVIDENCE AUTHORITY & UI IS NOT AUTHORIZATION ENFORCER."*

The Audit Trail UI is an evidence-inspection and compliance reconstruction surface. The UI MUST NOT calculate hash validity, enforce ALLOW/DENY decisions, or modify hash-chain metadata (`prev_hash`, `curr_hash`). All evidence verification results originate from server-side RPC `verify_audit_chain_integrity()`.

---

## 02. Chain Integrity Visual Indicators

1. **`VERIFIED` (100% Terverifikasi Imutabel):** Emerald green badge indicator. Hash-chain continuity intact without sequence gap.
2. **`COMPROMISED` (Peringatan Anomali Rantai):** Rose red pulsing alert badge. Out-of-band record tampering or sequence gap detected.
3. **`PENDING_VERIFICATION`:** Amber warning indicator during evaluation.

---

## 03. Responsive Layout & Component Architecture

- **Mobile View (PWA Single Column):**
  1. Audit Engine Context Banner & Integrity Status (`AuditHeader.tsx`)
  2. Audit Metrics Grid (`AuditMetricsGrid.tsx`)
  3. Topic & Action Filter Controls
  4. Audit Evidence Timeline Cards (`AuditTimelineStreamPanel.tsx`)
  5. Cryptographic Chain Verification Modal (`AuditVerificationModal.tsx`)

- **Desktop View (Grid Layout):**
  - Top: Audit Header, Integrity Status, & Metric Cards.
  - Main: Chronological Audit Evidence Stream with Truncated SHA-256 Hashes, State Diff Summaries, Policy Provenance & Modal Inspection.

---

## 04. Component Tree Specification (Gate 5)

```text
src/
├── components/
│   └── developer/
│       └── audit-trail/
│           ├── AuditHeader.tsx                 (Header Banner & Integrity Status)
│           ├── AuditMetricsGrid.tsx            (Audit Metrics Grid)
│           ├── AuditTimelineStreamPanel.tsx    (Timeline Stream Cards & Search)
│           ├── AuditVerificationModal.tsx      (Chain Verification Modal)
│           └── AuditTrailWorkspaceShell.tsx    (Master Layout & Stream Shell)
└── app/
    └── (dashboard)/
        └── developer/
            └── audit-trail/
                └── page.tsx                    (Next.js Page Route)
```
