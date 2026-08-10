# 02 — UX Entity Classification v1.1

| Field | Value |
|---|---|
| **Dokumen** | `02-UX-Entity-Classification-v1.1.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2 Freeze Package) |
| **Status** | 🔄 `DRAFT` — Menunggu review Principal Architect |
| **Ontological Authority** | `05-UX-Canonical-Model-v1.0.md` (FROZEN) |
| **Consistency Constraints** | `03-UX-Architecture-Decision-Log-v1.0.md` (ADR-01 s.d. 07) · `04-UX-Architecture-Principles-v1.0.md` (PR-01 s.d. PR-09) · VC-01 s.d. VC-05 |
| **Sumber Data** | `entity_inventory.md` (35 entitas) · `current_state_inventory.md` (35 tabel) |
| **Peran Dokumen** | **WHAT each database table means as a business concept** — jembatan dari struktur fisik database ke ontologi UX, tanpa kebocoran *database → UX*. |

---

## 0. Tujuan & Aturan Dokumen

### 0.1 Fungsi Dokumen

Dokumen ini mengklasifikasikan **35 tabel database** SI GPIB v2.2 ke dalam **kelas ontologis kanonis** yang ditetapkan di `05-UX-Canonical-Model-v1.0.md`. Tujuannya adalah memastikan bahwa struktur fisik database **tidak mendikte** struktur UX, navigasi, atau workspace.

### 0.2 Aturan Metodologis (Wajib)

| Aturan | Pernyataan |
|---|---|
| **M-1** | Klasifikasi mengikuti pipeline: `Database Table → Business Meaning → Canonical Class → UX Responsibility → Workspace/Section/View`. **Bukan** `Table → Menu → Workspace → Screen`. |
| **M-2** | Tidak ada tabel yang otomatis menjadi Workspace hanya karena merupakan domain/tabel besar. |
| **M-3** | `Person` tetap unified; `User Account` tetap terpisah dari `Person`. |
| **M-4** | `Context` tidak disamakan dengan `Organization Entity` meskipun keduanya berbagi hierarki yang sama. |
| **M-5** | `Transaction` tidak berubah menjadi Workspace; `Projection` tidak berubah menjadi Place. |
| **M-6** | `Capability` tidak tercampur dengan `Permission` (VC-02). |
| **M-7** | `Person Type`, `Organizational Role`, `System Role`, dan `Assignment` tetap terpisah (VC-01). |
| **M-8** | Tidak ada keputusan RBAC/RLS yang diselundupkan ke dokumen ini. Matriks izin adalah pekerjaan Gate 3. |
| **M-9** | Setiap klasifikasi dapat ditelusuri kembali ke `05-UX-Canonical-Model-v1.0.md`. |

### 0.3 Pembagian Fungsi Dokumen

| Dokumen | Menjawab | Fungsi |
|---|---|---|
| `05-Canonical-Model` | **WHAT** — Apa hakikat setiap konsep? | Ontological contract (FROZEN). |
| `02-Entity-Classification` (dokumen ini) | **WHAT each table means** — Apa makna bisnis tiap tabel? | Mapping 35 tabel → kelas kanonis. |
| `03-Decision-Log` | **WHY** — Mengapa keputusan diambil? | Decision traceability. |
| `04-Principles` | **HOW** — Bagaimana arsitektur berperilaku? | Behavioral rules. |

---

## 1. Canonical Class Taxonomy

Kelas klasifikasi yang digunakan dalam dokumen ini diturunkan langsung dari `05-UX-Canonical-Model-v1.0.md`.

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

### 1.2 Kelas Pendukung (Sub-class — tidak bertentangan dengan 05)

Untuk mengakomodasi 35 tabel secara presisi tanpa mengaburkan ontologi, dokumen ini menggunakan kelas pendukung yang secara eksplisit merupakan **sub-class** dari kelas kanonis:

| Kelas Pendukung | Induk Kanonis | Definisi |
|---|---|---|
| **Document / Attachment** | Sub-class dari Entity | File yang menempel pada entitas induk, bukan entitas mandiri. |
| **Attribute / Sub-record** | Sub-class dari Entity | Bagian dari entitas induk yang tidak memiliki lifecycle independen. |
| **Activity / Record** | Sub-class dari Entity | Catatan kejadian/peristiwa yang terikat pada entitas lain. |
| **Reference / Dataset** | Sub-class dari Entity | Data agregat/statistik yang menjadi bagian dari Capability. |
| **System Internal** | Sub-class dari User Account / Session | Objek teknis internal sistem, **bukan** Business Entity. |

> **Catatan penting:** Kelas pendukung ini **tidak menambah** kelas kanonis baru di Dokumen 05. Mereka adalah sub-kategorisasi untuk keperluan klasifikasi tabel, dan tetap tunduk pada definisi kelas induknya.

---

## 2. Master Classification Matrix — 35 Tabel

### 2.1 Ringkasan Distribusi

| Kelas Kanonis | Jumlah Tabel | Tabel |
|---|---:|---|
| **Organization Entity + Context** (dual) | 3 | `m_mupel`, `m_jemaat_induk`, `m_pos_pelkes` |
| **Person** (Business Identity) | 3 | `m_pendeta`, `t_pelayan`, `t_relawan` |
| **Assignment** (Scope Relationship) | 2 | `t_penugasan_pendeta`, `t_pj_jemaat` |
| **Role Record** (Organizational Role) | 1 | `t_jabatan_struktural` |
| **Entity** (Business Object) | 8 | `t_log_pastoral`, `t_jadwal_ibadah`, `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`, `t_kerawanan_wilayah`, `t_potensi_wilayah`, `t_demografi_pelkat`* |
| **Transaction** | 1 | `t_pengajuan_bantuan` |
| **Activity / Record** | 3 | `t_histori_perubahan_status`, `t_riwayat_mutasi_pendeta`, `t_approval_bantuan` |
| **Attribute / Sub-record** | 3 | `t_keluarga_pendeta`, `t_kompetensi_pendeta`, `t_keterlibatan_pendeta` |
| **Document / Attachment** | 4 | `t_lampiran_aset`, `t_lampiran_kerawanan`, `t_lampiran_potensi`, `t_keluarga_pendeta` (foto)* |
| **Reference / Dataset** | 1 | `t_demografi_pelkat` |
| **System Identity** | 1 | `users` |
| **System Internal** | 5 | `m_webauthn_credentials`, `webauthn_challenges`, `m_push_subscription`, `t_log_aktivitas`, `t_form_draft`, `sys_transaction_logs`, `sys_telemetry` |

> *`t_demografi_pelkat` diklasifikasikan sebagai **Reference / Dataset** (sub-class Entity), bukan Entity mandiri.

### 2.2 Matriks Klasifikasi Lengkap

| # | Tabel | Business Meaning | Canonical Class | Sub-Class | Person Type? | Org Role? | System Role? | UX Responsibility |
|---|---|---|---|---|---|---|---|---|
| 1 | `m_mupel` | Mupel — Regional Cluster | **Organization Entity + Context** | — | — | — | — | Organization Workspace (Mupel Instance) |
| 2 | `m_jemaat_induk` | Jemaat Induk — Local Church | **Organization Entity + Context** | — | — | — | — | Organization Workspace (Jemaat Instance) |
| 3 | `m_pos_pelkes` | Pos Pelkes / Bajem — Outpost | **Organization Entity + Context** | — | — | — | — | Organization Workspace (Pos Instance) |
| 4 | `t_histori_perubahan_status` | Riwayat elevasi status organisasi | **Activity / Record** | Lifecycle Event | — | — | — | Organization Workspace → History Section |
| 5 | `users` | Akun pengguna terautentikasi | **System Identity** | User Account | — | — | ✓ (kolom `role`) | Account & System (Utility) |
| 6 | `m_webauthn_credentials` | Kredensial passkey biometrik | **System Internal** | Auth Credential | — | — | — | Account & System → Biometric |
| 7 | `webauthn_challenges` | Challenge sementara WebAuthn | **System Internal** | Ephemeral | — | — | — | System (tidak terlihat user) |
| 8 | `m_push_subscription` | Token push notification PWA | **System Internal** | Device Token | — | — | — | System (tidak terlihat user) |
| 9 | `m_pendeta` | Pendeta | **Person** | Ministry Identity: Pendeta | ✓ | — | — | Person Directory + Person Workspace |
| 10 | `t_pelayan` | Pelayan / Presbiter (Penatua, Diaken) | **Person** | Ministry Identity: Pelayan | ✓ | — | — | Person Directory + Person Workspace |
| 11 | `t_relawan` | Relawan | **Person** | Ministry Identity: Relawan | ✓ | — | — | Person Directory + Person Workspace |
| 12 | `t_penugasan_pendeta` | Penugasan Pendeta ke Pos | **Assignment** | Scope Relationship | — | — | — | Person Workspace → Assignments; Org Workspace → Personnel |
| 13 | `t_pj_jemaat` | Penunjukan KMJ / PJ Jemaat | **Assignment** | Organizational Role Assignment | — | ✓ (KMJ/PJ) | — | Person Workspace → Assignments; Org Workspace → Leadership |
| 14 | `t_riwayat_mutasi_pendeta` | Riwayat mutasi antar jemaat | **Activity / Record** | Person Lifecycle Event | — | — | — | Person Workspace → Transfer History |
| 15 | `t_jabatan_struktural` | Jabatan struktural di majelis/mupel/sinode | **Role Record** | Organizational Role History | — | ✓ | — | Person Workspace → Structural Positions |
| 16 | `t_keluarga_pendeta` | Anggota keluarga pendeta | **Attribute / Sub-record** | Person Attribute | — | — | — | Person Workspace → Family |
| 17 | `t_kompetensi_pendeta` | Sertifikasi & kompetensi pendeta | **Attribute / Sub-record** | Person Attribute | — | — | — | Person Workspace → Competencies |
| 18 | `t_keterlibatan_pendeta` | Keterlibatan organisasi eksternal | **Attribute / Sub-record** | Person Attribute | — | — | — | Person Workspace → External Involvement |
| 19 | `t_log_pastoral` | Log kegiatan pastoral | **Entity** | Activity Record | — | — | — | Org Workspace → Pastoral Section; Person Workspace → Pastoral Activity |
| 20 | `t_jadwal_ibadah` | Jadwal ibadah rutin | **Entity** | Schedule Record | — | — | — | Org Workspace → Pastoral Section (Worship Schedule) |
| 21 | `t_aset_tanah` | Aset tanah | **Entity** | Asset Subtype: Land | — | — | — | Org Workspace → Assets Section |
| 22 | `t_aset_bangunan` | Aset bangunan | **Entity** | Asset Subtype: Building | — | — | — | Org Workspace → Assets Section |
| 23 | `t_aset_bergerak` | Aset bergerak / kendaraan | **Entity** | Asset Subtype: Movable | — | — | — | Org Workspace → Assets Section |
| 24 | `t_lampiran_aset` | File lampiran aset | **Document / Attachment** | Asset Document | — | — | — | Org Workspace → Assets Section → Asset Detail |
| 25 | `t_pengajuan_bantuan` | Pengajuan bantuan | **Transaction** | Aid Request | — | — | — | Org Workspace → Aid Section; Aid Review Queue (Projection) |
| 26 | `t_approval_bantuan` | Histori persetujuan bantuan | **Activity / Record** | Approval Record | — | — | — | Aid Request Detail → Approval Timeline |
| 27 | `t_demografi_pelkat` | Statistik demografi per Pelkat | **Reference / Dataset** | Demographic Aggregate | — | — | — | Org Workspace → Demography Section |
| 28 | `t_kerawanan_wilayah` | Titik kerawanan wilayah | **Entity** | Territory Data: Risk | — | — | — | Org Workspace → Territory Section; Territory Map (Projection) |
| 29 | `t_lampiran_kerawanan` | Foto titik kerawanan | **Document / Attachment** | Territory Document | — | — | — | Org Workspace → Territory Section → Detail |
| 30 | `t_potensi_wilayah` | Titik potensi wilayah | **Entity** | Territory Data: Potential | — | — | — | Org Workspace → Territory Section; Territory Map (Projection) |
| 31 | `t_lampiran_potensi` | Foto titik potensi | **Document / Attachment** | Territory Document | — | — | — | Org Workspace → Territory Section → Detail |
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
| **Organization Entity** | Mereka adalah objek bisnis dengan identitas (nama, alamat, koordinat), lifecycle (aktif → elevasi → nonaktif), dan atribut. |
| **Context (Execution Scope)** | Mereka sekaligus menjadi lingkup kerja (execution scope) di mana user beroperasi dan data diisolasi. |

> ⚠️ **VC-04 Guardrail (Acceptance Criterion #5):**
> Meskipun `m_mupel`, `m_jemaat_induk`, `m_pos_pelkes` berfungsi sebagai Context, **Context ≠ Organization Entity**. Context adalah konsep *execution scope* (di mana user bekerja), sedangkan Organization Entity adalah konsep *business object* (apa yang dikelola). Keduanya berbagi hierarki fisik yang sama, tetapi secara ontologis berbeda. Gate 3 harus mempertahankan pembedaan ini.

**Catatan tentang Bajem:**
Bajem (Bakal Jemaat) **bukan** tabel terpisah. Ia adalah **subtype/status** dari Pos Pelkes, disimpan di `m_pos_pelkes` dengan atribut `kategori = 'Bajem'`. Secara UX, Bajem adalah **fase lifecycle** (transisi Pos → Jemaat), bukan entitas terpisah.

**UX Responsibility:**
Ketiga level organisasi menggunakan **Organization Workspace** (satu Workspace Type, banyak Instance sesuai Active Context — PR-07, VC-04).

#### `t_histori_perubahan_status`

> **Klasifikasi: Activity / Record (Lifecycle Event)**

Catatan riwayat elevasi status organisasi. Bukan entitas mandiri, melainkan **jejak perubahan** pada Organization Entity.

**UX Responsibility:** Organization Workspace → History Section (atau sebagai bagian dari Identity Section).

---

### 3.2 Domain Auth & Keamanan (4 tabel)

#### `users`

> **Klasifikasi: System Identity (User Account)**

Ini adalah **User Account**, bukan Person. Ia adalah kunci masuk sistem, bukan orangnya.

> ⚠️ **PR-04 & VC-01 Guardrail:**
> `users` terhubung ke Person via relasi 0..1. Tidak semua Person memiliki User Account. Tabel `users` memiliki kolom `role` yang saat ini menampung **System Role** (super_user, admin_mupel, kmj, pj, pendeta, pelayan, relawan, user). Namun perlu dicatat bahwa **beberapa nilai kolom ini secara nominal mencampurkan System Role dan Person Type** (misal: 'pendeta', 'pelayan', 'relawan' adalah Person Type yang juga digunakan sebagai nilai role). Ini adalah **temuan Gate 3**, bukan sesuatu yang diselesaikan di dokumen ini.

**UX Responsibility:** Account & System (Utility). **Bukan** bagian dari Person Directory atau Person Workspace.

#### `m_webauthn_credentials`, `webauthn_challenges`, `m_push_subscription`

> **Klasifikasi: System Internal (Auth Credential / Device Token)**

Objek teknis untuk autentikasi biometrik dan notifikasi. **Bukan** Business Entity.

**UX Responsibility:** Account & System → Biometric Settings (untuk credentials). Challenges dan push subscription tidak terlihat langsung oleh user.

---

### 3.3 Domain SDM & Personel Pelayanan (3 tabel)

#### `m_pendeta`, `t_pelayan`, `t_relawan`

> **Klasifikasi: Person (Business Identity)**

Ketiga tabel ini merepresentasikan **Person** — individu manusia dalam pelayanan. Mereka adalah satu Entity Family yang terfragmentasi secara fisik di database, tetapi **secara konseptual adalah satu kelas: Person**.

| Tabel | Person Type / Ministry Identity |
|---|---|
| `m_pendeta` | Pendeta |
| `t_pelayan` | Pelayan / Presbiter (Penatua, Diaken) |
| `t_relawan` | Relawan |

> ⚠️ **VC-01 Guardrail (Acceptance Criterion #9):**
> **Person Type (Pendeta/Pelayan/Relawan) adalah Ministry Identity**, bukan Organizational Role dan bukan System Role.
>
> ```text
> PERSON
>   ├── Person Type / Ministry Identity  ← m_pendeta, t_pelayan, t_relawan
>   │      ├── Pendeta
>   │      ├── Penatua / Diaken (Pelayan)
>   │      └── Relawan
>   │
>   ├── Organizational Role               ← t_pj_jemaat, t_jabatan_struktural
>   │      ├── KMJ
>   │      ├── PJ
>   │      └── Jabatan struktural lainnya
>   │
>   ├── Assignment                        ← t_penugasan_pendeta, t_pj_jemaat
>   │      └── Context / Organization / Period
>   │
>   └── User Account (0..1)               ← users
>          └── System Role                ← users.role
> ```
>
> **Aturan keras:** Tabel `m_pendeta` tidak boleh diterjemahkan menjadi "System Role = pendeta". Person Type dan System Role adalah lapisan ontologi yang berbeda.

**UX Responsibility:**
- **Person Directory** (unified catalog — entry point di Primary Navigation slot "SDM").
- **Person Workspace** (role-specific progressive disclosure sesuai Person Type).
- Ketika diakses dari Organization Workspace → Personnel Section, ia tetap membuka **Person Workspace** yang sama (PR-06: One Entity, Multiple Entry Points).

---

### 3.4 Domain Profil 360 Pendeta (7 tabel)

| Tabel | Klasifikasi | Penjelasan |
|---|---|---|
| `t_penugasan_pendeta` | **Assignment** | Relasi Person (Pendeta) ↔ Pos dalam periode tertentu. |
| `t_pj_jemaat` | **Assignment** | Penunjukan Person (Pendeta) sebagai KMJ/PJ di Jemaat. Ini juga mencatat **Organizational Role**. |
| `t_riwayat_mutasi_pendeta` | **Activity / Record** | Jejak perpindahan homebase Person antar jemaat. |
| `t_jabatan_struktural` | **Role Record** | Riwayat **Organizational Role** yang dipegang Person. |
| `t_keluarga_pendeta` | **Attribute / Sub-record** | Atribut Person (keluarga). |
| `t_kompetensi_pendeta` | **Attribute / Sub-record** | Atribut Person (kompetensi/sertifikasi). |
| `t_keterlibatan_pendeta` | **Attribute / Sub-record** | Atribut Person (keterlibatan eksternal). |

> **Catatan:** Dari 7 tabel ini, hanya 2 yang merupakan **Assignment** (relasi scope), 1 yang merupakan **Role Record** (Organizational Role history), 1 yang merupakan **Activity / Record**, dan 3 yang merupakan **Attribute / Sub-record** dari Person.

**UX Responsibility:** Semuanya menjadi **section di dalam Person Workspace** (progressive disclosure untuk Person Type: Pendeta).

---

### 3.5 Domain Operasional Pelayanan (2 tabel)

#### `t_log_pastoral`

> **Klasifikasi: Entity (Activity Record)**

Catatan kegiatan pastoral. Memiliki identitas (`id_log`), tanggal, jenis kegiatan, dan terikat pada dua entitas: Pos (Context) dan Pendeta (Person).

**UX Responsibility (PR-06: One Entity, Multiple Entry Points):**
- Organization Workspace → Pastoral Section (entry point 1)
- Person Workspace → Pastoral Activity Section (entry point 2)
- Keduanya membuka **record yang sama**, bukan dua entitas berbeda.

#### `t_jadwal_ibadah`

> **Klasifikasi: Entity (Schedule Record)**

Jadwal ibadah rutin di Pos. Terikat pada Pos (Context).

**UX Responsibility:** Organization Workspace → Pastoral Section (Worship Schedule).

---

### 3.6 Domain Inventaris & Aset (4 tabel)

#### `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`

> **Klasifikasi: Entity (Asset Subtype)**

Ketiga tabel ini adalah subtipe dari **Asset Entity**: Land, Building, Movable. Mereka adalah Business Object dengan identitas, lifecycle, dan atribut.

> ⚠️ **VC-02 Guardrail (Acceptance Criterion #8):**
> **Asset adalah Business Entity / Organization Capability**, bukan Authorization Permission.
>
> ```text
> Asset (Entity)          → konsep bisnis, dikelola di Organization Workspace → Assets Section
> asset.create (Permission) → konsep otorisasi, akan didefinisikan di Gate 3
> ```
>
> Dokumen ini **tidak** mendefinisikan permission. Ia hanya mengklasifikasikan Asset sebagai Entity.

**UX Responsibility:** Organization Workspace → Assets & Property Section (Capability). Asset Detail adalah **View**, bukan Workspace.

#### `t_lampiran_aset`

> **Klasifikasi: Document / Attachment**

File lampiran (sertifikat, foto) yang menempel pada Asset. Bukan entitas mandiri.

**UX Responsibility:** Organization Workspace → Assets Section → Asset Detail View.

---

### 3.7 Domain Bantuan & Workflow (2 tabel)

#### `t_pengajuan_bantuan`

> **Klasifikasi: Transaction**

Ini adalah **Transaction**, bukan Entity biasa dan **bukan Workspace**. Memiliki lifecycle workflow (`Draft → Diajukan → Disetujui_KMJ → Disetujui_Mupel → Ditolak`) dan melibatkan multi-actor (PJ Pos sebagai creator, KMJ dan Mupel sebagai approver).

> ⚠️ **PR-02 & ADR-03 Guardrail (Acceptance Criterion #6):**
> **Transaction ≠ Workspace.** Pengajuan Bantuan tidak boleh menjadi "Aid Workspace". Ia adalah objek yang diproses.

**UX Responsibility:**
- Organization Workspace → Aid Requests Section (transaction list) — entry point creator
- Aid Review Queue (Projection) — entry point approver
- Aid Request Detail (**Transaction View**, bukan node navigasi) — dibuka dari kedua entry point (PR-06)

#### `t_approval_bantuan`

> **Klasifikasi: Activity / Record (Approval Record)**

Catatan keputusan approval berjenjang. Bagian dari Transaction, bukan entitas mandiri.

**UX Responsibility:** Aid Request Detail View → Approval Timeline.

---

### 3.8 Domain Demografi & Geospasial (5 tabel)

#### `t_demografi_pelkat`

> **Klasifikasi: Reference / Dataset**

Data agregat statistik per Pelkat. Bukan Entity dengan lifecycle independen, melainkan **dataset** yang menjadi bagian dari Demography Capability.

**UX Responsibility:** Organization Workspace → Demography Section (Capability).

#### `t_kerawanan_wilayah`, `t_potensi_wilayah`

> **Klasifikasi: Entity (Territory Data)**

Data titik kerawanan dan potensi wilayah. Memiliki identitas, koordinat, dan atribut. Mereka adalah **Territory Entity** dengan dua subtype: Risk dan Potential.

**UX Responsibility:**
- Organization Workspace → Territory Section (Capability) — entry point 1
- Territory Map (Projection) — entry point 2 (PR-06)

#### `t_lampiran_kerawanan`, `t_lampiran_potensi`

> **Klasifikasi: Document / Attachment**

Foto lokasi yang menempel pada Territory Entity.

**UX Responsibility:** Organization Workspace → Territory Section → Detail View.

---

### 3.9 Domain System & Sync (4 tabel)

#### `t_log_aktivitas`

> **Klasifikasi: System Internal (Audit Trail)**

Audit trail keamanan. Bukan Business Entity.

**UX Responsibility:** Account & System → Audit (hanya untuk Admin/Super User).

#### `t_form_draft`

> **Klasifikasi: System Internal (Offline Sync Buffer)**

Penampungan draft form lokal saat offline. Bukan Business Entity.

**UX Responsibility:** Account & System → Sync Manager.

#### `sys_transaction_logs`, `sys_telemetry`

> **Klasifikasi: System Internal**

Log sistem internal dan telemetri performa. Tidak terlihat oleh user.

**UX Responsibility:** System (tidak ada representasi UX langsung).

---

## 4. Special Models

### 4.1 Person Model (Unification)

Dokumen ini mengonfirmasi keputusan ADR-UX-004:

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
├── Attributes
│   ├── Keluarga       (dari t_keluarga_pendeta)
│   ├── Kompetensi     (dari t_kompetensi_pendeta)
│   ├── Keterlibatan   (dari t_keterlibatan_pendeta)
│   ├── Riwayat Mutasi (dari t_riwayat_mutasi_pendeta)
│   └── Log Pastoral   (dari t_log_pastoral — cross-reference)
│
└── User Account (0..1)  ← dari users
    └── System Role      ← dari users.role
```

> **Pernyataan kunci:** `Person` adalah **satu kelas ontologis**. Fragmentasi fisik di database (`m_pendeta`, `t_pelayan`, `t_relawan`) adalah **implementasi teknis**, bukan struktur UX. UX menyatukan mereka dalam Person Directory dan Person Workspace dengan progressive disclosure.

### 4.2 Context Model (Separation from Organization Entity)

```text
ORGANIZATION ENTITY (Business Object)          CONTEXT (Execution Scope)
─────────────────────────────────────         ──────────────────────────
m_mupel       → Mupel sebagai objek   ←→      Mupel sebagai scope kerja
m_jemaat_induk → Jemaat sebagai objek  ←→     Jemaat sebagai scope kerja
m_pos_pelkes  → Pos sebagai objek     ←→      Pos sebagai scope kerja
```

> **Pernyataan kunci:** Tabel yang sama (`m_mupel`, `m_jemaat_induk`, `m_pos_pelkes`) **berfungsi ganda** sebagai Organization Entity dan sebagai dasar untuk Context. Namun secara ontologis, **Entity adalah "apa yang dikelola"** dan **Context adalah "di mana user bekerja"**. Keduanya tidak boleh disamakan (Acceptance Criterion #5).

### 4.3 Capability Model (VC-02)

Berikut adalah **Organization Capabilities** yang menjadi section di Organization Workspace:

| Capability | Entitas Pendukung | Section di Organization Workspace |
|---|---|---|
| **Pastoral Care** | `t_log_pastoral`, `t_jadwal_ibadah` | Pastoral |
| **Assets & Property** | `t_aset_tanah`, `t_aset_bangunan`, `t_aset_bergerak`, `t_lampiran_aset` | Assets & Property |
| **Territory Intelligence** | `t_kerawanan_wilayah`, `t_potensi_wilayah`, lampiran terkait | Territory |
| **Aid & Workflow** | `t_pengajuan_bantuan`, `t_approval_bantuan` | Aid Requests |
| **Demography** | `t_demografi_pelkat` | Demography |
| **Personnel** | `t_pelayan`, `t_relawan`, `t_penugasan_pendeta` | SDM & Personnel |

> ⚠️ **VC-02 Guardrail:** Capability di atas adalah **konsep bisnis/organisasi** (apa yang organisasi mampu lakukan). Mereka **bukan** Authorization Permission. Permission (`asset.create`, `aid.approve`, dll.) akan didefinisikan di Gate 3 dan merupakan lapisan ontologi yang berbeda.

---

## 5. UX Responsibility Summary

### 5.1 Mapping ke Workspace / Section / View / Projection

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
| **System Identity** | Account & System (Utility) | User Account |
| **System Internal** | Account & System atau tidak terlihat | Credentials, Logs, Drafts, Telemetry |

### 5.2 Navigation Consequence

| Kelas | Boleh jadi Primary Nav? | Boleh jadi Workspace? | Boleh jadi Projection? |
|---|---|---|---|
| Organization Entity | ✓ (slot Organisasi) | ✓ (Organization Workspace) | — |
| Person | ✓ (slot SDM → Person Directory) | ✓ (Person Workspace) | — |
| Asset Entity | ✗ | ✗ | ✓ (Asset Intelligence) |
| Transaction | ✗ | ✗ | ✓ (Aid Review Queue) |
| Territory Entity | ✗ | ✗ | ✓ (Territory Map) |
| System Identity | ✓ (slot Akun & Sistem, sebagai Utility) | ✗ | — |

---

## 6. Acceptance Criteria Compliance Checklist

| # | Kriteria | Status | Bukti |
|---|---|---|---|
| 1 | Seluruh 35 tabel telah memiliki klasifikasi | ✅ | §2.2 Master Matrix |
| 2 | Tidak ada tabel yang otomatis dianggap Workspace hanya karena domain besar | ✅ | Asset (4 tabel) → Section, bukan Workspace; Aid (2 tabel) → Transaction, bukan Workspace |
| 3 | Person tetap unified | ✅ | §4.1 — m_pendeta, t_pelayan, t_relawan → satu kelas Person |
| 4 | User Account tetap terpisah dari Person | ✅ | §3.2 — users → System Identity, bukan Person |
| 5 | Context tidak disamakan dengan Organization Entity | ✅ | §4.2 — dual role dijelaskan, pembedaan ontologis ditegaskan |
| 6 | Transaction tidak berubah menjadi Workspace | ✅ | §3.7 — t_pengajuan_bantuan → Transaction, bukan Workspace |
| 7 | Projection tidak berubah menjadi Place/Workspace | ✅ | §5.2 — Territory Map, Asset Intelligence, Aid Queue → Projection |
| 8 | Capability tidak tercampur dengan Permission | ✅ | §4.3 — VC-02 guardrail eksplisit |
| 9 | Person Type, Org Role, System Role, Assignment tetap terpisah | ✅ | §4.1 — VC-01 guardrail dengan diagram 4 lapisan |
| 10 | Setiap klasifikasi traceable ke Dokumen 05 | ✅ | §1.1 — semua kelas merujuk ke section di 05 |
| 11 | Tidak ada keputusan RBAC/RLS yang diselundupkan | ✅ | Tidak ada matriks izin di dokumen ini; semua reference ke permission ditandai sebagai "Gate 3" |
| 12 | Hasil dapat menjadi input bersih untuk Gate 3 | ✅ | Person Model, Context Model, Capability Model sudah terpisah dan siap untuk Gate 3 |

---

## 7. Gate 3 Readiness Notes

Dokumen ini menghasilkan **input bersih** untuk Gate 3 dengan catatan berikut:

| Item | Status di Dokumen 02 | Ditangani di Gate 3 |
|---|---|---|
| Person Type vs Org Role vs System Role | Terpisah secara ontologis (§4.1) | Formalisasi Role Model & matriks |
| Context hierarchy & inheritance | Dual role dijelaskan (§4.2) | Context Hierarchy Rules |
| Capability vs Permission | Terpisah (§4.3) | Permission Boundary & Action Authorization |
| Kolom `users.role` yang mencampur System Role dan Person Type | **Ditandai sebagai temuan** (§3.2) | Role Model cleanup |
| Assignment semantics (t_penugasan_pendeta, t_pj_jemaat) | Terklasifikasi sebagai Assignment | Assignment Model formalisasi |
| Cross-context access (LogPastoral di 2 workspace) | Dicatat sebagai PR-06 multi-entry | Cross-Context Access rules |

---

## 8. Change Log

| Versi | Tanggal | Perubahan |
|---|---|---|
| v1.0 | 2026 (sebelumnya) | Audit klasifikasi awal dengan 7 UX Entity utama dan 9 supporting classifications. |
| **v1.1** | **2026-07-14** | **Rewrite penuh berdasarkan Gate 2 Freeze Package:** (1) Klasifikasi ulang 35 tabel menggunakan Canonical Class dari Dokumen 05; (2) Penambahan kelas pendukung sebagai sub-class; (3) Person Model unified dengan VC-01 guardrail; (4) Context Model dipisahkan dari Organization Entity; (5) Capability Model dengan VC-02 guardrail; (6) Transaction dan Projection tidak menjadi Workspace; (7) Acceptance Criteria Compliance Checklist (12 kriteria); (8) Gate 3 Readiness Notes. |

---

Dokumen `02-UX-Entity-Classification-v1.1.md` ini siap untuk review Anda, Principal Architect. Saya menunggu feedback Anda sebelum melanjutkan ke **Step 4: `01-UX-Information-Architecture-v1.1.md`** dan **Consistency Sign-off**.