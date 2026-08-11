# Architecture Coverage Matrix v1.4 — Certified Platform Baseline

**Status:** 🔒 **LOCKED ARCHITECTURE COVERAGE MATRIX**  
**Parent Standard:** `WORKSPACE_PATTERN_V1.1` & `PLATFORM_ARCHITECTURE_FREEZE_V1.4`

---

## 01. Certified 8 Reference Implementations Matrix

Eight reference implementations have been certified as the **Certified Platform Baseline**, proving that `WORKSPACE_PATTERN_V1.1` governs entity domains, transport resilience, binary storage objects, dual-context relocation engines, and geospatial boundary engines:

```text
                               CERTIFIED PLATFORM BASELINE
                                            │
    ┌──────────┬───────────┬────────┬───────┴───┬───────────┬───────────┬───────────┬───────────┐
    ▼          ▼           ▼        ▼           ▼           ▼           ▼           ▼           ▼
F2 PERSON   F3 ORG      F4 ASSET F5 AID REQ  F6 OFFLINE  F7 VAULT    F8 TRANSFER F9 WILAYAH
  Human    Hierarchy    Resource  Stateful   Transport   Document    Dual-Context Geospatial
 Identity  (Context)   (Resource) Workflow   Resilience  Storage     Relocation   Boundaries
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
| **F9 Geospatial Territory Workspace** (`/dashboard/wilayah`) | **Spatial Context & Boundary Engine** | Provider-Independent GeoJSON RFC 7946 Read Model, WGS 84 SRID 4326 Validation, PostGIS GIST Indexing, Geometry Semantics Separation |

---

## 02. Architecture Coverage Status

### ✅ Validated Domain, Resilience, Storage, & Spatial Surfaces (Certified Baseline)
1. **Universal Identity & Context Resolution:** Proven in F2, F3, F4, F5, F8, F9.
2. **PostgreSQL Security Boundary (`auth.uid()`):** Proven in F2, F3, F4, F5, F6, F7, F8, F9.
3. **ACL Anti-Corruption Layer (`DATA / EMPTY / PRIVACY_MASKED`):** Proven in F2, F3, F4, F5, F6, F7, F8, F9.
4. **Stateful Lifecycle Transitions & Audit Trail:** Proven in F5, F8, F9.
5. **Idempotent Mutation Commands:** Proven in F5, F6, F8, F9.
6. **PWA Offline Transport Resilience:** Proven in F6.
7. **Document Storage Object Lifecycle & Storage RLS:** Proven in F7.
8. **Dual-Context Relocation & Service Continuity:** Proven in F8.
9. **Geospatial Indexing, Boundary Polygons, & WGS84 Topology:** Proven in F9.

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
F9 Geospatial Territory Workspace  🔒 GOLDEN REFERENCE #8 (Spatial Boundary Engine)
──────────────────────────────────────────────────────────────────────────
Certified Platform Baseline        🔒 CERTIFIED & FROZEN
Architecture Coverage Matrix v1.4   🔒 LOCKED
```
