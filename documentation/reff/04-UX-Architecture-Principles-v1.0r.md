# STEP 1: `04-UX-Architecture-Principles-v1.0.md` (Revisi Sinkronisasi)

Berikut adalah dokumen lengkap yang telah disinkronkan dengan `05-UX-Canonical-Model-v1.0.md` dan 5 Validation Constraints. Perubahan ditandai dengan catatan sinkronisasi.

---

# 04 — UX Architecture Principles v1.0

| Field | Value |
|---|---|
| **Dokumen** | `04-UX-Architecture-Principles-v1.0.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2 Freeze Package) |
| **Status** | ✅ `FROZEN` |
| **Sumber Otoritas** | `03-UX-Architecture-Decision-Log-v1.0.md` (ADR-UX-001 s.d. 007) |
| **Ontological Contract** | `05-UX-Canonical-Model-v1.0.md` (FROZEN) |
| **Peran Dokumen** | **HOW the architecture must behave** (Complementary: 05 = WHAT, 03 = WHY, 04 = HOW) |

---

## 0. Tujuan & Aturan Dokumen

### 0.1 Fungsi Dokumen

Dokumen ini adalah **ringkasan eksekutif dan hukum perilaku arsitektur** yang mengikat seluruh keputusan desain UX, struktur navigasi, dan implementasi teknis di SI GPIB v2.2.

### 0.2 Aturan Penggunaan

| Aturan | Pernyataan |
|---|---|
| **R-1** | Setiap desainer, developer, dan product manager **wajib** merujuk pada 9 prinsip ini sebelum membuat wireframe, route, component, atau query database. |
| **R-2** | Jika sebuah fitur atau desain melanggar prinsip di bawah ini, ia harus ditolak atau diajukan melalui proses ADR baru. |
| **R-3** | Dokumen ini tidak boleh mengubah definisi konseptual yang telah dikunci di `05-UX-Canonical-Model-v1.0.md`. |
| **R-4** | Dokumen ini tidak boleh mengulang rationale keputusan yang sudah tercatat di `03-UX-Architecture-Decision-Log-v1.0.md`. |

### 0.3 Pembagian Fungsi Tiga Dokumen

| Dokumen | Menjawab | Fungsi |
|---|---|---|
| `05-Canonical-Model` | **WHAT** — Apa hakikat setiap konsep? | Ontological contract: definisi, batas, dan klasifikasi. |
| `03-Decision-Log` | **WHY** — Mengapa keputusan ini diambil? | Decision traceability: context, options, rationale, consequences. |
| `04-Principles` | **HOW** — Bagaimana arsitektur harus berperilaku? | Behavioral rules: prinsip operasional yang mengikat seluruh implementasi. |

---

## 1. Pengelompokan Prinsip

Ke-9 prinsip ini dibagi ke dalam 4 pilar arsitektur:

```text
PILAR 1: ONTOLOGY & STRUCTURE    → Apa hakikat benda di dalam sistem?
PILAR 2: NAVIGATION & ACCESS     → Bagaimana cara menuju ke sana?
PILAR 3: INTERACTION & EXPERIENCE → Bagaimana cara bekerja di sana?
PILAR 4: CONTEXT & AUTHORITY     → Apa batas ruang lingkup dan wewenang saya?
```

---

## PILAR 1: ONTOLOGY & STRUCTURE

### PR-01: Importance ≠ Navigation Level

> **Pentingnya suatu data tidak otomatis menjadikannya Workspace atau Menu Utama. Tingkat navigasi ditentukan oleh konteks kerja pengguna, bukan oleh volume atau urgensi data.**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | Data yang sangat kritis (seperti Aset Tanah atau Laporan Keuangan) tidak otomatis mendapat slot di Primary Navigation. Mereka ditempatkan di dalam Workspace atau Projection yang sesuai dengan tempat user bekerja. |
| **Implikasi UX** | Sebelum mengusulkan "ini penting, harus jadi menu utama", tanyakan: *"Apakah user bekerja DI SINI (Workspace) atau MELIHAT dari tempat lain (Projection)?"* |
| **Sumber ADR** | ADR-UX-001, ADR-UX-002 |

---

### PR-02: Transaction ≠ Workspace

> **Workflow, pengajuan, dan tiket adalah *objek* yang diproses di dalam workspace atau antrian, bukan ruang kerja itu sendiri.**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | "Pengajuan Bantuan" bukanlah sebuah Workspace. User tidak "pergi ke Ruang Pengajuan". User membuat objek pengajuan dari dalam Organization Workspace, dan meninjaunya melalui Aid Review Queue (Projection). |
| **Implikasi UX** | Setiap kali seseorang mengusulkan "buat workspace untuk X", periksa: apakah X adalah *tempat bekerja* atau *objek yang dikerjakan*? Jika yang terakhir, ia adalah Transaction, bukan Workspace. |
| **Sumber ADR** | ADR-UX-003 |

---

### PR-04: Person ≠ User Account

> **Identitas manusia (*siapa orangnya*) terpisah secara fundamental dari akun sistem (*bagaimana ia masuk ke aplikasi*).**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | Tidak semua Person (misal: Relawan, Anak Sekolah Minggu) memiliki User Account. Relasi keduanya adalah 0..1. Struktur database autentikasi (`users`) tidak boleh mendikte struktur hierarki SDM di UX. |
| **Implikasi UX** | Person muncul di Person Directory dan Person Workspace. User Account dikelola di "Akun & Sistem" (Utility). Keduanya tidak boleh dicampur dalam satu navigasi. |
| **Sumber ADR** | ADR-UX-004 |

---

### PR-05: Projection is a View, not a Place

> **Projection (Peta, Laporan, Antrian) adalah cara pandang atau analisis terhadap data, bukan tempat bekerja (Workspace).**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | Peta Sebaran dan Laporan Analytics tidak boleh diperlakukan sebagai Primary Navigation Destination yang sejajar dengan Organisasi atau SDM. Mereka adalah System Capabilities yang diakses melalui Access Hierarchy (widget, search, atau section), bukan Navigation Hierarchy. |
| **Implikasi UX** | Projection tidak memiliki slot di Bottom Navigation. Ia muncul sebagai widget di Contextual Home, atau dipanggil dari Search, atau dari Section di Workspace. |
| **Sumber ADR** | ADR-UX-001, ADR-UX-005 |

---

## PILAR 2: NAVIGATION & ACCESS

### PR-06: One Entity, Multiple Entry Points

> **Satu Entity dapat ditemukan, dilihat, atau ditindaklanjuti melalui berbagai *entry point* kontekstual tanpa menciptakan duplikasi Entity, Workspace, atau destinasi navigasi.**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | `Aid Request Detail`, `Asset Detail`, dan `Person 360` bukanlah node di pohon navigasi. Mereka adalah Transaction/Detail Views yang dapat dipanggil dari dalam Workspace Section MAUPUN dari Projection Queue. Entitas fisiknya tetap satu. |
| **Implikasi UX** | Back-navigation dari Detail View harus kembali ke entry point asal, bukan ke halaman list generik. Satu View bisa memiliki banyak "pintu masuk". |
| **Sumber ADR** | ADR-UX-003, ADR-UX-004 |

---

### PR-07: Stable Navigation, Adaptive Content

> **Navigasi utama (Primary Navigation) tetap stabil secara struktural lintas peran. Role, konteks aktif, izin, dan status workflow menentukan konten, tindakan, dan proyeksi yang muncul di dalam destinasi tersebut.**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | Bottom Navigation Bar (Beranda, Organisasi, SDM, +Aksi, Akun) tidak berubah-ubah bentuk atau labelnya berdasarkan role user. Yang berubah secara radikal adalah isi dari halaman-halaman tersebut (Adaptive Content). |
| **Implikasi UX** | Jangan pernah mengubah struktur navigasi berdasarkan role. Ubah kontennya. |
| **Sumber ADR** | ADR-UX-005 |

> **⚠️ VALIDATION CONSTRAINT #4 (Sync dengan Canonical Model 05 §2.1):**
>
> **Workspace Type ≠ Workspace Instance/Content.**
>
> - **Workspace Type** adalah kelas konseptual yang stabil: `Organization Workspace` dan `Person Workspace`. Ia tidak berubah berdasarkan siapa yang login atau konteks apa yang aktif.
> - **Workspace Instance/Content** adalah konten spesifik yang di-*resolve* berdasarkan **Active Context** di Session saat ini.
>
> Contoh:
> ```text
> Workspace Type: Organization Workspace (STABIL — tidak berubah)
>       │
>       ├── Active Context = Jemaat Paulus
>       │     → Content: data Jemaat Paulus
>       │
>       └── Active Context = Pos Serangkang
>             → Content: data Pos Serangkang
> ```
>
> **Tempat navigasinya tetap sama. Kontennya yang berbeda.** Ini adalah implementasi langsung dari PR-07 dan harus dipertahankan di Gate 3.

---

## PILAR 3: INTERACTION & EXPERIENCE

### PR-03: Unification ≠ Identical UX

> **Penyatuan konseptual (*conceptual unification*) tidak berarti penyatuan pengalaman pengguna (*identical UX experience*).**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | Person adalah satu Entity Family (Pendeta, Pelayan, Relawan). Namun, Person Workspace untuk Pendeta akan memiliki section yang kaya (Mutasi, Jabatan, Keluarga), sedangkan untuk Relawan hanya berisi (Penugasan, Bidang Pelayanan). UI melakukan progressive disclosure berdasarkan Person Type. |
| **Implikasi UX** | Jangan memaksakan UI identik untuk semua Person types. Gunakan progressive disclosure. |
| **Sumber ADR** | ADR-UX-004 |

---

### PR-08: Home is a Work Entry Point, Not a Dashboard

> **Permukaan Home memprioritaskan konteks, perhatian (*attention*), tindakan, dan wawasan yang relevan, bukan berfungsi utama sebagai kumpulan metrik atau grafik statistik.**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | Halaman Beranda disusun dengan urutan logis: **Where am I?** (Context) → **What needs attention?** (Tasks) → **What can I do?** (Actions) → **What should I know?** (Insights). Home bukan sekadar wall of charts. |
| **Implikasi UX** | Home terdiri dari 3 lapisan: (1) Context Header, (2) Primary Work / Needs Attention, (3) Contextual Insights. Urutan ini tidak boleh dibalik. |
| **Sumber ADR** | ADR-UX-005 |

---

## PILAR 4: CONTEXT & AUTHORITY

### PR-09: Context is Explicit and Session-Bound

> **Konteks yang digunakan untuk interaksi harus eksplisit, valid, dan terikat pada sesi saat ini. Sistem tidak boleh mengasumsikan satu identitas memiliki satu konteks kerja permanen. Context menentukan *data scope* sekaligus *action constraint*.**

| Aspek | Penjelasan |
|---|---|
| **Definisi Operasional** | Active Context disimpan dalam Session State (bukan di-hardcode dari profil user). Context Switcher di header adalah mekanisme perubahan execution scope. Saat context berganti, form akan terkunci (Poka-Yoke), data di-rehydrate, dan izin dievaluasi ulang. |
| **Implikasi UX** | Context Chip harus selalu terlihat di header. Setiap form input harus mengunci field Organisasi/Pos ke Active Context. |
| **Sumber ADR** | ADR-UX-007 |

> **⚠️ VALIDATION CONSTRAINT #3 (Sync dengan Canonical Model 05 §2.12, §2.13):**
>
> **Active Context di sisi client adalah *state preference*; otoritas keamanan dan validitas konteks tetap dieksekusi dan divalidasi di sisi server.**
>
> Mental model yang harus dipertahankan:
>
> ```text
> CLIENT (UI State)
> Active Context dipilih user via Context Switcher
>       │
>       │ request (membawa context identifier)
>       ▼
> SERVER / AUTHORIZATION ENGINE
>       │
>       ├── Validate Identity (siapa?)
>       ├── Validate Role (kapasitas apa?)
>       ├── Validate Assignment (apakah context ini valid untuk user ini?)
>       ├── Validate Context (apakah context ini ada dan aktif?)
>       └── Evaluate Permission (apakah aksi ini diizinkan di context ini?)
>               │
>               ▼
>           ALLOW / DENY
> ```
>
> **Aturan keras:**
> - Nilai `Active Context` yang dikirim dari client **tidak boleh** diterima begitu saja sebagai sumber otoritas.
> - Server **wajib** memvalidasi bahwa user memang memiliki Assignment yang valid ke Context tersebut sebelum mengeksekusi aksi apapun.
> - Session State di client adalah **preferensi kerja**; Security Authority di server adalah **keputusan final**.
>
> Ini adalah hard constraint untuk Gate 3 (Context & Authorization) dan Phase 11 (Implementation).

---

## 2. Cara Menggunakan Dokumen Ini (Checklist Tim)

| Peran | Checklist |
|---|---|
| 🎨 **Desainer UI/UX** | Sebelum mendesain screen baru, tanyakan: *"Apakah ini Place, Object, atau Projection?"* (PR-02, PR-05). *"Apakah navigasinya stabil?"* (PR-07). *"Apakah Home mengikuti urutan Context → Attention → Action → Insight?"* (PR-08). |
| 💻 **Frontend Engineer** | Sebelum membuat route Next.js baru, pastikan ia tidak menduplikasi entry point (PR-06) dan menghormati Session Context (PR-09). Jangan ubah struktur navigasi berdasarkan role (PR-07). |
| 🗄️ **Backend/Database Engineer** | Sebelum menulis query atau RLS, pastikan batasan data scope selalu merujuk pada Active Context yang **divalidasi server-side**, bukan sekadar nilai dari client (PR-09, Validation Constraint #3). |
| 📋 **Product Manager** | Sebelum mengusulkan fitur baru, periksa: *"Apakah ini memerlukan Workspace baru?"* (PR-01, PR-02). Jika ya, ajukan ADR baru. |

---

## 3. Change Log

| Versi | Tanggal | Perubahan |
|---|---|---|
| v1.0-draft.1 | 2026-07-14 | Draft awal PR-01 s.d. PR-09. |
| v1.0-draft.2 | 2026-07-14 | Penambahan PR-07 (Stable Navigation) dan PR-08 (Home as Work Entry Point). |
| v1.0-draft.3 | 2026-07-14 | Penambahan PR-09 (Context is Session-Bound). |
| **v1.0** | **2026-07-14** | **Sinkronisasi dengan Canonical Model 05:** (1) Integrasi Validation Constraint #4 ke PR-07 (Workspace Type ≠ Instance); (2) Integrasi Validation Constraint #3 ke PR-09 (Client State ≠ Server Authority); (3) Penambahan aturan pembagian fungsi dokumen 03/04/05; (4) Penambahan checklist per peran. |

---

# STEP 2: `03-UX-Architecture-Decision-Log-v1.0.md` (Revisi Sinkronisasi)

Berikut adalah dokumen lengkap yang telah disinkronkan. Perubahan utama: (a) klarifikasi terminologi di ADR-04, (b) penegasan Capability ≠ Permission di ADR-01/02, (c) pendaftaran 5 Validation Constraints, (d) penambahan aturan pembagian fungsi dokumen.

---

# 03 — UX Architecture Decision Log v1.0

| Field | Value |
|---|---|
| **Dokumen** | `03-UX-Architecture-Decision-Log-v1.0.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2 Freeze Package) |
| **Status Dokumen** | `ACCEPTED` — ADR-UX-001 s.d. ADR-UX-007 |
| **Tanggal** | 2026-07-14 |
| **Peserta** | Principal Architect (Product Owner) · Senior Information Architect (AI) |
| **Ontological Contract** | `05-UX-Canonical-Model-v1.0.md` (FROZEN) |
| **Peran Dokumen** | **WHY the decision exists** (Complementary: 05 = WHAT, 03 = WHY, 04 = HOW) |

---

## 0. Tujuan & Aturan Dokumen

### 0.1 Fungsi Dokumen

Dokumen ini adalah **catatan resmi seluruh keputusan arsitektural** yang memengaruhi Information Architecture SI GPIB v2.2. Setiap keputusan dicatat dengan format lengkap agar memiliki decision traceability.

### 0.2 Pembagian Fungsi Tiga Dokumen

| Dokumen | Menjawab | Fungsi |
|---|---|---|
| `05-Canonical-Model` | **WHAT** — Apa hakikat setiap konsep? | Ontological contract: definisi, batas, dan klasifikasi. |
| `03-Decision-Log` (dokumen ini) | **WHY** — Mengapa keputusan ini diambil? | Decision traceability: context, options, rationale, consequences. |
| `04-Principles` | **HOW** — Bagaimana arsitektur harus berperilaku? | Behavioral rules: prinsip operasional yang mengikat seluruh implementasi. |

### 0.3 Aturan Perubahan

| Aturan | Pernyataan |
|---|---|
| **R-1** | ADR yang sudah `ACCEPTED` tidak boleh diubah tanpa ADR baru yang secara eksplisit men-supersede-nya. |
| **R-2** | Klarifikasi terminologi (seperti yang ditambahkan pada revisi ini) tidak mengubah substansi keputusan. |
| **R-3** | Dokumen ini tidak boleh memasukkan detail implementasi Gate 3 (struktur tabel RBAC/RLS, query database, dsb.). |
| **R-4** | Dokumen ini tidak boleh mengubah definisi konseptual yang telah dikunci di `05-UX-Canonical-Model-v1.0.md`. |

---

## 1. Architectural Principles (Ringkasan)

> **Catatan:** Prinsip lengkap dengan penjelasan operasional ada di `04-UX-Architecture-Principles-v1.0.md`. Bagian ini hanya mencatat bahwa ADR-01 s.d. ADR-07 menghasilkan 9 prinsip (PR-01 s.d. PR-09).

| # | Prinsip | Sumber ADR |
|---|---|---|
| PR-01 | Importance ≠ Navigation Level | ADR-01, 02 |
| PR-02 | Transaction ≠ Workspace | ADR-03 |
| PR-03 | Unification ≠ Identical UX | ADR-04 |
| PR-04 | Person ≠ User Account | ADR-04 |
| PR-05 | Projection is a View, not a Place | ADR-01, 05 |
| PR-06 | One Entity, Multiple Entry Points | ADR-03, 04 |
| PR-07 | Stable Navigation, Adaptive Content | ADR-05 |
| PR-08 | Home is a Work Entry Point, Not a Dashboard | ADR-05 |
| PR-09 | Context is Explicit and Session-Bound | ADR-07 |

---

## 2. Architecture Decision Records

> **Catatan Sinkronisasi:** Semua ADR di bawah ini berstatus `ACCEPTED`. Klarifikasi terminologi yang ditambahkan pada revisi ini **tidak mengubah substansi keputusan**, hanya memperjelas batas konseptual sesuai `05-UX-Canonical-Model-v1.0.md`.

---

### ADR-UX-001 — Status Domain Pastoral & Territory

| Field | Value |
|---|---|
| **ID** | ADR-UX-001 |
| **Status** | ✅ `ACCEPTED` |
| **Decision** | Pastoral = Organizational Capability (Section); Territory = Organizational Capability + Spatial Projection. Keduanya bukan Domain penuh dan bukan Standalone Workspace. |

#### Klarifikasi Terminologi (Sinkronisasi v1.0)

> **Organization Capability ≠ Authorization Permission.**
>
> Dalam konteks ADR ini dan ADR-UX-002, istilah **"Capability"** merujuk pada **Organization Capability** — yaitu kemampuan operasional yang dimiliki oleh suatu organisasi (misal: kemampuan mengelola Aset, kemampuan mencatat Pastoral). Ini adalah konsep **bisnis/organisasi**.
>
> Ini **berbeda secara fundamental** dari **"Permission"** dalam konteks RBAC/Authorization — yaitu hak spesifik seorang actor untuk melakukan operasi tertentu (misal: `asset.create`, `asset.approve`). Ini adalah konsep **keamanan/otorisasi**.
>
> | Istilah | Domain | Contoh |
> |---|---|---|
> | Organization Capability | Bisnis/Organisasi | "Pos ini memiliki kemampuan mengelola Aset" |
> | Permission / Authorization | Keamanan/RBAC | "User ini diizinkan membuat Aset baru" |
>
> Gate 3 **wajib** mempertahankan perbedaan ini saat menyusun RBAC matrix.

---

### ADR-UX-002 — Position of Asset

| Field | Value |
|---|---|
| **ID** | ADR-UX-002 |
| **Status** | ✅ `ACCEPTED` |
| **Decision** | Asset = Organization Capability (Section di Organization Workspace) + Cross-Context Projection (Asset Intelligence). Asset bukan Standalone Workspace dan bukan Domain mandiri. |

#### Klarifikasi Terminologi (Sinkronisasi v1.0)

> Sama seperti ADR-UX-001: **"Asset" sebagai Organization Capability** adalah konsep bisnis (kemampuan organisasi mengelola aset). Ini berbeda dari **"asset.create" / "asset.update" sebagai Permission** dalam RBAC. Lihat klarifikasi lengkap di ADR-UX-001.

---

### ADR-UX-003 — Aid Request: Workspace atau Transaction

| Field | Value |
|---|---|
| **ID** | ADR-UX-003 |
| **Status** | ✅ `ACCEPTED` |
| **Decision** | Aid Request = Workflow Transaction + Cross-Context Projection (Review Queue). Aid Request bukan Workspace. Aid Request Detail adalah Transaction View, bukan node navigasi. |

*(Tidak ada klarifikasi tambahan diperlukan. Keputusan sudah konsisten dengan Canonical Model.)*

---

### ADR-UX-004 — Person Unification

| Field | Value |
|---|---|
| **ID** | ADR-UX-004 |
| **Status** | ✅ `ACCEPTED` |
| **Decision** | Person adalah canonical UX Entity Family yang menyatukan Pendeta, Pelayan/Presbiter, dan Relawan pada level identitas dan discovery. Pengalaman detail bersifat role-specific melalui progressive disclosure. User Account bukan subtype Person, melainkan System Identity yang terhubung 0..1 dengan Person. |

#### Klarifikasi Terminologi (Sinkronisasi v1.0)

> **Pembedaan empat konsep yang wajib dipertahankan di Gate 3:**
>
> | Konsep | Definisi | Contoh | Domain |
> |---|---|---|---|
> | **Person Type / Ministry Identity** | "Siapa orang ini secara pelayanan?" — Kategori identitas pelayanan yang melekat pada Person. | Pendeta, Penatua, Diaken, Relawan | Business Identity |
> | **Organizational Role** | "Dalam kapasitas apa ia bekerja di organisasi?" — Jabatan fungsional yang memberikan wewenang operasional. | KMJ, PJ Pos, Admin Mupel | Organizational Authority |
> | **System Role** | "Apa hak aksesnya di aplikasi?" — Role teknis di sistem RBAC. | super_user, admin_mupel, kmj, pj, pendeta, pelayan, relawan, user | System Authorization |
> | **Assignment** | "Di mana dan kapan ia bertugas?" — Relasi antara Person dan Context/Organization dalam periode tertentu. | Pdt. Anita → Pos Serangkang (2022–2025) | Scope Relationship |
>
> **Contoh komposit:**
> ```text
> Person: Pdt. Anita
>   ├── Person Type / Ministry Identity: Pendeta
>   ├── Organizational Role: KMJ Jemaat Paulus
>   ├── Assignment: Homebase Jemaat Paulus (2020–sekarang)
>   ├── Assignment: Pos Serangkang (2022–2025)
>   └── User Account: pdta.anita@gpib.or.id
>         └── System Role: kmj
> ```
>
> **Aturan keras untuk Gate 3:**
> - Person Type (Pendeta/Pelayan/Relawan) **tidak boleh** dicampur dengan System Role (kmj/pj/super_user).
> - Organizational Role (KMJ/PJ) adalah **kapasitas bisnis**; System Role adalah **hak akses teknis**.
> - Assignment adalah **relasi**, bukan atribut statis.

---

### ADR-UX-005 — Projection & Navigation

| Field | Value |
|---|---|
| **ID** | ADR-UX-005 |
| **Status** | ✅ `ACCEPTED` |
| **Decision** | SI GPIB menggunakan Stable Primary Mobile Navigation with Contextual Adaptive Content. Primary navigation terdiri dari: Home, Organisasi, SDM, Quick Actions (+), Akun & Sistem. Projections tidak memiliki slot di Primary Navigation. Adaptive behavior ditangguhkan ke ADR-07. |

*(Tidak ada klarifikasi tambahan diperlukan.)*

---

### ADR-UX-006 — Sinode: Global Context Scope

| Field | Value |
|---|---|
| **ID** | ADR-UX-006 |
| **Status** | ✅ `ACCEPTED` |
| **Dependency** | Membutuhkan ADR-UX-007 (Session Context) untuk dapat diwujudkan. |
| **Decision** | Sinode GPIB adalah Global Context Scope, bukan Standalone Workspace. Super User mengakses data dan analitik tingkat nasional dengan cara mengaktifkan Global Context melalui Context Switcher. |

*(Tidak ada klarifikasi tambahan diperlukan.)*

---

### ADR-UX-007 — Persistent Context Switcher & Session State

| Field | Value |
|---|---|
| **ID** | ADR-UX-007 |
| **Status** | ✅ `ACCEPTED` |
| **Decision** | Active Context adalah Session State, bukan User Identity Property. Context Switcher adalah mekanisme perubahan execution scope. Sistem memisahkan secara tegas: Identity (Who), Role/Permission (What), Valid Contexts (Where allowed), dan Active Context (Where working now). |

*(Tidak ada klarifikasi tambahan diperlukan. Validasi server-side authority sudah dicatat di PR-09 dan Validation Constraint #3.)*

---

## 3. Status Register — Gate 2

| ADR | Topik | Status | Ringkasan Keputusan |
|---|---|---|---|
| **ADR-UX-001** | Status Pastoral & Territory | ✅ `ACCEPTED` | Pastoral = capability; Territory = capability + spatial projection. Bukan Domain/Workspace. |
| **ADR-UX-002** | Position of Asset | ✅ `ACCEPTED` | Asset = Organization capability + cross-context projection. Bukan Workspace. |
| **ADR-UX-003** | Aid Request Classification | ✅ `ACCEPTED` | Aid Request = Workflow Transaction + Queue Projection. Bukan Workspace. |
| **ADR-UX-004** | Person Unification | ✅ `ACCEPTED` | Unified Person Entity Family + role-specific progressive disclosure. User Account terpisah (0..1). |
| **ADR-UX-005** | Projection & Navigation | ✅ `ACCEPTED` | Stable Navigation + Adaptive Content. Projections di Access Hierarchy. |
| **ADR-UX-006** | Sinode / Global Workspace | ✅ `ACCEPTED` | Sinode = Global Context Scope, bukan Workspace. |
| **ADR-UX-007** | Identity × Role × Assignment × Context | ✅ `ACCEPTED` | Persistent Context Switcher + Session Active Context. |

---

## 4. Gate 2 / Gate 3 Validation Constraints

> **Catatan:** Kelima tension di bawah ini **bukan** cacat pada dokumen 05. Mereka adalah **batasan ontologis** yang harus divalidasi dan dipertahankan selama Gate 2 Consistency Check dan Gate 3.

| # | Tension | Deskripsi Singkat | Gate |
|---|---|---|---|
| **VC-01** | Role vs Person Type vs System Role | Person Type (Pendeta/Pelayan/Relawan) ≠ Organizational Role (KMJ/PJ) ≠ System Role (super_user/kmj). Gate 3 wajib membedakan ketiganya secara tajam. | Gate 3 |
| **VC-02** | Organization Capability ≠ Authorization Permission | "Asset" sebagai capability organisasi ≠ "asset.create" sebagai permission RBAC. Gate 3 wajib mempertahankan perbedaan ini. | Gate 3 |
| **VC-03** | Session State ≠ Security Authority | Active Context di client adalah state preference; validitas dan kewenangan ditentukan server-side. Gate 3 wajib menjadikan ini hard constraint. | Gate 3 |
| **VC-04** | Workspace Type ≠ Workspace Instance | Workspace Type (Organization/Person) stabil di navigasi; Workspace Content di-resolve berdasarkan Active Context. | Gate 2 Check + Gate 3 |
| **VC-05** | Person Directory → Person Workspace Navigation | Person Directory adalah entry point di Primary Navigation (slot "SDM"); Person Workspace diakses dari dalam Directory. Bukan dua destinasi primary terpisah. | Gate 2 Check |

---

## 5. Change Log

| Versi | Tanggal | Perubahan |
|---|---|---|
| v1.0-draft.1 | 2026-07-14 | Draft awal ADR-01 s.d. ADR-04. |
| v1.0-draft.2 | 2026-07-14 | Penambahan ADR-05, ADR-06, ADR-07. Semua berstatus ACCEPTED. |
| **v1.0** | **2026-07-14** | **Sinkronisasi dengan Canonical Model 05:** (1) Klarifikasi terminologi di ADR-04: Person Type vs Organizational Role vs System Role vs Assignment; (2) Penegasan di ADR-01/02: Organization Capability ≠ Authorization Permission; (3) Pendaftaran 5 Validation Constraints (VC-01 s.d. VC-05); (4) Penambahan aturan pembagian fungsi dokumen 03/04/05; (5) Penambahan aturan perubahan (R-1 s.d. R-4). |

---

## 6. Ringkasan Eksekutif untuk Approval

| Dokumen | Status | Perubahan Utama |
|---|---|---|
| **`04-UX-Architecture-Principles-v1.0.md`** | ✅ Siap untuk approval | Integrasi VC-04 ke PR-07; Integrasi VC-03 ke PR-09; Penambahan aturan pembagian fungsi 03/04/05; Penambahan checklist per peran. |
| **`03-UX-Architecture-Decision-Log-v1.0.md`** | ✅ Siap untuk approval | Klarifikasi terminologi di ADR-04; Penegasan Capability ≠ Permission di ADR-01/02; Pendaftaran 5 Validation Constraints; Penambahan aturan pembagian fungsi 03/04/05. |

**Tidak ada konsep baru yang ditambahkan. Tidak ada keputusan yang diubah. Tidak ada detail implementasi Gate 3 yang dimasukkan.**

---

Kedua dokumen di atas siap untuk review dan approval Anda, Principal Architect. Setelah Anda approve, kita akan melanjutkan ke **`02-UX-Entity-Classification-v1.1.md`** — di mana kita akan memetakan ulang 35 tabel database ke dalam kelas-kelas Canonical Model tanpa kebocoran *database structure → UX ontology*.