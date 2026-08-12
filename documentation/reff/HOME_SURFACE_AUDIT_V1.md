# HOME SURFACE AUDIT V1 (/dashboard)

**Platform Layer:** Home Control & Attention-First Surface Layer  
**Platform Target:** Platform Baseline v2.2.0 (🔒 FROZEN ARCHITECTURE)  
**Governance Lineage:** `v2.0.0 ➔ SURFACE_NORMALIZATION_GATE_V1 ➔ HOME_SURFACE_AUDIT_V1`  
**Audit Verdict Status:** 🟢 **AUDIT COMPLETED — AUTHORIZED FOR ATTENTION-FIRST IMPLEMENTATION**  
**Date:** 2026-08-12  

---

## 🛑 THE HOME RECONSTRUCTION IRON LAW

> [!CAUTION]
> **IRON LAW OF HOME RECONSTRUCTION:**  
> **`/dashboard` is an Attention-First Projection & Aggregation Surface, NOT a Business Logic Layer.**  
> 1. `/dashboard` MUST NOT create new business orchestration, services, or DB workflows.  
> 2. `/dashboard` MUST aggregate state directly from certified existing queries/services.  
> 3. Floating FAB `+` remains the SINGLE CANONICAL Action Gateway. Dashboard actions act strictly as entry shortcuts.

```text
Existing Domain / Services / Queries (🔒 FROZEN)
              │
              ▼
       Projection / Aggregation
              │
       ┌──────┼──────┬────────┐
       ▼      ▼      ▼        ▼
    CONTEXT ATTENTION ACTION INSIGHT
       │      │      │        │
       └──────┼──────┼────────┘
              ▼
    /dashboard (Attention-First Home Surface)
```

---

## 📊 1. CURRENT DASHBOARD SURFACE INVENTORY

Based on actual codebase inspection of [`src/app/(dashboard)/dashboard/page.tsx`](file:///d:/PROJECT/si-gpib-v2/src/app/(dashboard)/dashboard/page.tsx):

1. **Header & Context**:
   - `ScopeIndicator` rendered ONLY on desktop (`hidden md:flex`). On mobile viewports, users lack immediate visual clarity regarding their active role scope ("What context am I working in?").
2. **Greeting Banner**:
   - `WelcomeGreetingBanner` with mixed greeting copy and inline quick links.
3. **Stat Cards Section**:
   - 6 statistics cards (`Mupel`, `Jemaat Induk`, `Bajem`, `Pos Pelkes`, `Total Jiwa`, `Giat Pastoral`) placed at the top before operational items.
4. **Demographics & Activity Grid**:
   - 2-column layout containing `DemografiChart` (Pelkat PA/PT/GP/PKP/PKB/PKLU) and `RecentActivity`.
5. **Conditional Pastoral Section**:
   - Renders `PastoralStats` when `userRole === 'kmj'`.
6. **QuickActions Footer**:
   - Redundant `QuickActions` component floating at bottom.

---

## 🗺️ 2. ATTENTION-FIRST NORMALIZATION MODEL

Reorganize `/dashboard` into **4 Sequential Layers**:

### Layer 1: CONTEXT LAYER (Konteks Kerja User)
- Integrated mobile & desktop **Context Banner / Chip**:
  e.g. `⛪ Sinode GPIB · Admin Nasional` or `⛪ Mupel Jabar · Ketua Majelis Jemaat`.
- Provides 100% instant visual clarity on active scope upon login.

### Layer 2: ATTENTION LAYER (Perhatian Utama Operasional)
- Prominently placed BEFORE statistics:
  - **Pending Approvals**: Counts of aid requests awaiting review (`t_ajuan_bantuan` status `PENDING`).
  - **Offline Sync Alerts**: Pending offline drafts / sync warnings.
  - **Elevation Requests**: Status elevation alerts.
- Formatted as clean `SemanticRow` items or warning chips with direct link to approval pages.

### Layer 3: ACTION LAYER (Entri Aksi Informasi)
- Quick informational entry shortcuts (*Tambah Log Pastoral*, *Ajukan Bantuan*, *Buka Direktori*).
- Does NOT duplicate or conflict with the FAB `+` Master Menu Sheet.

### Layer 4: INSIGHT LAYER (Statistik & Demografi Ringkas)
- Positioned below Attention & Action layers.
- Contains normalized `StatCards`, `DemografiChart`, and `RecentActivity` using F1.1 surface design tokens (`border-border-subtle`, `bg-surface-1`, `rounded-card`).

---

## 🔒 3. FORBIDDEN MUTATION LIST

> [!CAUTION]
> **FORBIDDEN MUTATION LIST (SACRED BOUNDARIES):**
> 1. ❌ **DO NOT create new backend services / tables**: All attention counts MUST be aggregated from existing tables (`t_ajuan_bantuan`, `t_log_pastoral`, etc.).
> 2. ❌ **DO NOT alter Authorization Boundaries**: `userRole`, `isLocked`, and scope filtering rules remain 100% untouched.
> 3. ❌ **DO NOT duplicate the FAB Action Gateway**: FAB `+` remains the canonical quick action handler.

---

## 🚀 4. F4 IMPLEMENTATION PIPELINE

```text
F4.1  Context Layer Normalization (Unified Mobile & Desktop Scope Indicator)
      ↓
F4.2  Attention Layer Implementation (Pending approvals & sync alert projection)
      ↓
F4.3  Action Layer Shortcut Refactoring
      ↓
F4.4  Insight Layer Token Styling & Reordering
      ↓
      ┌────────────────────────────────────────────────────────┐
      │ F4 VERIFICATION GATE:                                  │
      │ 1. npx tsc --noEmit (0 Errors)                         │
      │ 2. npm run build                                       │
      │ 3. E2E Regression Suite Pass                           │
      │ 4. Attention-First Geometry Verification               │
      └────────────────────────────────────────────────────────┘
```
