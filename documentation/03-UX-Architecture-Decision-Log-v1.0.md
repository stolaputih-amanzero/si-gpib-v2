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

#### Context
Sistem sebelumnya (IA v1) memiliki navigasi utama yang mencampurkan *Workspaces* (Beranda, Profil) dengan *Projections* (Peta, Laporan). Hal ini membuat struktur hierarki menjadi rancu, terutama ketika diakses dari berbagai peran.

#### Problem
Bagaimana merancang navigasi utama (Bottom Navigation Bar) yang stabil dan konsisten bagi seluruh pengguna, tanpa harus mengubah layout menu ketika terjadi pergantian konteks (Context Switching)?

#### Options & Evaluation
| Option | Deskripsi | Kelebihan | Kelemahan | Verdict |
|---|---|---|---|---|
| **A** | Dynamic Navigation | Menu berubah sesuai role aktif (misal: KMJ punya menu Laporan, PJ Pos punya menu Aset). | Navigasi terasa personal dan langsung pada tujuan. | Merusak *muscle memory* pengguna (PR-07). Sulit dikelola secara teknis. | ❌ |
| **B** | Stable Navigation + Adaptive Content | Menu tetap 5 slot. Konten di dalam menu menyesuaikan *Active Context*. | Konsisten, *muscle memory* terjaga, sejalan dengan standar PWA modern. | Membutuhkan arsitektur *Context Switcher* (ADR-07) yang kuat. | ✅ |

#### Decision
**ACCEPT — Option B.**
Sistem menggunakan *Stable Primary Mobile Navigation* dengan 5 slot: `Home`, `Organisasi`, `SDM`, `[+] Quick Actions`, dan `Akun & Sistem`. *Projections* (seperti Peta dan Laporan) tidak diberikan slot navigasi utama, melainkan dipindahkan ke dalam *Projection Cards* di halaman `Home` atau `Organisasi`.

#### Rationale
Kestabilan navigasi (PR-07) adalah kunci adopsi aplikasi *mobile-first*. `Home` berfungsi sebagai *Work Entry Point* (PR-08), bukan sekadar dashboard statis.

#### Consequences
Seluruh pengguna akan melihat 5 menu yang sama di bagian bawah layar. Menu *Peta* dan *Laporan* dicabut dari *bottom bar*.

---

### ADR-UX-006 — Sinode: Global Context Scope

| Field | Value |
|---|---|
| **ID** | ADR-UX-006 |
| **Status** | ✅ `ACCEPTED` |
| **Decision** | Sinode GPIB adalah Global Context Scope, bukan Standalone Workspace. Super User mengakses data dan analitik tingkat nasional dengan cara mengaktifkan Global Context melalui Context Switcher. |

#### Context
Level organisasi tertinggi di GPIB adalah Sinode. Pada level ini, Super User atau pengurus tingkat nasional perlu melihat keseluruhan data Mupel, Jemaat, dan Pos.

#### Problem
Apakah Sinode memerlukan *Workspace* terpisah (seperti Sinode Dashboard), atau cukup dikelola sebagai *Context Scope*?

#### Options & Evaluation
| Option | Deskripsi | Kelebihan | Kelemahan | Verdict |
|---|---|---|---|---|
| **A** | Standalone Sinode Workspace | UI dapat didesain khusus secara masif sebagai *Executive Dashboard*. | Melanggar penyederhanaan *Workspace*. Terlalu banyak jenis halaman yang harus di-*maintain*. | ❌ |
| **B** | Sinode sebagai Global Context Scope | Menggunakan template *Organization Workspace* yang sudah ada, dengan data yang diagregasi secara nasional. | Efisien, re-usable, mempertegas hierarki 2 *Standalone Workspace*. | ✅ |

#### Decision
**ACCEPT — Option B.**
Sinode adalah tingkat *Scope*, bukan tempat yang berbeda secara struktural. Super User bekerja di *Organization Workspace* yang sama, tetapi data yang dimuat adalah agregasi nasional.

#### Rationale
Penyederhanaan jumlah *Workspace* (hanya Organization dan Person) sangat mengurangi beban teknis. Data agregasi nasional dapat ditangani dengan baik oleh komponen UI yang dirancang adaptif.

#### Consequences
Saat Super User memilih "Sinode" di *Context Switcher*, mereka akan tetap berada di layar `Organisasi`, namun KPI dan daftar di dalamnya akan menampilkan data *Global*.

---

### ADR-UX-007 — Persistent Context Switcher & Session State

| Field | Value |
|---|---|
| **ID** | ADR-UX-007 |
| **Status** | ✅ `ACCEPTED` |
| **Decision** | Active Context adalah Session State, bukan User Identity Property. Context Switcher adalah mekanisme perubahan execution scope. Sistem memisahkan secara tegas: Identity (Who), Role/Permission (What), Valid Contexts (Where allowed), dan Active Context (Where working now). |

#### Context
Satu orang (Person) sering kali memegang berbagai posisi secara bersamaan (misal: Pdt. A adalah KMJ Jemaat X, namun juga menjadi PJ Pos Y).

#### Problem
Bagaimana cara antarmuka menangani pengguna *multi-role*? Apakah pengguna memilih untuk "Login sebagai KMJ", atau "Login sebagai dirinya sendiri, lalu memilih lokasi kerjanya"?

#### Options & Evaluation
| Option | Deskripsi | Kelebihan | Kelemahan | Verdict |
|---|---|---|---|---|
| **A** | Switch by Role | Pengguna memilih kapasitas perannya (Misal: "Bekerja sebagai KMJ"). | Sesuai dengan mental model otorisasi teknis. | Membingungkan untuk pengguna lapangan yang lebih berpikir spasial/lokasi. | ❌ |
| **B** | Switch by Location / Context | Pengguna memilih di mana mereka bekerja (Misal: "Bekerja di Jemaat X" atau "Pos Y"). | Intuitif, sesuai dengan dunia nyata. Otorisasi diselesaikan otomatis di *server-side*. | Membutuhkan arsitektur *RBAC* yang dinamis mengevaluasi *Context* yang diklaim klien. | ✅ |

#### Decision
**ACCEPT — Option B.**
Mekanisme perpindahan konteks dilakukan melalui *Persistent Context Switcher* berbasis lokasi (Scope). *Active Context* (lokasi saat ini) disimpan sebagai *Session State* (`sessionStorage` atau URL param), bukan sebagai atribut permanen pada `User Account`.

#### Rationale
Pemilihan berbasis lokasi (PR-09) jauh lebih ramah pengguna. Klien hanya perlu mengklaim "Saya sedang melihat Pos Y". Engine otorisasi (Gate 3) yang bertugas memverifikasi apakah `User Account` tersebut memiliki *Permission* di Pos Y. (VC-03)

#### Consequences
Setiap *request* atau aksi dari klien harus menyertakan `context_id` (ID Jemaat/Pos). Komponen UI *Context Switcher* harus diletakkan di tempat yang persisten (misal: Header) dan menonjol.

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