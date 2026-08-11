# F15 Organization Directory Implementation Design Specification & Gate v1.0

**Feature:** F15 — Organization Directory Workspace  
**Route:** `/org`  
**Parent Standard:** `F15_FEATURE_CHARTER_AND_CONSUMER_CONTRACT_V1` & `PLATFORM_ARCHITECTURE_BASELINE_V2_0`  
**Platform Baseline:** v2.0.0 (`8a34a3cfca6f663dd48c75f6cb92b4d42781e2e2`)  
**Design Status:** 🔒 APPROVED FOR IMPLEMENTATION DESIGN  
**ADR Required:** NO (Conditional trigger active)  

---

## 01. Information Architecture

### Workspace Route Entry Point
```text
/org
```

### Hierarchy & Context Tree Integration
```text
                  Sinode GPIB (National Scope)
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
     Mupel (Regional Scope)              Mupel (Regional Scope)
            │                                     │
    ┌───────┴───────┐                     ┌───────┴───────┐
    ▼               ▼                     ▼               ▼
Jemaat Induk   Jemaat Induk           Jemaat Induk   Jemaat Induk
    │               │                     │               │
    ▼               ▼                     ▼               ▼
Pos Pelkes /    Pos Pelkes /          Pos Pelkes /    Pos Pelkes /
Bajem           Bajem                 Bajem           Bajem
```

### Workspace Sections Breakdown
1. **Header & Context Summary:** Title, scope badge (National / Mupel / Jemaat), and national hierarchy stats widget.
2. **Search & Filter Control Bar:** Search input (by name or ID) + level filter tabs (`Semua`, `Mupel`, `Jemaat Induk`, `Pos Pelkes & Bajem`).
3. **Directory Card Grid / List:** Responsive mobile-first cards displaying hierarchy lineage, leadership assignment (KMJ/PJ), stats, location summary, and action triggers.
4. **Deep-Link Action Trigger:** Secondary action button navigating directly to existing F3 workspace `/org/[id_org]`.

---

## 02. UX Contract & Mobile-First PWA Design

### Layout Structure
- **Mobile Viewport (<768px):** Single-column stacked cards with sticky filter tabs at top, search bar with debounce, touch-friendly min-h 48px tap targets, and haptic feedback.
- **Desktop Viewport (≥768px):** 2-column grid layout with sidebar stats and quick filters.

### Organization Card Anatomy (`OrgCard.tsx`)
```text
┌─────────────────────────────────────────────────────────────┐
│ [Icon] NAMA ORGANISASI                    [Badge Scope]     │
│ ID: ORG-XXX • Level: Jemaat Induk                           │
├─────────────────────────────────────────────────────────────┤
│ 📍 Alamat / Mupel: Mupel Kaltim-Sultra                      │
│ 👤 KMJ / PJ: Pdt. Nama Lengkap                              │
│ 📊 Stat: 12 Pos Pelkes • 450 KK • 1,800 Jiwa                 │
├─────────────────────────────────────────────────────────────┤
│ [ Lihat Detail Workspace (/org/[id_org]) → ]               │
└─────────────────────────────────────────────────────────────┘
```

---

## 03. Data Consumption Contract

### Permitted Hooks & Services (F3 Consumers Only)
- `useHierarchyStats()`: Fetches national aggregates (Total Mupel, Jemaat, Bajem, Pos, KK, Jiwa).
- `useMupelList(search)`: Fetches Mupel list and sub-counts.
- `useJemaatByMupel(id_mupel, search)`: Fetches Jemaat Induk list with KMJ leadership and Pos counts.
- `usePosByJemaat(id_induk, search)`: Fetches Pos Pelkes / Bajem list with PJ leadership and demografi KK/Jiwa totals.
- `useUserRoleScope()`: Enforces data layer security and role scoping.

### Unified Application View Model (`OrgDirectoryItem`)
```typescript
export interface OrgDirectoryItem {
  id: string;
  name: string;
  type: 'mupel' | 'jemaat_induk' | 'pos_pelkes' | 'bajem';
  mupelName?: string;
  parentName?: string;
  parentId?: string;
  address?: string | null;
  leaderName?: string | null;
  leaderRole?: 'KMJ' | 'PJ' | null;
  posCount?: number;
  bajemCount?: number;
  kkCount?: number;
  jiwaCount?: number;
  detailUrl: string;
}
```

### UI States
- **Loading State:** Skeleton cards matching card anatomy.
- **Empty State:** Clean empty illustration with clear text (e.g. *"Tidak ada organisasi yang sesuai dengan pencarian"*).
- **Error State:** Error banner with retry trigger.

---

## 04. Authorization Matrix & Role Scoping

| User Role | Visible Directory Scope | Scoping Enforcement Mechanism |
|---|---|---|
| **Super User** (`super_user`) | 全 (National Scope) — All Mupel, Jemaat Induk, Pos Pelkes | `useUserRoleScope()` returns `isLocked: false` |
| **Admin Mupel** (`admin_mupel`) | Single Mupel + All child Jemaat Induk & Pos Pelkes under Mupel | `useUserRoleScope()` filters by `scope.id_mupel` |
| **KMJ** (`kmj`) | Single Jemaat Induk + All child Pos Pelkes under Jemaat | `useUserRoleScope()` filters by `scope.id_induk` |
| **PJ / User** (`pj`, `user`) | Single Pos Pelkes / Jemaat scope | `useUserRoleScope()` filters by `scope.id_pos` / `id_induk` |

---

## 05. Test Contract

### Mandatory Test Specifications (`tests/e2e/f15-org-directory.spec.ts`)
1. **Route Resolution:** Verify navigating to `/org` returns HTTP 200 (resolving 404).
2. **Tab Filtering:** Verify clicking level tabs (`Semua`, `Mupel`, `Jemaat Induk`, `Pos Pelkes`) correctly filters the directory list.
3. **Search Interaction:** Verify typing query into search bar filters organization items deterministically.
4. **Role Scoping Security:** Verify logging in as `admin_mupel` displays only organizations within assigned Mupel.
5. **Deep-Link Navigation:** Verify clicking **Lihat Detail** navigates cleanly to `/org/[id_org]`.

---

## 06. Implementation Boundary & Conditional ADR Trigger

### Code Modification Boundaries

```text
ALLOWED BOUNDARIES (F15 Workspace Scope)
├── src/app/(dashboard)/org/page.tsx
├── src/components/org/OrgDirectoryHeader.tsx
├── src/components/org/OrgDirectoryTabs.tsx
├── src/components/org/OrgCard.tsx
├── src/hooks/use-org-directory.ts
└── tests/e2e/f15-org-directory.spec.ts

FORBIDDEN BOUNDARIES (Baseline v2.0.0 Protection)
├── supabase/migrations/* (0 SQL modifications)
├── src/lib/supabase/client.ts / server.ts
├── src/hooks/use-hierarki.ts (Read-only consumer)
├── Core RLS policies or database tables
└── F12 PDP & F13 Audit helpers
```

### Conditional ADR Trigger Rule
> **STOP CONDITION:** If implementation uncovers any issue requiring changes to `supabase/migrations/`, RLS helper functions, or core F2–F14 API contracts, development **MUST IMMEDIATELY STOP** and submit a formal ADR proposal under [ADR_GOVERNANCE_POLICY_V1.md](file:///d:/PROJECT/si-gpib-v2/documentation/reff/ADR_GOVERNANCE_POLICY_V1.md).
