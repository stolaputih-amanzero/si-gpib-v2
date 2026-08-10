Berikut adalah draf final untuk **`04-UX-Architecture-Principles-v1.0.md`**. Dokumen ini disusun sebagai "hukum arsitektur" (architectural law) yang ringkas, tegas, dan langsung dapat dijadikan rujukan wajib oleh tim desain, *frontend engineer*, maupun *backend engineer* sebelum mereka menulis satu pun baris kode atau membuat *wireframe*.

---

# 04 — UX Architecture Principles v1.0

| Field | Value |
|---|---|
| **Dokumen** | `04-UX-Architecture-Principles-v1.0.md` |
| **Project** | SI GPIB v2.2 (Mobile-First PWA) |
| **Phase** | 2A — Architecture Decisions (Gate 2 Freeze Package) |
| **Status** | ✅ `FROZEN` |
| **Sumber Otoritas** | `03-UX-Architecture-Decision-Log-v1.0.md` (ADR-UX-001 s.d. 007) |

## 1. Tujuan Dokumen
Dokumen ini adalah **ringkasan eksekutif dan hukum arsitektur** yang mengikat seluruh keputusan desain UX, struktur navigasi, dan implementasi teknis di SI GPIB v2.2. 

Setiap desainer, developer, dan product manager **wajib** merujuk pada 9 prinsip ini. Jika sebuah fitur, *route*, atau desain layar melanggar prinsip di bawah ini, ia harus ditolak atau diajukan ulang melalui proses *Architecture Decision Record (ADR)* baru.

## 2. Pengelompokan Prinsip
Ke-9 prinsip ini dibagi ke dalam 4 pilar arsitektur untuk memudahkan pemetaan mental:
1. **Ontology & Structure** (Apa hakikat benda di dalam sistem?)
2. **Navigation & Access** (Bagaimana cara menuju ke sana?)
3. **Interaction & Experience** (Bagaimana cara bekerja di sana?)
4. **Context & Authority** (Apa batas ruang lingkup dan wewenang saya?)

---

### PILAR 1: ONTOLOGY & STRUCTURE

#### PR-01: Importance ≠ Navigation Level
> **Pentingnya suatu data tidak otomatis menjadikannya *Workspace* atau Menu Utama. Tingkat navigasi ditentukan oleh konteks kerja pengguna, bukan oleh volume atau urgensi data.**
*   **Implikasi:** Data yang sangat kritis (seperti Aset Tanah atau Laporan Keuangan) tidak otomatis mendapat slot di *Bottom Navigation*. Mereka ditempatkan di dalam *Workspace* atau *Projection* yang sesuai dengan tempat user bekerja.

#### PR-02: Transaction ≠ Workspace
> **Workflow, pengajuan, dan tiket adalah *objek* yang diproses di dalam workspace atau antrian, bukan ruang kerja itu sendiri.**
*   **Implikasi:** "Pengajuan Bantuan" bukanlah sebuah *Workspace*. User tidak "pergi ke Ruang Pengajuan". User membuat objek pengajuan dari dalam *Organization Workspace*, dan meninjaunya melalui *Aid Review Queue* (Projection).

#### PR-04: Person ≠ User Account
> **Identitas manusia (*siapa orangnya*) terpisah secara fundamental dari akun sistem (*bagaimana ia masuk ke aplikasi*).**
*   **Implikasi:** Tidak semua `Person` (misal: Relawan, Anak Sekolah Minggu) memiliki `User Account`. Relasi keduanya adalah 0..1. Struktur database autentikasi (`users`) tidak boleh mendikte struktur hierarki SDM di UX.

#### PR-05: Projection is a View, not a Place
> **Projection (Peta, Laporan, Antrian) adalah cara pandang atau analisis terhadap data, bukan tempat bekerja (Workspace).**
*   **Implikasi:** Peta Sebaran dan Laporan Analytics tidak boleh diperlakukan sebagai *Primary Navigation Destination* yang sejajar dengan Organisasi atau SDM. Mereka adalah *System Capabilities* yang diakses melalui *Access Hierarchy* (widget, search, atau section), bukan *Navigation Hierarchy*.

---

### PILAR 2: NAVIGATION & ACCESS

#### PR-06: One Entity, Multiple Entry Points
> **Satu Entity dapat ditemukan, dilihat, atau ditindaklanjuti melalui berbagai *entry point* kontekstual tanpa menciptakan duplikasi Entity, Workspace, atau destinasi navigasi.**
*   **Implikasi:** `Aid Request Detail`, `Asset Detail`, dan `Person 360` bukanlah node di pohon navigasi. Mereka adalah *Transaction/Detail Views* yang dapat dipanggil dari dalam *Workspace Section* MAUPUN dari *Projection Queue*. Entitas fisiknya tetap satu.

#### PR-07: Stable Navigation, Adaptive Content
> **Navigasi utama (Primary Navigation) tetap stabil secara struktural lintas peran. Role, konteks aktif, izin, dan status workflow menentukan konten, tindakan, dan proyeksi yang muncul di dalam destinasi tersebut.**
*   **Implikasi:** *Bottom Navigation Bar* (Beranda, Organisasi, SDM, +Aksi, Akun) tidak berubah-ubah bentuk atau labelnya berdasarkan role user. Yang berubah secara radikal adalah *isi* dari halaman-halaman tersebut (*Adaptive Content*).

---

### PILAR 3: INTERACTION & EXPERIENCE

#### PR-03: Unification ≠ Identical UX
> **Penyatuan konseptual (*conceptual unification*) tidak berarti penyatuan pengalaman pengguna (*identical UX experience*).**
*   **Implikasi:** `Person` adalah satu *Entity Family* (Pendeta, Pelayan, Relawan). Namun, *Person Workspace* untuk Pendeta akan memiliki *section* yang kaya (Mutasi, Jabatan, Keluarga), sedangkan untuk Relawan hanya berisi (Penugasan, Bidang Pelayanan). UI melakukan *progressive disclosure* berdasarkan *Role/Type*.

#### PR-08: Home is a Work Entry Point, Not a Dashboard
> **Permukaan Home memprioritaskan konteks, perhatian (*attention*), tindakan, dan wawasan yang relevan, bukan berfungsi utama sebagai kumpulan metrik atau grafik statistik.**
*   **Implikasi:** Halaman Beranda disusun dengan urutan logis: **Where am I?** (Context) → **What needs attention?** (Tasks) → **What can I do?** (Actions) → **What should I know?** (Insights). Home bukan sekadar *wall of charts*.

---

### PILAR 4: CONTEXT & AUTHORITY

#### PR-09: Context is Explicit and Session-Bound
> **Konteks yang digunakan untuk interaksi harus eksplisit, valid, dan terikat pada sesi saat ini. Sistem tidak boleh mengasumsikan satu identitas memiliki satu konteks kerja permanen. Context menentukan *data scope* sekaligus *action constraint*.**
*   **Implikasi:** `Active Context` disimpan dalam *Session State* (bukan di-*hardcode* dari profil user). *Context Switcher* di header adalah mekanisme perubahan *execution scope*. Saat context berganti, form akan terkunci (*Poka-Yoke*), data di-*rehydrate*, dan izin dievaluasi ulang. User yang memiliki multi-assignment (misal: KMJ di Jemaat A, PJ di Pos B) dapat berpindah konteks tanpa *logout*.

---

## 3. Cara Menggunakan Dokumen Ini (Checklist Tim)

*   🎨 **Desainer UI/UX:** Sebelum mendesain *screen* baru, tanyakan: *"Apakah ini Place, Object, atau Projection?"* (PR-02, PR-05). *"Apakah navigasinya stabil?"* (PR-07).
*   💻 **Frontend Engineer:** Sebelum membuat *route* Next.js baru, pastikan ia tidak menduplikasi *entry point* (PR-06) dan menghormati *Session Context* (PR-09).
*   🗄️ **Backend/Database Engineer:** Sebelum menulis *query* atau RLS (Row Level Security), pastikan batasan *data scope* selalu merujuk pada `Active Context` dari sesi, bukan sekadar `id_user` (PR-09).

---

Dokumen `04-UX-Architecture-Principles-v1.0.md` ini sekarang siap di-*freeze* dan menjadi bagian dari **Gate 2 Freeze Package**.