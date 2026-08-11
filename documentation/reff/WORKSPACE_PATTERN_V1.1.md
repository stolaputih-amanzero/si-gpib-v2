# Workspace Construction Pattern v1.1 — Standard Specification

**Status:** 🔒 **LOCKED ARCHITECTURAL STANDARD**  
**Empirical Evidence Base:**  
- **Reference Implementation #1:** Person Workspace (`/dashboard/people/[id_person]`)  
- **Reference Implementation #2:** Organization Workspace (`/dashboard/org/[id_org]`)

---

## 01. Executive Overview & Taxonomical Split

Workspace Pattern v1.1 consolidates the proven architectural principles from Person Workspace (F2) and Organization Workspace (F3). It provides a strict taxonomy separating **Immutable Architectural Commons**, **Configurable Elements**, and **Domain-Specific Elements**.

```text
               WORKSPACE PLATFORM ARCHITECTURE
                              │
  ┌───────────────────────────┼───────────────────────────┐
  ▼                           ▼                           ▼
IMMUTABLE COMMONS         CONFIGURABLE             DOMAIN-SPECIFIC
- Security Boundary        - Section Composition    - RPC Logic (e.g. get_person_360)
- Identity-First Header    - Section Count (5 vs 6) - Specific Projection Payload
- Single Sticky Anchor     - Adaptive Layout        - Underlying Database Tables
- FieldRenderState (3 UI)  - Level Badges
- ACL View Adapter
- Deep-Link Hash Nav
- Anti-God RPC Rule
```

---

## 02. Taxonomy of Workspace Components

### 1. Immutable Architectural Commons (MUST NOT BE ALTERED)
1. **Backend-Only Security Boundary:** The UI (React/Next.js) is **0% a security boundary**. All authorization, session trust (`auth.uid()`), context resolution, and data masking happen exclusively inside PostgreSQL RPCs (`SECURITY DEFINER`).
2. **Identity-First Visual Hierarchy:** Headlines answer *"WHO or WHAT is this canonical entity?"* metadata/level/roles appear as secondary badges.
3. **Single Top Sticky Anchor Bar:** Exactly 1 sticky anchor bar for section traversal. **Zero bottom sticky navigation bars**. Horizontal scroll on mobile.
4. **3 UI Render States (`FieldRenderState<T>`):** Every field/section resolves strictly to `DATA`, `EMPTY`, or `PRIVACY_MASKED`.
5. **Anti-Corruption Layer (ACL Adapter):** Read-Model payload (`Unified[Entity]Data`) MUST pass through an adapter (`[entity]ViewModelAdapter.ts`) before rendering.
6. **Structural Predictability Invariant:** Restriksi hak akses **tidak pernah menghapus atau menyembunyikan seksi** dari struktur navigasi. Restricted sections render `PRIVACY_MASKED` notice.
7. **URL Fragment Hashing:** Navigation updates URL hash (`#overview`, `#structure`, etc.) without triggering page reloads.

### 2. Configurable Workspace Elements
1. **Section Count & Labels:** Adaptive to domain requirements (e.g. 5 sections for Person, 6 sections for Organization).
2. **Section Composition:** Dynamic internal layout adapting to entity attributes (e.g. `org_level` adaptively changing `#overview` stats).
3. **Header Badges & Identifiers:** Visual badge colors and secondary ID formats (`UUID` vs string `01-10-YB`).

### 3. Domain-Specific Elements (ISOLATED)
1. **PostgreSQL RPC Implementation:** `get_person_360()`, `get_organization_360()`.
2. **Physical Database Tables:** `m_person`, `m_jemaat_induk`, `m_mupel`, `m_pos_pelkes`.
3. **Projection Item Interfaces:** Specific attributes of Person, Asset, or Aid Request projections.

---

## 03. Strict Architectural Layering

Every Workspace MUST strictly follow this 5-layer pipeline:

```text
LAYER 1: Database & Security Boundary
         PostgreSQL RPC [SECURITY DEFINER, auth.uid(), pg_temp]
                   │
                   ▼ (Pure JSONB Read-Model Payload)
LAYER 2: Type Contract Interface
         Unified[Entity]Data (e.g., src/types/organization.types.ts)
                   │
                   ▼ (ACL Mapping)
LAYER 3: ViewModel Adapter (ACL)
         [entity]ViewModelAdapter.ts ➔ FieldRenderState<T> Resolution
                   │
                   ▼ (Clean UI View Model)
LAYER 4: View Model Interface
         [Entity]WorkspaceViewModel (e.g., src/types/organizationViewModel.types.ts)
                   │
                   ▼ (React UI Presentation)
LAYER 5: Workspace Shell & Progressive Sections
         [Entity]WorkspaceShell.tsx ➔ Header + Anchor + 6 Progressive Sections
```

---

## 04. Standard Component Contracts

### A. `WorkspaceHeader` Contract
- **Primary Line:** Canonical Entity Name (`nama_lengkap` / `nama`).
- **Badge Line:** Entity Level / Primary Role Badge.
- **Context Line:** Parent Organization / Primary Assignment.
- **Footer Line:** Copyable Technical ID + Canonical Identity Badge.

### B. `WorkspaceNavigationAnchor` Contract
- **Position:** Sticky top `top-0 z-30` with backdrop blur (`backdrop-blur-md`).
- **Behavior:** Smooth scroll on click + active section highlighting via `window.onscroll` threshold listener.
- **Mobile UX:** `overflow-x-auto no-scrollbar` horizontal swipe.

### C. `FieldRenderState<T>` Invariant Contract
```ts
export type FieldRenderState<T> = 
  | { type: 'DATA'; value: T }
  | { type: 'EMPTY'; label: string }
  | { type: 'PRIVACY_MASKED'; reason: PrivacyReason; label: string };
```
- **DATA Rules:** `accessible = true` AND data is present.
- **EMPTY Rules:** `accessible = true` AND data is `null`, `undefined`, or `[]`.
- **PRIVACY_MASKED Rules:** `accessible = false`. **NEVER** convert `null` to `PRIVACY_MASKED` if `accessible = true`.

### D. Projection & Cross-Workspace Contract
- Projections (People, Assets, Aid Requests) MUST remain **lightweight summary cards**.
- Clicking a projection item MUST redirect to its canonical workspace / detail view:
  - Person Item ➔ `/dashboard/people/[id_person]`
  - Asset Item ➔ `/dashboard/assets/[id_asset]`
  - Aid Request Item ➔ `/dashboard/aid-requests/[id_ajuan]`

---

## 05. Negative Anti-Patterns (FORBIDDEN IN FUTURE WORKSPACES)

1. **NO Role/Auth Logic in React:** NEVER write `if (user.role === 'admin')` inside React components.
2. **NO `LIMIT 1` Guessing in RPC:** RPC ID resolution MUST be deterministic. If ID matches 0 or >1 rows, return `NULL`.
3. **NO Section Removal on Privacy Restriction:** NEVER conditionally hide a section based on privacy (`if (!accessible) return null`). Render `PrivacyStateNotice` instead.
4. **NO Leakage of `SYSTEM_ONLY` Data:** Internal credentials (`password_hash`, `p256dh_key`, etc.) MUST NEVER enter the read-model JSON payload.
5. **NO God RPCs:** Workspace read-model RPCs serve ONLY the bounded context of that workspace. Unrelated domains interact via lightweight projections.
6. **NO Bottom Sticky Bars:** Keep mobile viewports clean for PWA ergonomics.

---

## 06. Consolidated Governance Matrix

```text
B1 Universal Identity                       🔒 LOCKED
B2 Identity Boundary Contract              🔒 LOCKED
F2 Person Workspace                        🔒 REFERENCE IMPLEMENTATION #1
F3 Organization Workspace                  🔒 REFERENCE IMPLEMENTATION #2
WORKSPACE_PATTERN_V1.1                     🔒 LOCKED ARCHITECTURAL STANDARD
```
