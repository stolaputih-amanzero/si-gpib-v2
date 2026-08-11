# Architecture Coverage Matrix v1.3 — Certified Platform Baseline

**Status:** 🔒 **LOCKED ARCHITECTURE COVERAGE MATRIX**  
**Parent Standard:** `WORKSPACE_PATTERN_V1.1` & `PLATFORM_ARCHITECTURE_FREEZE_V1.3`

---

## 01. Certified 7 Reference Implementations Matrix

Seven reference implementations have been certified as the **Certified Platform Baseline**, proving that `WORKSPACE_PATTERN_V1.1` governs entity domains, transport resilience, binary storage objects, and dual-context relocation engines:

```text
                       CERTIFIED PLATFORM BASELINE
                                    │
    ┌──────────┬───────────┬────────┼───────────┬───────────┬───────────┬───────────┐
    ▼          ▼           ▼        ▼           ▼           ▼           ▼           ▼
F2 PERSON   F3 ORG      F4 ASSET F5 AID REQ  F6 OFFLINE  F7 VAULT    F8 TRANSFER
  Human    Hierarchy    Resource  Stateful   Transport   Document    Dual-Context
 Identity  (Context)   (Resource) Workflow   Resilience  Storage     Relocation
```

| Reference Implementation | Surface Dimension | Specific Invariants & Capabilities Proven |
|---|---|---|
| **F2 Person Workspace** (`/dashboard/people/[id_person]`) | **Human Identity & Privacy** | Universal Identity Resolution, Personal Data Privacy Masking, Pastoral Roster Projections |
| **F3 Organization Workspace** (`/dashboard/org/[id_org]`) | **Hierarchy & Context** | Multi-Level Ancestry Resolution, Cross-Context Aggregations, Sub-Node Projections |
| **F4 Asset Detail View** (`/dashboard/assets/[id_asset]`) | **Physical & Financial Resource** | Polymorphic 3-Table Resolution, Valuation & Legal Restrictions, Geolocation Links |
| **F5 Aid Request Workspace** (`/dashboard/aid-requests/[id_ajuan]`) | **Stateful Transactional Workflow** | CQRS Query/Command Separation, Multi-Stage State Machine, Backend Atomic Mutation, Audit Log, Idempotency Token |
| **F6 Offline Sync Workspace** (`/dashboard/offline-sync`) | **Transport Resilience Layer** | IndexedDB 4-Store Isolation, PWA Command Queueing, Immutable Token Retry, Conflict Rejection Capture |
| **F7 Document Vault Workspace** (`/dashboard/vault`) | **Document Storage Object Lifecycle** | Supabase Private Storage Bucket RLS, Two-Phase Upload Protocol, Temporary Signed URLs, Soft-Delete & Purge |
| **F8 Pastoral Transfer Workspace** (`/dashboard/transfers`) | **Dual-Context Relocation & Continuity** | Dual-Context Scope Authority, Single Active Assignment Invariance, Historical Service Chain Preservation |

---

## 02. Architecture Coverage Status

### ✅ Validated Domain, Resilience, & Object Storage Surfaces (Certified Baseline)
1. **Universal Identity & Context Resolution:** Proven in F2, F3, F4, F5, F8.
2. **PostgreSQL Security Boundary (`auth.uid()`):** Proven in F2, F3, F4, F5, F6, F7, F8.
3. **ACL Anti-Corruption Layer (`DATA / EMPTY / PRIVACY_MASKED`):** Proven in F2, F3, F4, F5, F6, F7, F8.
4. **Stateful Lifecycle Transitions & Audit Trail:** Proven in F5, F8.
5. **Idempotent Mutation Commands:** Proven in F5, F6, F8.
6. **PWA Offline Transport Resilience:** Proven in F6.
7. **Document Storage Object Lifecycle & Storage RLS:** Proven in F7.
8. **Dual-Context Relocation & Service Continuity:** Proven in F8.

---

## 03. Certified Baseline Summary

```text
F2 Person Workspace                🔒 GOLDEN REFERENCE #1 (Human Identity)
F3 Organization Workspace          🔒 GOLDEN REFERENCE #2 (Org Hierarchy)
F4 Asset Detail View               🔒 GOLDEN REFERENCE #3 (Capability & Resource)
F5 Aid Request Workspace           🔒 GOLDEN REFERENCE #4 (Stateful Workflow)
F6 Offline Sync Workspace          🔒 GOLDEN REFERENCE #5 (Transport Resilience)
F7 Document Vault Workspace        🔒 GOLDEN REFERENCE #6 (Document Storage)
F8 Pastoral Transfer Workspace     🔒 GOLDEN REFERENCE #7 (Dual-Context Relocation)
──────────────────────────────────────────────────────────────────────────
Certified Platform Baseline        🔒 CERTIFIED & FROZEN
Architecture Coverage Matrix v1.3   🔒 LOCKED
```
