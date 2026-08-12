# ORGANIZATION DIRECTORY SURFACE AUDIT V1 (/org)

**Platform Layer:** Organizational Directory Projection Surface Layer  
**Platform Target:** Platform Baseline v2.2.0 (🔒 FROZEN ARCHITECTURE)  
**Governance Lineage:** `SURFACE_NORMALIZATION_GATE_V1 ➔ CONSUMER_SURFACE_COMPLETION_AUDIT_V1 ➔ ORGANIZATION_DIRECTORY_SURFACE_AUDIT_V1`  
**Audit Verdict Status:** 🟢 **AUDIT COMPLETED — CERTIFIED FOR NORMALIZATION ONLY IMPLEMENTATION**  
**Date:** 2026-08-12  

---

## 🛑 THE PROJECTION vs WORKSPACE INVARIANT

> [!CAUTION]
> **PROJECTION SURFACE INVARIANT:**  
> **`/org` is an Organization Directory Projection Surface, NOT an Organization Workspace.**  
> `/org` strictly projects filterable and searchable organizational entities (Mupel, Jemaat Induk, Pos Pelkes).  
> The target canonical Organization Workspace (`/org/[id_org]`) certified in Phase 3 reference MUST remain 100% UNTOUCHED and PROTECTED.

```text
/org (Organization Directory Projection Surface)
   │
   ├── [ 🔍 Cari nama organisasi... ]
   ├── [Semua Level] [Mupel] [Jemaat Induk] [Pos Pelkes] (Projection Filters)
   │
   └── SemanticRow List (Full-Width + 1px Hairline Divider)
           │
           ▼ (Navigate on Click)
/org/[id_org] (PROTECTED CANONICAL ORGANIZATION WORKSPACE)
```

---

## 📊 10 EXPLICIT GOVERNANCE AUDIT FINDINGS

| # | Audit Item | Existing Code Audit Findings | Governance Verdict |
| :-: | :--- | :--- | :--- |
| **1** | **Surface Classification** | [`src/app/(dashboard)/org/page.tsx`](file:///d:/PROJECT/si-gpib-v2/src/app/(dashboard)/org/page.tsx) uses `useOrgDirectory()` to fetch organizational entities. `/org` is strictly a Projection Surface. Canonical workspace is `/org/[id_org]`. | 🟢 **CORRECT** |
| **2** | **Entity Boundary** | Entities mapped strictly to certified database models: `m_mupel` (Mupel), `m_jemaat_induk` (Jemaat Induk), `m_pos_pelkes` (Pos Pelkes / Bajem). No ad-hoc UI entities created. | 🟢 **CORRECT** |
| **3** | **Hierarchical Context** | Scope filtering and parent-child linkages are resolved by existing `useOrgDirectory()` hook and `t_penugasan_pendeta` RLS boundaries. No new Context Resolver created. | 🟢 **CORRECT** |
| **4** | **Search & Filter Contract** | Tabs (`Semua Level`, `Mupel`, `Jemaat Induk`, `Pos Pelkes`) and search input `searchQuery` are already supported by existing service layer. | 🟢 **CORRECT** |
| **5** | **Route Invariants** | Canonical routes `/org` and `/org/[id_org]` are strictly preserved. Zero Route Drift assertion satisfied. | 🟢 **CORRECT** |
| **6** | **Workspace Entry Contract** | Card/Row items navigate directly to `/org/[id_org]` via clean client-side routing. No secondary workspace created inside `/org`. | 🟢 **CORRECT** |
| **7** | **Authorization Boundary** | Data visibility is governed by existing Supabase RLS and `useOrgDirectory()` data queries. Directory does NOT act as an authorization engine. | 🟢 **CORRECT** |
| **8** | **Surface Normalization** | Currently renders a 3-column card grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`). Requires normalization to full-width `SemanticRow` list with 1px hairline dividers matching F3 (`/people`). | 🟡 **REQUIRES NORMALIZATION** |
| **9** | **Responsive & Geometry** | Layout adheres to 390px mobile & 1280px desktop viewports with safe-area insets and touch targets $\ge 44\text{px}$. | 🟢 **CORRECT** |
| **10** | **Existing E2E Coverage** | Existing Playwright spec [`e2e/f15-org-directory.spec.ts`](file:///d:/PROJECT/si-gpib-v2/e2e/f15-org-directory.spec.ts) tests `/org` layout, search input, and level tabs. | 🟢 **COVERED** |

---

## 🎯 FINAL AUDIT DECISION & IMPLEMENTATION ROADMAP

```text
===========================================================================
ORGANIZATION DIRECTORY AUDIT DECISION
===========================================================================
Architectural Layer Status         🔒 100% FROZEN (Zero Schema / Route drift)
Data Service & Query Contract      🟢 CERTIFIED (useOrgDirectory fully functional)
Authorization / RLS Boundary       🟢 CERTIFIED (Strict PDP compliance)
Surface Layer State                🟡 REQUIRES SEMANTIC ROW NORMALIZATION
===========================================================================
AUDIT VERDICT                      🟢 NORMALIZATION ONLY
===========================================================================
```

### Normalization Implementation Scope (When Authorized):
1. Replace 3-column card grid in `/org/page.tsx` with full-width `SemanticRow` list container with 1px hairline dividers (`divide-border-subtle`).
2. Apply F1.1 surface design tokens (`px-gutter-mobile`, `rounded-card`, `rounded-control`).
3. Preserve existing search, level tabs (`OrgDirectoryTabs`), loading skeleton, error state, and empty state.
4. Run E2E test suite (`e2e/f15-org-directory.spec.ts` & `e2e/f3-org-deep-link.spec.ts`) for verification.
