# 05 — UX Canonical Model v1.0

| Field | Value |
|---|---|
| **Dokumen** | `05-UX-Canonical-Model-v1.0.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2 Freeze Package) |
| **Status** | ✅ `FROZEN` |
| **Tipe Dokumen** | **Normative Ontological Contract** |
| **Sumber Otoritas** | `03-UX-Architecture-Decision-Log-v1.0.md` (ADR-UX-001 s.d. 007) |
| **Berlaku untuk** | Seluruh artefak Gate 2, Gate 3, dan seluruh fase implementasi berikutnya |

---

## 0. Status Normatif Dokumen Ini

### 0.1 Fungsi Dokumen

Dokumen ini adalah **ontological contract** untuk SI GPIB v2.2. Ia membekukan definisi dan batas-batas konseptual dari seluruh istilah arsitektural yang digunakan di seluruh dokumen turunan.

### 0.2 Aturan Penggunaan

| Aturan | Pernyataan |
|---|---|
| **R-1** | Dokumen `01`, `02`, `03`, dan `04` **tidak boleh** mengubah, memperluas, atau mengaburkan definisi yang ditetapkan di dokumen ini. |
| **R-2** | Jika Gate 3 atau fase berikutnya menemukan bahwa suatu definisi perlu berubah, perubahan tersebut **harus** menjadi ADR baru, bukan edit terminologi di dokumen ini. |
| **R-3** | Setiap dokumen yang menggunakan istilah-istilah di bawah ini **wajib** menggunakannya sesuai definisi di sini. |
| **R-4** | Istilah yang tidak didefinisikan di dokumen ini tidak boleh diperlakukan sebagai canonical term tanpa melalui proses ADR. |

### 0.3 Urutan Eksekusi Gate 2 Freeze

```text
05 Canonical Model (dokumen ini — ontological contract)
       ↓
04 Architecture Principles (PR-01 s.d. PR-09)
       ↓
03 Architecture Decision Log (ADR-UX-001 s.d. 007)
       ↓
02 Entity Classification (revisi v1.1)
       ↓
01 Information Architecture (revisi v1.1)
       ↓
CONSISTENCY CHECK
       ↓
GATE 2 FREEZE
```

---

## 1. Struktur Ontologis SI GPIB

```text
SI GPIB CANONICAL MODEL
│
├── 1. PLACES
│   └── Workspace
│
├── 2. BUSINESS OBJECTS
│   ├── Entity
│   └── Transaction
│
├── 3. VIEWS
│   └── Detail / Record View
│
├── 4. PROJECTIONS
│   └── Cross-Context Analytical View
│
├── 5. CONTEXT
│   └── Execution Scope
│
├── 6. IDENTITY
│   ├── Person (Business Identity)
│   └── User Account (System Identity)
│
├── 7. AUTHORIZATION
│   ├── Role
│   └── Permission / Capability
│
├── 8. ASSIGNMENT
│   └── Identity ↔ Context/Function Relationship
│
└── 9. SESSION
    └── Active Context + Runtime State
```

---

## 2. Definisi Konsep

---

### 2.1 WORKSPACE

| Field | Content |
|---|---|
| **1. Definition** | Lingkungan kerja terpadu yang menyatukan Context + Entity + Sections + Actions dalam satu kesatuan navigasi. Workspace adalah representasi konseptual dari "ruang kerja" user terhadap suatu objek bisnis utama. |
| **2. Purpose** | Menyediakan tempat bagi user untuk menyelesaikan suatu gugus tugas (task cluster) tanpa harus berpindah-pindah halaman atau kehilangan konteks. |
| **3. What it IS** | Sebuah *Place* — destinasi navigasi utama. Ia memiliki identitas, sections, dan actions yang dapat diakses dari berbagai entry point. |
| **4. What it is NOT** | Bukan objek bisnis itu sendiri. Bukan projection. Bukan view dari satu transaksi. Bukan action. Bukan halaman CRUD flat. |
| **5. Relationship** | Workspace **dihuni oleh** Sections. Workspace **terikat pada** Context. Workspace **mengelola** Entities. Workspace **memiliki** Actions. |
| **6. UX Consequence** | Setiap Workspace harus memiliki header identitas (context chip), sections yang jelas, dan quick actions yang relevan. User harus selalu tahu "di mana saya" saat berada di dalam Workspace. |
| **7. Navigation Consequence** | Workspace **berhak** menjadi destinasi di Primary Navigation. Jumlah Workspace di SI GPIB = **2** (Organization Workspace + Person Workspace). |
| **8. Authorization Consequence** | Akses ke Workspace ditentukan oleh Role + Active Context. User hanya dapat membuka Workspace jika memiliki Assignment yang valid terhadap Entity tersebut. |
| **9. Canonical Examples** | `Organization Workspace` (untuk Mupel / Jemaat / Pos Pelkes). `Person Workspace` (untuk Pendeta / Pelayan / Relawan — role-specific progressive disclosure). |
| **10. Anti-Pattern** | ❌ Membuat Workspace untuk setiap entitas (aset, bantuan, jadwal). ❌ Membuat Workspace untuk Projection (Peta, Laporan). ❌ Membuat Workspace untuk Sinode (Sinode = Context, bukan Place). |

---

### 2.2 ENTITY (Business Object)

| Field | Content |
|---|---|
| **1. Definition** | Objek bisnis bermakna yang memiliki identitas unik, lifecycle, atribut, dan relasi. Entity adalah "benda" yang dikelola oleh organisasi. |
| **2. Purpose** | Merepresentasikan unit informasi bisnis yang dapat dibuat, dilihat, diubah, dan dihapus sesuai aturan domain. |
| **3. What it IS** | Sebuah *Business Object* dengan PK, atribut, relasi, dan lifecycle. Ia adalah "kata benda" dalam domain GPIB. |
| **4. What it is NOT** | Bukan halaman UI. Bukan route. Bukan tabel database secara langsung (tabel bisa lebih banyak dari entity). Bukan action. Bukan view. |
| **5. Relationship** | Entity **dimiliki oleh** Organization/Context. Entity **dikelola di dalam** Workspace Sections. Entity **dapat memiliki** Transactions. Entity **dapat diakses dari** Views dan Projections. |
| **6. UX Consequence** | Entity ditampilkan sebagai record/item di dalam Section. Klik pada Entity membuka Detail View (PR-06: One Entity, Multiple Entry Points). |
| **7. Navigation Consequence** | Entity **tidak berhak** menjadi destinasi navigasi utama. Ia adalah *konten* di dalam Workspace, bukan *tempat*. |
| **8. Authorization Consequence** | CRUD terhadap Entity dibatasi oleh Permission (Role) + Data Scope (Context). |
| **9. Canonical Examples** | `Organization` (Mupel, Jemaat, Pos Pelkes). `Person` (Pendeta, Pelayan, Relawan). `Asset` (Tanah, Bangunan, Bergerak). `PastoralRecord`. `WorshipSchedule`. `TerritoryData`. |
| **10. Anti-Pattern** | ❌ "1 tabel = 1 halaman = 1 menu". ❌ Menjadikan Entity kecil (Jadwal Ibadah, Lampiran) sebagai destinasi navigasi. ❌ Mencampur Entity dengan Action di navigasi. |

---

### 2.3 TRANSACTION (Business Object — Workflow)

| Field | Content |
|---|---|
| **1. Definition** | Objek bisnis yang memiliki lifecycle workflow dengan status berjenjang dan melibatkan lebih dari satu actor/role. Transaction adalah Entity yang "bergerak" melalui tahapan approval. |
| **2. Purpose** | Merepresentasikan proses bisnis yang memerlukan persetujuan, review, atau eksekusi berurutan dari beberapa pihak. |
| **3. What it IS** | Sebuah *Business Object* dengan status lifecycle (`Draft → Submitted → Approved → Rejected`), timeline, dan multi-actor involvement. |
| **4. What it is NOT** | Bukan Workspace. Bukan tempat bekerja. Bukan navigasi utama. Ia adalah **objek yang dikerjakan**, bukan **tempat bekerja**. |
| **5. Relationship** | Transaction **dimiliki oleh** Entity/Context asal (misal: Pos Pelkes). Transaction **diproses melalui** Projection Queue. Transaction **ditampilkan melalui** Transaction Detail View. |
| **6. UX Consequence** | User membuat Transaction dari dalam Workspace (Section). Approver melihat antrian Transaction melalui Projection. Detail Transaction dibuka dari kedua entry point. |
| **7. Navigation Consequence** | Transaction **tidak berhak** menjadi destinasi navigasi utama. Ia adalah objek yang diakses dari Section (Creator) atau Queue Projection (Approver). |
| **8. Authorization Consequence** | Create = Creator Role (PJ Pos). Approve/Reject = Approver Role (KMJ, Mupel) di Context yang sesuai. |
| **9. Canonical Examples** | `AidRequest` (Pengajuan Bantuan: Draft → Diajukan → Disetujui_KMJ → Disetujui_Mupel → Ditolak). |
| **10. Anti-Pattern** | ❌ Membuat "Aid Request Workspace". ❌ Menjadikan `/bantuan/new` sebagai rute navigasi utama. ❌ Memaksa Approver masuk ke Pos satu per satu untuk review. |

---

### 2.4 VIEW (Detail / Record View)

| Field | Content |
|---|---|
| **1. Definition** | Tampilan detail dari satu Entity atau Transaction. View adalah cara user **melihat** satu objek spesifik, bukan tempat user **bekerja**. |
| **2. Purpose** | Menyajikan seluruh informasi relevan tentang satu objek/record tertentu dalam satu layar terfokus. |
| **3. What it IS** | Sebuah *rendering surface* untuk satu Entity/Transaction. Ia dipanggil dari berbagai entry point (PR-06). Ia bukan destinasi navigasi mandiri. |
| **4. What it is NOT** | Bukan Workspace. Bukan Section. Bukan Projection. Bukan node di pohon navigasi. Bukan halaman yang berdiri sendiri tanpa parent context. |
| **5. Relationship** | View **menampilkan** satu Entity atau Transaction. View **dipanggil dari** Section (di Workspace) ATAU dari Projection (Queue). View **tunduk pada** Context dan Permission yang sama dengan parent-nya. |
| **6. UX Consequence** | View memiliki header identitas objek, konten detail, dan action buttons yang sesuai Permission. Back-navigation kembali ke entry point asal (bukan ke "halaman list" generik). |
| **7. Navigation Consequence** | View **tidak muncul** di navigasi utama, sidebar, atau bottom nav. Ia adalah *deep link target* yang diakses dari entry point lain. |
| **8. Authorization Consequence** | View hanya dapat dibuka jika user memiliki Read Permission terhadap Entity/Transaction tersebut di Active Context saat ini. |
| **9. Canonical Examples** | `Aid Request Detail View` (dipanggil dari Org Workspace → Aid Section, ATAU dari Aid Review Queue). `Asset Detail View`. `Person 360 View` (di dalam Person Workspace). `Pastoral Record Detail View`. |
| **10. Anti-Pattern** | ❌ Membuat View sebagai destinasi di bottom nav. ❌ Membuat route terpisah untuk setiap View tanpa parent context. ❌ Menganggap View = Workspace. |

---

### 2.5 PROJECTION (Cross-Context Analytical View)

| Field | Content |
|---|---|
| **1. Definition** | Cara pandang atau analisis terhadap data yang berasal dari beberapa domain/entity/context. Projection adalah **lensa**, bukan **tempat**. |
| **2. Purpose** | Memungkinkan user melihat, menganalisis, atau memproses data lintas konteks tanpa harus mengunjungi setiap Workspace satu per satu. |
| **3. What it IS** | Sebuah *analytical/operational lens* yang mengumpulkan, memfilter, dan menyajikan data berdasarkan kriteria tertentu (role, status, wilayah, waktu). |
| **4. What it is NOT** | Bukan Workspace. Bukan Entity. Bukan Transaction. Bukan destinasi navigasi utama. Ia tidak memiliki "konten milik sendiri" — ia meminjam data dari Entities dan Transactions. |
| **5. Relationship** | Projection **mengambil data dari** Entities dan Transactions. Projection **diakses dari** Access Hierarchy (widget di Home, search, section, notification). Projection **dapat memanggil** Detail Views. |
| **6. UX Consequence** | Projection disajikan sebagai widget/card di Contextual Home (entry point), atau sebagai halaman full-screen yang dipanggil dari widget. Ia bukan tab di bottom nav. |
| **7. Navigation Consequence** | Projection **tidak berhak** memiliki slot di Primary Navigation (bottom nav). Ia masuk dalam **Access Hierarchy**, bukan **Navigation Hierarchy**. |
| **8. Authorization Consequence** | Projection menampilkan data sesuai Data Scope dari Active Context + Role. KMJ melihat Aid Queue untuk Jemaatnya; Mupel melihat untuk Mupelnya. |
| **9. Canonical Examples** | `Territory Map` (spatial projection). `Asset Intelligence` (cross-org asset view). `Aid Review Queue` (workflow inbox). `Reports & Analytics` (consolidated projection). `Pastoral Dashboard`. |
| **10. Anti-Pattern** | ❌ Menjadikan "Peta" atau "Laporan" sebagai item di bottom nav. ❌ Membuat Projection yang tidak terikat pada Context/Role (data tanpa scope). ❌ Menganggap Projection = Workspace. |

---

### 2.6 CONTEXT (Execution Scope)

| Field | Content |
|---|---|
| **1. Definition** | Lingkup organisasi/wilayah di mana user bekerja dan di mana data serta aksi dibatasi. Context menjawab: *"Di mana saya sedang bekerja?"* |
| **2. Purpose** | Mengisolasi data scope dan action constraint berdasarkan unit organisasi. Context menentukan **batas eksekusi** dari setiap operasi sistem. |
| **3. What it IS** | Sebuah *scope boundary* yang hierarkis: Sinode → Mupel → Jemaat → Pos Pelkes. Ia adalah "ruang lingkup" bukan "ruang kerja". |
| **4. What it is NOT** | Bukan Workspace (Sinode bukan tempat bekerja). Bukan Entity. Bukan Role. Bukan Permission. Ia adalah **di mana** aksi terjadi, bukan **apa** yang boleh dilakukan. |
| **5. Relationship** | Context **membatasi** data yang terlihat (Data Scope). Context **membatasi** aksi yang boleh dilakukan (Action Constraint). Context **dipilih** melalui Session. Context **memiliki** Entities. |
| **6. UX Consequence** | Context harus selalu terlihat (Context Chip di header). Form input terkunci ke Active Context (Poka-Yoke). Perpindahan Context mengubah seluruh konten tanpa mengubah navigasi. |
| **7. Navigation Consequence** | Context **bukan** item navigasi. Ia adalah **state** yang memengaruhi konten di setiap destinasi. Context Switcher adalah mekanisme perubahan scope, bukan perpindahan halaman. |
| **8. Authorization Consequence** | RBAC menentukan *apa* yang boleh; Context menentukan *di mana* itu boleh. Kombinasi keduanya menghasilkan Permission efektif. |
| **9. Canonical Examples** | `Sinode` (Global Scope — bukan tabel, bukan workspace). `Mupel` (Regional Scope). `Jemaat Induk` (Local Church Scope). `Pos Pelkes` (Outpost Scope). |
| **10. Anti-Pattern** | ❌ Membuat "Sinode Workspace". ❌ Menyimpan Active Context di tabel `users` secara permanen. ❌ Mengasumsikan satu user = satu context. ❌ Tidak menampilkan Context secara visual. |

---

### 2.7 PERSON (Business Identity)

| Field | Content |
|---|---|
| **1. Definition** | Individu manusia yang terlibat dalam pelayanan GPIB. Person adalah **entitas bisnis** yang memiliki identitas, peran, dan riwayat. |
| **2. Purpose** | Merepresentasikan "siapa orangnya" secara independen dari apakah ia memiliki akun sistem atau tidak. |
| **3. What it IS** | Sebuah *Business Entity* dengan identitas (nama, kontak, foto), peran (Pendeta/Pelayan/Relawan), dan riwayat (penugasan, kompetensi, aktivitas). |
| **4. What it is NOT** | Bukan User Account. Bukan Role. Bukan Assignment. Person bisa ada tanpa User Account (relawan tanpa login). Person ≠ cara masuk ke sistem. |
| **5. Relationship** | Person **dapat memiliki** 0..1 User Account. Person **memiliki** Roles (tipe: Pendeta/Pelayan/Relawan). Person **memiliki** Assignments. Person **menghasilkan** Activities (Pastoral Records). |
| **6. UX Consequence** | Person ditampilkan di Person Directory (unified catalog). Detail Person dibuka di Person Workspace dengan progressive disclosure sesuai Role. |
| **7. Navigation Consequence** | Person Directory adalah destinasi di Primary Navigation (slot "SDM"). Person Workspace adalah destinasi kedua. |
| **8. Authorization Consequence** | Akses ke data Person (terutama Keluarga, Biometrik) dibatasi oleh Permission Matrix. Pemilik data memiliki akses penuh; role lain terbatas. |
| **9. Canonical Examples** | `Pdt. Anita` (Person type: Pendeta; Roles: KMJ Jemaat A; Assignments: Pos B, Pos C). `Bpk. Yohanes` (Person type: Pelayan/Penatua; tidak memiliki User Account). |
| **10. Anti-Pattern** | ❌ Menyamakan Person dengan User Account. ❌ Memaksa semua Person memiliki login. ❌ Membuat 3 navigasi terpisah untuk Pendeta/Pelayan/Relawan. ❌ Memaksakan UI identik untuk semua Person types. |

---

### 2.8 USER ACCOUNT (System Identity)

| Field | Content |
|---|---|
| **1. Definition** | Objek identitas sistem yang memungkinkan seorang Person berinteraksi dengan aplikasi. User Account adalah **kunci masuk**, bukan **orangnya**. |
| **2. Purpose** | Mengelola autentikasi (email, passkey, biometrik), sesi, dan preferensi teknis user di dalam sistem. |
| **3. What it IS** | Sebuah *System Object* dengan kredensial (email, password hash, WebAuthn credentials), RBAC role, dan session management. |
| **4. What it is NOT** | Bukan Person. Bukan business entity. Bukan bagian dari domain SDM. User Account tanpa Person yang terhubung adalah anomali yang harus dihindari. |
| **5. Relationship** | User Account **terhubung 0..1 ke** Person. User Account **memiliki** System Role. User Account **memiliki** Valid Contexts. User Account **menghasilkan** Sessions. |
| **6. UX Consequence** | User Account dikelola di "Akun & Sistem" (Utility), bukan di "SDM". Pengaturan profil, passkey, dan preferensi ada di sini. |
| **7. Navigation Consequence** | User Account adalah slot ke-5 di bottom nav ("Akun & Sistem"), tetapi sebagai Utility, bukan Workspace. |
| **8. Authorization Consequence** | User Account adalah subjek dari RBAC. Ia memiliki System Role yang menentukan Permission. Ia juga memiliki Valid Contexts yang menentukan Data Scope. |
| **9. Canonical Examples** | `pdta.anita@gpib.or.id` (User Account untuk Person Pdt. Anita). `admin.mupel3@gpib.or.id` (User Account untuk Admin Mupel 3). |
| **10. Anti-Pattern** | ❌ Menjadikan `users` sebagai subtype Person di UX. ❌ Menyimpan data bisnis (jabatan, keluarga) di tabel `users`. ❌ Mengasumsikan setiap Person harus punya User Account. |

---

### 2.9 ROLE (Authorization Construct)

| Field | Content |
|---|---|
| **1. Definition** | Kapasitas di mana seseorang beroperasi di dalam sistem/organisasi. Role menjawab: *"Dalam kapasitas apa orang ini bekerja?"* |
| **2. Purpose** | Menentukan seperangkat Permission (capability) yang melekat pada suatu kapasitas kerja. |
| **3. What it IS** | Sebuah *Authorization Construct* yang mengikat seperangkat Permission. Di SI GPIB ada dua jenis: **Organizational Role** (KMJ, PJ Pos) dan **System Role** (super_user, admin_mupel, kmj, pj, pendeta, pelayan, relawan, user). |
| **4. What it is NOT** | Bukan Person. Bukan Context. Bukan Permission itu sendiri (Role *memiliki* Permissions). Bukan Assignment (Role = kapasitas; Assignment = di mana). |
| **5. Relationship** | Role **dimiliki oleh** User Account (System Role) atau Person (Organizational Role). Role **menentukan** Permissions. Role **berlaku di dalam** Context tertentu. |
| **6. UX Consequence** | Role menentukan apa yang terlihat dan dapat dilakukan user. UI harus menyembunyikan/menampilkan elemen berdasarkan Role. |
| **7. Navigation Consequence** | Role tidak mengubah struktur navigasi (PR-07). Role mengubah **konten** di dalam destinasi navigasi yang stabil. |
| **8. Authorization Consequence** | Role adalah input utama untuk Permission evaluation. `Role × Context × Permission = Effective Access`. |
| **9. Canonical Examples** | `super_user` (System Role, Global). `admin_mupel` (System Role, Mupel scope). `kmj` (System Role, Jemaat scope). `pj` (System Role, Pos scope). `KMJ Jemaat Paulus` (Organizational Role). |
| **10. Anti-Pattern** | ❌ Mencampur Person Type (Pendeta/Pelayan/Relawan) dengan System Role. ❌ Membuat Role baru untuk setiap fitur. ❌ Mengasumsikan Role = satu Context tetap. |

---

### 2.10 PERMISSION / CAPABILITY (Authorization Construct)

| Field | Content |
|---|---|
| **1. Definition** | Hak spesifik untuk melakukan suatu operasi (Read, Create, Edit, Delete, Approve, Upload) terhadap suatu Entity di dalam suatu Context. |
| **2. Purpose** | Menjadi unit terkecil dari evaluasi akses. Permission adalah "atom" dari RBAC. |
| **3. What it IS** | Sebuah *atomic authorization rule*: `Subject (Role) × Action × Object (Entity) × Context = Allow/Deny`. |
| **4. What it is NOT** | Bukan Role (Role memiliki banyak Permissions). Bukan Context. Bukan UI element. Permission adalah aturan, bukan tombol. |
| **5. Relationship** | Permission **dimiliki oleh** Role. Permission **dievaluasi terhadap** Context. Permission **mengontrol** Action availability di UI. |
| **6. UX Consequence** | UI harus menyembunyikan atau disable action buttons jika user tidak memiliki Permission. Poka-Yoke: jangan tampilkan tombol yang tidak bisa digunakan. |
| **7. Navigation Consequence** | Permission tidak mengubah navigasi. Ia mengubah **ketersediaan aksi** di dalam navigasi yang stabil. |
| **8. Authorization Consequence** | Permission dievaluasi di server-side (RLS, rbac.ts) dan di client-side (UI visibility). Kedua layer harus konsisten. |
| **9. Canonical Examples** | `pj_pos` dapat `Create` `PastoralRecord` di `Pos Context`. `kmj` dapat `Approve` `AidRequest` di `Jemaat Context`. `super_user` dapat `Edit` `Organization` di `Global Context`. |
| **10. Anti-Pattern** | ❌ Menyembunyikan data tapi membiarkan action. ❌ Menampilkan tombol yang selalu disabled tanpa penjelasan. ❌ Mengevaluasi Permission hanya di client-side. |

---

### 2.11 ASSIGNMENT (Scope Relationship)

| Field | Content |
|---|---|
| **1. Definition** | Relasi yang mengikat seorang Person ke suatu Context dan/atau Fungsi dalam periode tertentu. Assignment menjawab: *"Di mana dan kapan orang ini bertugas?"* |
| **2. Purpose** | Menentukan Valid Contexts untuk seorang Person — yaitu daftar Context di mana ia diizinkan bekerja. |
| **3. What it IS** | Sebuah *Relationship Construct* dengan atribut: Person, Organization/Context, Role/Fungsi, Periode (tgl_mulai, tgl_selesai), Status. |
| **4. What it is NOT** | Bukan Person. Bukan Role. Bukan Context. Assignment adalah **penghubung** antara Identity dan Context. |
| **5. Relationship** | Assignment **menghubungkan** Person ↔ Organization Context. Assignment **menentukan** Valid Context Set untuk Session. Assignment **memiliki** periode dan status. |
| **6. UX Consequence** | Context Switcher menampilkan daftar Context yang berasal dari Assignments user. User tidak dapat memilih Context di luar Assignments-nya. |
| **7. Navigation Consequence** | Assignment tidak memengaruhi struktur navigasi. Ia memengaruhi **daftar Context yang tersedia** di Context Switcher. |
| **8. Authorization Consequence** | Assignment adalah input untuk menentukan Valid Contexts. Tanpa Assignment yang aktif, user tidak dapat mengaktifkan suatu Context di Session. |
| **9. Canonical Examples** | `Pdt. Anita → Homebase: Jemaat Paulus (2020–sekarang)`. `Pdt. Anita → Penugasan: Pos Serangkang (2022–2025)`. `Pdt. Otniel → KMJ: Jemaat Getsemani (2019–sekarang)`. |
| **10. Anti-Pattern** | ❌ Menyimpan Assignment sebagai kolom statis di tabel `users` (misal: `users.id_pos`). ❌ Mengasumsikan satu Person hanya punya satu Assignment. ❌ Tidak memodelkan periode Assignment. |

---

### 2.12 SESSION (Runtime State)

| Field | Content |
|---|---|
| **1. Definition** | State runtime dari interaksi user dengan sistem pada satu waktu tertentu. Session mencakup Active Context, token autentikasi, dan preferensi sementara. |
| **2. Purpose** | Menyimpan "di mana user sedang bekerja sekarang" dan "apa yang sedang ia lakukan" secara real-time. |
| **3. What it IS** | Sebuah *Runtime State* yang bersifat sementara (per-session), tersimpan di client (memory/localStorage) dan server (auth token). |
| **4. What it is NOT** | Bukan User Account (Account bersifat persisten; Session bersifat sementara). Bukan Assignment (Assignment adalah data persisten; Session adalah state aktif). Bukan Context (Context adalah scope; Session adalah state yang menyimpan scope aktif). |
| **5. Relationship** | Session **dimiliki oleh** User Account. Session **menyimpan** Active Context. Session **dievaluasi** oleh Permission engine. Session **berakhir** saat logout atau timeout. |
| **6. UX Consequence** | Active Context harus selalu terlihat di UI (Context Chip). Perpindahan Context dalam Session mengubah seluruh konten tanpa reload app. |
| **7. Navigation Consequence** | Session tidak memengaruhi struktur navigasi. Ia memengaruhi **konten** yang dirender di setiap destinasi. |
| **8. Authorization Consequence** | Session menyimpan Active Context yang menjadi input untuk setiap evaluasi Permission. Tanpa Session yang valid, tidak ada akses. |
| **9. Canonical Examples** | `Session: { user: 'pdta.anita@...', activeContext: 'POS-001 (Serangkang)', validContexts: ['JEM-02-01', 'POS-001', 'POS-002'] }`. |
| **10. Anti-Pattern** | ❌ Menyimpan Active Context di database secara permanen. ❌ Mengasumsikan Session = User Account. ❌ Tidak memvalidasi Session di setiap server action. |

---

### 2.13 ACTIVE CONTEXT (Session State)

| Field | Content |
|---|---|
| **1. Definition** | Context yang sedang dipilih dan aktif di dalam Session saat ini. Active Context menentukan data scope dan action constraint untuk seluruh operasi yang sedang berlangsung. |
| **2. Purpose** | Menjadi "kacamata" yang digunakan sistem untuk menentukan data mana yang relevan dan aksi mana yang diizinkan pada momen ini. |
| **3. What it IS** | Sebuah *Session State property* yang menunjuk ke satu Context spesifik (misal: `id_pos = 'POS-001'`). |
| **4. What it is NOT** | Bukan Context itu sendiri (Context adalah konsep; Active Context adalah instance yang dipilih). Bukan User Account property. Bukan Assignment (meskipun berasal dari Assignments). |
| **5. Relationship** | Active Context **berasal dari** Valid Contexts (yang diturunkan dari Assignments). Active Context **membatasi** Data Scope. Active Context **mengunci** Form Scope (Poka-Yoke). |
| **6. UX Consequence** | Active Context ditampilkan sebagai Context Chip di header. Mengubah Active Context memicu re-hydration seluruh konten. Form input terkunci ke Active Context. |
| **7. Navigation Consequence** | Mengubah Active Context **tidak mengubah** struktur navigasi (PR-07). Ia mengubah konten di dalam destinasi yang stabil. |
| **8. Authorization Consequence** | Setiap server action **wajib** memvalidasi Active Context sebelum eksekusi. Active Context yang tidak valid = reject. |
| **9. Canonical Examples** | `Active Context: Pos Pelkes Serangkang (POS-001)`. `Active Context: Jemaat Paulus (02-01-BM)`. `Active Context: Sinode GPIB (GLOBAL)`. |
| **10. Anti-Pattern** | ❌ Menyimpan Active Context di tabel `users` (kolom `id_pos`). ❌ Tidak menampilkan Active Context secara visual. ❌ Mengizinkan form input tanpa mengunci ke Active Context. |

---

### 2.14 CONTEXT SWITCHER (Execution Scope Mechanism)

| Field | Content |
|---|---|
| **1. Definition** | Mekanisme perubahan execution scope. Secara UI ia adalah chip + bottom sheet; secara arsitektur ia adalah **state transition engine**. |
| **2. Purpose** | Memungkinkan user berpindah dari satu Active Context ke Active Context lain tanpa logout, dengan re-evaluasi penuh terhadap permissions dan data. |
| **3. What it IS** | Sebuah *Mekanisme* (bukan sekadar komponen UI). Ia melakukan: Validate authorization → Update Session → Rehydrate data → Re-evaluate permissions → Re-render content. |
| **4. What it is NOT** | Bukan dropdown biasa. Bukan navigasi. Bukan filter. Ia adalah **perubahan scope eksekusi** yang memiliki konsekuensi keamanan. |
| **5. Relationship** | Context Switcher **membaca** Valid Contexts dari Assignments. Context Switcher **menulis** Active Context ke Session. Context Switcher **memicu** re-evaluation di seluruh sistem. |
| **6. UX Consequence** | Setelah switch, seluruh konten berubah: Home, Workspace sections, Quick Actions, Projections. Context Chip di header selalu mencerminkan Active Context. |
| **7. Navigation Consequence** | Context Switcher ada di header, bukan di bottom nav. Ia bukan destinasi; ia adalah **kontrol global**. |
| **8. Authorization Consequence** | Context Switcher hanya menampilkan Contexts yang ada di Valid Context Set. User tidak dapat memilih Context di luar otorisasinya. Setiap switch divalidasi di server. |
| **9. Canonical Examples** | Pdt. Anita tap Context Chip → muncul: [Jemaat Paulus (Homebase), Pos Serangkang (Assignment), Pos Anugerah (Assignment)] → pilih Pos Serangkang → seluruh UI rehydrate. |
| **10. Anti-Pattern** | ❌ Menganggap Context Switcher = dropdown filter. ❌ Tidak melakukan re-evaluation setelah switch. ❌ Menyimpan pilihan context di localStorage tanpa validasi server. |

---

### 2.15 CAPABILITY (Organization Capability)

| Field | Content |
|---|---|
| **1. Definition** | Kemampuan operasional yang dimiliki oleh suatu Organization Workspace. Capability bukan entitas mandiri, melainkan **aspek fungsional** dari organisasi. |
| **2. Purpose** | Mengelompokkan functionality yang melekat pada organisasi tanpa memaksakannya sebagai Workspace atau Domain terpisah. |
| **3. What it IS** | Sebuah *Section-level grouping* di dalam Organization Workspace yang merepresentasikan satu area operasional (Pastoral, Assets, Territory, Aid). |
| **4. What it is NOT** | Bukan Domain. Bukan Workspace. Bukan Entity. Capability adalah **apa yang organisasi bisa lakukan**, bukan **tempat organisasi berada**. |
| **5. Relationship** | Capability **berada di dalam** Organization Workspace sebagai Section. Capability **mengelola** Entities. Capability **dapat memiliki** Projections (untuk cross-context viewing). |
| **6. UX Consequence** | Capability muncul sebagai tab/section di Organization Workspace. User mengaksesnya dari dalam Workspace, bukan dari navigasi terpisah. |
| **7. Navigation Consequence** | Capability **tidak memiliki** slot navigasi sendiri. Ia adalah bagian dari Organization Workspace navigation. |
| **8. Authorization Consequence** | Akses ke Capability mengikuti Context + Role yang berlaku di Organization Workspace. |
| **9. Canonical Examples** | `Pastoral` (capability). `Assets & Property` (capability). `Territory Intelligence` (capability). `Aid & Workflow` (capability). `Demography` (capability). |
| **10. Anti-Pattern** | ❌ Membuat "Pastoral Workspace" atau "Asset Workspace" sebagai standalone destination. ❌ Menjadikan Capability sebagai item di bottom nav. ❌ Menganggap Capability = Domain. |

---

## 3. Canonical Classification Matrix

| Concept | Class | Is Place? | Is Object? | Is View? | Is Projection? | Is Context? | Is Identity? | Is Auth? | Is Assignment? | Runtime? |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Organization Workspace | Workspace | ✓ | | | | | | | | |
| Person Workspace | Workspace | ✓ | | | | | | | | |
| Organization | Entity | | ✓ | | | | | | | |
| Person | Entity | | ✓ | | | | ✓ | | | |
| Asset | Entity | | ✓ | | | | | | | |
| PastoralRecord | Entity | | ✓ | | | | | | | |
| WorshipSchedule | Entity | | ✓ | | | | | | | |
| TerritoryData | Entity | | ✓ | | | | | | | |
| AidRequest | Transaction | | ✓ | | | | | | | |
| Aid Request Detail | Transaction View | | | ✓ | | | | | | |
| Asset Detail | Entity View | | | ✓ | | | | | | |
| Person 360 View | Entity View | | | ✓ | | | | | | |
| Pastoral Record Detail | Record View | | | ✓ | | | | | | |
| Territory Map | Projection | | | | ✓ | | | | | |
| Asset Intelligence | Projection | | | | ✓ | | | | | |
| Aid Review Queue | Projection | | | | ✓ | | | | | |
| Reports & Analytics | Projection | | | | ✓ | | | | | |
| Pastoral Dashboard | Projection | | | | ✓ | | | | | |
| Sinode | Context | | | | | ✓ | | | | |
| Mupel | Context | | | | | ✓ | | | | |
| Jemaat Induk | Context | | | | | ✓ | | | | |
| Pos Pelkes | Context | | | | | ✓ | | | | |
| User Account | System Identity | | | | | | ✓ | | | |
| Role | Authorization | | | | | | | ✓ | | |
| Permission | Authorization | | | | | | | ✓ | | |
| Assignment | Scope Relationship | | | | | | | | ✓ | |
| Session | Runtime State | | | | | | | | | ✓ |
| Active Context | Session State | | | | | | | | | ✓ |
| Context Switcher | Mechanism | | | | | | | | | ✓ |
| Pastoral (capability) | Capability | | | | | | | | | |
| Assets (capability) | Capability | | | | | | | | | |
| Territory (capability) | Capability | | | | | | | | | |

---

## 4. Relationship Map (Canonical)

```text
PLACES (2)
├── Organization Workspace ←── manages ──→ Entities + Capabilities
└── Person Workspace ←── displays ──→ Person (role-specific)

BUSINESS OBJECTS
├── Entities ←── owned by ──→ Context
├── Entities ←── displayed in ──→ Workspace Sections
├── Entities ←── rendered as ──→ Views
└── Transactions ←── queued in ──→ Projections

VIEWS
└── Detail/Record Views ←── called from ──→ Sections OR Projections (PR-06)

PROJECTIONS
└── Cross-Context Views ←── sourced from ──→ Entities + Transactions
    ←── accessed via ──→ Access Hierarchy (Home widgets, search, sections)

CONTEXT
└── Execution Scopes ←── hierarchically structured ──→ Sinode > Mupel > Jemaat > Pos
    ←── selected via ──→ Session (Active Context)

IDENTITY
├── Person ←── 0..1 ──→ User Account
├── Person ←── has ──→ Roles (type)
├── Person ←── has ──→ Assignments
└── User Account ←── has ──→ System Role + Permissions + Valid Contexts

AUTHORIZATION
├── Role ←── grants ──→ Permissions
└── Permission ←── evaluated against ──→ Context

ASSIGNMENT
└── Person ↔ Organization Context ←── determines ──→ Valid Context Set

SESSION
├── Session ←── stores ──→ Active Context
├── Active Context ←── constrains ──→ Data Scope + Action Scope
└── Context Switcher ←── mutates ──→ Active Context (with full re-evaluation)
```

---

## 5. Governing Rules (Normative Constraints)

| # | Rule | Source |
|---|---|---|
| **CR-1** | Hanya ada **2 Workspaces** di SI GPIB: Organization Workspace dan Person Workspace. Tidak boleh ada yang ketiga tanpa ADR baru. | ADR-01 s.d. 04 |
| **CR-2** | Transaction dan Entity **bukan** Workspace dan **bukan** node navigasi. Mereka adalah objek yang diproses/dilihat. | ADR-03, PR-02 |
| **CR-3** | Projection **tidak boleh** memiliki slot di Primary Navigation. Projection masuk Access Hierarchy. | ADR-05, PR-05 |
| **CR-4** | Sinode adalah Context Scope, bukan Workspace, bukan Entity. | ADR-06 |
| **CR-5** | Active Context adalah Session State, bukan property persisten di User Account. | ADR-07, PR-09 |
| **CR-6** | Person ≠ User Account. Relasi 0..1. Person tanpa Account adalah valid. | ADR-04, PR-04 |
| **CR-7** | Satu Entity/Transaction dapat diakses dari multiple entry points tanpa duplikasi. | PR-06 |
| **CR-8** | Navigasi utama stabil lintas role. Konten adaptif. | ADR-05, PR-07 |
| **CR-9** | Home adalah Work Entry Point, bukan Dashboard. | PR-08 |
| **CR-10** | Context Switcher adalah mekanisme perubahan execution scope, bukan UI filter. | ADR-07 |

---

## 6. Change Control

| Aturan | Penjelasan |
|---|---|
| Dokumen ini **FROZEN** setelah Gate 2. | Tidak ada perubahan tanpa ADR baru. |
| Perubahan definisi = ADR baru. | Bahkan perubahan satu kata pada definisi memerlukan justifikasi arsitektural. |
| Penambahan konsep baru = ADR baru. | Jika Gate 3+ menemukan kebutuhan konsep baru, ia harus melalui proses ADR sebelum ditambahkan ke dokumen ini. |
| Dokumen 01–04 harus konsisten dengan dokumen ini. | Consistency Check sebelum Gate 2 Freeze memverifikasi hal ini. |

---

*Dokumen ini adalah bagian dari rantai arsitektur SI GPIB v2.2: Phase 0 (Source of Truth) → Phase 1 (Entity Model) → Phase 2A (Architecture Decisions) → **Gate 2 Freeze Package (dokumen ini: ontological contract)** → Phase 3 (Context & Authorization).*