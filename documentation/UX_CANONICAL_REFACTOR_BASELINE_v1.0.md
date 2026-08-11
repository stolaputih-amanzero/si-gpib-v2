# UX Canonical Refactor — Baseline v1.0

**Status:** REGRESSION FREE AGAINST CANONICAL UX REFACTOR BASELINE
**Architecture:** FROZEN
**Phase:** Ready for Next Feature Phase

Dokumen ini merekam hasil akhir, batas-batas arsitektur yang dikunci (FROZEN), serta status *Technical Debt* pada akhir fase **UX Canonical Refactor** untuk proyek SI GPIB v2.2. Dokumen ini menjadi titik acuan (*baseline*) untuk fase *feature development* selanjutnya.

---

## 1. Frozen Architecture Boundaries

Setiap pengembangan fitur ke depan **WAJIB** mematuhi model-model yang telah dikunci di bawah ini. Jangan melakukan redesain terhadap batas *workspace*, hierarki navigasi, maupun arsitektur otorisasi.

### Canonical Model
- Arsitektur berbasis **Mobile-First PWA** dengan pembagian tegas antara Workspace, Projection, dan Detail View.

### Workspace Model
- Tepat **2 (dua) Workspace** dalam keseluruhan sistem:
  1. **Organization Workspace** (`/dashboard/org/[id_org]`) — Untuk mengelola aset, bantuan, dan kapabilitas organisasi.
  2. **Person Workspace** (`/dashboard/people/[id_person]`) — Untuk profil 360° pelayan dan operasional personal.
- Fitur baru tidak boleh menciptakan workspace baru (misalnya, *Asset Workspace* atau *Aid Workspace* dilarang). Semua kapabilitas harus disematkan sebagai *Section* di dalam Workspace yang ada.

### Navigation Model
- Tepat **5-slot Primary Navigation** di *bottom bar*:
  1. Home
  2. Organisasi
  3. SDM
  4. Quick Actions (+)
  5. Akun & Sistem
- Fitur Proyeksi atau entitas spesifik **dilarang** mengambil slot di navigasi utama.

### Projection Model
- **Projection** melintasi berbagai konteks dan diakses via *Cross-Context Entry*, bukan *Primary Navigation*.
- Proyeksi Kanonikal saat ini:
  - Territory Map (`/dashboard/maps`)
  - Asset Intelligence (`/dashboard/assets`)
  - Aid Review Queue (`/dashboard/aid-requests`)
  - Reports & Analytics (`/dashboard/analytics`)

### Detail View Model
- Canonical Detail View menangani akses *Read-Only* ke entitas dari Workspace maupun Projection, mempertahankan otorisasi server-side dan asal usul navigasi.
- Rute Kanonikal Terkunci:
  - Canonical Asset Detail: `/dashboard/assets/[id_asset]`
  - Canonical Aid Request Detail: `/dashboard/aid-requests/[id_ajuan]`

### Authorization Boundary
- Pemisahan total antara **Person (SDM)** dan **User Account (Otorisasi)**.
- Otorisasi dijalankan secara **Server-Side** melalui `ContextResolver` dan *Row Level Security (RLS)*. 
- *Routing Guard* buatan klien tidak boleh digunakan sebagai *security boundary*.
- Akses lintas-data pada Proyeksi dan Detail View dijamin aman oleh Server Supabase Client tanpa membebani klien.

### Database Boundary
- **Database Schema = UNCHANGED**.
- Refaktor UX ini bersifat *presentation & logical boundary* yang tidak merusak maupun merubah skema migrasi tabel bawaan, fungsi RPC, maupun RLS dasar.

---

## 2. Active Context Status

**Status: PARTIAL — BACKEND/API GAP**

- **Frontend Abstraction**: Selesai dan digeneralisasi (mendukung hierarki `Sinode → Mupel → Jemaat → Pos Pelkes`).
- **Backend / API Hierarchy**: Masih tertahan pada skema *Pos-only* (menggunakan `useAssignedPosList` & `t_penugasan_pendeta`).
- **Keputusan**: Jangan memaksakan perubahan *naming* di frontend jika *API contract* aslinya masih spesifik pada Pos. Pembangunan *Hierarchical Context Assignment* di sisi backend didelegasikan ke dalam fase *Backend/API Architecture* di masa mendatang.

---

## 3. Test Baseline & Known Technical Debt

Status di bawah ini direkam pada akhir fase Canonical Refactor. Angka-angka ini menjadi **Baseline**. Setiap penambahan jumlah kegagalan (regression) di fase pengembangan fitur selanjutnya harus dianggap sebagai *blocker*.

### Baseline Pengujian (Test Gate)
- **TypeScript** (`npx tsc --noEmit`): **PASS (0 errors)**
- **ESLint** (`npm run lint`): **119 failures**
- **Unit Test CJ1** (`npm run test:cj1`): **7 failures**

### Rincian Technical Debt (DEFERRED)
1. **Lint Debt**: 119 kegagalan, mayoritas disebabkan oleh blok kosong (`no-empty`), deklarasi variabel (`prefer-const`), dan aturan gambar lama.
2. **Unit-Test Debt**: 7 kegagalan, murni bersumber dari utang teknis pra-refaktor terkait *Vitest mock* yang belum lengkap untuk metode Supabase (seperti `.insert is not a function`) dalam `pastoral.service.test.ts` dan logika *offline sync*.
3. **Backend Gaps**: Skema API Active Context masih bergantung pada `POS-only` (Tabel `t_penugasan_pendeta` & `MockContextResolver`).
4. **Runtime RLS E2E Tests**: Uji perlindungan akses E2E secara langsung untuk rute baca Detail View belum disusun.

---

**Keputusan Akhir Refactor:**
Fase UX Canonical Refactor resmi ditutup. Sistem kini **REGRESSION FREE** terhadap arsitektur dasar dan **READY FOR NEXT FEATURE PHASE** berlandaskan dokumen *Enterprise Information Architecture (EIA)*.
