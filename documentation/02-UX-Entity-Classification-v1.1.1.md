# 02 — UX Entity Classification v1.1.1 (Correction Pass)

| Field | Value |
|---|---|
| **Dokumen** | `02-UX-Entity-Classification-v1.1.1.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2 Freeze Package) |
| **Status** | 🔄 `REVISED` — Correction pass berdasarkan review Principal Architect |
| **Ontological Authority** | `05-UX-Canonical-Model-v1.0.md` (FROZEN) |
| **Consistency Constraints** | `03-UX-Architecture-Decision-Log-v1.0.md` · `04-UX-Architecture-Principles-v1.0.md` · VC-01 s.d. VC-05 |
| **Sumber Data** | `entity_inventory.md` (35 entitas) · `current_state_inventory.md` (35 tabel) |
| **Peran Dokumen** | **WHAT each database table means as a business concept** — jembatan dari struktur fisik database ke ontologi UX. |
| **Versi** | v1.1.1 — Consistency Correction (bukan perubahan arsitektur) |

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

> **⚠️ GUARDRAIL (ditambahkan per review Principal Architect):**
>
> **A physical database table has one primary canonical classification; UX concepts may aggregate multiple physical tables, and a physical table may participate in more than one conceptual responsibility only where explicitly declared (e.g., Organization Entity + Context).**
>
> Contoh agregasi:
> ```text
> m_pendeta ─────┐
> t_pelayan ────┼──→ PERSON (satu konsep kanonis)
> t_relawan ────┘
> ```
>
> Contoh dual participation (harus dideklarasikan eksplisit):
> ```text
> m_jemaat_induk
>        ├──→ Organization Entity ("what is managed")
>        └──→ Context Source ("where I operate")
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

> **Catatan koreksi v1.1.1:** Seluruh kelas pendukung secara eksplisit dideklarasikan sebagai sub-class dari kelas kanonis induknya. Tidak ada kelas pendukung yang berdiri sendiri tanpa induk kanonis.

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
| **System Internal** | Tidak memiliki Business UX representation | Objek teknis internal sistem. |

> **Koreksi v1.1.1:** `Role Record` kini secara eksplisit dideklarasikan sebagai **Organizational Role Record**, sub-class dari **Role**. `System Identity` kini menjadi sub-class/qualifier dari **User Account**, bukan kelas terpisah.

---

## 2. Master Classification Matrix — 35 Tabel

### 2.1 Ringkasan Distribusi (Koreksi v1.1.1)

| Kelas Kanonis | Sub-Class | Jumlah | Tabel |
|---|---|---:|---|
| **Organization Entity + Context** (dual) | — | 3 | `m_mupel`, `m_jemaat_induk`, `m_pos_pelkes` |
| **Person** (Business Identity) | — | 3 | `m_pendeta`, `t_pelayan`, `t_relawan` |
| **Assignment** (Scope Relationship) | — | 2 | `t_penugasan_pendeta`, `t_pj_jemaat` |
| **Role** | Organizational Role Record | 1 | `t_jabatan_struktural` |
| **Entity** | *(primary — lihat breakdown di bawah)* | 7 | `t_log_pastoral`, `t_jadwal_ibadah`, `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`, `t_kerawanan_wilayah`, `t_potensi_wilayah` |
| **Entity** | Activity / Record | 3 | `t_histori_perubahan_status`, `t_riwayat_mutasi_pendeta`, `t_approval_bantuan` |
| **Entity** | Attribute / Sub-record | 3 | `t_keluarga_pendeta`, `t_kompetensi_pendeta`, `t_keterlibatan_pendeta` |
| **Entity** | Document / Attachment | 3 | `t_lampiran_aset`, `t_lampiran_kerawanan`, `t_lampiran_potensi` |
| **Entity** | Reference / Dataset | 1 | `t_demografi_pelkat` |
| **Transaction** | — | 1 | `t_pengajuan_bantuan` |
| **User Account** | System Identity | 1 | `users` |
| **System Internal** | — | 7 | `m_webauthn_credentials`, `webauthn_challenges`, `m_push_subscription`, `t_log_aktivitas`, `t_form_draft`, `sys_transaction_logs`, `sys_telemetry` |
| | | **35** | |

> **Koreksi v1.1.1 dari v1.1:**
> - Entity: 8 → **7** (`t_demografi_pelkat` dipindahkan ke Reference / Dataset)
> - Document / Attachment: 4 → **3** (`t_keluarga_pendeta` tetap sebagai Attribute / Sub-record)
> - System Internal: 5 → **7** (menambahkan `sys_transaction_logs` dan `sys_telemetry` yang sebelumnya terlewat)
> - `t_demografi_pelkat` dihapus dari daftar Entity dan footnote `*` dihapus
> - `t_keluarga_pendeta` dihapus dari daftar Document / Attachment
> - `Role Record` diformalkan sebagai sub-class dari `Role`
> - `System Identity` menjadi sub-class dari `User Account`
> - Seluruh Activity / Record diseragamkan sebagai sub-class dari Entity

### 2.2 Matriks Klasifikasi Lengkap

| # | Tabel | Business Meaning | Canonical Class | Sub-Class | Person Type? | Org Role? | System Role? | UX Responsibility |
|---|---|---|---|---|---|---|---|---|
| 1 | `m_mupel` | Mupel — Regional Cluster | **Organization Entity + Context** | — | — | — | — | Organization Workspace (Mupel Instance) |
| 2 | `m_jemaat_induk` | Jemaat Induk — Local Church | **Organization Entity + Context** | — | — | — | — | Organization Workspace (Jemaat Instance) |
| 3 | `m_pos_pelkes` | Pos Pelkes / Bajem — Outpost | **Organization Entity + Context** | — | — | — | — | Organization Workspace (Pos Instance) |
| 4 | `t_histori_perubahan_status` | Riwayat elevasi status organisasi | **Entity** | Lifecycle Event | — | — | — | Organization Workspace → History Section |
| 5 | `users` | Akun pengguna terautentikasi | **User Account** | System Identity | — | — | ✓ (kolom `role`) | Account & System (Utility) |
| 6 | `m_webauthn_credentials` | Kredensial passkey biometrik | **System Internal** | Auth Credential | — | — | — | Account & System → Biometric |
| 7 | `webauthn_challenges` | Challenge sementara WebAuthn | **System Internal** | Ephemeral | — | — | — | System (tidak terlihat user) |
| 8 | `m_push_subscription` | Token push notification PWA | **System Internal** | Device Token | — | — | — | System (tidak terlihat user) |
| 9 | `m_pendeta` | Pendeta | **Person** | Ministry Identity: Pendeta | ✓ | — | — | Person Directory + Person Workspace |
| 10 | `t_pelayan` | Pelayan / Presbiter | **Person** | Ministry Identity: Pelayan | ✓ | — | — | Person Directory + Person Workspace |
| 11 | `t_relawan` | Relawan | **Person** | Ministry Identity: Relawan | ✓ | — | — | Person Directory + Person Workspace |
| 12 | `t_penugasan_pendeta` | Penugasan Pendeta ke Pos | **Assignment** | Scope Relationship | — | — | — | Person Workspace → Assignments; Org Workspace → Personnel |
| 13 | `t_pj_jemaat` | Penunjukan KMJ / PJ Jemaat | **Assignment** | Org Role Assignment | — | ✓ (KMJ/PJ) | — | Person Workspace → Assignments; Org Workspace → Leadership |
| 14 | `t_riwayat_mutasi_pendeta` | Riwayat mutasi antar jemaat | **Entity** | Person Lifecycle Event | — | — | — | Person Workspace → Transfer History |
| 15 | `t_jabatan_struktural` | Jabatan struktural di majelis/mupel/sinode | **Role** | Organizational Role Record | — | ✓ | — | Person Workspace → Structural Positions |
| 16 | `t_keluarga_pendeta` | Anggota keluarga pendeta | **Entity** | Attribute / Sub-record | — | — | — | Person Workspace → Family |
| 17 | `t_kompetensi_pendeta` | Sertifikasi & kompetensi pendeta | **Entity** | Attribute / Sub-record | — | — | — | Person Workspace → Competencies |
| 18 | `t_keterlibatan_pendeta` | Keterlibatan organisasi eksternal | **Entity** | Attribute / Sub-record | — | — | — | Person Workspace → External Involvement |
| 19 | `t_log_pastoral` | Log kegiatan pastoral | **Entity** | Activity / Record | — | — | — | Org Workspace → Pastoral Section; Person Workspace → Pastoral Activity |
| 20 | `t_jadwal_ibadah` | Jadwal ibadah rutin | **Entity** | Schedule Record | — | — | — | Org Workspace → Pastoral Section (Worship Schedule) |
| 21 | `t_aset_tanah` | Aset tanah | **Entity** | Asset Subtype: Land | — | — | — | Org Workspace → Assets Section |
| 22 | `t_aset_bangunan` | Aset bangunan | **Entity** | Asset Subtype: Building | — | — | — | Org Workspace → Assets Section |
| 23 | `t_aset_bergerak` | Aset bergerak / kendaraan | **Entity** | Asset Subtype: Movable | — | — | — | Org Workspace → Assets Section |
| 24 | `t_lampiran_aset` | File lampiran aset | **Entity** | Document / Attachment | — | — | — | Org Workspace → Assets Section → Asset Detail |
| 25 | `t_pengajuan_bantuan` | Pengajuan bantuan | **Transaction** | Aid Request | — | — | — | Org Workspace → Aid Section; Aid Review Queue (Projection) |
| 26 | `t_approval_bantuan` | Histori persetujuan bantuan | **Entity** | Approval Record | — | — | — | Aid Request Detail → Approval Timeline |
| 27 | `t_demografi_pelkat` | Statistik demografi per Pelkat | **Entity** | Reference / Dataset | — | — | — | Org Workspace → Demography Section |
| 28 | `t_kerawanan_wilayah` | Titik kerawanan wilayah | **Entity** | Territory Data: Risk | — | — | — | Org Workspace → Territory Section; Territory Map (Projection) |
| 29 | `t_lampiran_kerawanan` | Foto titik kerawanan | **Entity** | Document / Attachment | — | — | — | Org Workspace → Territory Section → Detail |
| 30 | `t_potensi_wilayah` | Titik potensi wilayah | **Entity** | Territory Data: Potential | — | — | — | Org Workspace → Territory Section; Territory Map (Projection) |
| 31 | `t_lampiran_potensi` | Foto titik potensi | **Entity** | Document / Attachment | — | — | — | Org Workspace → Territory Section → Detail |
| 32 | `t_log_aktivitas` | Audit trail aktivitas user | **System Internal** | Audit Trail | — | — | — | Account & System → Audit (Admin only) |
| 33 | `t_form_draft` | Buffer draft offline | **System Internal** | Offline Sync Buffer | — | — | — | Account & System → Sync Manager |
| 34 | `sys_transaction_logs` | Log transaksi sistem | **System Internal** | System Log | — | — | — | System (tidak terlihat user) |
| 35 | `sys_telemetry` | Telemetri performa | **System Internal** | Telemetry | — | — | — | System (tidak terlihat user) |

---

## 3. Detailed Classification by Domain

### 3.1 Domain Hierarki Organisasi (4 tabel)

#### `m_mupel`, `m_jemaat_induk`, `m_pos_pelkes`

> **Klasifikasi: Organization Entity + Context (dual role)**

Ketiga tabel ini memiliki **peran ganda** yang harus dibedakan secara konseptual:

| Peran | Penjelasan |
|---|---|
| **Organization Entity** | Objek bisnis dengan identitas, lifecycle, dan atribut. *"What is managed."* |
| **Context (Execution Scope)** | Lingkup kerja di mana user beroperasi dan data diisolasi. *"Where I operate."* |

> ⚠️ **VC-04 Guardrail:** Context ≠ Organization Entity. Keduanya berbagi hierarki fisik yang sama, tetapi secara ontologis berbeda. Gate 3 harus mempertahankan pembedaan ini.

```text
                 ┌──────────────────────┐
                 │ Organization Entity  │
                 │ "what is managed"    │
                 └──────────┬───────────┘
                            │
                     same physical
                         source
                            │
                 ┌──────────▼───────────┐
                 │      Context         │
                 │ "where I operate"    │
                 └──────────────────────┘
```

**Catatan tentang Bajem:** Bajem bukan tabel terpisah. Ia adalah subtype/status dari Pos Pelkes (`m_pos_pelkes.kategori = 'Bajem'`). Secara UX, Bajem adalah fase lifecycle, bukan entitas terpisah.

**UX Responsibility:** Organization Workspace (satu Workspace Type, banyak Instance sesuai Active Context — PR-07, VC-04).

#### `t_histori_perubahan_status`

> **Klasifikasi: Entity → Lifecycle Event**

Catatan riwayat elevasi status organisasi. Sub-class dari Entity.

**UX Responsibility:** Organization Workspace → History Section.

---

### 3.2 Domain Auth & Keamanan (4 tabel)

#### `users`

> **Klasifikasi: User Account → System Identity**

Ini adalah **User Account**, bukan Person. Ia adalah kunci masuk sistem, bukan orangnya.

> ⚠️ **PR-04 & VC-01 Guardrail:** `users` terhubung ke Person via relasi 0..1. Kolom `users.role` saat ini menampung **System Role** (super_user, admin_mupel, kmj, pj, pendeta, pelayan, relawan, user). Beberapa nilai kolom ini secara nominal mencampurkan System Role dan Person Type — ini adalah **temuan Gate 3**, bukan sesuatu yang diselesaikan di dokumen ini.

**UX Responsibility:** Account & System (Utility).

#### `m_webauthn_credentials`, `webauthn_challenges`, `m_push_subscription`

> **Klasifikasi: System Internal**

Objek teknis untuk autentikasi dan notifikasi. **Bukan** Business Entity.

**UX Responsibility:** Account & System → Biometric Settings (untuk credentials). Lainnya tidak terlihat langsung oleh user.

---

### 3.3 Domain SDM & Personel Pelayanan (3 tabel)

#### `m_pendeta`, `t_pelayan`, `t_relawan`

> **Klasifikasi: Person (Business Identity)**

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

| Tabel | Canonical Class | Sub-Class | Penjelasan |
|---|---|---|---|
| `t_penugasan_pendeta` | **Assignment** | Scope Relationship | Relasi Person ↔ Pos dalam periode tertentu. |
| `t_pj_jemaat` | **Assignment** | Org Role Assignment | Penunjukan Person sebagai KMJ/PJ. Mencatat Organizational Role. |
| `t_riwayat_mutasi_pendeta` | **Entity** | Person Lifecycle Event | Jejak perpindahan homebase Person. |
| `t_jabatan_struktural` | **Role** | Organizational Role Record | Riwayat Organizational Role yang dipegang Person. |
| `t_keluarga_pendeta` | **Entity** | Attribute / Sub-record | Atribut Person (keluarga). |
| `t_kompetensi_pendeta` | **Entity** | Attribute / Sub-record | Atribut Person (kompetensi). |
| `t_keterlibatan_pendeta` | **Entity** | Attribute / Sub-record | Atribut Person (keterlibatan eksternal). |

> **Koreksi v1.1.1:** `t_jabatan_struktural` kini diklasifikasikan sebagai **Role → Organizational Role Record** (bukan "Role Record" sebagai kelas terpisah). `t_riwayat_mutasi_pendeta` kini diklasifikasikan sebagai **Entity → Person Lifecycle Event** (diseragamkan dengan pola Activity / Record sebagai sub-class Entity).

**UX Responsibility:** Semuanya menjadi section di dalam Person Workspace (progressive disclosure untuk Person Type: Pendeta).

---

### 3.5 Domain Operasional Pelayanan (2 tabel)

#### `t_log_pastoral`

> **Klasifikasi: Entity → Activity / Record**

Catatan kegiatan pastoral. Memiliki identitas, tanggal, jenis kegiatan, dan terikat pada dua entitas: Pos (Context) dan Pendeta (Person).

**UX Responsibility (PR-06: One Entity, Multiple Entry Points):**
- Organization Workspace → Pastoral Section (entry point 1)
- Person Workspace → Pastoral Activity Section (entry point 2)

#### `t_jadwal_ibadah`

> **Klasifikasi: Entity → Schedule Record**

Jadwal ibadah rutin di Pos. Terikat pada Pos (Context).

**UX Responsibility:** Organization Workspace → Pastoral Section (Worship Schedule).

---

### 3.6 Domain Inventaris & Aset (4 tabel)

#### `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`

> **Klasifikasi: Entity → Asset Subtype (Land / Building / Movable)**

> ⚠️ **VC-02 Guardrail:** Asset adalah Business Entity / Organization Capability, bukan Authorization Permission.

**UX Responsibility:** Organization Workspace → Assets & Property Section (Capability). Asset Detail adalah **View**, bukan Workspace.

#### `t_lampiran_aset`

> **Klasifikasi: Entity → Document / Attachment**

File lampiran yang menempel pada Asset. Bukan entitas mandiri.

**UX Responsibility:** Organization Workspace → Assets Section → Asset Detail View.

---

### 3.7 Domain Bantuan & Workflow (2 tabel)

#### `t_pengajuan_bantuan`

> **Klasifikasi: Transaction**

> ⚠️ **PR-02 & ADR-03 Guardrail:** Transaction ≠ Workspace.

**UX Responsibility:**
- Organization Workspace → Aid Requests Section (transaction list) — entry point creator
- Aid Review Queue (Projection) — entry point approver
- Aid Request Detail (**Transaction View**, bukan node navigasi) — PR-06

#### `t_approval_bantuan`

> **Klasifikasi: Entity → Approval Record**

Catatan keputusan approval berjenjang. Bagian dari Transaction, bukan entitas mandiri.

**UX Responsibility:** Aid Request Detail View → Approval Timeline.

---

### 3.8 Domain Demografi & Geospasial (5 tabel)

#### `t_demografi_pelkat`

> **Klasifikasi: Entity → Reference / Dataset**

Data agregat statistik per Pelkat. Bukan Entity dengan lifecycle independen, melainkan dataset yang menjadi bagian dari Demography Capability.

> **Koreksi v1.1.1:** `t_demografi_pelkat` secara eksplisit diklasifikasikan sebagai **Reference / Dataset**, bukan Entity mandiri. Footnote `*` dari v1.1 dihapus.

**UX Responsibility:** Organization Workspace → Demography Section (Capability).

#### `t_kerawanan_wilayah`, `t_potensi_wilayah`

> **Klasifikasi: Entity → Territory Data (Risk / Potential)**

**UX Responsibility:**
- Organization Workspace → Territory Section (Capability) — entry point 1
- Territory Map (Projection) — entry point 2 (PR-06)

#### `t_lampiran_kerawanan`, `t_lampiran_potensi`

> **Klasifikasi: Entity → Document / Attachment**

**UX Responsibility:** Organization Workspace → Territory Section → Detail View.

---

### 3.9 Domain System & Sync (5 tabel)

#### `t_log_aktivitas`

> **Klasifikasi: System Internal → Audit Trail**

**UX Responsibility:** Account & System → Audit (hanya untuk Admin/Super User).

#### `t_form_draft`

> **Klasifikasi: System Internal → Offline Sync Buffer**

**UX Responsibility:** Account & System → Sync Manager.

#### `sys_transaction_logs`, `sys_telemetry`

> **Klasifikasi: System Internal**

Tidak terlihat oleh user. Tidak ada representasi UX langsung.

---

## 4. Special Models

### 4.1 Person Model (Unification)

> **Koreksi v1.1.1:** `Riwayat Mutasi` dipindahkan dari Attributes ke Activity / Record, konsisten dengan Master Matrix #14.

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

> **Tidak berubah dari v1.1.** Model dual role Organization Entity + Context dipertahankan sesuai arahan Principal Architect.

```text
ORGANIZATION ENTITY (Business Object)          CONTEXT (Execution Scope)
─────────────────────────────────────         ──────────────────────────
m_mupel       → Mupel sebagai objek   ←→      Mupel sebagai scope kerja
m_jemaat_induk → Jemaat sebagai objek  ←→     Jemaat sebagai scope kerja
m_pos_pelkes  → Pos sebagai objek     ←→      Pos sebagai scope kerja
```

### 4.3 Capability Model (VC-02)

> **Tidak berubah dari v1.1.** Capability tetap sebagai section di Organization Workspace, bukan navigation menu dan bukan Permission.

| Capability | Entitas Pendukung | Section di Organization Workspace |
|---|---|---|
| **Pastoral Care** | `t_log_pastoral`, `t_jadwal_ibadah` | Pastoral |
| **Assets & Property** | `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`, `t_lampiran_aset` | Assets & Property |
| **Territory Intelligence** | `t_kerawanan_wilayah`, `t_potensi_wilayah`, lampiran terkait | Territory |
| **Aid & Workflow** | `t_pengajuan_bantuan`, `t_approval_bantuan` | Aid Requests |
| **Demography** | `t_demografi_pelkat` | Demography |
| **Personnel** | `t_pelayan`, `t_relawan`, `t_penugasan_pendeta` | SDM & Personnel |

---

## 5. Classification Invariants (Baru — v1.1.1)

> **Ditambahkan per review Principal Architect (P1).**

| Invariant | Rule |
|---|---|
| **CI-01** | One physical table has exactly one primary Canonical Class. |
| **CI-02** | Supporting Sub-Class cannot override its Canonical Class. |
| **CI-03** | One Person may have multiple Person Types/roles/assignments where permitted by business rules. |
| **CI-04** | Organization Entity and Context may share physical source but remain distinct UX concepts. |
| **CI-05** | No Transaction becomes Workspace. |
| **CI-06** | No Projection becomes Entity or Place. |
| **CI-07** | Capability is not Permission. |
| **CI-08** | System Internal has no direct Business UX representation unless explicitly exposed as a Utility. |
| **CI-09** | A physical database table has one primary canonical classification; UX concepts may aggregate multiple physical tables, and a physical table may participate in more than one conceptual responsibility only where explicitly declared (e.g., Organization Entity + Context). |

> **CI-01 adalah invariant paling kritis.** Begitu aturan ini ada, kesalahan seperti `t_keluarga_pendeta → Attribute + Document` atau `t_demografi_pelkat → Entity + Dataset` langsung dianggap invalid.

---

## 6. UX Responsibility Summary

### 6.1 Mapping ke Workspace / Section / View / Projection

| Canonical Class | UX Responsibility | Contoh |
|---|---|---|
| **Organization Entity** | Organization Workspace (Instance sesuai Active Context) | Mupel/Jemaat/Pos Instance |
| **Person** | Person Directory + Person Workspace | Pendeta/Pelayan/Relawan |
| **Asset Entity** | Org Workspace → Assets Section → Asset Detail View | Tanah/Bangunan/Bergerak |
| **Pastoral Entity** | Org Workspace → Pastoral Section; Person Workspace → Pastoral Activity | Log Pastoral, Jadwal Ibadah |
| **Territory Entity** | Org Workspace → Territory Section; Territory Map (Projection) | Kerawanan, Potensi |
| **Demography Dataset** | Org Workspace → Demography Section | Demografi Pelkat |
| **Transaction** | Org Workspace → Aid Section; Aid Review Queue (Projection); Aid Request Detail View | Pengajuan Bantuan |
| **Assignment** | Person Workspace → Assignments; Org Workspace → Personnel | Penugasan, KMJ/PJ |
| **Attribute / Sub-record** | Person Workspace → section terkait | Keluarga, Kompetensi, Keterlibatan |
| **Document / Attachment** | Detail View entitas induk | Lampiran Aset, Kerawanan, Potensi |
| **Activity / Record** | Section entitas induk | Riwayat Mutasi, Histori Status, Approval |
| **Role (Org Role Record)** | Person Workspace → Structural Positions | Jabatan Struktural |
| **User Account** | Account & System (Utility) | User Account |
| **System Internal** | Account & System atau tidak terlihat | Credentials, Logs, Drafts, Telemetry |

### 6.2 Navigation Consequence

| Kelas | Boleh jadi Primary Nav? | Boleh jadi Workspace? | Boleh jadi Projection? |
|---|---|---|---|
| Organization Entity | ✓ (slot Organisasi) | ✓ (Organization Workspace) | — |
| Person | ✓ (slot SDM → Person Directory) | ✓ (Person Workspace) | — |
| Asset Entity | ✗ | ✗ | ✓ (Asset Intelligence) |
| Transaction | ✗ | ✗ | ✓ (Aid Review Queue) |
| Territory Entity | ✗ | ✗ | ✓ (Territory Map) |
| User Account | ✓ (slot Akun & Sistem, sebagai Utility) | ✗ | — |

---

## 7. Acceptance Criteria Compliance Checklist

| # | Kriteria | Status | Bukti |
|---|---|---|---|
| 1 | Seluruh 35 tabel telah memiliki klasifikasi | ✅ | §2.2 Master Matrix |
| 2 | Tidak ada tabel yang otomatis dianggap Workspace | ✅ | Asset → Section; Aid → Transaction |
| 3 | Person tetap unified | ✅ | §4.1 |
| 4 | User Account tetap terpisah dari Person | ✅ | §3.2 |
| 5 | Context tidak disamakan dengan Organization Entity | ✅ | §4.2 |
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
| Context hierarchy & inheritance | Dual role dijelaskan (§4.2) | Context Hierarchy Rules |
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
| **v1.1.1** | **2026-07-14** | **Consistency Correction Pass (7 P0 + 2 P1):** |
| | | **P0-1:** §2.1 distribution diperbaiki: Entity 8→7, Document 4→3, System Internal 5→7. |
| | | **P0-2:** `t_demografi_pelkat` dihapus dari daftar Entity; footnote `*` dihapus. |
| | | **P0-3:** `t_keluarga_pendeta` dihapus dari Document / Attachment; tetap sebagai Attribute / Sub-record. |
| | | **P0-4:** `Role Record` diformalkan sebagai **Role → Organizational Role Record** (sub-class dari Role). |
| | | **P0-5:** `System Identity` menjadi sub-class/qualifier dari **User Account** (bukan kelas terpisah). |
| | | **P0-6:** Seluruh Activity / Record diseragamkan sebagai sub-class dari Entity (`t_log_pastoral`, `t_histori_perubahan_status`, `t_riwayat_mutasi_pendeta`, `t_approval_bantuan`). |
| | | **P0-7:** Person Model diagram diperbaiki: `Riwayat Mutasi` dipindahkan dari Attributes ke Activity / Record. |
| | | **P1-8:** Classification Invariants (CI-01 s.d. CI-09) ditambahkan sebagai §5. |
| | | **P1-9:** Guardrail sentence ditambahkan di §0.2: *"A physical database table has one primary canonical classification..."* |

---

Dokumen `02-UX-Entity-Classification-v1.1.1.md` ini siap untuk review final dan sign-off Anda, Principal Architect. Seluruh 7 koreksi P0 dan 2 penambahan P1 telah diterapkan. Tidak ada perubahan arsitektur — hanya consistency correction.