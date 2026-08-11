# Access Control Workspace UX / IA Contract v0.1 — LOCKED

**Status:** 🔒 **LOCKED & APPROVED FOR GATE 5**  
**Target Route:** `/dashboard/settings/access-control`  
**Reference Standard:** `WORKSPACE_PATTERN_V1.1` & `ARCHITECTURE_COVERAGE_MATRIX_V1.6`

---

## 01. Core UX Invariant Statement

> **Invariant:** *"UI IS NOT ENFORCER & UI IS NOT AUTHORITY SOURCE."*

The Access Control UI is an observability and policy-inspection surface. The UI MUST NOT calculate or enforce ALLOW/DENY decisions, nor supply authority parameters (`role`, `org_scope`). All decisions and authority contexts are derived server-side via trusted PDP engine evaluations.

---

## 02. PDP Evaluation Decision Visual Indicators

1. **`ALLOW` (Izin Eksplisit):** Emerald green badge indicator. Matching policy rule executed.
2. **`DENY` (Penolakan):** Rose red badge indicator with machine-readable `ReasonCode` (e.g. `DENIED_DEFAULT`, `DENIED_TENANT_BOUNDARY`, `DENIED_TEMPORAL_EXPIRED`).
3. **`FAIL_CLOSED`:** Rose red pulse indicator. System error or unauthenticated request defaults to DENY.

---

## 03. Responsive Layout & Component Architecture

- **Mobile View (PWA Single Column):**
  1. Access Control Context Banner & PDP Status (`AccessControlHeader.tsx`)
  2. Policy Evaluation Metrics Grid (`PolicyEvaluationMetrics.tsx`)
  3. Interactive PDP Policy Inspection Filter
  4. Policy Rules & Decision Stream Cards (`PolicyRuleGridPanel.tsx`)
  5. Policy Metadata & Decision Inspection Modal (`PolicyInspectionModal.tsx`)

- **Desktop View (Grid Layout):**
  - Top: Access Control Header, PDP Status, & Metric Cards.
  - Main: Policy Rules Definitions Table & Recent PDP Evaluation Decisions Stream with Reason Code Filter and Search.

---

## 04. Component Tree Specification (Gate 5)

```text
src/
├── components/
│   └── developer/
│       └── access-control/
│           ├── AccessControlHeader.tsx         (Header Banner & PDP Status)
│           ├── PolicyEvaluationMetrics.tsx     (Policy Metrics Grid)
│           ├── PolicyRuleGridPanel.tsx         (Policy Rules Grid & Recent Decisions)
│           ├── PolicyInspectionModal.tsx       (Policy Inspection Modal)
│           └── AccessControlWorkspaceShell.tsx (Master Layout & Decision Shell)
└── app/
    └── (dashboard)/
        └── settings/
            └── access-control/
                └── page.tsx                    (Next.js Page Route)
```
