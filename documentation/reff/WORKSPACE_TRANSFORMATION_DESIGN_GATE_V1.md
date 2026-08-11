# WORKSPACE TRANSFORMATION DESIGN GATE V1
**Platform Layer:** Cross-Feature UX Integration Layer (Consumer of F2–F15)  
**Platform Version Target:** Platform Baseline v2.0.0 (🔒 FROZEN)  
**Governance Lineage:** `v2.0.0 ➔ F15 /org ➔ Workspace Transformation (Cross-Feature UX Integration Layer)`  
**Audit Status:** 🟢 READ-ONLY BASELINE CONTRACT AUDIT VERIFIED (0 DRIFT)

---

## 1. WORKSPACE MODEL & INVARIANTS

### 1.1 Invariant Utama: Active Workspace ≠ Authorization Scope
> [!IMPORTANT]
> **INVARIANT SUPREMA:**  
> **Active Workspace adalah konteks tampilan UI (UI View Context). Otorisasi pengguna sepenuhnya ditentukan oleh F12 (PDP / PostgreSQL RLS Policies).**  
> Switching / mengganti `Active Workspace` pada UI **TIDAK PERNAH MEMPERLUAS AUTHORIZATION SCOPE** pengguna.

```text
                 F12 AUTHORIZATION (PostgreSQL RLS / PDP)
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Allowed Scope   │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Active Workspace│ (UI Context Only)
                          └────────┬────────┘
                                   │
                                   ▼
                            UI / Read Model
```

### 1.2 Active Workspace Concept
`Active Workspace` adalah unit hierarki organisasi (`Mupel`, `Jemaat Induk`, atau `Pos Pelkes`) yang sedang menjadi konteks visualisasi aktif di UI. Seluruh visualisasi data, agregasi statistik, personil, aset, ajuan bantuan, dan pemetaan wilayah direspons secara eksplisit berdasarkan `Active Workspace`.

### 1.3 Workspace Saya (`/org/me`) — Pure Consumer Redirect Layer
`/org/me` bertindak **sepenuhnya sebagai Page/Consumer Redirect Layer** (bahkan tidak memiliki state bisnis, API semantics, atau database storage tersendiri).

```text
/org/me (Page Redirect Consumer Layer)
   │
   ├─ resolve authenticated identity (via auth.users & users table)
   ├─ resolve role (super_user, admin_mupel, kmj, pj, user)
   ├─ resolve assignment (t_penugasan_pendeta / m_jemaat_induk / m_mupel)
   ├─ resolve workspace target
   │
   ├─ valid target ──────► redirect /org/{id_org}
   │
   └─ no assignment ─────► redirect /org
```

### 1.4 Context Switching
Pengguna (khususnya Super User, Admin Mupel, atau KMJ) dapat mengoperasikan `Active Workspace` secara *in-context* melalui komponen **Workspace Context Switcher** di Top Header tanpa mengubah hak otorisasi F12.

---

## 2. SMART ENTRY CONTRACT

| Role | Primary Target Route | Condition / Assignment Filter | Fallback Route |
| :--- | :--- | :--- | :--- |
| `super_user` | `/org` | Semua node dapat diakses | `/org` |
| `admin_mupel` | `/org/{id_mupel}` | Memiliki `id_mupel` di `users` table | `/org` |
| `kmj` (Ketua Majelis Jemaat) | `/org/{id_induk}` | Memiliki `id_induk` / `id_kmj` di `m_jemaat_induk` | `/org` |
| `pj` (Pendeta Jemaat) | `/org/{id_pos}` | Memiliki `id_pos` aktif di `t_penugasan_pendeta` (`status_tugas = 'Aktif'`) | `/org/{id_induk}` ➔ `/org` |
| `guest` / `read_only` | `/org` | Pengguna anonim / tanpa penugasan | `/login` |

---

## 3. IDENTITY RESOLUTION CONTRACT (AUDITED & VERIFIED)

### 3.1 Audited Baseline Identity Sources
- **User Session:** `auth.users` ➔ Server API `/api/auth/me` / `supabase.auth.getUser()`.
- **User Role & Profile:** Tabel `users` (`role`, `id_mupel`, `id_induk`, `id_pos`, `id_pendeta`).
- **PJ Assignment:** Tabel `t_penugasan_pendeta` (`id_pendeta`, `id_pos`, `status_tugas = 'Aktif'`).
- **KMJ Assignment:** Tabel `m_jemaat_induk` (`id_kmj = id_pendeta`).
- **Pendeta Profile:** Tabel `m_pendeta` (`id_pendeta`, `id_induk`, `is_kmj`, `is_pj`).

---

## 4. NAVIGATION CONTRACT

### 4.1 Global Navigation Structure (Sidebar & Bottom Nav)
1. **📌 Workspace Saya (`/org/me`):** Redirecter otomatis ke node penugasan aktif.
2. **🌐 Direktori Organisasi (`/org`):** Eksplorasi hierarki Mupel, Jemaat Induk, dan Pos Pelkes.
3. **👥 SDM & Pelayan (`/people`):** Direktori personil, presbiter, dan pelayan pastoral.
4. **📊 Analitik & Peta (`/analytics`, `/maps`):** Proyeksi demografi, kondisi aset, dan peta sebaran wilayah.
5. **⚙️ Pengaturan (`/settings`, `/settings/profile`):** Profil 360° pengguna dan pengaturan sistem.

### 4.2 Workspace Navigation & Views (In-Node Anchors)
- `#overview` ➔ Ringkasan umum, koordinat, & statistik utama.
- `#structure` ➔ Struktur hierarki induk/anak.
- `#people` ➔ Daftar KMJ, PJ, Pelayan, dan Relawan.
- `#assets` ➔ Inventaris aset tanah, bangunan, dan barang bergerak.
- `#aid-requests` ➔ Ajuan bantuan & status persetujuan.
- `#territory` ➔ Demografi Pelkat, risiko kerawanan, & potensi wilayah.

---

## 5. MOBILE UX CONTRACT

| Parameter | Specification & Rule |
| :--- | :--- |
| **Bottom Nav Clearance** | Main container `pb-28 md:pb-12` untuk menjamin `SuperBottomNav` melayang tidak pernah menutupi tombol/konten bawah. |
| **Touch Target Size** | Semua elemen interaktif (tombol, tab, kartu, link) wajib memiliki ukuran minimal **44px × 44px**. |
| **Header Behavior** | `MobileHeader` bersifat sticky `top-0 z-40` dengan `backdrop-blur-md` dan `safe-area-inset-top`. |
| **Context Switcher** | Komponen `WorkspaceContextSwitcher` ditampilkan di header mobile dengan pembatasan teks (*truncate*) maks 160px. |
| **Responsive Grid & Cards** | Grid statistik di ponsel menggunakan `grid-cols-2 gap-2.5`, padding internal `p-3.5`, dan ukuran font `text-[22px]`. |

---

## 6. F2–F15 CONSUMER MAP (AUDITED & VERIFIED AGAINST BASELINE CODE)

| Feature ID | Feature Name | Audited Baseline Entity / Interface | Modifications Allowed |
| :--- | :--- | :--- | :--- |
| **F2** | Person Identity 360 | Read-only (`m_person`, `m_pendeta`, `useProfile`) | ❌ ZERO MODIFICATION |
| **F3** | Organization Workspace 360 | RPC `get_organization_360` + `fetchUnifiedOrganizationData` | ❌ ZERO MODIFICATION |
| **F11** | Telemetry Stream | `src/lib/telemetry/sync-tracker.ts` & `/developer/telemetry` | ❌ ZERO MODIFICATION |
| **F12** | PDP / RLS Authorization | Native PostgreSQL Policies + `enforceContract` (`/lib/authorization`) | ❌ ZERO MODIFICATION |
| **F13** | Audit Trail System | Logging table `t_log_aktivitas` via `db.from('t_log_aktivitas').insert(...)` | ❌ ZERO MODIFICATION |

---

## 7. BASELINE COMPATIBILITY GATE & READ-ONLY AUDIT VERDICT

```text
READ-ONLY BASELINE CONTRACT AUDIT VERDICT
────────────────────────────────────────────────────────────
Database Migrations Diff     🟢 0% (Zero schema change required)
PostgreSQL RLS Policies      🟢 0% (Zero policy change required)
F2–F14 Core Helpers          🟢 0% (Pure Read-Only Consumption)
Identity & Role Mapping      🟢 PASSED (Verified against users/t_penugasan_pendeta)
F13 Audit Logging Contract   🟢 PASSED (Verified against t_log_aktivitas)
F11 Telemetry Contract       🟢 PASSED (Verified against sync-tracker.ts)
Active Workspace Invariant   🟢 PASSED (Context UI strictly decoupled from F12 RLS)
────────────────────────────────────────────────────────────
VERDICT                      🟢 GO FOR IMPLEMENTATION
```
