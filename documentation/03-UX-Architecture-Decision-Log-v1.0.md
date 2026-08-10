# 03 — UX Architecture Decision Log v1.0

| Field | Value |
|---|---|
| **Dokumen** | `03-UX-Architecture-Decision-Log-v1.0.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2) |
| **Status Dokumen** | `IN PROGRESS` — ADR-01 s.d. ADR-04 `ACCEPTED`; ADR-05 s.d. ADR-07 `OPEN` |
| **Tanggal** | 2026-07-14 |
| **Peserta** | Principal Architect (Product Owner) · Senior Information Architect (AI) |
| **Sumber Rujukan** | `UX_INFORMATION_ARCHITECTURE_v1.md` · `UX_ENTITY_CLASSIFICATION_v1.md` · `entity_inventory.md` · `current_state_inventory.md` · `EIA_v0.1.1.md` |
| **Aturan Main** | Tidak ada wireframe, route design, component architecture, page hierarchy, database refactoring, atau RBAC implementation sebelum Gate 2 ditutup. |

---

## 0. Tujuan Dokumen Ini

Dokumen ini adalah **catatan resmi seluruh keputusan arsitektural** yang memengaruhi Information Architecture SI GPIB v2.2. Setiap keputusan dicatat dengan format lengkap — Context, Problem, Options, Evaluation, Decision, Rationale, Consequences — agar:

1. Setiap perubahan pada IA v1 memiliki **decision traceability**.
2. Tidak ada keputusan arsitektur yang diambil **secara implisit** sambil mendesain UI.
3. Gate 2 memiliki batas tegas antara *proposal* dan *decision*.

### Konvensi Status

| Status | Arti |
|---|---|
| `OPEN` | Masalah teridentifikasi, belum ada opsi yang disepakati. |
| `PROPOSED` | Opsi sudah diusulkan, belum ada persetujuan Principal Architect. |
| `ACCEPTED` | Keputusan disepakati dan mengikat untuk seluruh dokumen turunan. |
| `SUPERSEDED` | Keputusan lama digantikan keputusan baru (belum ada saat ini). |

> **Catatan disiplin:** Status hanya naik ke `ACCEPTED` setelah seluruh konsekuensi (IA, Database, RBAC, UX) diperiksa. Pada versi ini, ADR-UX-001 s.d. ADR-UX-004 telah melalui pemeriksaan tersebut dan berstatus `ACCEPTED`.

---

## 1. Architectural Principles (Ditetapkan oleh ADR-01 s.d. ADR-04)

Keempat ADR pertama secara kolektif menetapkan enam prinsip yang mengikat seluruh keputusan berikutnya:

| # | Prinsip | Pernyataan |
|---|---|---|
| **PR-01** | *Importance ≠ Navigation Level* | Pentingnya suatu data tidak otomatis menjadikannya Workspace. Tingkat navigasi ditentukan oleh konteks kerja pengguna. |
| **PR-02** | *Transaction ≠ Workspace* | Workflow dan tiket adalah objek yang diproses di dalam workspace atau queue, bukan ruang kerja itu sendiri. |
| **PR-03** | *Unification ≠ Identical UX* | Penyatuan konseptual tidak berarti penyatuan pengalaman. Entity family boleh tunggal, experience boleh role-specific. |
| **PR-04** | *Person ≠ User Account* | Identity (siapa orangnya) terpisah dari Authentication (bagaimana ia masuk sistem). |
| **PR-05** | *Projection is a View, not a Place* | Projection adalah cara melihat/menganalisis data, bukan tempat bekerja. |
| **PR-06** | *One Entity, Multiple Entry Points* | Satu Entity dapat ditemukan, dilihat, atau ditindaklanjuti melalui berbagai entry point kontekstual tanpa menciptakan duplikasi Entity, Workspace, atau destinasi navigasi. |

### Konsekuensi Operasional PR-06

```text
Person
  Entry: Organization Workspace → SDM & Personel ─┐
  Entry: Person Directory ───────────────────────┼─→ SATU Person Workspace
  Entry: Global Search ──────────────────────────┘

Aid Request
  Entry: Organization Workspace → Aid Section ───┐
                                                 ├─→ SATU Aid Request Detail (Transaction View)
  Entry: Aid Review Queue (Projection) ──────────┘

Asset
  Entry: Organization Workspace → Assets ────────┐
                                                 ├─→ SATU Asset Detail
  Entry: Asset Intelligence (Projection) ────────┘
```

> **Kritikal untuk implementasi nanti:** `Aid Request Detail`, `Asset Detail`, dan `Person Detail` **bukan node navigasi**. Mereka adalah *views* yang dipanggil dari banyak entry point. Ini akan menjadi fondasi pola routing (satu resource, banyak pintu masuk).

---

## 2. Architecture Decision Records

---

### ADR-UX-001 — Status Domain Pastoral & Territory

| Field | Value |
|---|---|
| **ID** | ADR-UX-001 |
| **Judul** | Status Domain Pastoral & Territory |
| **Status** | ✅ `ACCEPTED` |
| **Temuan Audit Terkait** | Temuan #1 (6 Domain vs 5 Canonical), #3 (Territory: Domain/Section/Projection?), #8 (Peta & Laporan sebagai Primary Nav) |
| **Bagian IA v1 yang Direvisi** | §3 Domain Architecture, §7 Section Architecture, §10 Canonical IA, §11 Global Navigation |

#### Context

IA v1 mendefinisikan **6 Domain** (Organizational, People, Pastoral, Assets, Aid, Territory) pada §3, tetapi Canonical IA pada §10 hanya menampilkan 5 domain top-level. Pastoral dan Territory tidak memiliki representasi Workspace yang jelas — terlalu signifikan untuk diabaikan, tetapi tidak memiliki batas arsitektur yang konsisten.

#### Problem

Apakah Pastoral dan Territory memerlukan boundary arsitektur sebagai **Domain penuh dengan Workspace sendiri**, atau cukup menjadi **Capability / Section / Projection** di dalam workspace lain?

Definisi operasional yang digunakan:

```text
DOMAIN     = area bisnis dengan vocabulary, purpose, lifecycle, actors, dan capabilities sendiri
SECTION    = kelompok informasi di dalam suatu Workspace
PROJECTION = cara melihat / menganalisis data yang berasal dari beberapa domain/entity
CAPABILITY = kemampuan operasional yang dimiliki suatu organisasi/workspace
```

#### Options & Evaluation

| Option | Deskripsi | Kelebihan | Kelemahan | Verdict |
|---|---|---|---|---|
| **A** | Pastoral & Territory = Domain penuh dengan Workspace sendiri | Vocabulary bisnis eksplisit; mudah berkembang menjadi modul besar | Menciptakan Domain tanpa representasi Workspace yang jelas; user lapangan tidak berpikir "saya bekerja di Territory Domain" | ❌ |
| **B** | Keduanya diturunkan menjadi Section di Organization Workspace | Konsisten dengan prinsip "workspace = lingkungan kerja user" | Tidak cukup untuk kebutuhan cross-context spatial view (peta lintas Pos) | ⚠️ |
| **C** | Pastoral = Organizational Capability (Section); Territory = Capability + Spatial Projection | Menyelesaikan kebutuhan operasional lokal DAN analitik lintas konteks | Menambahkan konsep "Projection" yang harus diatur konsisten | ✅ |

#### Decision

```text
Pastoral  = Organizational Capability
            → hadir sebagai SECTION di dalam Organization Workspace

Territory = Organizational Capability + Spatial Projection
            → hadir sebagai SECTION di dalam Organization Workspace
            → DAN sebagai cross-context PROJECTION (Peta)
```

Keduanya **bukan** Domain penuh dan **bukan** Standalone Workspace.

#### Rationale

1. User lapangan bekerja dengan mental model *"Saya mengelola Pos X"*, bukan *"Saya masuk ke Territory Domain"*. Dari Pos itulah ia melihat pastoral, aset, wilayah, dan bantuan.
2. Peta adalah **cara pandang spasial** terhadap data, bukan tempat bekerja (PR-05).
3. Domain tanpa Workspace menciptakan *orphan domain*; Workspace tanpa kebutuhan kerja menciptakan *ghost room*. Keduanya dihindari.
4. Keputusan ini **tidak menghapus** Pastoral maupun Territory — hanya menempatkan keduanya pada level arsitektur yang sesuai.

#### Consequences

| Area | Dampak |
|---|---|
| **Impact on IA** | Jumlah domain top-level berkurang; Pastoral & Territory menjadi capabilities di bawah Organizational Management Area. Canonical IA §10 direvisi. |
| **Impact on Database** | **Tidak ada perubahan.** `t_log_pastoral`, `t_jadwal_ibadah`, `t_kerawanan_wilayah`, `t_potensi_wilayah`, dan lampirannya tetap. |
| **Impact on RBAC** | Tidak ada perubahan langsung. Akses pastoral & territory mengikuti context Pos/Jemaat/Mupel yang sudah ada (`assertPosWriteAccess`). |
| **Impact on UX** | User mengakses pastoral & territory dari dalam Organization Workspace. Cross-context viewing melalui Territory Map projection. `/dashboard/peta` dan `/laporan` tidak lagi diperlakukan sebagai destinasi utama (finalisasi di ADR-UX-005). |

#### Dependencies

- Menjadi preseden untuk ADR-UX-002 (Assets) dan ADR-UX-005 (Projection & Navigation).

---

### ADR-UX-002 — Position of Asset

| Field | Value |
|---|---|
| **ID** | ADR-UX-002 |
| **Judul** | Posisi Asset: Workspace, Section, atau Projection |
| **Status** | ✅ `ACCEPTED` |
| **Temuan Audit Terkait** | Temuan #2 (Asset: Domain vs Workspace vs Section), IA v1 §15 Open Decision #3 |
| **Bagian IA v1 yang Direvisi** | §3 Domain Architecture, §6 Workspace Architecture (Workspace 3 dihapus), §7, §10 |

#### Context

IA v1 memberikan **tiga identitas berbeda** pada Asset secara bersamaan: Domain (§3), Standalone Workspace #3 "Asset Group Workspace" (§6), dan Section di Organization Workspace (§7). Ini adalah tumpang tindih arsitektur yang harus diselesaikan.

#### Problem

Apakah Asset merupakan **Place of Work** (Standalone Workspace) atau **business capability** yang dimiliki Organization?

Pertanyaan pembeda:

```text
Section   menjawab: "Saya ingin mengelola aset organisasi INI."
Projection menjawab: "Saya ingin melihat/menganalisis aset LINTAS organisasi."
Workspace menjawab: "Saya ingin BEKERJA di ruang yang berpusat pada aset."
```

#### Options & Evaluation

| Option | Deskripsi | Kelebihan | Kelemahan | Verdict |
|---|---|---|---|---|
| **A** | Asset Standalone Workspace | Baik untuk audit aset skala besar & admin Mupel yang me-review aset lintas Jemaat | PJ Pos harus keluar dari Pos Workspace untuk mengelola aset pos-nya sendiri; melanggar mental model "saya mengelola aset Pos saya" | ❌ |
| **B** | Asset hanya Section di Organization Workspace | Natural untuk operasional lokal PJ Pos | Tidak memadai untuk kebutuhan "tampilkan seluruh aset GPIB per Mupel/Jemaat/Pos" | ⚠️ |
| **C** | Asset = Organization Capability (Section) + Cross-Context Projection (Asset Intelligence) | Menjawab kedua kebutuhan tanpa menciptakan workspace baru | Menambah satu projection yang harus dikelola | ✅ |

#### Decision

```text
Asset = Organization Capability + Cross-Context Projection

OPERASIONAL (Section):
  Organization Workspace → Assets Section
  (Tanah | Bangunan | Bergerak | Dokumen — dalam konteks Pos pemilik)

ANALITIK (Projection):
  Asset Intelligence
  (All Assets | By Mupel | By Jemaat | By Pos | Legal Status | Condition)
```

Asset **bukan** Standalone Workspace dan **bukan** Domain mandiri. `Asset Group Workspace` (Workspace 3 pada IA v1 §6) **dihapus**.

#### Rationale

1. Mental model PJ Pos: *"Saya sedang mengelola aset Pos saya"* — bukan *"Saya pergi ke Ruang Aset lalu memilih Pos saya"* (PR-01).
2. Kebutuhan lintas organisasi (Admin Mupel melihat aset 50 Jemaat) adalah kebutuhan **melihat/menganalisis**, bukan kebutuhan **menempati ruang kerja** (PR-05).
3. `Asset Detail` tunduk pada PR-06: satu entitas, dua entry point (dari Section Pos maupun dari Asset Intelligence).

#### Consequences

| Area | Dampak |
|---|---|
| **Impact on IA** | Standalone Workspace berkurang dari 4 → 2 (Organization Workspace + Person Workspace). Asset menjadi Section + Projection. §6 dan §10 IA v1 direvisi. |
| **Impact on Database** | **Tidak ada perubahan.** `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`, `t_lampiran_aset` tetap dengan FK `id_pos`. |
| **Impact on RBAC** | Tidak berubah. Akses aset mengikuti scope Pos. Asset Intelligence projection di-filter oleh scope Mupel/Sinode. |
| **Impact on UX** | PJ Pos mengelola aset tanpa keluar workspace. Admin Mupel/Sinode melihat agregasi aset via projection. Route `/laporan/aset` eksisting dipetakan ulang menjadi entry ke Asset Intelligence (bukan workspace baru). |

#### Dependencies

- Konsisten dengan ADR-UX-001 (Projection ≠ Place).
- Finalisasi penempatan Asset Intelligence di navigasi menunggu ADR-UX-005.

---

### ADR-UX-003 — Aid Request: Workspace atau Transaction?

| Field | Value |
|---|---|
| **ID** | ADR-UX-003 |
| **Judul** | Klasifikasi Aid Request: Workspace vs Transaction |
| **Status** | ✅ `ACCEPTED` |
| **Temuan Audit Terkait** | Temuan #7 (Aid Request Workspace vs lifecycle workflow), #3 duplikasi Aid Review Queue |
| **Bagian IA v1 yang Direvisi** | §6 Workspace Architecture (Workspace 4 dihapus), §7, §10, §14 Anti-Pattern |

#### Context

IA v1 menetapkan **"Aid Request Workflow Workspace"** sebagai Standalone Workspace #4. Namun secara ontologi bisnis, Pengajuan Bantuan (`t_pengajuan_bantuan`) adalah sebuah **transaction/ticket** dengan lifecycle `Draft → Diajukan → Disetujui_KMJ → Disetujui_Mupel → Ditolak` — identik dengan Invoice atau Support Ticket — bukan sebuah *environment*.

#### Problem

Apakah Aid Request adalah **Workspace** (tempat bekerja) atau **Transaction Object** (objek yang dikerjakan)? Dan bagaimana Approver (KMJ / Admin Mupel) me-review antrian pengajuan lintas-Pos secara efisien?

Ini adalah ujian prinsip paling fundamental: **"Workspace adalah tempat bekerja; Transaction adalah sesuatu yang dikerjakan."**

#### Options & Evaluation

| Option | Deskripsi | Kelebihan | Kelemahan | Verdict |
|---|---|---|---|---|
| **A** | Aid Request = Standalone Workspace | Baik untuk pola ticketing murni | PJ Pos dipaksa keluar dari Pos Workspace; justifikasi aset yang dilampirkan berada di workspace lain | ❌ |
| **B** | Aid Request = Section saja di Organization Workspace | Natural untuk Creator (PJ Pos) | Approver harus masuk Pos A → tab Aid → keluar → Pos B; tidak efisien untuk review lintas-Pos | ⚠️ |
| **C** | Aid Request = Workflow Transaction + Cross-Context Queue Projection | Menyelesaikan kebutuhan Creator DAN Approver tanpa workspace baru | Memerlukan discipline membedakan View vs Node navigasi | ✅ |

#### Decision

```text
Aid Request = Workflow Transaction + Cross-Context Projection (Review Queue)
```

Struktur kanonis (setelah koreksi duplikasi):

```text
ORGANIZATION WORKSPACE (Pos Context)
└── SECTION: Aid Requests
    ├── Transaction List (riwayat pengajuan Pos ini)
    └── Action: [+] Buat Pengajuan Baru
              │
              ▼
    AID REQUEST DETAIL  ← Transaction View, BUKAN node navigasi
    ├── Justifikasi & Linked Assets
    ├── Biaya & Urgensi
    └── Workflow Timeline (Draft → KMJ → Mupel)
              ▲
              │
PROJECTIONS   │
└── Aid Review Queue (Inbox untuk KMJ / Mupel)
    ├── Filter: Pending Approval (per role approver)
    └── Actions: Approve / Reject / Request Revision
```

> **Kunci:** `Aid Review Queue` didefinisikan **hanya sekali** sebagai Projection. `Aid Request Detail` adalah **Transaction View** yang dipanggil dari dua entry point (PR-06), bukan node di pohon navigasi.

#### Rationale

1. **PJ Pos (Creator):** bekerja di context Pos → Section Aid → buat pengajuan. Tidak pernah keluar workspace.
2. **KMJ / Admin Mupel (Approver):** bekerja di Queue projection → buka Transaction Detail → approve/reject. Tidak perlu mengunjungi Pos satu per satu.
3. Pola ini identik dengan enterprise ticketing: *ticket* adalah objek yang diproses; *board/queue* adalah projection; keduanya bukan workspace (PR-02).
4. Menghilangkan duplikasi konseptual `Aid Review Queue` yang pada draft awal muncul dua kali.

#### Consequences

| Area | Dampak |
|---|---|
| **Impact on IA** | "Aid Request Workflow Workspace" dihapus dari daftar Standalone Workspace. Aid menjadi Section (list) + Transaction View (detail) + Projection (queue). |
| **Impact on Database** | **Tidak ada perubahan.** `t_pengajuan_bantuan` + `t_approval_bantuan` tetap. |
| **Impact on RBAC** | Queue projection di-filter oleh role & scope: KMJ melihat pending di Jemaatnya; Admin Mupel melihat pending di Mupel-nya. Aksi `approvePengajuanBantuanAction` / `rejectPengajuanBantuanAction` tetap menjadi dasar capability. |
| **Impact on UX** | Approver mendapat Inbox terpusat dengan notifikasi/badge. Creator tetap bekerja dalam konteks Pos. Komponen eksisting `BantuanTimeline.tsx` & `WorkflowTimeline.tsx` menjadi isi Transaction View tanpa perubahan fungsi. |

#### Dependencies

- Konsisten dengan ADR-UX-001 & ADR-UX-002 (Projection ≠ Place).
- Menjadi pola rujukan untuk transaksi/workflow lain di masa depan.

---

### ADR-UX-004 — Person Unification

| Field | Value |
|---|---|
| **ID** | ADR-UX-004 |
| **Judul** | Penyatuan Person Entity Family & Pemisahan User Account |
| **Status** | ✅ `ACCEPTED` |
| **Temuan Audit Terkait** | Temuan #4 (fragmentasi Pendeta vs Pelayan/Relawan), #9 (multi-role context), #10 (cross-context ownership) |
| **Bagian IA v1 yang Direvisi** | §4B Person Entity Family, §6 Workspace Architecture (Workspace 2), §10, §15 Open Decision #1 |
| **Sumber Konflik** | IA v1 §15 Open Decision #1 · `UX_ENTITY_CLASSIFICATION_v1.md` §7 People Model · `entity_inventory.md` §3 (3 tabel SDM terpisah) |

#### Context

IA v1 mendefinisikan `Person` sebagai Entity Family tunggal (Pendeta, Pelayan, Relawan, User Account), tetapi implementasinya terfragmentasi: Pendeta → Person Workspace 360; Pelayan/Relawan → Section SDM; User → System. Di database, fragmentasi ini nyata: `m_pendeta`, `t_pelayan`, `t_relawan`, dan `users` adalah empat tabel terpisah tanpa abstraksi `Person`.

#### Problem

1. Apakah `Person` benar-benar Entity Family, atau hanya abstraksi kosong?
2. Bagaimana menyatukan discovery tanpa memaksakan UI yang identik untuk lifecycle yang berbeda?
3. Di mana posisi `User Account` — subtype Person atau entitas terpisah?

#### Options & Evaluation

| Option | Deskripsi | Kelebihan | Kelemahan | Verdict |
|---|---|---|---|---|
| **A** | Semua Person → satu Workspace identik | Mental model konsisten; satu pencarian | Memaksakan keseragaman pada lifecycle yang berbeda (Pendeta: mutasi/jabatan/keluarga vs Pelayan: periode pelayanan vs Relawan: bidang pelayanan) → *"unified entity, fragmented UI"* | ❌ |
| **B** | Semua Person terpisah (3 directory + 3 workspace) | Lifecycle sangat jelas per tipe | Menghidupkan kembali anti-pattern "1 tabel → 1 halaman → 1 nav"; user harus tahu dulu tipe orang sebelum mencari | ❌ |
| **C** | Unified Person Directory + Role-Specific Person Experience | Discovery tunggal, experience sesuai lifecycle, future-proof | Memerlukan pemodelan Person/Role/Assignment/Account yang disiplin | ✅ |

#### Decision

**ACCEPT — Option C.**

> Person adalah canonical UX Entity Family yang menyatukan Pendeta, Pelayan/Presbiter, dan Relawan pada level **identitas dan discovery**. Pengalaman detail, lifecycle, dan section bersifat **role-specific melalui progressive disclosure**. User Account **bukan subtype Person**, melainkan System Identity yang terhubung **0..1** dengan Person.

Canonical model empat lapisan:

```text
PERSON (Identity: siapa orangnya)
├── Identity     : Nama, Kontak, Foto, Identitas dasar
├── Roles        : Pendeta / Pelayan-Presbiter / Relawan
├── Assignments  : Organization, Pos, Jabatan, Periode
└── Activities   : Pastoral, Pelayanan, Kompetensi, Dokumen

USER ACCOUNT (Authentication: bagaimana masuk sistem)
├── Authentication
├── RBAC Role
├── Permissions
└── Active Context

PERSON ──── 0..1 ──── USER ACCOUNT
(Person tanpa Account adalah VALID, mis. Relawan tercatat tanpa login)
```

Empat konsep yang **wajib dibedakan** (fondasi ADR-UX-007):

```text
PERSON TYPE          → "Siapa orang ini?"        → Pendeta / Pelayan / Relawan
ORGANIZATIONAL ROLE  → "Dalam kapasitas apa?"    → KMJ / PJ Pos / Admin Mupel
ASSIGNMENT           → "Di mana dan kapan?"      → Jemaat A, Pos B, periode X
SYSTEM ROLE          → "Apa yang boleh di app?"  → RBAC capabilities
```

Progressive disclosure Person Workspace:

```text
Person = Pendeta:
  Profil | Penugasan | Jabatan | Mutasi | Keluarga | Kompetensi | Dokumen | Log Pastoral

Person = Pelayan/Presbiter:
  Profil | Penugasan | Peran Pelayanan | Periode | Kompetensi | Aktivitas

Person = Relawan:
  Profil | Penugasan | Bidang Pelayanan | Kompetensi | Aktivitas
```

#### Rationale

1. **PR-03:** Directory disatukan, experience tidak dipaksakan identik.
2. **PR-04:** `Person` menjawab *"siapa orangnya"*; `User Account` menjawab *"bagaimana ia masuk sistem"*. Menyamakan keduanya memaksa asumsi bahwa setiap Person harus punya login.
3. Pendeta memiliki lifecycle terkaya (7 sub-tabel profil 360 — bukti empiris `entity_inventory.md` §4). Memaksakan struktur ini ke Pelayan/Relawan menciptakan conditional UI yang buruk; memisahkan ketiganya menciptakan fragmentasi navigasi.
4. Satu Person dapat memiliki banyak Role + Assignment (contoh: Pdt. Anita = Pendeta homebase Jemaat A + KMJ Jemaat A + PJ Pos B). Ini fondasi untuk ADR-UX-007.

#### Consequences

| Area | Dampak |
|---|---|
| **Impact on IA** | Person Directory = unified entry point. Istilah "Person Workspace (Pendeta 360)" → "Person Workspace" dengan "Person 360" sebagai experience model untuk Pendeta. Primary destination = "SDM & Person"; filter Pendeta/Pelayan/Relawan adalah projection/filter, bukan workspace baru. |
| **Impact on Database** | **TIDAK ADA REFACTORING DI GATE 2.** `m_pendeta`, `t_pelayan`, `t_relawan`, `users` tetap. Unifikasi fisik (jika diperlukan) adalah keputusan Data Architecture di fase terpisah, bukan bagian dari keputusan UX ini. |
| **Impact on RBAC** | Fondasi multi-role: satu Person dapat memegang beberapa Organizational Role + Assignment. Model `Person × Role × Assignment × Context` diformalkan di ADR-UX-007. |
| **Impact on UX** | Organization Workspace → Section SDM menampilkan personnel by context (Pendeta/Penatua/Diaken/Relawan di Pos tersebut). Klik person → masuk ke Person Workspace (satu canonical identity, PR-06), bukan ke "halaman pendeta milik pos". Route ganda eksisting `/sdm/pendeta` vs `/pendeta` diselesaikan menjadi satu Directory. |

#### Dependencies

- **Membuka dependency langsung ke ADR-UX-007** (Identity × Role × Assignment × Context).
- Berkaitan dengan ADR-UX-006 (Sinode Workspace) untuk Person Directory scope global.

---

## 3. Status Register — Gate 2

| ADR | Topik | Status | Ringkasan Keputusan |
|---|---|---|---|
| **ADR-UX-001** | Status Pastoral & Territory | ✅ `ACCEPTED` | Pastoral = capability; Territory = capability + spatial projection. Bukan Domain/Workspace. |
| **ADR-UX-002** | Position of Asset | ✅ `ACCEPTED` | Asset = Organization capability (Section) + cross-context projection (Asset Intelligence). Bukan Workspace. |
| **ADR-UX-003** | Aid Request Classification | ✅ `ACCEPTED` | Aid Request = Workflow Transaction (Detail View) + Queue Projection. Bukan Workspace. |
| **ADR-UX-004** | Person Unification | ✅ `ACCEPTED` | Unified Person Entity Family + role-specific progressive disclosure. User Account terpisah (0..1). |
| **ADR-UX-005** | Projection & Navigation | 🔲 `OPEN` | Apa yang menjadi Global Navigation vs Workspace Navigation vs Projection/Utility. |
| **ADR-UX-006** | Sinode / Global Workspace | 🔲 `OPEN` | Ruang kerja Super User (Global Scope) yang belum terdefinisi di IA v1. |
| **ADR-UX-007** | Identity × Role × Assignment × Context | 🔲 `OPEN` | Model multi-role & context switching. Dependency langsung ADR-UX-004. Fondasi Phase 3 (Context & RBAC). |

---

## 4. Canonical IA Areas (Revisi Pasca ADR-01 s.d. 04)

> **Peringatan terminologi:** Struktur di bawah sengaja menggunakan istilah **"Canonical IA Areas"**, bukan "Core Domains". Boundary domain final belum diputuskan — khususnya apakah *People & Ministry* dan *Aid/Workflow* layak disebut Domain top-level — dan akan diuji kembali setelah ADR-UX-005 s.d. 007 selesai.

```text
CANONICAL IA AREAS — SI GPIB v2.2 (sementara, menunggu domain boundary final)
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
│   ├── Aid Review Queue        (workflow inbox — ADR-03, didefinisikan SEKALI di sini)
│   └── Reports & Analytics     (consolidated projection)
│
└── SYSTEM & GOVERNANCE
    ├── User Account & Security (authentication, biometric passkeys)
    ├── Admin & Role Management (RBAC configuration)
    └── Audit Trail & Sync Manager (logs, offline queue)

VIEWS (bukan node navigasi — PR-06):
  • Aid Request Detail   ← dipanggil dari Aid Section (Org) ATAU Aid Review Queue
  • Asset Detail         ← dipanggil dari Assets Section (Org) ATAU Asset Intelligence
  • Person Detail/360    ← dipanggil dari SDM Section (Org) ATAU Person Directory ATAU Search
```

---

## 5. Dampak Kumulatif terhadap IA v1

Pemetaan bagian `UX_INFORMATION_ARCHITECTURE_v1.md` yang harus direvisi saat penyusunan `01-UX-Information-Architecture-v1.1.md`:

| Bagian IA v1 | Perubahan | ADR Sumber |
|---|---|---|
| §3 Domain Architecture (6 domain) | Domain top-level dikurangi; Pastoral, Assets, Territory menjadi capabilities; Aid menjadi transaction family | ADR-01, 02, 03 |
| §6 Workspace Architecture (4 standalone) | Berubah menjadi **2 standalone** (Organization + Person). Asset Group Workspace & Aid Workflow Workspace dihapus | ADR-02, 03 |
| §4B Person Entity Family | User Account dikeluarkan dari subtype Person; relasi 0..1; model 4-lapisan (Person Type / Org Role / Assignment / System Role) | ADR-04 |
| §7 Section Architecture | Section SDM menjadi entry PR-06 ke Person Workspace; Assets & Aid menjadi capability sections | ADR-02, 03, 04 |
| §10 Canonical IA | Digantikan struktur Canonical IA Areas pada §4 dokumen ini | Semua |
| §11 Global Navigation | Peta & Laporan tidak lagi diasumsikan Primary Navigation — **finalisasi menunggu ADR-UX-005** | ADR-01 (partial) |
| §15 Open Decisions | #1 (Person) → ditutup ADR-04 · #3 (Asset) → ditutup ADR-02 · #2, #4, #5, #6 → dialirkan ke ADR-05/06/07 | ADR-02, 04 |

---

## 6. Gate 2 Checkpoint & Artefak

Tiga artefak formal Gate 2 dan statusnya setelah ADR-01 s.d. 04:

| Dokumen | Fungsi | Status |
|---|---|---|
| `03-UX-Architecture-Decision-Log-v1.0.md` | Mengunci ADR-01 s.d. 04 | ✅ **Dokumen ini** — ADR-01 s.d. 04 `ACCEPTED` |
| `02-UX-Entity-Classification-v1.1.md` | Sinkronisasi klasifikasi: penambahan kelas *Projection*, *Transaction View*, *Capability*; Person Family & User Account dipisah | 🔲 Draft berikutnya |
| `01-UX-Information-Architecture-v1.1.md` | IA terkoreksi sesuai §5 dokumen ini | 🔲 Draft berikutnya — disusun setelah ADR-05 s.d. 07 selesai agar tidak revisi ganda |

### Yang masih dilarang sampai Gate 2 ditutup

```text
✗ wireframe
✗ route design
✗ component architecture
✗ page hierarchy
✗ database refactoring
✗ RBAC implementation
```

---

## 7. Agenda Keputusan Berikutnya

| Urutan | ADR | Pertanyaan Inti |
|---|---|---|
| 1 | **ADR-UX-005** — Projection & Navigation | Apa yang berhak menjadi Global Navigation (Places), apa yang menjadi Workspace Navigation, dan apa yang hanya boleh muncul sebagai Projection/Utility? Bagaimana nasib 5 slot bottom-nav eksisting (Beranda, Peta, SuperButton, Laporan, Profil)? |
| 2 | **ADR-UX-006** — Sinode / Global Workspace | Ke mana Super User "pergi" saat login? Apakah diperlukan Global/Sinode Workspace terpisah, atau cukup projection dashboard? |
| 3 | **ADR-UX-007** — Identity × Role × Assignment × Context | Bagaimana UX memformalkan multi-role (Pendeta + KMJ + PJ sekaligus), Identity Scope vs Working Scope, dan mekanisme context switching? Fondasi langsung Phase 3 (Context & RBAC). |

---

## Change Log Dokumen

| Versi | Tanggal | Perubahan |
|---|---|---|
| v1.0-draft.1 | 2026-07-14 | Draft awal ADR-01 s.d. 04 (status campuran PROPOSED/ACCEPTED). |
| **v1.0** | **2026-07-14** | **Penyesuaian final:** (1) Status ADR-01 & ADR-02 dinaikkan menjadi `ACCEPTED`; (2) Istilah "3 Core Domains" diganti **Canonical IA Areas** sampai domain boundary final; (3) Duplikasi `Aid Review Queue` dihapus — Queue hanya Projection, `Aid Request Detail` ditegaskan sebagai Transaction View dengan multi entry point; (4) Penambahan **PR-06: One Entity, Multiple Entry Points**. |

---

*Dokumen ini adalah bagian dari rantai arsitektur SI GPIB v2.2: Phase 0 (Source of Truth) → Phase 1 (Entity Model) → **Phase 2A (Architecture Decisions — di sini)** → Phase 3 (Context & RBAC) → Phase 4+ (Navigation → Workspace → Actions → Flows → Screens → Wireframes).*