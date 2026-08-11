# Hierarchical Authorization & Policy Contract v0.1 — F12 Gate 1 Specification

**Status:** 🔒 **GATE 1 LOCKED & APPROVED**  
**Target Subsystem:** Hierarchical Authorization & Policy Engine (RBAC/ABAC) (`/dashboard/settings/access-control`)  
**Parent Standard:** `WORKSPACE_PATTERN_V1.1` & `ARCHITECTURE_COVERAGE_MATRIX_V1.6`

---

## 01. Core Architectural Invariant

> **Invariant:** *"Hierarchical Authorization & Policy Evaluation is a Decoupled Security Engine operating on Policy Decision Point (PDP) & Policy Enforcement Point (PEP) separation, Deny by Default, Data-Driven Organizational Hierarchy Resolution, and Combined RBAC+ABAC Composition, guaranteeing provider neutrality and zero reliance on client-supplied authority."*

```text
                    AUTHORIZATION REQUEST
                            │
                            ▼
                 ┌──────────────────────┐
                 │  POLICY DECISION     │
                 │       POINT          │
                 │       (PDP)          │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
         Subject         Resource       Context
         identity        entity         attributes
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                    POLICY EVALUATION
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
                ALLOW                DENY
                  │                   │
                  ▼                   ▼
           Policy Decision       Reason Code
                  │
                  ▼
          Enforcement Point
      ┌───────────┼────────────┐
      ▼           ▼            ▼
     RLS         RPC           UI
```

---

## 02. The 20 Invariants Contract Matrix

### 1. Deny by Default
Any authorization request that does not match an explicit `ALLOW` policy evaluates to `DENY`.

### 2. Explicit Allow
Access permissions are granted strictly through valid, non-expired `ALLOW` policies.

### 3. Data-Driven Hierarchical Scope
Organizational hierarchy nodes (`Sinode` ➔ `Mupel` ➔ `Jemaat` ➔ `Sektor` / `Bajem` / `Unit Misioner` / `Pos Pelkes`) are resolved dynamically via data-driven parent-child contracts (`parent_context`, `authority_boundary`). Hierarchy is never hardcoded.

### 4. No Privilege Escalation
A subject granted permissions at a child node MUST NOT inherit or grant privileges exceeding their authority boundary at the parent node.

### 5. Separation of PDP & PEP
The Policy Decision Point (PDP - decision engine) is strictly decoupled from Policy Enforcement Points (PEP - RLS, RPC, UI).

### 6. RBAC + ABAC Composition
Role-Based Access Control (RBAC) defines baseline capabilities; Attribute-Based Access Control (ABAC - context, time, location, state) restricts access. ABAC MUST NOT silently expand RBAC permissions.

### 7. Organization Tenant Boundary
Cross-organizational access is blocked by default unless explicit, audited cross-tenant delegation policies exist.

### 8. Context-Aware Evaluation
Every `AuthorizationRequest` evaluates 6 core parameters: `subject`, `resource`, `organization`, `role`, `action`, and `context_attributes`.

### 9. Deterministic Decision
Identical authorization inputs produce identical authorization outcomes.

### 10. Reason-Coded Denial
Every `DENY` decision yields a machine-readable `ReasonCode` (e.g. `ERR_AUTH_SCOPE_MISMATCH`, `ERR_AUTH_EXPIRED_POLICY`, `ERR_AUTH_NO_ROLE`).

### 11. RLS as Final Physical Enforcement
PostgreSQL Row Level Security (RLS) acts as the immutable physical enforcement boundary for database reads and writes.

### 12. UI Is Not Security Boundary
Visual element hiding or disabling in React UI is purely cosmetic and NEVER replaces server-side authorization.

### 13. Server Is Not Trust Boundary Bypass
API routes, RPCs, and service functions MUST execute authorization evaluation and MUST NOT bypass security boundaries.

### 14. No Client-Supplied Authority
Clients MUST NOT supply their own `role`, `org_scope`, or authority context. Authority is derived server-side from `auth.uid()`.

### 15. Audit-Compatible Decision
All policy decisions emit structured, PII-free audit metadata (`decision_id`, `subject_id`, `resource_type`, `action`, `decision`, `reason_code`).

### 16. Fail Closed
Errors in PDP evaluation or authority resolution result in immediate `DENY`.

### 17. Policy Versioning
All policy evaluations are stamped with a deterministic `policy_version`.

### 18. Temporal Constraints
Policies support valid execution windows (`valid_from`, `valid_until`).

### 19. Explicit Delegation
Impersonation and delegation are explicit, audited capabilities, not implicit hierarchical side-effects.

### 20. Provider Neutrality
Domain authorization contracts operate on clean JSON/TypeScript interfaces. Zero Supabase SDK / RLS syntax in domain contracts.

---

## 03. Gate 1 Verdict & Decision Matrix

```text
F12 Gate 1 Summary:
│
├── Deny by Default & Explicit Allow Invariants                         🔒 LOCKED
├── Data-Driven Organizational Hierarchy Resolution                     🔒 LOCKED
├── No Privilege Escalation & Organization Tenant Isolation              🔒 LOCKED
├── PDP / PEP Separation & Deterministic Decision Engine                🔒 LOCKED
├── RBAC + ABAC Composition & Reason-Coded Denial                       🔒 LOCKED
├── Zero Client-Supplied Authority & Server Trust Enforcement            🔒 LOCKED
├── PostgreSQL RLS as Physical Enforcement Boundary                     🔒 LOCKED
├── Provider Neutrality & Audit-Compatible Decision Engine               🔒 LOCKED
├── WORKSPACE_PATTERN_V1.1 100% Unchanged Certification                 🔒 LOCKED
─────────────────────────────────────────────────────────────────────────────
F12 Gate 1 Status                                                      🟢 APPROVED FOR GATE 2
```
