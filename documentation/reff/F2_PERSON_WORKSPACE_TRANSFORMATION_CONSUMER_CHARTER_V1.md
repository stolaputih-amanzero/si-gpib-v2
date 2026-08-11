# F2 PERSON WORKSPACE TRANSFORMATION CONSUMER CHARTER V1

**Platform Layer:** Cross-Feature UX Integration & Modernization Layer (Consumer of F2, F12, F13, F11)  
**Parent Baseline Target:** Platform Architecture Baseline v2.0.0 (🔒 FROZEN)  
**Governance Lineage:** `v2.0.0 ➔ F2 Ref #1 ➔ F15 /org ➔ Workspace Transformation ➔ F2 Person Workspace Transformation`  
**Charter Status:** 🟡 **DRAFT & AWAITING DESIGN GATE REVIEW** (Zero Code Modification Authorized)  
**Date:** 2026-08-12  

---

## 1. PURPOSE & SCOPE

### 1.1 Purpose
F2 Person Workspace (`/people/[id_person]`) is certified as **Reference Implementation #1** in Platform Baseline v2.0.0. The purpose of this charter is to define the **Consumer-Only Modernization & Integration Framework** for Person Workspace without modifying baseline database schemas, RPC functions, or F12 PDP authorization boundaries.

### 1.2 Scope Boundaries
- **IN SCOPE:**
  - Modernizing Person Workspace UI Shell (`PersonWorkspaceShell.tsx`, `PersonHeader.tsx`, `PersonNavigationAnchor.tsx`).
  - Aligning section layout into 5 progressive anchor sections (`#overview`, `#profile`, `#roles`, `#competencies`, `#pastoral`).
  - Adopting the F3 P2 **Geometry Contract** (`scroll-mt-36 md:scroll-mt-28` & `IntersectionObserver`) for deep-link anchors.
  - Enforcing mobile layout clearance (`pb-36 md:pb-16`) and responsive card targets.
  - Server-enforced privacy notice boundaries (`PrivacyStateNotice`) for family and biometric data.
- **OUT OF SCOPE (EXPLICIT NON-GOALS):**
  - Modifying Supabase migrations or SQL schemas.
  - Modifying `get_pendeta_360()` RPC or F2 baseline helpers.
  - Expanding person data mutations or CRUD operations.
  - Altering F12 PDP RLS policies or privacy authorization logic.

---

## 2. CURRENT F2 CAPABILITY INVENTORY

> [!NOTE]
> Based on `documentation/F2_PERSON_WORKSPACE_DISCOVERY.md`, the audited baseline capabilities for Person Workspace are:

| Capability Boundary | Baseline Asset / Helper | Audited Behavior | Consumer Status |
| :--- | :--- | :--- | :--- |
| **Canonical Route** | `src/app/(dashboard)/people/[id_person]/page.tsx` | Single entry point for Person Workspace. | 🔒 **READ-ONLY CONSUMPTION** |
| **Data Fetcher** | `src/lib/services/person.ts` (`fetchUnifiedPersonData`) | Consumes RPC `get_pendeta_360()`. Strictly bound to Pendeta entity capability. | 🔒 **READ-ONLY CONSUMPTION** |
| **Workspace Shell** | `src/components/person/PersonWorkspaceShell.tsx` | Identity Banner Header + Sticky Anchor Bar + 5 Section Blocks. | 🟢 **CONSUMER MODERNIZATION** |
| **Privacy Boundary** | `src/components/person/PrivacyStateNotice.tsx` | Renders server-returned `PRIVACY_MASKED` data notices for unauthorized viewers. | 🔒 **MANDATORY INVARIANT** |
| **Authorization Check** | `getServerContext()` & F12 PDP RLS | Server-side evaluation of `can_see_private` and scope boundary. | 🔒 **UNTOUCHED BASELINE** |

---

## 3. TARGET PERSON WORKSPACE EXPERIENCE

The modernized Person Workspace experience presents a unified **360° Personal Command Center** across 5 progressive, deep-linkable anchors:

```text
/people/{id_person}
    ├── #overview       ➔ Ringkasan statistik personal, status tugas aktif, & log pastoral
    ├── #profile        ➔ Identitas utama, biografi, & data keluarga (Privacy State Enforced)
    ├── #roles          ➔ Penugasan pos pelkes, jabatan struktural, & riwayat mutasi
    ├── #competencies   ➔ Kompetensi pastoral, karunia, & keterlibatan sinodal
    └── #pastoral       ➔ Telemetri log pelayanan & supervisi pastoral
```

---

## 4. ENTITY & DATA CONSUMPTION MAP

> [!IMPORTANT]
> **EXISTING CAPABILITY CONTRACT ENFORCEMENT:**  
> The current backend capability `fetchUnifiedPersonData` (via `get_pendeta_360()`) is Pendeta-centric. This charter strictly enforces consuming `fetchUnifiedPersonData` **as an existing capability contract**.  
> We do NOT attempt to rewrite baseline schemas to merge Penatua, Diaken, or Relawan into F2. If a future requirement demands multi-role entity expansion beyond Pendeta 360°, it MUST trigger a **HARD STOP & ADR Review**.

```text
               EXISTING F2 BACKEND CAPABILITY (🔒 FROZEN)
                         get_pendeta_360()
                                 │
                                 ▼
                     fetchUnifiedPersonData()
                                 │
                                 ▼
                    UnifiedPersonData Interface
                                 │
                                 ▼
                  adaptPersonToViewModel() Adapter
                                 │
                                 ▼
                 F2 Person Workspace ViewModel
```

---

## 5. PRIVACY & AUTHORIZATION INVARIANTS

> [!WARNING]
> **PRIVACY INVARIANT SUPREMA:**  
> Person Workspace Transformation **MUST NEVER** fetch unauthorized private data (e.g. family details, biometric records) to mask or hide on the client side.  
> Privacy enforcement remains strictly **server-delegated via F12 PDP RLS**.

```text
                        F12 PDP / RLS Authorization
                                     │
                                     ▼
                        Server-Side Context Check
                     (Self OR Super User Evaluation)
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
           Authorized Viewer                 Unauthorized Viewer
                    │                                 │
                    ▼                                 ▼
           Full Family & Biometrics             Server Returns NULL / 
            Data Returned from DB               PRIVACY_MASKED Notice
                    │                                 │
                    ▼                                 ▼
           Rendered in UI                    Rendered as PrivacyStateNotice
```

---

## 6. WORKSPACE & ANCHOR MODEL

We adopt the proven **F3 P2 Geometry & Deep-Link Pattern**:

| Parameter | Specification | Compliance Requirement |
| :--- | :--- | :--- |
| **Canonical Deep-Link Target** | `/people/{id_person}#section` | Deterministik deep linking langsung ke node person + section hash. |
| **Section Margin Top** | `scroll-mt-36 md:scroll-mt-28` | Menjamin target section tidak tertutup *Mobile Header* atau *Sticky Anchor Bar*. |
| **Geometry Contract** | `target.top >= effectiveHeaderBottom` | Teruji melalui Playwright E2E assertion pada viewport Mobile & Desktop. |
| **Active Anchor Observer** | `IntersectionObserver` (`rootMargin: '-20% 0px -60% 0px'`) | Tracking otomatis seksi aktif berbasis viewport scroll. |
| **Mount Initialization** | `useEffect` hash handler with `behavior: 'auto'` | Cold-load deterministik langsung mendarat di seksi hash tanpa *layout shift*. |

---

## 7. F2/F12/F13/F11 CONSUMER DEPENDENCY MAP

| Baseline Subsystem | Subsystem Role | Consumer Integration Contract | Modification Allowed |
| :--- | :--- | :--- | :--- |
| **F2 Person Workspace** | Identity & Profile 360 | Read-only consumption via `fetchUnifiedPersonData` | ❌ ZERO MODIFICATION |
| **F12 PDP Authorization** | Hierarchical Access Control | Server-evaluated authorization & Privacy Masking | ❌ ZERO MODIFICATION |
| **F13 Audit Trail Engine** | Cryptographic Action Logging | Mutation logging via `t_log_aktivitas` | ❌ ZERO MODIFICATION |
| **F11 Telemetry Outbox** | Transactional Event Outbox | Read-only telemetry stream viewing | ❌ ZERO MODIFICATION |

---

## 8. MOBILE UX CONTRACT

| Mobile Parameter | Specification | Rule |
| :--- | :--- | :--- |
| **Bottom Clearance** | `pb-36 md:pb-16` | Mencegah `SuperBottomNav` melayang menutupi konten bawah. |
| **Touch Target Size** | `min-h-[44px] min-w-[44px]` | Semua tab anchor, tombol aksi, dan card link wajib memenuhi standar 44px. |
| **Sticky Header** | `MobileHeader` `top-0 z-40` | Header seluler melayang bersih dengan `backdrop-blur-md`. |
| **Card Padding & Text** | `p-3.5 sm:p-4`, font `text-sm` | Tidak ada pemotongan teks (*text truncation*) pada informasi identitas person. |

---

## 9. BASELINE COMPATIBILITY GATE

Prior to initiating any implementation phase, the proposal must pass the **Baseline Compatibility Gate**:

```text
BASELINE COMPATIBILITY GATE CHECKLIST (F2 TRANSFORMATION)
────────────────────────────────────────────────────────────
Database Migrations Diff     🟢 0% Required (Zero Schema Change)
PostgreSQL RLS Policies      🟢 0% Required (Zero Policy Change)
F2–F14 Core Helpers          🟢 0% Required (Pure Read-Only)
F12 Privacy Boundaries       🟢 PASSED (Server-enforced PRIVACY_MASKED)
F3 Geometry Pattern Reuse    🟢 PASSED (Adopt scroll-mt-36 & IntersectionObserver)
────────────────────────────────────────────────────────────
VERDICT                      🟢 GO FOR DESIGN GATE
```

---

## 10. EXPLICIT NON-GOALS

1. **No Backend Entity Merging:** We do NOT alter `get_pendeta_360()` to force Penatua/Diaken/Relawan in this consumer layer.
2. **No Client-Side Authorization Logic:** We do NOT compute user access levels in React state.
3. **No Direct Baseline Code Edits:** All changes are strictly contained within consumer components (`src/components/person/`).
4. **No Route Splitting:** Canonical path remains `/people/[id_person]`. No legacy routes (`/pelayan`, `/pendeta`) will be re-introduced.

---

## 11. HARD STOP / ADR CONDITIONS

If any of the following conditions are encountered during Design Gate or Implementation, work MUST **HARD STOP** immediately and initiate a formal ADR:

1. Requirement demands modifying database tables in `supabase/migrations/`.
2. Requirement demands altering parameters or return types of `get_pendeta_360()`.
3. Requirement demands bypassing or expanding F12 PDP authorization rules.
4. Requirement demands removing or bypassing `PrivacyStateNotice` for unauthorized users.

---

## 12. ACCEPTANCE & EVIDENCE CONTRACT

Milestone completion for F2 Person Workspace Transformation requires:
1. **TypeScript Type Safety**: `npx tsc --noEmit` passes with **0 errors**.
2. **Production Build Verification**: `npm run build` compiles with **0 warnings/errors**.
3. **Playwright E2E Test Suite**: New test file `e2e/f2-person-workspace.spec.ts` passes **100%** covering:
   - Cold load `/people/{id}` -> Overview active.
   - Cold load `/people/{id}#roles` -> Satisfies Desktop & Mobile Geometry Contract (`target.top >= header.bottom`).
   - Cold load by Unauthorized User -> PrivacyStateNotice verified for Family & Biometrics (DOM absence of raw data).
   - Internal Anchor tap -> Hash updated & smooth scroll verified.
4. **Baseline Drift Audit**: `git status` verifies 0 modifications to `supabase/migrations/` and core F2–F14 baseline files.
