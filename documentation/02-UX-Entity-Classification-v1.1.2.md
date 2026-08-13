# 02 — UX Entity Classification v1.1.2 (Final Correction Pass)

| Field | Value |
|---|---|
| **Dokumen** | `02-UX-Entity-Classification-v1.1.2.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2 Freeze Package) |
| **Status** | ✅ `FROZEN` |
| **Ontological Authority** | `05-UX-Canonical-Model-v1.0.md` (FROZEN) |
| **Consistency Constraints** | `03-UX-Architecture-Decision-Log-v1.0.md` · `04-UX-Architecture-Principles-v1.0.md` · VC-01 s.d. VC-05 |
| **Sumber Data** | `entity_inventory.md` (35 entitas) · `current_state_inventory.md` (35 tabel) |
| **Peran Dokumen** | **WHAT each database table means as a business concept** — jembatan dari struktur fisik database ke ontologi UX. |
| **Versi** | v1.1.2 — Final consistency correction sebelum Gate 2 Freeze |

---

## 0. Tujuan & Aturan Dokumen

### 0.1 Fungsi Dokumen

Dokumen ini mengklasifikasikan **35 tabel database** SI GPIB v2.2 ke dalam **kelas ontologis kanonis** yang ditetapkan di `05-UX-Canonical-Model-v1.0.md`.

### 0.2 Pipeline Klasifikasi (Wajib)

```text
Physical Database Table
        ↓
Business Meaning
        ↓
Canonical Concept (dari Dokumen 05)
        ↓
UX Responsibility
        ↓
Workspace / Section / View / Projection
```

> **⚠️ GUARDRAIL:**
>
> **A physical database table has one primary canonical classification; UX concepts may aggregate multiple physical tables, and a physical table may participate in more than one conceptual responsibility only where explicitly declared as Secondary Conceptual Participation.**
>
> Contoh agregasi:
> ```text
> m_pendeta ─────┐
> t_pelayan ────┼──→ PERSON (satu konsep kanonis)
> t_relawan ────┘
> ```
>
> Contoh Secondary Conceptual Participation (harus dideklarasikan eksplisit):
> ```text
> m_jemaat_induk
>        ├── Primary Canonical Class: Entity
>        ├── Business Meaning: Organization Entity
>        └── Secondary Conceptual Participation: Context
> ```

### 0.3 Aturan Metodologis

| Aturan | Pernyataan |
|---|---|
| **M-1** | Klasifikasi mengikuti pipeline di §0.2. **Bukan** `Table → Menu → Workspace → Screen`. |
| **M-2** | Tidak ada tabel yang otomatis menjadi Workspace hanya karena merupakan domain/tabel besar. |
| **M-3** | `Person` tetap unified; `User Account` tetap terpisah dari `Person`. |
| **M-4** | `Context` tidak disamakan dengan `Organization Entity` meskipun keduanya berbagi hierarki fisik yang sama. |
| **M-5** | `Transaction` tidak berubah menjadi Workspace; `Projection` tidak berubah menjadi Place. |
| **M-6** | `Capability` tidak tercampur dengan `Permission` (VC-02). |
| **M-7** | `Person Type`, `Organizational Role`, `System Role`, dan `Assignment` tetap terpisah (VC-01). |
| **M-8** | Tidak ada keputusan RBAC/RLS yang diselundupkan ke dokumen ini. |
| **M-9** | Setiap klasifikasi dapat ditelusuri kembali ke `05-UX-Canonical-Model-v1.0.md`. |

---

## 1. Canonical Class Taxonomy

### 1.1 Kelas Kanonis Utama (dari Dokumen 05)

| Kelas | Definisi Singkat | Sumber di 05 |
|---|---|---|
| **Entity** | Objek bisnis bermakna dengan identitas, lifecycle, atribut, dan relasi. | §2.2 |
| **Transaction** | Objek bisnis dengan lifecycle workflow dan multi-actor approval. | §2.3 |
| **View** | Tampilan detail dari satu Entity/Transaction (bukan node navigasi). | §2.4 |
| **Projection** | Cara pandang lintas konteks (lensa, bukan tempat). | §2.5 |
| **Context** | Lingkup eksekusi (execution scope) — Sinode/Mupel/Jemaat/Pos. | §2.6 |
| **Person** | Individu manusia dalam pelayanan (Business Identity). | §2.7 |
| **User Account** | Identitas sistem untuk autentikasi (System Identity). | §2.8 |
| **Role** | Kapasitas otorisasi (Organizational Role / System Role). | §2.9 |
| **Permission** | Hak spesifik untuk operasi tertentu (atom RBAC). | §2.10 |
| **Assignment** | Relasi Person ↔ Context/Organization dalam periode tertentu. | §2.11 |
| **Session** | State runtime interaksi user. | §2.12 |
| **Capability** | Kemampuan operasional organisasi (section di Workspace). | §2.15 |
| **Workspace** | Lingkungan kerja terpadu (Place). | §2.1 |

### 1.2 Kelas Pendukung (Sub-class)

Seluruh kelas pendukung secara eksplisit dideklarasikan sebagai sub-class dari kelas kanonis induknya.

| Kelas Pendukung | Induk Kanonis | Definisi |
|---|---|---|
| **Activity / Record** | Sub-class dari **Entity** | Catatan kejadian/peristiwa yang terikat pada entitas lain. |
| **Lifecycle Event** | Sub-class dari **Entity → Activity / Record** | Peristiwa perubahan status organisasi. |
| **Person Lifecycle Event** | Sub-class dari **Entity → Activity / Record** | Peristiwa perubahan status Person (misal: mutasi). |
| **Approval Record** | Sub-class dari **Entity → Activity / Record** | Catatan keputusan dalam workflow approval. |
| **Schedule Record** | Sub-class dari **Entity** | Data penjadwalan rutin. |
| **Attribute / Sub-record** | Sub-class dari **Entity** | Bagian dari entitas induk yang tidak memiliki lifecycle independen. |
| **Asset Subtype** | Sub-class dari **Entity** | Variasi tipe aset (Land, Building, Movable). |
| **Territory Data** | Sub-class dari **Entity** | Data titik geospasial (Risk, Potential). |
| **Document / Attachment** | Sub-class dari **Entity** | File yang menempel pada entitas induk, bukan entitas mandiri. |
| **Reference / Dataset** | Sub-class dari **Entity** | Data agregat/statistik yang menjadi bagian dari Capability. |
| **Organizational Role Record** | Sub-class dari **Role** | Riwayat jabatan struktural (Organizational Role) yang dipegang Person. |
| **System Identity** | Sub-class dari **User Account** | Kualifier untuk tabel `users` sebagai identitas sistem. |

### 1.3 System Internal — Technical Qualifiers

> **Koreksi v1.1.2 (P1-3):** Sub-qualifier di bawah `System Internal` secara eksplisit dideklarasikan sebagai **technical qualifiers**, bukan canonical classes dan bukan sub-canonical classes. Mereka tidak memiliki ontologi bisnis dan tidak boleh berkembang menjadi Business Entity.

**System Internal** adalah kelas untuk objek teknis internal sistem yang **tidak memiliki Business UX representation** kecuali secara eksplisit diekspos sebagai Utility.

| Technical Qualifier | Tabel | Penjelasan |
|---|---|---|
| *Auth Credential* | `m_webauthn_credentials` | Kredensial FIDO2/WebAuthn perangkat. |
| *Ephemeral* | `webauthn_challenges` | Challenge sementara (expired dalam detik). |
| *Device Token* | `m_push_subscription` | Token push notification PWA. |
| *Audit Trail* | `t_log_aktivitas` | Rekam jejak keamanan. |
| *Offline Sync Buffer* | `t_form_draft` | Penampungan draft form offline. |
| *System Log* | `sys_transaction_logs` | Log transaksi background queue. |
| *Telemetry* | `sys_telemetry` | Metrik performa PWA. |

> **Aturan:** Technical qualifiers ini bersifat deskriptif saja. Mereka tidak mengubah Primary Canonical Class (`System Internal`) dan tidak boleh dijadikan dasar untuk membuat Workspace, Section, atau Navigation.

---

## 2. Master Classification Matrix — 35 Tabel

### 2.1 Ringkasan Distribusi (Koreksi v1.1.2)

> **Koreksi P0-1:** Tabel organisasi kini diklasifikasikan sebagai **Primary Canonical Class = Entity** dengan **Secondary Conceptual Participation = Context**, bukan "dual canonical class".
>
> **Koreksi P1-2:** Domain count System & Sync = **4** (bukan 5). Total tetap **35**.

| Kelas Kanonis | Sub-Class | Jumlah | Tabel |
|---|---|---:|---|
| **Entity** *(primary)* + Context *(secondary)* | Organization Entity | 3 | `m_mupel`, `m_jemaat_induk`, `m_pos_pelkes` |
| **Person** (Business Identity) | — | 3 | `m_pendeta`, `t_pelayan`, `t_relawan` |
| **Assignment** (Scope Relationship) | — | 2 | `t_penugasan_pendeta`, `t_pj_jemaat` |
| **Role** | Organizational Role Record | 1 | `t_jabatan_struktural` |
| **Entity** *(primary)* | *(7 tabel — lihat breakdown)* | 7 | `t_log_pastoral`, `t_jadwal_ibadah`, `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`, `t_kerawanan_wilayah`, `t_potensi_wilayah` |
| **Entity** | Activity / Record | 3 | `t_histori_perubahan_status`, `t_riwayat_mutasi_pendeta`, `t_approval_bantuan` |
| **Entity** | Attribute / Sub-record | 3 | `t_keluarga_pendeta`, `t_kompetensi_pendeta`, `t_keterlibatan_pendeta` |
| **Entity** | Document / Attachment | 3 | `t_lampiran_aset`, `t_lampiran_kerawanan`, `t_lampiran_potensi` |
| **Entity** | Reference / Dataset | 1 | `t_demografi_pelkat` |
| **Transaction** | — | 1 | `t_pengajuan_bantuan` |
| **User Account** | System Identity | 1 | `users` |
| **System Internal** | *(technical qualifiers)* | 7 | `m_webauthn_credentials`, `webauthn_challenges`, `m_push_subscription`, `t_log_aktivitas`, `t_form_draft`, `sys_transaction_logs`, `sys_telemetry` |
| | | **35** | |

### 2.2 Matriks Klasifikasi Lengkap

> **Koreksi P0-1:** Kolom `Canonical Class` untuk 3 tabel organisasi kini menunjukkan **Entity** sebagai Primary Canonical Class, dengan **Context** sebagai Secondary Conceptual Participation.

| # | Tabel | Business Meaning | Primary Canonical Class | Secondary Participation | Sub-Class | Person Type? | Org Role? | System Role? | UX Responsibility |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `m_mupel` | Mupel — Regional Cluster | **Entity** | Context | Organization Entity | — | — | — | Organization Workspace (Mupel Instance) |
| 2 | `m_jemaat_induk` | Jemaat Induk — Local Church | **Entity** | Context | Organization Entity | — | — | — | Organization Workspace (Jemaat Instance) |
| 3 | `m_pos_pelkes` | Pos Pelkes / Bajem — Outpost | **Entity** | Context | Organization Entity | — | — | — | Organization Workspace (Pos Instance) |
| 4 | `t_histori_perubahan_status` | Riwayat elevasi status organisasi | **Entity** | — | Lifecycle Event | — | — | — | Organization Workspace → History Section |
| 5 | `users` | Akun pengguna terautentikasi | **User Account** | — | System Identity | — | — | ✓ (kolom `role`) | Account & System (Utility) |
| 6 | `m_webauthn_credentials` | Kredensial passkey biometrik | **System Internal** | — | *Auth Credential* | — | — | — | Account & System → Biometric |
| 7 | `webauthn_challenges` | Challenge sementara WebAuthn | **System Internal** | — | *Ephemeral* | — | — | — | System (tidak terlihat user) |
| 8 | `m_push_subscription` | Token push notification PWA | **System Internal** | — | *Device Token* | — | — | — | System (tidak terlihat user) |
| 9 | `m_pendeta` | Pendeta | **Person** | — | Ministry Identity: Pendeta | ✓ | — | — | Person Directory + Person Workspace |
| 10 | `t_pelayan` | Pelayan / Presbiter | **Person** | — | Ministry Identity: Pelayan | ✓ | — | — | Person Directory + Person Workspace |
| 11 | `t_relawan` | Relawan | **Person** | — | Ministry Identity: Relawan | ✓ | — | — | Person Directory + Person Workspace |
| 12 | `t_penugasan_pendeta` | Penugasan Pendeta ke Pos | **Assignment** | — | Scope Relationship | — | — | — | Person Workspace → Assignments; Org Workspace → Personnel |
| 13 | `t_pj_jemaat` | Penunjukan KMJ / PJ Jemaat | **Assignment** | — | Org Role Assignment | — | ✓ (KMJ/PJ) | — | Person Workspace → Assignments; Org Workspace → Leadership |
| 14 | `t_riwayat_mutasi_pendeta` | Riwayat mutasi antar jemaat | **Entity** | — | Person Lifecycle Event | — | — | — | Person Workspace → Transfer History |
| 15 | `t_jabatan_struktural` | Jabatan struktural di majelis/mupel/sinode | **Role** | — | Organizational Role Record | — | ✓ | — | Person Workspace → Structural Positions |
| 16 | `t_keluarga_pendeta` | Anggota keluarga pendeta | **Entity** | — | Attribute / Sub-record | — | — | — | Person Workspace → Family |
| 17 | `t_kompetensi_pendeta` | Sertifikasi & kompetensi pendeta | **Entity** | — | Attribute / Sub-record | — | — | — | Person Workspace → Competencies |
| 18 | `t_keterlibatan_pendeta` | Keterlibatan organisasi eksternal | **Entity** | — | Attribute / Sub-record | — | — | — | Person Workspace → External Involvement |
| 19 | `t_log_pastoral` | Log kegiatan pastoral | **Entity** | — | Activity / Record | — | — | — | Org Workspace → Pastoral Section; Person Workspace → Pastoral Activity |
| 20 | `t_jadwal_ibadah` | Jadwal ibadah rutin | **Entity** | — | Schedule Record | — | — | — | Org Workspace → Pastoral Section (Worship Schedule) |
| 21 | `t_aset_tanah` | Aset tanah | **Entity** | — | Asset Subtype: Land | — | — | — | Org Workspace → Assets Section |
| 22 | `t_aset_bangunan` | Aset bangunan | **Entity** | — | Asset Subtype: Building | — | — | — | Org Workspace → Assets Section |
| 23 | `t_aset_bergerak` | Aset bergerak / kendaraan | **Entity** | — | Asset Subtype: Movable | — | — | — | Org Workspace → Assets Section |
| 24 | `t_lampiran_aset` | File lampiran aset | **Entity** | — | Document / Attachment | — | — | — | Org Workspace → Assets Section → Asset Detail |
| 25 | `t_pengajuan_bantuan` | Pengajuan bantuan | **Transaction** | — | Aid Request | — | — | — | Org Workspace → Aid Section; Aid Review Queue (Projection) |
| 26 | `t_approval_bantuan` | Histori persetujuan bantuan | **Entity** | — | Approval Record | — | — | — | Aid Request Detail → Approval Timeline |
| 27 | `t_demografi_pelkat` | Statistik demografi per Pelkat | **Entity** | — | Reference / Dataset | — | — | — | Org Workspace → Demography Section |
| 28 | `t_kerawanan_wilayah` | Titik kerawanan wilayah | **Entity** | — | Territory Data: Risk | — | — | — | Org Workspace → Territory Section; Territory Map (Projection) |
| 29 | `t_lampiran_kerawanan` | Foto titik kerawanan | **Entity** | — | Document / Attachment | — | — | — | Org Workspace → Territory Section → Detail |
| 30 | `t_potensi_wilayah` | Titik potensi wilayah | **Entity** | — | Territory Data: Potential | — | — | — | Org Workspace → Territory Section; Territory Map (Projection) |
| 31 | `t_lampiran_potensi` | Foto titik potensi | **Entity** | — | Document / Attachment | — | — | — | Org Workspace → Territory Section → Detail |
| 32 | `t_log_aktivitas` | Audit trail aktivitas user | **System Internal** | — | *Audit Trail* | — | — | — | Account & System → Audit (Admin only) |
| 33 | `t_form_draft` | Buffer draft offline | **System Internal** | — | *Offline Sync Buffer* | — | — | — | Account & System → Sync Manager |
| 34 | `sys_transaction_logs` | Log transaksi sistem | **System Internal** | — | *System Log* | — | — | — | System (tidak terlihat user) |
| 35 | `sys_telemetry` | Telemetri performa | **System Internal** | — | *Telemetry* | — | — | — | System (tidak terlihat user) |

---

## 3. Detailed Classification by Domain

> **Koreksi P1-2:** Domain counts direkonsiliasi terhadap `entity_inventory.md`. System & Sync = **4 tabel** (bukan 5). Total = **35**.

### 3.1 Domain Hierarki Organisasi (4 tabel)

#### `m_mupel`, `m_jemaat_induk`, `m_pos_pelkes`

> **Primary Canonical Class: Entity**
> **Business Meaning: Organization Entity**
> **Secondary Conceptual Participation: Context**

Ketiga tabel ini memiliki **Primary Canonical Class = Entity** (sesuai CI-01). Namun secara konseptual, mereka juga berpartisipasi sebagai **Context** (execution scope). Partisipasi ini adalah **Secondary Conceptual Participation**, bukan dual canonical class.

```text
Physical Table: m_jemaat_induk
      │
      ├── Primary Canonical Class = Entity
      │     └── Business Concept = Organization Entity ("what is managed")
      │
      └── Secondary Conceptual Participation = Context
            └── Execution Scope ("where I operate")
```

> ⚠️ **VC-04 Guardrail:** Context ≠ Organization Entity. Keduanya berbagi sumber fisik yang sama, tetapi secara ontologis berbeda. Gate 3 harus mempertahankan pembedaan ini.

**Catatan tentang Bajem:** Bajem bukan tabel terpisah. Ia adalah subtype/status dari Pos Pelkes (`m_pos_pelkes.kategori = 'Bajem'`). Secara UX, Bajem adalah fase lifecycle, bukan entitas terpisah.

**UX Responsibility:** Organization Workspace (satu Workspace Type, banyak Instance sesuai Active Context — PR-07, VC-04).

#### `t_histori_perubahan_status`

> **Primary Canonical Class: Entity → Lifecycle Event**

Catatan riwayat elevasi status organisasi. Sub-class dari Entity.

**UX Responsibility:** Organization Workspace → History Section.

---

### 3.2 Domain Auth & Keamanan (4 tabel)

#### `users`

> **Primary Canonical Class: User Account → System Identity**

Ini adalah **User Account**, bukan Person. Ia adalah kunci masuk sistem, bukan orangnya.

> ⚠️ **PR-04 & VC-01 Guardrail:** `users` terhubung ke Person via relasi 0..1. Kolom `users.role` saat ini menampung **System Role**. Beberapa nilai kolom ini secara nominal mencampurkan System Role dan Person Type — ini adalah **temuan Gate 3**.

**UX Responsibility:** Account & System (Utility).

#### `m_webauthn_credentials`, `webauthn_challenges`, `m_push_subscription`

> **Primary Canonical Class: System Internal** *(technical qualifiers: Auth Credential, Ephemeral, Device Token)*

Objek teknis untuk autentikasi dan notifikasi. **Bukan** Business Entity.

**UX Responsibility:** Account & System → Biometric Settings (untuk credentials). Lainnya tidak terlihat langsung oleh user.

---

### 3.3 Domain SDM & Personel Pelayanan (3 tabel)

#### `m_pendeta`, `t_pelayan`, `t_relawan`

> **Primary Canonical Class: Person (Business Identity)**

Ketiga tabel ini merepresentasikan **Person** — satu Entity Family yang terfragmentasi secara fisik di database, tetapi secara konseptual adalah satu kelas.

| Tabel | Person Type / Ministry Identity |
|---|---|
| `m_pendeta` | Pendeta |
| `t_pelayan` | Pelayan / Presbiter (Penatua, Diaken) |
| `t_relawan` | Relawan |

> ⚠️ **VC-01 Guardrail:** Person Type (Pendeta/Pelayan/Relawan) adalah Ministry Identity, bukan Organizational Role dan bukan System Role.

**UX Responsibility:** Person Directory (unified catalog) + Person Workspace (role-specific progressive disclosure).

---

### 3.4 Domain Profil 360 Pendeta (7 tabel)

| Tabel | Primary Canonical Class | Sub-Class | Penjelasan |
|---|---|---|---|
| `t_penugasan_pendeta` | **Assignment** | Scope Relationship | Relasi Person ↔ Pos dalam periode tertentu. |
| `t_pj_jemaat` | **Assignment** | Org Role Assignment | Penunjukan Person sebagai KMJ/PJ. Mencatat Organizational Role. |
| `t_riwayat_mutasi_pendeta` | **Entity** | Person Lifecycle Event | Jejak perpindahan homebase Person. |
| `t_jabatan_struktural` | **Role** | Organizational Role Record | Riwayat Organizational Role yang dipegang Person. |
| `t_keluarga_pendeta` | **Entity** | Attribute / Sub-record | Atribut Person (keluarga). |
| `t_kompetensi_pendeta` | **Entity** | Attribute / Sub-record | Atribut Person (kompetensi). |
| `t_keterlibatan_pendeta` | **Entity** | Attribute / Sub-record | Atribut Person (keterlibatan eksternal). |

**UX Responsibility:** Semuanya menjadi section di dalam Person Workspace (progressive disclosure untuk Person Type: Pendeta).

---

### 3.5 Domain Operasional Pelayanan (2 tabel)

#### `t_log_pastoral`

> **Primary Canonical Class: Entity → Activity / Record**

**UX Responsibility (PR-06: One Entity, Multiple Entry Points):**
- Organization Workspace → Pastoral Section (entry point 1)
- Person Workspace → Pastoral Activity Section (entry point 2)

#### `t_jadwal_ibadah`

> **Primary Canonical Class: Entity → Schedule Record**

**UX Responsibility:** Organization Workspace → Pastoral Section (Worship Schedule).

---

### 3.6 Domain Inventaris & Aset (4 tabel)

#### `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`

> **Primary Canonical Class: Entity → Asset Subtype (Land / Building / Movable)**

> ⚠️ **VC-02 Guardrail:** Asset adalah Business Entity / Organization Capability, bukan Authorization Permission.

**UX Responsibility:** Organization Workspace → Assets & Property Section (Capability). Asset Detail adalah **View**, bukan Workspace.

#### `t_lampiran_aset`

> **Primary Canonical Class: Entity → Document / Attachment**

**UX Responsibility:** Organization Workspace → Assets Section → Asset Detail View.

---

### 3.7 Domain Bantuan & Workflow (2 tabel)

#### `t_pengajuan_bantuan`

> **Primary Canonical Class: Transaction**

> ⚠️ **PR-02 & ADR-03 Guardrail:** Transaction ≠ Workspace.

**UX Responsibility:**
- Organization Workspace → Aid Requests Section (transaction list) — entry point creator
- Aid Review Queue (Projection) — entry point approver
- Aid Request Detail (**Transaction View**, bukan node navigasi) — PR-06

#### `t_approval_bantuan`

> **Primary Canonical Class: Entity → Approval Record**

Catatan keputusan approval berjenjang. Bagian dari Transaction, bukan entitas mandiri.

```text
Transaction
└── t_pengajuan_bantuan
       │
       └── Approval Records
              └── t_approval_bantuan
```

**UX Responsibility:** Aid Request Detail View → Approval Timeline.

---

### 3.8 Domain Demografi & Geospasial (5 tabel)

#### `t_demografi_pelkat`

> **Primary Canonical Class: Entity → Reference / Dataset**

Data agregat statistik per Pelkat. Bukan Entity dengan lifecycle independen.

**UX Responsibility:** Organization Workspace → Demography Section (Capability).

#### `t_kerawanan_wilayah`, `t_potensi_wilayah`

> **Primary Canonical Class: Entity → Territory Data (Risk / Potential)**

**UX Responsibility:**
- Organization Workspace → Territory Section (Capability) — entry point 1
- Territory Map (Projection) — entry point 2 (PR-06)

#### `t_lampiran_kerawanan`, `t_lampiran_potensi`

> **Primary Canonical Class: Entity → Document / Attachment**

**UX Responsibility:** Organization Workspace → Territory Section → Detail View.

---

### 3.9 Domain System & Sync (4 tabel)

> **Koreksi P1-2:** Domain ini berisi **4 tabel**, bukan 5. Rekonsiliasi terhadap `entity_inventory.md` §9 (Log Aktivitas, Form Draft Offline, Sys Transaction Log, Sys Telemetry).

#### `t_log_aktivitas`

> **Primary Canonical Class: System Internal** *(technical qualifier: Audit Trail)*

**UX Responsibility:** Account & System → Audit (hanya untuk Admin/Super User).

#### `t_form_draft`

> **Primary Canonical Class: System Internal** *(technical qualifier: Offline Sync Buffer)*

**UX Responsibility:** Account & System → Sync Manager.

#### `sys_transaction_logs`, `sys_telemetry`

> **Primary Canonical Class: System Internal** *(technical qualifiers: System Log, Telemetry)*

Tidak terlihat oleh user. Tidak ada representasi UX langsung.

---

## 4. Special Models

### 4.1 Person Model (Unification)

```text
PERSON (Business Identity — unified Entity Family)
│
├── Person Type / Ministry Identity
│   ├── Pendeta        (dari m_pendeta)
│   ├── Pelayan/Presbiter — Penatua, Diaken  (dari t_pelayan)
│   └── Relawan        (dari t_relawan)
│
├── Organizational Role
│   ├── KMJ            (dari t_pj_jemaat, m_jemaat_induk.id_kmj, m_pendeta.is_kmj)
│   ├── PJ             (dari t_pj_jemaat, m_pendeta.is_pj)
│   └── Jabatan Struktural lain  (dari t_jabatan_struktural)
│
├── Assignment
│   ├── Penugasan ke Pos  (dari t_penugasan_pendeta)
│   └── Penunjukan KMJ/PJ (dari t_pj_jemaat)
│
├── Attributes (Entity → Attribute / Sub-record)
│   ├── Keluarga       (dari t_keluarga_pendeta)
│   ├── Kompetensi     (dari t_kompetensi_pendeta)
│   └── Keterlibatan   (dari t_keterlibatan_pendeta)
│
├── Activity / Record (Entity → Person Lifecycle Event)
│   ├── Riwayat Mutasi (dari t_riwayat_mutasi_pendeta)
│   └── Log Pastoral   (dari t_log_pastoral — cross-reference)
│
└── User Account (0..1)  ← dari users
    └── System Role      ← dari users.role
```

### 4.2 Context Model (Separation from Organization Entity)

> **Koreksi P0-1:** Model ini kini secara eksplisit menggunakan terminologi Primary Canonical Class dan Secondary Conceptual Participation, konsisten dengan CI-01.

```text
ORGANIZATION ENTITY                    CONTEXT
(Primary Canonical Class: Entity)      (Secondary Conceptual Participation)
─────────────────────────────────     ──────────────────────────────────
m_mupel       → Mupel sebagai objek ←→ Mupel sebagai scope kerja
m_jemaat_induk → Jemaat sebagai objek ←→ Jemaat sebagai scope kerja
m_pos_pelkes  → Pos sebagai objek    ←→ Pos sebagai scope kerja
```

> **Pernyataan kunci:** Ketiga tabel memiliki **Primary Canonical Class = Entity** dan **Secondary Conceptual Participation = Context**. CI-01 tetap terjaga: satu tabel memiliki tepat satu Primary Canonical Class. Context adalah partisipasi konseptual tambahan, bukan canonical class kedua.

### 4.3 Capability Model (VC-02)

| Capability | Entitas Pendukung | Section di Organization Workspace |
|---|---|---|
| **Pastoral Care** | `t_log_pastoral`, `t_jadwal_ibadah` | Pastoral |
| **Assets & Property** | `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`, `t_lampiran_aset` | Assets & Property |
| **Territory Intelligence** | `t_kerawanan_wilayah`, `t_potensi_wilayah`, lampiran terkait | Territory |
| **Aid & Workflow** | `t_pengajuan_bantuan`, `t_approval_bantuan` | Aid Requests |
| **Demography** | `t_demografi_pelkat` | Demography |
| **Personnel** | `t_pelayan`, `t_relawan`, `t_penugasan_pendeta` | SDM & Personnel |

> ⚠️ **VC-02 Guardrail:** Capability adalah konsep bisnis/organisasi, bukan Authorization Permission.

### 4.4 Workspace / Entity / Context — Tiga Konsep Berbeda

> **Klarifikasi v1.1.2:** Untuk mencegah pembaca Gate 3 menyamakan Workspace dengan Entity atau Context.

```text
Organization Entity          Context                    Organization Workspace
(Entity — business object)   (Execution Scope)          (UX Environment)
─────────────────────────   ──────────────────────     ──────────────────────
"what is managed"           "where I operate"          "where I work in the app"

m_mupel                     Mupel Context              Organization Workspace
m_jemaat_induk              Jemaat Context               → Mupel Instance
m_pos_pelkes                Pos Context                  → Jemaat Instance
                                                         → Pos Instance
```

> **Aturan:** Workspace adalah **UX environment** (tempat user berinteraksi). Entity adalah **business object** (apa yang dikelola). Context adalah **execution scope** (di mana user bekerja). Ketiganya tidak boleh disamakan.

---

## 5. Classification Invariants

| Invariant | Rule |
|---|---|
| **CI-01** | One physical table has exactly one **Primary** Canonical Class. |
| **CI-02** | Supporting Sub-Class cannot override its Canonical Class. |
| **CI-03** | One Person may have multiple Person Types/roles/assignments where permitted by business rules. |
| **CI-04** | Organization Entity and Context may share physical source but remain distinct UX concepts. Context is a **Secondary Conceptual Participation**, not a second Primary Canonical Class. |
| **CI-05** | No Transaction becomes Workspace. |
| **CI-06** | No Projection becomes Entity or Place. |
| **CI-07** | Capability is not Permission. |
| **CI-08** | System Internal has no direct Business UX representation unless explicitly exposed as a Utility. |
| **CI-09** | A physical database table has one primary canonical classification; UX concepts may aggregate multiple physical tables, and a physical table may participate in more than one conceptual responsibility only where explicitly declared as Secondary Conceptual Participation. |
| **CI-10** | Technical qualifiers under System Internal are descriptive labels, not canonical or sub-canonical classes. They do not create new ontological categories. |

---

## 6. UX Responsibility Summary

### 6.1 Mapping ke Workspace / Section / View / Projection

> **Koreksi v1.1.2:** Istilah "Asset Entity" diganti menjadi **Entity → Asset Subtype** untuk konsistensi terminologi dengan taxonomy.

| Canonical Class | UX Responsibility | Contoh |
|---|---|---|
| **Entity** (Organization) + Context | Organization Workspace (Instance sesuai Active Context) | Mupel/Jemaat/Pos Instance |
| **Person** | Person Directory + Person Workspace | Pendeta/Pelayan/Relawan |
| **Entity → Asset Subtype** | Org Workspace → Assets Section → Asset Detail View | Tanah/Bangunan/Bergerak |
| **Entity → Activity / Record** (Pastoral) | Org Workspace → Pastoral Section; Person Workspace → Pastoral Activity | Log Pastoral |
| **Entity → Schedule Record** | Org Workspace → Pastoral Section (Worship Schedule) | Jadwal Ibadah |
| **Entity → Territory Data** | Org Workspace → Territory Section; Territory Map (Projection) | Kerawanan, Potensi |
| **Entity → Reference / Dataset** | Org Workspace → Demography Section | Demografi Pelkat |
| **Transaction** | Org Workspace → Aid Section; Aid Review Queue (Projection); Aid Request Detail View | Pengajuan Bantuan |
| **Entity → Approval Record** | Aid Request Detail View → Approval Timeline | Approval Bantuan |
| **Assignment** | Person Workspace → Assignments; Org Workspace → Personnel | Penugasan, KMJ/PJ |
| **Entity → Attribute / Sub-record** | Person Workspace → section terkait | Keluarga, Kompetensi, Keterlibatan |
| **Entity → Document / Attachment** | Detail View entitas induk | Lampiran Aset, Kerawanan, Potensi |
| **Entity → Lifecycle Event** | Organization Workspace → History Section | Histori Status |
| **Entity → Person Lifecycle Event** | Person Workspace → Transfer History | Riwayat Mutasi |
| **Role → Organizational Role Record** | Person Workspace → Structural Positions | Jabatan Struktural |
| **User Account → System Identity** | Account & System (Utility) | User Account |
| **System Internal** | Account & System atau tidak terlihat | Credentials, Logs, Drafts, Telemetry |

### 6.2 Navigation Consequence

| Kelas | Boleh jadi Primary Nav? | Boleh jadi Workspace? | Boleh jadi Projection? |
|---|---|---|---|
| Entity (Organization) + Context | ✓ (slot Organisasi) | ✓ (Organization Workspace) | — |
| Person | ✓ (slot SDM → Person Directory) | ✓ (Person Workspace) | — |
| Entity → Asset Subtype | ✗ | ✗ | ✓ (Asset Intelligence) |
| Transaction | ✗ | ✗ | ✓ (Aid Review Queue) |
| Entity → Territory Data | ✗ | ✗ | ✓ (Territory Map) |
| User Account | ✓ (slot Akun & Sistem, sebagai Utility) | ✗ | — |

---

## 7. Acceptance Criteria Compliance Checklist

| # | Kriteria | Status | Bukti |
|---|---|---|---|
| 1 | Seluruh 35 tabel telah memiliki klasifikasi | ✅ | §2.2 Master Matrix |
| 2 | Tidak ada tabel yang otomatis dianggap Workspace | ✅ | Asset → Section; Aid → Transaction |
| 3 | Person tetap unified | ✅ | §4.1 |
| 4 | User Account tetap terpisah dari Person | ✅ | §3.2 |
| 5 | Context tidak disamakan dengan Organization Entity | ✅ | §4.2 — Primary = Entity, Secondary = Context |
| 6 | Transaction tidak berubah menjadi Workspace | ✅ | §3.7 |
| 7 | Projection tidak berubah menjadi Place/Workspace | ✅ | §6.2 |
| 8 | Capability tidak tercampur dengan Permission | ✅ | §4.3 |
| 9 | Person Type, Org Role, System Role, Assignment tetap terpisah | ✅ | §4.1 |
| 10 | Setiap klasifikasi traceable ke Dokumen 05 | ✅ | §1.1 |
| 11 | Tidak ada keputusan RBAC/RLS yang diselundupkan | ✅ | Semua reference ke permission ditandai "Gate 3" |
| 12 | Hasil dapat menjadi input bersih untuk Gate 3 | ✅ | §8 Gate 3 Readiness |

---

## 8. Gate 3 Readiness Notes

| Item | Status di Dokumen 02 | Ditangani di Gate 3 |
|---|---|---|
| Person Type vs Org Role vs System Role | Terpisah secara ontologis (§4.1) | Formalisasi Role Model & matriks |
| Context hierarchy & inheritance | Primary/Secondary dijelaskan (§4.2) | Context Hierarchy Rules |
| Capability vs Permission | Terpisah (§4.3) | Permission Boundary & Action Authorization |
| Kolom `users.role` yang mencampur System Role dan Person Type | **Ditandai sebagai temuan** (§3.2) | Role Model cleanup |
| Assignment semantics | Terklasifikasi sebagai Assignment | Assignment Model formalisasi |
| Cross-context access (LogPastoral di 2 workspace) | Dicatat sebagai PR-06 multi-entry | Cross-Context Access rules |

---

## 9. Change Log

| Versi | Tanggal | Perubahan |
|---|---|---|
| v1.0 | 2026 (sebelumnya) | Audit klasifikasi awal dengan 7 UX Entity utama. |
| v1.1 | 2026-07-14 | Rewrite penuh berdasarkan Gate 2 Freeze Package. |
| v1.1.1 | 2026-07-14 | Consistency Correction Pass (7 P0 + 2 P1). |
| **v1.1.2** | **2026-07-14** | **Final Correction Pass (3 items):** |
| | | **P0-1:** CI-01 representation resolved. Tabel organisasi kini: Primary Canonical Class = Entity, Secondary Conceptual Participation = Context. Bukan "dual canonical class". CI-01 dan CI-04 diperjelas. |
| | | **P1-2:** Domain counts direkonsiliasi terhadap `entity_inventory.md`. System & Sync = 4 (bukan 5). Total = 35. |
| | | **P1-3:** System Internal sub-qualifiers (Auth Credential, Ephemeral, Device Token, Audit Trail, Offline Sync Buffer, System Log, Telemetry) secara eksplisit dideklarasikan sebagai **technical qualifiers**, bukan canonical/sub-canonical classes. CI-10 ditambahkan. |
| | | **Editorial:** Istilah "Asset Entity" → "Entity → Asset Subtype" di §6.1. Klarifikasi Workspace ≠ Entity ≠ Context di §4.4. |

---
