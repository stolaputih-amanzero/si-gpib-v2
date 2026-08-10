# UX ENTITY CLASSIFICATION AUDIT v2 — SI GPIB v2.2

**Role**: Senior Information Architect, Enterprise UX Architect, dan Domain Model Analyst  
**Project**: SI GPIB v2.2 (*Mobile First PWA*)  
**Dokumen Output**: `UX_ENTITY_CLASSIFICATION_v1.md`  
**Status**: Audit Read-Only terhadap Aplikasi Eksisting (Tanpa Perubahan Kode / Wireframe / Redesign).

---

## 1. Executive Summary

Audit ini bertolak dari **35 entitas teknis (database tables)** yang ditemukan pada `current_state_inventory.md` dan `entity_inventory.md` untuk mentransformasikannya menjadi **UX/Business Entity Model** yang sahih dan berlandaskan bukti empiris codebase.

### Temuan Kunci Audit UX Architecture:
1. **1 Database Table $\neq$ 1 UX Entity**: Dari 35 tabel database teknis, hanya **7 Objek yang memenuhi syarat sebagai UX Entity Utama** (`Organization`, `Person`, `Asset`, `PastoralRecord`, `WorshipSchedule`, `AidRequest`, `TerritoryRiskPotential`).
2. **Penumpukan Entitas SDM (People Model)**: Saat ini `m_pendeta`, `t_pelayan`, dan `t_relawan` dipisah menjadi 3 tabel terpisah tanpa abstraksi entitas tunggal `Person`. Namun akun autentikasi `users` menampung foreign key ke `m_pendeta`, `id_mupel`, `id_induk`, dan `id_pos`.
3. **Model Hierarki Organisasi (Context vs Scope)**: Hierarki `Sinode → Mupel → Jemaat Induk → Bajem / Pos Pelkes` bertindak ganda sebagai **Organizational Hierarchy**, **Context Hierarchy** (User Working Context), dan **Data Access Scope (RBAC/RLS)**. `Sinode` tidak memiliki baris tabel di database (berada sebagai implicit global scope `super_user`), sedangkan `Bajem` (*Bakal Jemaat*) secara teknis disimpan di tabel `m_pos_pelkes` dengan `kategori = 'Bajem'`.
4. **Pencampuran Konsep Navigasi (Navigation Mixture)**: Navigasi eksisting mencampurkan `Entity` (`/sdm/pendeta`), `Action` (`/pastoral/new`, `/bantuan/new`), `View/Projection` (`/dashboard/peta`), `Report` (`/laporan`), dan `Domain` (`/sdm`, `/hierarki`).

---

## 2. Methodology

Audit ini menerapkan **6 Konsep UX Utama**:
1. **DOMAIN**: Area bisnis besar dengan vocabulary & tujuan tersendiri.
2. **ENTITY**: Objek bisnis bermakna dengan identitas, lifecycle, relationship, dan atribut.
3. **CONTEXT**: Lingkup kerja organisasi/wilayah user aktif saat ini (`id_mupel`, `id_induk`, `id_pos`).
4. **WORKSPACE**: Lingkungan kerja berpusat pada satu objek/konteks tertentu.
5. **SECTION**: Pengelompokan informasi di dalam suatu Workspace.
6. **ACTION**: Tindakan user terhadap Entity/Context/Workspace (View, Create, Edit, Transfer, Approve).

Serta **9 Klasifikasi Pendukung (Supporting Classifications)**:
- **UX Entity** | **Relationship** | **Activity / Record** | **Transaction / Workflow** | **Document / Attachment** | **System Object** | **Reference / Dataset** | **View / Projection** | **Attribute / Sub-record** | **Uncertain**

---

## 3. Technical Entity $\rightarrow$ UX Classification Matrix

Tabel audit 35 entitas teknis database ke klasifikasi UX/Business:

| # | Technical Entity | Business Name | UX Classification | Parent UX Entity | Related Entity | Candidate Workspace? | Candidate Section? | Reason | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `m_mupel` | Mupel (Musyawarah Pelayanan) | **UX Entity** | Organization (Sinode) | JemaatInduk, User | **YES** | YES | Memiliki identitas, wilayah, jemaat bawahan, & statistik. | High |
| 2 | `m_jemaat_induk` | Jemaat Induk | **UX Entity** | Organization (Mupel) | PosPelkes, Pendeta (KMJ) | **YES** | YES | Gereja lokal mandiri, dipimpin KMJ, bawahi Pos Pelkes. | High |
| 3 | `m_pos_pelkes` | Pos Pelkes / Bajem | **UX Entity** | Organization (Jemaat) | Pelayan, Relawan, LogPastoral | **YES** | YES | Unit pelayanan lapangan, tempat tugas & operasional. | High |
| 4 | `m_pendeta` | Pendeta | **UX Entity** | Person | JemaatInduk, Penugasan, Mutasi | **YES** | YES | Subjek pelayan firman & sakramen, Profil 360 lengkap. | High |
| 5 | `t_pelayan` | Pelayan / Presbiter | **UX Entity** / Sub-Person | Person | PosPelkes | NO | YES | Presbiter/Pelayan Pos. Lebih tepat atribut/role dari Person. | High |
| 6 | `t_relawan` | Relawan | **UX Entity** / Sub-Person | Person | PosPelkes | NO | YES | Tenaga pendukung pelayanan. Lebih tepat atribut/role Person. | High |
| 7 | `users` | User Account | **System Object** / Identity | Person | Pendeta, Mupel, Jemaat, Pos | NO | YES (Akun & Keamanan) | Akun kredensial login & otorisasi RBAC aplikasi. | High |
| 8 | `m_webauthn_credentials` | Passkey Biometrik | **System Object** | User | User | NO | YES (Biometrik) | Kredensial FIDO2/WebAuthn perangkat fisik user. | High |
| 9 | `webauthn_challenges` | Biometric Challenge | **System Object** | None | User | NO | NO | Challenge temporary jabat tangan protokol WebAuthn. | High |
| 10 | `m_push_subscription` | Push Subscriptions | **System Object** | None | User | NO | NO | Token per-device PWA Push Notification API. | High |
| 11 | `t_pj_jemaat` | Penugasan KMJ / PJ Jemaat | **Relationship** | JemaatInduk | Pendeta | NO | YES (Kepemimpinan) | Tabel pivot penunjukan Pendeta menjadi KMJ Jemaat. | High |
| 12 | `t_penugasan_pendeta` | Penugasan Pendeta Pos | **Relationship** | PosPelkes | Pendeta | NO | YES (Penugasan) | Tabel pivot penugasan Pendeta bertugas di Pos Pelkes. | High |
| 13 | `t_riwayat_mutasi_pendeta` | Riwayat Mutasi | **Activity / Record** | Pendeta | JemaatInduk (Lama/Baru) | NO | YES (Riwayat Mutasi) | Records historis alih tugas pendeta antar jemaat. | High |
| 14 | `t_jabatan_struktural` | Jabatan Struktural | **Attribute / Sub-record** | Pendeta | Pendeta | NO | YES (Jabatan) | Riwayat jabatan dalam struktur majelis/mupel. | High |
| 15 | `t_keluarga_pendeta` | Data Keluarga | **Attribute / Sub-record** | Pendeta | Pendeta | NO | YES (Keluarga) | Sub-record anggota keluarga inti pendeta. | High |
| 16 | `t_kompetensi_pendeta` | Sertifikasi / Kompetensi | **Attribute / Sub-record** | Pendeta | Pendeta, Document | NO | YES (Kompetensi) | Sub-record keahlian & sertifikat pendeta. | High |
| 17 | `t_keterlibatan_pendeta` | Keterlibatan Eksternal | **Attribute / Sub-record** | Pendeta | Pendeta | NO | YES (Keterlibatan) | Keaktifan dalam organisasi di luar gereja. | High |
| 18 | `t_log_pastoral` | Log Pastoral | **Activity / Record** | PosPelkes / Pendeta | PosPelkes, Pendeta | NO | YES (Log Pastoral) | Record aktivitas pastoral/penggembalaan di lapangan. | High |
| 19 | `t_jadwal_ibadah` | Jadwal Ibadah | **Activity / Record** | PosPelkes | PosPelkes | NO | YES (Jadwal) | Routine schedule ibadah & kegiatan pelayanan pos. | High |
| 20 | `t_aset_tanah` | Aset Tanah | **UX Entity** (Aset Subtype) | Asset | PosPelkes, Document | **YES** (Group) | YES (Aset Tanah) | Bidang tanah milik/dikelola pos pelkes. | High |
| 21 | `t_aset_bangunan` | Aset Bangunan | **UX Entity** (Aset Subtype) | Asset | PosPelkes, Document | **YES** (Group) | YES (Aset Bangunan) | Fisik gedung gereja / pastori / aula. | High |
| 22 | `t_aset_bergerak` | Aset Bergerak | **UX Entity** (Aset Subtype) | Asset | PosPelkes, Document | **YES** (Group) | YES (Aset Bergerak) | Kendaraan operasional & inventaris bergerak pos. | High |
| 23 | `t_lampiran_aset` | File Lampiran Aset | **Document / Attachment** | Asset | Aset Tanah/Bangunan/Bergerak | NO | YES (Lampiran) | File foto/sertifikat bukti kepemilikan aset. | High |
| 24 | `t_pengajuan_bantuan` | Pengajuan Bantuan | **Transaction / Workflow** | PosPelkes | PosPelkes, Asset, Approval | **YES** | YES (Bantuan) | Transaksi permohonan dana/bantuan ber-lifecycle. | High |
| 25 | `t_approval_bantuan` | Approval Bantuan | **Activity / Record** | PengajuanBantuan | User, PengajuanBantuan | NO | YES (Workflow Timeline) | Catatan keputusan approval berjenjang (KMJ/Mupel). | High |
| 26 | `t_demografi_pelkat` | Demografi Pelkat | **Reference / Dataset** | PosPelkes | PosPelkes | NO | YES (Demografi) | Agregasi data statistik jemaat per Pelkat di Pos. | High |
| 27 | `t_kerawanan_wilayah` | Kerawanan Wilayah | **UX Entity** / Territory Data | PosPelkes | PosPelkes, Document | NO | YES (Wilayah Risiko) | Identifikasi titik risiko bencana/sosial di wilayah pos. | High |
| 28 | `t_lampiran_kerawanan` | Lampiran Kerawanan | **Document / Attachment** | KerawananWilayah | KerawananWilayah | NO | YES (Lampiran Risiko) | Foto lokasi titik kerawanan. | High |
| 29 | `t_potensi_wilayah` | Potensi Wilayah | **UX Entity** / Territory Data | PosPelkes | PosPelkes, Document | NO | YES (Wilayah Potensi) | Identifikasi titik potensi ekonomi/sosial pos. | High |
| 30 | `t_lampiran_potensi` | Lampiran Potensi | **Document / Attachment** | PotensiWilayah | PotensiWilayah | NO | YES (Lampiran Potensi) | Foto lokasi titik potensi. | High |
| 31 | `t_log_aktivitas` | Audit Log Aktivitas | **System Object** | User | User | NO | YES (Log Keamanan) | Rekam jejak audit keamanan aplikasi. | High |
| 32 | `t_form_draft` | Offline Draft | **System Object** | User | User | NO | YES (Data Lokal) | Penampungan sementara form draft lokal PWA. | High |
| 33 | `t_histori_perubahan_status` | Histori Status Hierarki | **Activity / Record** | Organization | PosPelkes, JemaatInduk | NO | YES (Histori Elevasi) | Record elevasi status Pos Pelkes $\rightarrow$ Bajem $\rightarrow$ Jemaat. | High |
| 34 | `sys_transaction_logs` | System Tx Log | **System Object** | System | None | NO | NO | Log internal transaksi sistem & background queue. | High |
| 35 | `sys_telemetry` | System Telemetry | **System Object** | System | None | NO | NO | Metrik performa PWA & telemetry sistem. | High |

---

## 4. UX Entity Inventory

Berdasarkan hasil pemilahan di atas, terdapat **7 Objek UX Entity Utama** yang menjadi pilar domain bisnis SIGPIB:

### 1. `Organization` (Entitas Organisasi)
- **Definisi UX**: Entitas struktur badan pelayanan GPIB. Memiliki tipe/level: `Mupel`, `Jemaat Induk`, `Bajem`, dan `Pos Pelkes`. (Sinode sebagai Root Scope).
- **Atribut Bisnis**: Kode Unik (`id_mupel`/`id_induk`/`id_pos`), Nama, Alamat, Koordinat Geospasial (`latitude`, `longitude`), Pemimpin/Penanggung Jawab, Tanggal Berdiri, Foto/Dokumen.
- **Dukungan Codebase**: `m_mupel`, `m_jemaat_induk`, `m_pos_pelkes`, `t_histori_perubahan_status`.

### 2. `Person` (Entitas Manusia / SDM Pelayanan)
- **Definisi UX**: Individu manusia yang terlibat dalam pelayanan GPIB. Memiliki peran/kategori: `Pendeta`, `Pelayan/Presbiter` (Penatua/Diaken), `Relawan`, dan `Pengguna Akun`.
- **Atribut Bisnis**: NIP/NIK, Nama Lengkap, Nomor Kontak (WA), Gender, Tanggal Lahir, Foto Profil, Status Keaktifan.
- **Dukungan Codebase**: `m_pendeta`, `t_pelayan`, `t_relawan`, `users`.

### 3. `Asset` (Entitas Aset & Inventaris)
- **Definisi UX**: Barang kekayaan material yang dimiliki atau dikelola oleh Organisasi/Pos Pelkes. Memiliki subtipe: `Tanah`, `Bangunan`, dan `Bergerak`.
- **Atribut Bisnis**: ID Aset, Subtipe Aset, Kondisi (`Baik`/`Rusak Ringan`/`Rusak Berat`), Tahun Perolehan/Berdiri, Legalitas/Status Hukum, Nilai/Luas/No.Polisi, Lampiran Foto/Sertifikat.
- **Dukungan Codebase**: `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`, `t_lampiran_aset`.

### 4. `PastoralRecord` (Entitas Catatan Pastoral)
- **Definisi UX**: Records kegiatan rekap penggembalaan, kunjungan jemaat, konseling, ibadah rumah tangga, atau pelayanan lapangan yang dilakukan oleh Pendeta/Pelayan di Pos Pelkes.
- **Atribut Bisnis**: ID Log, Tanggal Kegiatan, Jenis Kegiatan, Jumlah Jiwa dilayani, Catatan Pastoral, Foto Kegiatan.
- **Dukungan Codebase**: `t_log_pastoral`.

### 5. `WorshipSchedule` (Entitas Jadwal Pelayanan / Ibadah)
- **Definisi UX**: Penjadwalan rutinitas ibadah minggu, ibadah Pelkat, atau kegiatan persekutuan di Pos Pelkes.
- **Atribut Bisnis**: ID Jadwal, Jenis Ibadah, Hari, Jam, Zona Waktu, Keterangan.
- **Dukungan Codebase**: `t_jadwal_ibadah`.

### 6. `AidRequest` (Entitas Transaksi Pengajuan Bantuan)
- **Definisi UX**: Transaksi permohonan dukungan dana atau perbaikan aset fisik dari Pos Pelkes yang memerlukan workflow persetujuan (approval) berjenjang.
- **Atribut Bisnis**: ID Ajuan, Jenis Bantuan, Estimasi Biaya, Tingkat Urgensi, Status Workflow (`Draft`, `Diajukan`, `Disetujui_KMJ`, `Disetujui_Mupel`, `Ditolak`), Catatan Approval Timeline.
- **Dukungan Codebase**: `t_pengajuan_bantuan`, `t_approval_bantuan`.

### 7. `TerritoryData` / `RiskPotential` (Entitas Data Wilayah & Geospasial)
- **Definisi UX**: Data karakteristik wilayah pelayanan mencakup identifikasi titik Risiko Kerawanan dan titik Potensi Wilayah di sekitar Pos Pelkes.
- **Atribut Bisnis**: ID Risiko/Potensi, Kategori, Deskripsi, Tingkat Frekuensi, Koordinat Presisi (`latitude`, `longitude`), Foto Lampiran Wilayah.
- **Dukungan Codebase**: `t_kerawanan_wilayah`, `t_potensi_wilayah`, `t_lampiran_kerawanan`, `t_lampiran_potensi`.

---

## 5. Relationship Map

Berikut adalah peta hubungan (relationship map) antar entitas UX beserta kardinalitasnya berdasarkan bukti empiris database:

```text
Organization (Sinode / Mupel / Jemaat / Bajem / Pos Pelkes)
    │
    ├── 1 ─── N Organization (Parent-Child Hierarchy: Mupel 1:N Jemaat 1:N Pos)
    │
    ├── 1 ─── N Person Assignment (Penugasan Pendeta / KMJ / Pelayan / Relawan)
    │             │
    │             └── 1 ─── 1 Person (Pendeta / Pelayan / Relawan / User)
    │
    ├── 1 ─── N Asset (Aset Tanah / Bangunan / Bergerak)
    │             │
    │             └── 1 ─── N Document (Lampiran Aset)
    │
    ├── 1 ─── N Pastoral Record (Log Pastoral Pos)
    │
    ├── 1 ─── N Worship Schedule (Jadwal Ibadah Pos)
    │
    ├── 1 ─── N Aid Request (Pengajuan Bantuan Pos)
    │             │
    │             └── 1 ─── N Approval Record (Timeline Persetujuan KMJ / Mupel)
    │
    ├── 1 ─── N Territory Risk & Potential (Kerawanan & Potensi Wilayah)
    │             │
    │             └── 1 ─── N Document (Foto Lampiran Wilayah)
    │
    └── 1 ─── N Demographics Dataset (Demografi Pelkat PA/PT/GP/PKP/PKB/PKLU)
```

---

## 6. Organization Model (Answering Questions A)

### Audit Entitas Hierarki:
- `Sinode`: **Root Scope (Level 0)**. Tidak memiliki baris tabel tersendiri di database. Merepresentasikan akses global untuk peran `superadmin`/`super_user`.
- `Mupel`: **UX Entity (Level 1)** (`m_mupel`). Mengelompokkan Jemaat-Jemaat Induk dalam 1 wilayah regional.
- `Jemaat Induk`: **UX Entity (Level 2)** (`m_jemaat_induk`). Gereja lokal mandiri yang dipimpin oleh Pendeta KMJ.
- `Bajem` (*Bakal Jemaat*): **Organizational Subtype / Status Level** dari Pos Pelkes. Di database disimpan dalam tabel `m_pos_pelkes` dengan atribut `kategori = 'Bajem'`. Memiliki fungsi transisi menuju Jemaat Induk mandiri.
- `Pos Pelkes`: **UX Entity (Level 3)** (`m_pos_pelkes`). Pos pelayanan perintisan di bawah bimbingan Jemaat Induk.
- `Histori Status Hierarki`: **Activity Record** (`t_histori_perubahan_status`). Mencatat riwayat peningkatan status dari Pos Pelkes $\rightarrow$ Bajem $\rightarrow$ Jemaat Induk.

### Jawaban Pertanyaan Arsitektur A:
1. **Apakah 1 Entity `Organization` dengan Type?**: Secara konseptual UX, YA. Seluruhnya adalah entitas `Organization` dengan tipe/level: `Mupel`, `Jemaat Induk`, `Bajem`, dan `Pos Pelkes`.
2. **Atau Entity Berbeda?**: Secara teknis database saat ini dipisah menjadi 3 tabel (`m_mupel`, `m_jemaat_induk`, `m_pos_pelkes`), namun berelasi hierarkis 1-to-N yang sangat ketat (`m_mupel` $\rightarrow$ `m_jemaat_induk` $\rightarrow$ `m_pos_pelkes`).
3. **Hierarchical Relationship**: Cascading FK (`id_mupel` pada Jemaat Induk, `id_induk` pada Pos Pelkes).
4. **Context Hierarchy**: YA. Hierarki ini bertindak sebagai **User Working Context** aktif di aplikasi (misalnya user memilih bekerja dalam konteks Pos Pelkes tertentu atau Jemaat Induk tertentu via `use-pos-context.tsx`).
5. **Scope Hierarchy**: YA. Hierarki ini menentukan **Data Scope & RBAC/RLS** (`rbac.ts` memeriksa `id_mupel`, `id_induk`, dan `id_pos` metadata user untuk membatasi hak akses baca/tulis).

---

## 7. People Model (Answering Questions B)

### Audit Entitas Manusia:
- `Pendeta`: Tabel `m_pendeta`. Memiliki NIP, NIK, Jabatan, Profil 360, Riwayat Mutasi, Penugasan, Keluarga, Kompetensi.
- `Pelayan` / Presbiter: Tabel `t_pelayan`. Presbiter (Penatua/Diaken) atau pelayan pos.
- `Relawan`: Tabel `t_relawan`. Relawan pendukung kegiatan pos pelkes.
- `User Account`: Tabel `users`. Kredensial akun sistem (`email`, `password_hash`, `role`, `id_pendeta`, `id_mupel`, `id_induk`, `id_pos`).

### Jawaban Pertanyaan Arsitektur B:
**Apakah `Person + Role/Assignment` atau Entity Terpisah?**
- **Kondisi Eksisting Codebase**: Saat ini database menerapkan **Entity Terpisah secara fisik** (`m_pendeta`, `t_pelayan`, `t_relawan`, `users`).
- **Analisis UX Architecture**: Pemisahan fisik ini menimbulkan **fragmentasi data manusia**. Akun `users` dihubungkan ke `m_pendeta` via `id_pendeta`, namun pelayan (`t_pelayan`) dan relawan (`t_relawan`) tidak terhubung secara langsung ke tabel `users`.
- **Model UX Ideal**: Model UX yang lebih tepat adalah **`Person` sebagai Entitas Utama** dengan atribut peran/penugasan (*Role & Assignment*). Namun pada audit kondisi saat ini, `Pendeta` berdiri sebagai UX Entity mandiri dengan bobot informasi paling dominan (Profil 360), sedangkan `Pelayan` dan `Relawan` bertindak sebagai Sub-Person / Staff Records di bawah Pos Pelkes.

---

## 8. Activity & Transaction Model (Answering Questions C & G)

### Pastoral Domain (Pertanyaan C):
- `LogPastoral`: Bertindak sebagai **Activity / Record**. Merupakan pencatatan kejadian penggembalaan yang terikat ke `PosPelkes` dan `Pendeta`. Dapat diakses dari 2 konteks workspace: **Organization Workspace (Pos Pelkes)** dan **Person Workspace (Profil Pendeta 360)**.
- `JadwalIbadah`: Bertindak sebagai **Activity / Record Schedule**. Terikat langsung sebagai seksi operasional rutin di bawah `PosPelkes`.

### Bantuan Domain (Pertanyaan G):
- `PengajuanBantuan`: Bertindak sebagai **Transaction / Workflow Entity**. Memiliki identitas unik, biaya, urgensi, terikat ke Aset/Pos, dan memiliki status *lifecycle* (`Draft` $\rightarrow$ `Diajukan` $\rightarrow$ `Disetujui_KMJ` $\rightarrow$ `Disetujui_Mupel` / `Ditolak`).
- `ApprovalBantuan`: Bertindak sebagai **Approval Record** / Sub-record dari `PengajuanBantuan`. Mencatat log timeline siapa (*approver_id* & *role*) yang menyetujui atau menolak pada tanggal berapa beserta alasannya.

---

## 9. Document Model (Answering Questions H)

### Inventarisasi File & Dokumen dalam Aplikasi:
1. **Lampiran Aset**: Tabel `t_lampiran_aset` (Foto tanah/bangunan, scan sertifikat tanah/STNK).
2. **Lampiran Kerawanan**: Tabel `t_lampiran_kerawanan` (Foto lokasi titik bencana/risiko).
3. **Lampiran Potensi**: Tabel `t_lampiran_potensi` (Foto lokasi titik potensi wilayah).
4. **Dokumen Kompetensi Pendeta**: Atribut `dokumen_url` pada `t_kompetensi_pendeta` (Scan sertifikat/ijazah).
5. **Foto Keluarga Pendeta**: Atribut `foto_url` pada `t_keluarga_pendeta`.
6. **Foto Log Pastoral**: Atribut `foto_url` pada `t_log_pastoral`.
7. **Avatar & Foto Profil**: Atribut `foto_url` / `avatar_url` pada `users`, `m_pendeta`, `t_pelayan`, `t_relawan`, `m_jemaat_induk`.

### Jawaban Pertanyaan Arsitektur H:
- **Apakah `Document` Layak menjadi Cross-Domain Entity?**:
  - Pada arsitektur database saat ini, dokumen disimpannya secara **terfragmentasi** (sebagian sebagai tabel lampiran khusus seperti `t_lampiran_aset`, sebagian sebagai kolom string URL `foto_url`/`dokumen_url`).
  - Secara UX Model, dokumen bertindak sebagai **Document / Attachment** yang menempel (*owned by*) pada entitas utamanya (`Asset`, `Person`, `Territory`, `PastoralRecord`), bukan sebagai entitas mandiri yang berdiri sendiri tanpa induk.

---

## 10. System Object Model (Answering Questions I)

Objek-objek internal berikut dipisahkan secara tegas dari Business Navigation:

| System Object | Fungsi Utama | Alasan Bukan Business Entity |
| :--- | :--- | :--- |
| `users` | Autentikasi & Sesi User | Merupakan objek identitas sistem untuk login & otorisasi RBAC. |
| `m_webauthn_credentials` | Passkey FIDO2 Biometrik | Kredensial kriptografi perangkat keras fisik user. |
| `webauthn_challenges` | Temporary Challenge | Data transaksi kriptografi sementara (expired dalam hitungan detik). |
| `m_push_subscription` | Token Push Notifikasi PWA | Metadata browser Service Worker endpoint. |
| `t_log_aktivitas` | Audit Trail Keamanan | Log aktivitas internal sistem untuk keperluan audit auditability. |
| `t_form_draft` | Buffer Draft Offline | Penampung state JSON temporer IndexedDB/Supabase saat offline. |
| `sys_transaction_logs` | System Tx Log | Log pemrosesan transaksi background queue. |
| `sys_telemetry` | PWA Performance Telemetry | Metrik performa render & latensi aplikasi. |

> [!IMPORTANT]
> Seluruh System Object di atas **HARUS DIKECUALIKAN** dari Navigasi Bisnis Utama Pengguna.

---

## 11. Candidate Workspace Map

Hasil evaluasi kelayakan suatu UX Entity untuk menjadi **Workspace** (Lingkungan kerja kompleks multi-seksi):

| UX Entity | Candidate Workspace? | Why? | Main Sections |
|---|---|---|---|
| **Organization (Mupel / Jemaat / Pos)** | **YES** | Memiliki kompleksitas data paling tinggi,bawahan hierarki, aset, SDM, log pastoral, demografi, & geospasial. | Overview, Profil, SDM & Pelayan, Aset & Inventaris, Demografi, Pastoral, Wilayah (Potensi/Risiko), Bantuan, Settings. |
| **Person (Profil 360 Pendeta)** | **YES** | Memiliki portofolio komprehensif, riwayat mutasi, jabatan, keluarga, kompetensi, keterlibatan, & log penggembalaan. | Profil Utama, Jabatan Struktural, Riwayat Mutasi, Penugasan, Keluarga, Kompetensi & Sertifikasi, Keterlibatan, Log Pastoral. |
| **Asset (Aset Pos Pelkes)** | **YES** (Group) | Memiliki 3 subtipe (Tanah, Bangunan, Bergerak), nilai ekonomis, legalitas hukum, lokasi peta, & file lampiran foto. | Ringkasan Aset, Tanah, Bangunan, Aset Bergerak, File Lampiran / Legalitas. |
| **AidRequest (Pengajuan Bantuan)** | **YES** (Detail) | Memiliki siklus hidup (lifecycle) workflow persetujuan, estimasi biaya, urgensi, & timeline approval. | Detail Ajuan, Item Aset Terkait, Urgensi & Cost, Timeline Approval (KMJ/Mupel). |
| **PastoralRecord** | **NO** | Merupakan catatan aktivitas (record) sederhana. Cukup ditampilkan sebagai list/form dialog. | Detail Kegiatan, Jumlah Jiwa, Catatan, Foto. |
| **WorshipSchedule** | **NO** | Merupakan data rutin operasional. Cukup sebagai seksi di dalam Organization Workspace. | Detail Jadwal, Hari/Jam, Pelayan Bertugas. |
| **TerritoryRiskPotential** | **NO** | Merupakan data pemetaan spasial. Cukup sebagai seksi/layer di Organization Workspace. | Detail Risiko/Potensi, Titik Koordinat, Foto Lampiran. |

---

## 12. Navigation Implications

> [!WARNING]
> Arsitektur navigasi eksisting (`src/lib/constants/navigation.ts`) saat ini mengalami **Pencampuran Konsep (Concept Mixture)** yang dapat membingungkan pengguna:

### Identifikasi Pencampuran Konsep pada Navigasi Eksisting:

```text
EKSISTING NAVIGATION MIXTURE:
├── Menu -> Entity         : /sdm/pendeta, /dashboard/pos-pelkes, /pelayan
├── Menu -> Action         : /pastoral/new (Input Log Pastoral), /bantuan/new (Pengajuan Bantuan)
├── Menu -> View/Projection: /dashboard/peta (Visualisasi Peta Sebaran)
├── Menu -> Report         : /laporan, /laporan/pastoral, /laporan/aset
└── Menu -> Domain Hub     : /sdm, /hierarki, /settings
```

- **Pencampuran Entity & Action**: Menu `SuperButton` mencampurkan rute navigasi entitas (`/pelayan`, `/demografi`) langsung berdampingan dengan aksi input cepat (`/pastoral/new`, `/aset/new`, `/bantuan/new`).
- **Pencampuran View & Entity**: Rute `/dashboard/peta` adalah *projection / cara pandang peta*, sementara `/dashboard/pos-pelkes` adalah *daftar entitas*.
- **Rute Redundan**: Terdapat rute terpisah antara `/sdm/pendeta` dengan `/pendeta`, `/sdm/pelayan` dengan `/pelayan`, `/sdm/relawan` dengan `/relawan`.

---

## 13. Confirmed Findings

Hal-hal yang terbukti secara empiris dan didukung langsung oleh kode & database:
1. Database memiliki 35 tabel dengan skema PostgreSQL aktif di folder `supabase/migrations/`.
2. Hierarki fisik database terdiri dari `m_mupel` $\rightarrow$ `m_jemaat_induk` $\rightarrow$ `m_pos_pelkes`.
3. Entitas Pendeta memiliki cakupan data terluas di SDM dengan 6 sub-tabel pelengkap (`t_penugasan_pendeta`, `t_riwayat_mutasi_pendeta`, `t_jabatan_struktural`, `t_keluarga_pendeta`, `t_kompetensi_pendeta`, `t_keterlibatan_pendeta`).
4. RBAC ditegakkan melalui kombinasi Supabase RLS policies dan fungsi helper server `rbac.ts` (`assertPosWriteAccess`).
5. Fitur biometrik WebAuthn didukung oleh tabel `m_webauthn_credentials` dan `webauthn_challenges`.

---

## 14. Inferences

Hasil interpretasi arsitektur berdasarkan bukti-bukti kode:
1. `Sinode` bertindak secara implisit sebagai Root Organization Scope untuk pengguna dengan role `superadmin` / `super_user`.
2. `Bajem` (*Bakal Jemaat*) secara arsitektur bisnis adalah entitas transisi (pos pelkes yang sedang diproses naik status menjadi Jemaat Induk mandiri), yang diimplementasikan di database melalui tabel `m_pos_pelkes` dengan atribut `kategori = 'Bajem'`.
3. `LogPastoral` dan `JadwalIbadah` didesain untuk dapat diakses secara *cross-context* baik dari konteks Pos Pelkes maupun dari Profil Pendeta.

---

## 15. Uncertainties

Hal-hal yang tidak memiliki bukti kode yang cukup memadai:
1. Apakah ke depannya `Pelayan` dan `Relawan` akan memiliki fitur akun login sendiri (saat ini tabel `users` hanya memiliki relasi FK `id_pendeta`, tanpa `id_pelayan` atau `id_relawan`).
2. Apakah entitas `DemografiPelkat` perlu diubah dari agregasi manual per-pos menjadi data individu jemaat (*jiwa/KK detail*).

---

## 16. Conflicts

Perbedaan antara Dokumentasi PRD / Label UI dengan Kode & Database Eksisting:

| Komponen | Documentation / UI Label | Codebase / Database Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Bajem (Bakal Jemaat)** | Dianggap sebagai level hierarki tersendiri di PRD v2.2 | Tidak memiliki tabel `m_bajem`. Disimpan di `m_pos_pelkes` dengan `kategori = 'Bajem'` & dibantu helper `isBajemPos()`. | **CONFLICT** |
| **Sinode GPIB** | Disebut sebagai Sinode Pusat pada hierarki level 0 | Tidak ada tabel `m_sinode`. Hanya diwakili oleh global scope `role = 'super_user'`. | **CONFLICT** |
| **Rute SDM** | Navigasi menu mengarahkan ke `/sdm/pendeta`, `/sdm/pelayan`, `/sdm/relawan` | Di aplikasi juga terdapat rute langsung `/pendeta`, `/pelayan`, `/relawan`. | **CONFLICT** |

---

## 17. Gaps

Area data atau arsitektur yang belum ditemukan implementasinya secara penuh:
1. **Sinode Entity**: `NOT FOUND IN CURRENT IMPLEMENTATION` (hanya ada sebagai role scope).
2. **Bajem Table**: `NOT FOUND IN CURRENT IMPLEMENTATION` (diwakili oleh kolom `kategori` di `m_pos_pelkes`).
3. **Hubungan Jemaat ↔ Bajem**: `NOT FOUND IN CURRENT IMPLEMENTATION` (Bajem masih memakai FK `id_induk` ke Jemaat Induk sama seperti Pos Pelkes biasa).
4. **Person Abstraction**: `NOT FOUND IN CURRENT IMPLEMENTATION` (SDM masih terpisah di 4 tabel: `m_pendeta`, `t_pelayan`, `t_relawan`, `users`).
5. **Unified Document Repository**: `NOT FOUND IN CURRENT IMPLEMENTATION` (dokumen/lampiran masih tersebar di tabel khusus dan string URL).

---

## 18. Recommended Next Step

Rekomendasi langkah berikutnya sesuai arsitektur informasi:
1. Gunakan dokumen `UX_ENTITY_CLASSIFICATION_v1.md` ini sebagai fondasi utama untuk tahap **Domain Architecture & Workspace Mapping**.
2. **JANGAN melakukan perubahan kode atau perancangan UI terlebih dahulu** sampai arsitektur Domain & Context disepakati bersama.
