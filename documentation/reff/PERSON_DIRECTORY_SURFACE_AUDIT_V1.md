# PERSON DIRECTORY SURFACE AUDIT V1 (/people)

**Platform Layer:** SDM Directory Projection Surface Layer  
**Platform Target:** Platform Baseline v2.2.0 (🔒 FROZEN ARCHITECTURE)  
**Governance Lineage:** `v2.0.0 ➔ SURFACE_NORMALIZATION_GATE_V1 ➔ PERSON_DIRECTORY_SURFACE_AUDIT_V1`  
**Audit Verdict Status:** 🟢 **AUDIT COMPLETED — AUTHORIZED FOR SEMANTIC ROW NORMALIZATION**  
**Date:** 2026-08-12  

---

## 🛑 FASE 3 INVARIANT: PROJECTION SURFACE ONLY (NO WORKSPACE MUTATION)

> [!CAUTION]
> **PROJECTION SURFACE INVARIANT:**  
> **`/people` is a Projection Surface, NOT a Person Workspace.**  
> `/people` serves strictly as a filterable & searchable list projection. It MUST NOT contain inline workspace tabs or edit forms.  
> The target canonical Person Workspace (`/people/[id_person]`) certified in Phase 1 (F2) MUST remain 100% UNTOUCHED and PROTECTED.

```text
/people (Projection Surface - Filterable List)
   │
   ├── [🔍 Cari SDM...]
   ├── [Semua] [Pendeta] [Pelayan] [Relawan] (Projection Filters)
   │
   └── SemanticRow List (Full-Width + 1px Hairline Divider)
           │
           ▼ (Navigate on Click)
/people/[id_person] (PROTECTED F2 CANONICAL PERSON 360 WORKSPACE)
```

---

## 📊 10 EXPLICIT AUDIT DECISIONS

| # | Audit Question | Audit Findings & Explicit Decision |
| :-: | :--- | :--- |
| **1** | **Projection vs Workspace** | **PROJECTION SURFACE ONLY.** `/people` strictly projects SDM summary rows (nama, jemaat, status) and delegates detailed view to `/people/[id_person]`. |
| **2** | **Canonical Routes** | **PRESERVED (Zero Route Drift).** Routes `/people` and `/people/[id_person]` remain exact. |
| **3** | **F2 Person Workspace Protection** | **100% UNTOUCHED & PROTECTED.** Any finding inside `/people/[id_person]` will be logged as a Protected Finding, never mutated during Phase 3. |
| **4** | **Person Type Availability** | **AVAILABLE.** Role/status metadata (`status`, `jabatan`, `tipe`) is present in `m_pendeta`/`m_person` database tables. |
| **5** | **Projection Filters** | **PURE PROJECTION FILTERS.** Category chips (`Semua`, `Pendeta`, `Pelayan`, `Relawan`) operate via URL query parameter `?type=` without introducing new domain logic. |
| **6** | **Search Source** | **EXISTING QUERY SOURCE.** Uses existing `.ilike('nama_lengkap', '%q%')` Supabase server query. |
| **7** | **Card Soup Inventory** | **CARDS DETECTED (Requires Normalization).** Current code renders a 2-column grid of floating cards (`rounded-2xl p-4 border`). MUST be normalized to full-width `SemanticRow` list with 1px hairline dividers. |
| **8** | **PDP Privacy Boundaries** | **NO LEAKS.** Rows expose public directory fields only (`nama_lengkap`, `nama_induk`, `status`). Sensitive personal data remains shielded inside F2. |
| **9** | **State Handling** | **NORMALIZED.** Handles Unauthorized (SSR `/login` redirect), Empty/No-Result (clean centered state), and Loading (SSR rendered). |
| **10** | **Row Navigation** | **CANONICAL REDIRECT.** Row click performs clean client-side navigation to `/people/[id_person]`. |

---

## 📐 TARGET SURFACE GEOMETRY & TYPOGRAPHY MODEL

```text
┌──────────────────────────────────────────────────────────┐
│ Context Header                                     🔔    │
├──────────────────────────────────────────────────────────┤
│ SDM                                                      │
│ Direktori pendeta, pelayan, dan relawan                  │
│                                                          │
│ [ 🔍 Cari nama pendeta atau pelayan.................... ]│
│                                                          │
│ [Semua]  [Pendeta]  [Pelayan]  [Relawan]                 │
│ ──────────────────────────────────────────────────────── │
│ 👤  Pdt. Otniel Marbun                                  │
│     Pendeta · Jemaat Immanuel                          › │
│ ──────────────────────────────────────────────────────── │
│ 👤  Pdt. Christian S.                                   │
│     Pendeta · Jemaat Paulus                            › │
│ ──────────────────────────────────────────────────────── │
│ 👤  Relawan Pelayanan A                                 │
│     Relawan · Pos Pelkes X                             › │
└──────────────────────────────────────────────────────────┘
```

- **Pattern:** `Surface ➔ Row ➔ Divider ➔ Navigation` (Eliminating card soup).
- **Component:** Uses `SemanticRow` ([SemanticRow.tsx](file:///d:/PROJECT/si-gpib-v2/src/components/ui/SemanticRow.tsx)) with `hairline-b`.
- **Gutter:** `px-gutter-mobile` (16px) / `md:px-gutter-desktop` (24px).

---

## 🚀 FASE 3 IMPLEMENTATION PIPELINE

```text
F3.1  Projection Filter Chips Implementation (?type=all|pendeta|pelayan|relawan)
      ↓
F3.2  SemanticRow List & Hairline Divider Normalization in /people/page.tsx
      ↓
F3.3  Search & Empty/No-Result State Polish
      ↓
      ┌────────────────────────────────────────────────────────┐
      │ F3 VERIFICATION GATE:                                  │
      │ 1. npx tsc --noEmit (0 Errors)                         │
      │ 2. npm run build                                       │
      │ 3. F2 & F3 E2E Suite Pass                              │
      │ 4. Navigation & Geometry Contract Verification         │
      └────────────────────────────────────────────────────────┘
```
