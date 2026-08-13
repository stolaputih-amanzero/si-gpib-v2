# 01 — UX Information Architecture v1.1

| Field | Value |
|---|---|
| **Dokumen** | `01-UX-Information-Architecture-v1.1.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2 Freeze Package) |
| **Status** | ✅ `FROZEN` |
| **Otoritas** | Disusun berdasarkan `03-UX-Architecture-Decision-Log-v1.0.md` (ADR-UX-001 s.d. 007) |

---

## 1. Executive Summary

Dokumen ini merumuskan ulang Arsitektur Informasi (**Information Architecture - IA**) dan **UX Object Model** untuk aplikasi **SI GPIB v2.2**. Berlandaskan audit teknis eksisting dan keputusan arsitektural (ADR-UX-001 hingga 007), sistem yang semula berbasis *flat table routes* dan *mixed navigation menu* kini ditata ke dalam 6 hierarki konseptual murni:

$$\text{DOMAIN} \longrightarrow \text{CONTEXT} \longrightarrow \text{WORKSPACE} \longrightarrow \text{SECTION} \longrightarrow \text{ENTITY} \longrightarrow \text{ACTION}$$

### Temuan Arsitektur Utama:
1. **Pemisahan Tegas Navigation vs Action**: Navigation merepresentasikan **Tempat / Lingkungan Kerja** (*Places / Workspaces*), sedangkan Action merepresentasikan **Tindakan / Transaksi** (*Tasks / Operations*).
2. **Model Konteks Berlapis (Context Hierarchy)**: Bekerja di SI GPIB selalu terjadi di dalam sebuah **Context Scope** (`Sinode` $\rightarrow$ `Mupel` $\rightarrow$ `Jemaat` $\rightarrow$ `Pos Pelkes`). Perpindahan konteks (*Context Switching*) secara otomatis mengisolasi Data Scope dan Hak Akses. 
3. **Penyederhanaan Workspace**: Sistem hanya memiliki 2 Standalone Workspace utama: **Organization Workspace** dan **Person Workspace**.
4. **Stable Navigation**: Navigasi utama tetap, sedangkan konten di dalamnya beradaptasi (Adaptive Content) berdasarkan konteks kerja.

---

## 2. Canonical IA Areas (Domain Architecture)

Berdasarkan ADR-UX-001 hingga ADR-UX-004, seluruh fungsionalitas aplikasi dipetakan ke dalam struktur kanonis berikut:

```text
CANONICAL IA AREAS — SI GPIB v2.2
│
├── AREA A: ORGANIZATIONAL MANAGEMENT
│   └── Organization Workspace (Mupel / Jemaat / Pos — template sama, kelengkapan berbeda)
│       ├── Overview            (Contextual KPI & quick stats)
│       ├── Identity            (Profil, alamat, lokasi, kontak)
│       ├── SDM & Personel      (Personnel by context → PR-06 entry ke Person)
│       ├── Demografi           (Pelkat stats)
│       ├── Pastoral            (capability — ADR-01)
│       ├── Assets & Property   (capability — ADR-02)
│       ├── Territory           (capability — ADR-01)
│       └── Aid Requests        (transaction list — ADR-03)
│
├── AREA B: PEOPLE & MINISTRY
│   ├── Person Directory        (unified catalog — ADR-04)
│   └── Person Workspace        (role-specific progressive disclosure — ADR-04)
│
├── CROSS-CONTEXT PROJECTIONS (cara pandang, bukan tempat — PR-05)
│   ├── Territory Map           (spatial projection — ADR-01)
│   ├── Asset Intelligence      (cross-org asset projection — ADR-02)
│   ├── Aid Review Queue        (workflow inbox — ADR-03)
│   └── Reports & Analytics     (consolidated projection)
│
└── SYSTEM & GOVERNANCE
    ├── User Account & Security (authentication, biometric passkeys)
    ├── Admin & Role Management (RBAC configuration)
    └── Audit Trail & Sync Manager (logs, offline queue)
```

> **Catatan Penting**: Asset, Pastoral, dan Territory adalah *Organization Capabilities*, bukan Domain yang berdiri sendiri. Aid Request adalah *Workflow Transaction*, bukan Workspace.

---

## 3. Entity Architecture

### A. Organization Entity Family
Satu Entitas Utama **`Organization`** dengan *Organizational Subtype/Level*:
- Level 0: `Sinode` (Root Scope Implisit - Global Context)
- Level 1: `Mupel` (*Musyawarah Pelayanan*)
- Level 2: `Jemaat Induk` (*Gereja Lokal Mandiri*)
- Level 3a: `Bajem` (*Bakal Jemaat / Pos Pelkes Status Elevasi*)
- Level 3b: `Pos Pelkes` (*Pos Pelayanan & Kesaksian*)

Seluruh level organisasi menggunakan **Struktur Template Workspace yang Konsisten** (`Organization Workspace`).

### B. Person Entity Family
Satu Entitas Utama **`Person`** dengan pengalaman *role-specific progressive disclosure*:
- Subtype `Pendeta`: Memiliki Profil 360 lengkap (Jabatan, Mutasi, Keluarga, Sertifikasi).
- Subtype `Pelayan/Presbiter`: Pelayan organik pos.
- Subtype `Relawan`: Tenaga pendukung pelayanan pos.
- **Penting**: `User Account` BUKAN subtype Person, melainkan System Identity terpisah yang terhubung (0..1) ke Person.

---

## 4. Context Architecture & Scope

Context menjawab: *"Di lingkup organisasi/wilayah mana user sedang bekerja saat ini?"*

### Mekanisme Context Switching (ADR-UX-007)
Perpindahan konteks tidak didasarkan pada pemilihan peran (Misal: KMJ vs PJ), melainkan **berbasis Lokasi/Konteks Kerja (Jemaat X vs Pos Y)**. RBAC Engine di sisi server akan mengevaluasi otoritas berdasarkan lokasi yang dipilih.

| Role | Primary Working Context | Allowed Data Scope | Typical Workspace | Can Switch Context? |
|---|---|---|---|---|
| `super_user` | **Sinode Context** (Global) | Seluruh Mupel, Jemaat, & Pos (Global Access) | All Workspaces | **YES** |
| `admin_mupel` | **Mupel Context** | Seluruh Jemaat & Pos di dalam 1 Mupelnya (`id_mupel`) | Organization (Mupel Workspace) | **YES** (Terbatas di Mupelnya) |
| `kmj` | **Jemaat Context** | Jemaat Induknya (`id_induk`) & seluruh Pos bawahan | Organization (Jemaat Workspace) | **YES** (Terbatas ke Pos bawahannya) |
| `pj_pos` / `pj` | **Pos Pelkes Context** | 1 Pos Pelkes tempat tugasnya (`id_pos`) | Organization (Pos Workspace) | **NO** (Terkunci pada Pos tugasnya) |
| `pendeta` | **Person / Pos Context** | Profil Pribadi & Pos tempat ditugaskan | Person Workspace (Profil 360) | **LIMITED** (Sesuai riwayat penugasan) |
| `pelayan` / `relawan` | **Pos Pelkes Context** | 1 Pos Pelkes tempat tugas (`id_pos`) | Pos Pelkes Workspace (Read/Write Log) | **NO** (Terkunci pada Pos tugasnya) |

---

## 5. Workspace Architecture

Sistem dipangkas menjadi **2 Standalone Workspace** (mengeliminasi Asset Workspace dan Aid Request Workspace dari draf sebelumnya).

### 1. Organization Workspace
- **Tujuan**: Pusat kendali operasional, SDM, aset, & penggembalaan suatu unit organisasi.
- **Section**: Overview, Identity, SDM & Pelayan, Demografi Pelkat, Log Pastoral, Jadwal Pelayanan, Aset & Property, Wilayah & Intel, Pengajuan Bantuan.

### 2. Person Workspace (Pendeta 360)
- **Tujuan**: Portfolio komprehensif 360 derajat karir, jabatan, mutasi, & penggembalaan (progressive disclosure untuk peran lain).
- **Section**: Identitas Utama, Jabatan Struktural, Riwayat Mutasi, Penugasan Pos, Keluarga, Kompetensi, Log Pastoral.

---

## 6. Global Navigation Architecture (ADR-UX-005)

Sesuai ADR-UX-005, sistem menggunakan **Stable Primary Mobile Navigation** dengan 5 slot utama. Peta dan Laporan dipindahkan sebagai **Projection Cards** di halaman Beranda (Home).

```text
GLOBAL NAVIGATION LAYOUT
│
├── PRIMARY NAVIGATION (Places / Destinations — Bottom Bar)
│   ├── 1. Beranda (Home)         → Entry Point & Projection Cards (Peta, Laporan, Notifikasi)
│   ├── 2. Organisasi             → Organization Workspace (sesuai Active Context)
│   ├── 3. SDM                    → Person Directory & Workspace
│   ├── 4. [+] Quick Actions      → Modal Super Button
│   └── 5. Akun & Sistem          → Utility, Profil, Pengaturan
│
├── CONTEXT NAVIGATION (Current Working Scope)
│   └── Context Switcher Bar: [ Lokasi Kerja: Pos Pelkes Anugerah ] (Tap to Switch)
│
├── UTILITY NAVIGATION (Global Tools)
│   ├── Universal Search (Global Search Bar for Person/Org/Asset)
│   └── Network & Offline Sync Status Badge
│
└── QUICK ACTIONS (Floating Action Button / Super Button)
    ├── [ + Input Log Pastoral ]  (Triggers Modal/Sheet Form)
    ├── [ + Foto / Input Aset ]   (Triggers Modal/Sheet Form)
    └── [ + Ajukan Bantuan ]      (Triggers Modal/Sheet Form)
```

---

## 7. Cross-Context Projections & Transaction Views (PR-05 & PR-06)

Beberapa informasi bukan merupakan destinasi independen, melainkan Transaction View atau Projection.

1. **Aid Request Detail**: Sebuah Transaction View yang dipanggil dari Aid Section (Organization Workspace) ATAU dari Aid Review Queue (Inbox Approval). Bukan node navigasi.
2. **Asset Detail**: Dipanggil dari Asset Section (Organization Workspace) ATAU dari Asset Intelligence Projection.
3. **Territory Map**: Sebuah *Spatial Projection* yang dipanggil dari Projection Card di Home atau dari Section Wilayah di Organization Workspace.

### Aturan Keamanan & UX Context Switching:
1. **Visual Prominence**: Nama Konteks Aktif HARUS selalu terlihat menonjol di bagian atas layar (Header Context Chip).
2. **Form Auto-Lock (Poka-Yoke)**: Saat user membuka form aksi (misal: *Input Log Pastoral*), bidang Organisasi/Pos secara otomatis terisi dan terkunci (*disabled*) sesuai Konteks Aktif untuk mencegah kesalahan penginputan data.
3. **State Isolation**: Mengubah konteks organisasi akan memicu evaluasi RBAC ulang di server dan memuat ulang antarmuka ke *Organization Workspace* yang sesuai dengan cakupan izin yang baru (termasuk agregasi nasional jika memilih Sinode Global Scope).

---

*Dokumen ini bersifat FROZEN untuk Gate 2. Perubahan pada arsitektur ini memerlukan persetujuan melalui mekanisme Architecture Decision Record (ADR) yang baru.*
