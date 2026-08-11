# F2 PERSON WORKSPACE DESIGN GATE V1

**Platform Layer:** Cross-Feature UX Integration Layer (Consumer of F2, F12, F13, F11)  
**Platform Target:** Platform Baseline v2.0.0 (🔒 FROZEN)  
**Governance Lineage:** `v2.0.0 ➔ F2 Ref #1 ➔ F15 /org ➔ F2 Person Workspace Transformation (Design Gate V1)`  
**Audit Verdict Status:** 🟢 **READ-ONLY BASELINE AUDIT VERIFIED — GO FOR CONSUMER IMPLEMENTATION**  
**Date:** 2026-08-12  

---

## 1. IDENTITY MODEL & INVARIANTS

### 1.1 Invariant Utama: Active Person Context ≠ Authorization Expansion
> [!IMPORTANT]
> **INVARIANT SUPREMA:**  
> **Person Workspace adalah konteks visualisasi profil personal (UI View Context). Hak akses pengguna terhadap data privat (keluarga, biometrik, log pastoral) sepenuhnya ditentukan oleh F12 (PDP / PostgreSQL RLS Policies).**  
> Mengunjungi atau bernavigasi di Person Workspace **TIDAK PERNAH MEMPERLUAS AUTHORIZATION SCOPE** pengguna.

```text
                 F12 AUTHORIZATION (PostgreSQL RLS / PDP)
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  Allowed Scope  │ (Self OR Super User)
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  Person Workspace│ (UI Context Only)
                          └────────┬────────┘
                                   │
                                   ▼
                       Fail-Closed Read Model
```

### 1.2 The Universal Person Boundary Question (AUDITED & ANSWERED)
- **Question:** Apakah Person Workspace Transformation dapat memberikan pengalaman 360° yang ditargetkan **tanpa memperluas `get_pendeta_360()` dan tanpa mengubah F2/F12 contract?**
- **Verdict:** **YA (PURE CONSUMER)**.  
  Antarmuka `UnifiedPersonData` dan `adaptPersonToViewModel` di UI Anti-Corruption Layer secara bersih mengisolasi data Pendeta 360° dan menyajikannya secara *fail-closed*. Komponen UI menyerap tipe data `DATA`, `PRIVACY_MASKED`, atau `EMPTY` tanpa memerlukan perubahan skema database atau RPC baru.

---

## 2. ACTIVE PERSON CONTEXT & ROUTING CONTRACT

| Parameter | Canonical Target / Rule | Fallback / Fail-Closed Behavior |
| :--- | :--- | :--- |
| **Canonical Route** | `/people/[id_person]` | `/people` (Person Directory) |
| **Identity Resolution** | Server-side `fetchUnifiedPersonData(id_person)` | Next.js `notFound()` if entity absent |
| **Self Profile Shortcut** | `/settings/profile` | Exactly 1 assignment ➔ `/people/{id_person}`<br>No assignment ➔ `/people`<br>Ambiguous ➔ Fail-closed explicit resolution |
| **Authorization Check** | Server-side `getServerContext()` | Privacy notice masking for unauthorized viewers |

---

## 3. PERSON NAVIGATION & ANCHOR CONTRACT

The Person Workspace presents 5 progressive, deep-linkable section anchors using semantic navigation links:

```text
/people/{id_person}
    ├── <a href="#overview">       ➔ Ringkasan statistik personal, status tugas aktif, & log pastoral
    ├── <a href="#profile">        ➔ Identitas utama, biografi, & data keluarga (Privacy State Enforced)
    ├── <a href="#roles">          ➔ Penugasan pos pelkes, jabatan struktural, & riwayat mutasi
    ├── <a href="#competencies">   ➔ Kompetensi pastoral, karunia, & keterlibatan sinodal
    └── <a href="#pastoral">       ➔ Telemetri log pelayanan & supervisi pastoral
```

---

## 4. PRIVACY STATE CONTRACT (FAIL-CLOSED)

> [!WARNING]
> **FAIL-CLOSED PRIVACY CONTRACT:**  
> Server F12 PDP mengevaluasi akses secara langsung saat query database. Apabila pengguna tidak memiliki izin (bukan pemilik profil / bukan Super User):  
> 1. Database mengembalikan `null` atau metadata `PRIVACY_MASKED`.  
> 2. Klien **TIDAK PERNAH** menerima data mentah privat untuk disembunyikan via CSS.  
> 3. UI wajib merender komponen `PrivacyStateNotice` secara eksplisit dan transparan.

```text
Viewer State ➔ Evaluation ➔ Payload Returned ➔ UI Component Rendered
─────────────────────────────────────────────────────────────────────────────
Authorized (Self / Super) ➔ PASS ➔ Full Data Object ➔ Full Data Cards
Unauthorized Viewer ➔ DENY ➔ PRIVACY_MASKED Payload ➔ PrivacyStateNotice Component
Missing / Null Data ➔ EMPTY ➔ EMPTY Payload ➔ Empty State Notice
```

---

## 5. F2/F12/F13/F11 CONSUMER BOUNDARY

| Subsystem | Baseline Status | Consumer Integration Contract | Violation Trigger |
| :--- | :--- | :--- | :--- |
| **F2 Person Workspace** | 🔒 FROZEN | Pure consumption via `fetchUnifiedPersonData` | Modifying `get_pendeta_360()` or `person.ts` |
| **F12 PDP Authorization** | 🔒 FROZEN | Server RLS policy enforcement & `PrivacyStateNotice` | Bypassing RLS or client-side privacy checks |
| **F13 Audit Trail Engine** | 🔒 FROZEN | Transaction logging via `t_log_aktivitas` | Direct mutation without F13 logging |
| **F11 Telemetry Stream** | 🔒 FROZEN | Read-only telemetry event outbox viewing | Direct telemetry schema changes |

---

## 6. MOBILE GEOMETRY & DEEP-LINK CONTRACT

| Parameter | Specification & Rule | Verification Requirement |
| :--- | :--- | :--- |
| **Bottom Nav Clearance** | `pb-36 md:pb-16` | Main container padding guarantees `SuperBottomNav` clearance. |
| **Touch Target Size** | `min-h-[44px] min-w-[44px]` | All anchor links, buttons, and triggers satisfy 44px touch rule. |
| **Header Offset** | `scroll-mt-36 md:scroll-mt-28` | All 5 section anchors compensate for `MobileHeader` & `PersonNavigationAnchor`. |
| **Geometry Assertion** | `target.top >= effectiveHeaderBottom` | Playwright E2E assertion satisfies `sectionBox.y + 5 >= headerBox.bottom`. |
| **Active Anchor Observer** | `IntersectionObserver` (`rootMargin: '-20% 0px -60% 0px'`) | Dynamic section tracking across window or `<main className="overflow-y-auto">`. |
| **Mount Hash Handler** | `useEffect` hash handler with `behavior: 'auto'` | Cold-load deterministik langsung mendarat di seksi hash tanpa layout shift. |

---

## 7. LOADING, EMPTY, & ERROR STATES

- **Loading State:** Standardized Skeleton Loading UI (`PersonWorkspaceSkeleton.tsx`) during Next.js page transition.
- **Empty State:** Standardized empty message notice rendered when a section returns `type === 'EMPTY'`.
- **Error State:** Next.js `notFound()` trigger when `id_person` does not exist; global error boundary catch for network errors.

---

## 8. ACCESSIBILITY & NAVIGATION SEMANTICS

- Anchor elements in `PersonNavigationAnchor` use semantic `<a href="#section">` navigation links.
- Active section state is indicated using `aria-current="location"` rather than `role="button"` + `aria-selected`.
- Keyboard navigation supported via standard Focus indicators (`focus-visible:outline-hidden focus-visible:ring-2`).
- Contrast ratio compliant with WCAG AA standards (high-contrast text colors in light/dark mode).

---

## 9. MANDATORY 12-POINT E2E VERIFICATION MATRIX

| ID | Test Scenario | Expected Outcome & Boundary Assertion |
| :--- | :--- | :--- |
| **01** | Canonical `/people/{id}` | Default load opens `#overview` in active viewport |
| **02** | Cold-load `#profile` | Deterministic landing on `#profile` anchor |
| **03** | Cold-load `#roles` | Deterministic landing on `#roles` anchor |
| **04** | Cold-load `#competencies` | Deterministic landing on `#competencies` anchor |
| **05** | Cold-load `#pastoral` | Deterministic landing on `#pastoral` anchor |
| **06** | Internal anchor navigation | Click anchor link updates hash & scrolls smoothly |
| **07** | Mobile geometry contract | Target section `top >= effectiveHeaderBottom` on mobile (390px) |
| **08** | Desktop geometry contract | Target section `top >= effectiveHeaderBottom` on desktop (1280px) |
| **09** | Unknown `id_person` | Next.js `notFound()` 404 page rendered |
| **10** | Authorized viewer (Self/Super) | Full private data cards rendered (family & biometrics) |
| **11** | Unauthorized viewer | `PrivacyStateNotice` component rendered in DOM |
| **12** | Raw payload leak assertion | **Strict boundary:** DOM does NOT contain raw private payload string for unauthorized viewer |

---

## 10. BASELINE COMPATIBILITY GATE & READ-ONLY AUDIT VERDICT

```text
READ-ONLY BASELINE CONTRACT AUDIT VERDICT (F2 TRANSFORMATION)
────────────────────────────────────────────────────────────
Database Migrations Diff     🟢 0% (Zero schema change required)
PostgreSQL RLS Policies      🟢 0% (Zero policy change required)
F2 Core RPC Helpers          🟢 0% (Pure Read-Only Consumption)
Privacy Fail-Closed Policy   🟢 PASSED (Server-enforced PRIVACY_MASKED)
F3 Geometry Pattern Reuse    🟢 PASSED (Adopt scroll-mt-36 & IntersectionObserver)
Active Person Context        🟢 PASSED (Decoupled from F12 RLS authorization)
────────────────────────────────────────────────────────────
VERDICT                      🟢 GO FOR CONSUMER IMPLEMENTATION
```
