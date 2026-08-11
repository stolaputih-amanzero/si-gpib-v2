# F2 Person Workspace Discovery & Audit

**Date:** 11 August 2026

Dokumen ini memuat temuan hasil audit *EIA-to-code* terhadap domain *Person* di SI GPIB, sebagai langkah investigasi sebelum merumuskan spesifikasi fitur **Feature 02 — Person / SDM Workspace**. 

Tujuan audit ini adalah untuk mencegah duplikasi arsitektur dan memastikan Workspace kedua (Person Workspace) murni mengadopsi prinsip yang sama dengan *Organization Workspace*.

---

## 1. Current Person Routes
Rute yang ada saat ini sudah sangat ideal dan *canonical*:
- `/dashboard/people/[id_person]` → Ini adalah satu-satunya rute masuk untuk *Person Workspace*.
- **Tidak ada** *route* pecah seperti `/dashboard/pelayan` atau `/dashboard/pendeta`. Canonical refactor sebelumnya terbukti sukses membersihkan ini.

## 2. Current Person Components
Komponen UI untuk *Person* saat ini dimotori oleh:
- `PersonWorkspaceClient.tsx` (sebagai kontainer utama / shell).
- 8 *Section Components*:
  1. `PersonProfileSection`
  2. `PersonStructuralSection`
  3. `PersonTransferSection` (Mutasi)
  4. `PersonAssignmentSection` (Penugasan)
  5. `PersonFamilySection` (Keluarga)
  6. `PersonCompetencySection` (Kompetensi)
  7. `PersonInvolvementSection` (Keterlibatan)
  8. `PersonPastoralLogSection` (Log Pastoral)

## 3. Person Entities & Relationships (CRITICAL GAP)
Di sinilah letak gap terbesar terhadap *Enterprise Information Architecture* (EIA):
- **EIA Entity Map**: Person seharusnya mencakup Pendeta, Penatua, Diaken, Pelayan, dan Relawan. (Di *database* eksis tabel `t_pelayan`, `t_relawan`, `m_pendeta`).
- **Current Backend Implementation**: `fetchUnifiedPersonData` memanggil RPC `get_pendeta_360()`. Sesuai namanya, API ini **strictly bound ke entitas Pendeta**.
- **Dampak UI**: Pada halaman *Organization Workspace* (Feature 01), komponen `OrgSdmSection` memiliki validasi `isPendeta`. Pelayan dan relawan **tidak bisa di-klik** karena backend belum mendukung penyajian data mereka dalam satu bentuk *Unified Person Data*. 

Oleh karena itu, secara *de facto*, Workspace saat ini masih berupa **Pendeta Workspace**, bukan **Person Workspace universal**.

## 4. Existing Capabilities (The 8 Tabs)
Workspace saat ini memiliki 8 tab. Secara visual, ini terlalu banyak dan mulai menyerupai "Detail View raksasa" ketimbang "Workspace berlapis". 
Beberapa tab sebenarnya memiliki kaitan erat:
- *Structural*, *Mutasi*, dan *Penugasan* sebenarnya merupakan satu klaster kapabilitas fungsional (Penugasan/Assignment).
- *Kompetensi* dan *Keterlibatan* adalah metadata profesional.

## 5. Existing Authorization Path (STRENGTH)
Otorisasi *Person Workspace* saat ini adalah **salah satu area terkuat dan sangat konsisten dengan Canonical Baseline**:
- UI tidak mengevaluasi keamanan. Semuanya ditarik dari *Server-Side*.
- Memanfaatkan `getServerContext()`.
- Di dalam RPC `get_pendeta_360()`, terdapat pendelegasian validasi `p_requester_role` dan *scope* (Mupel/Jemaat).
- Terdapat gerbang privasi mutlak: `can_see_private`. Data keluarga dan biometrik akan **dikembalikan null oleh server** bila pengguna tidak memiliki akses langsung (hanya untuk *Self* atau *Super User*).

## 6. Existing Detail/Workspace Distinction
Meskipun menyandang nama `PersonWorkspaceClient`, desain saat ini lebih berfungsi sebagai *Read-Only Profile View* yang teramat detail. Belum ada karakteristik "Command Center" seperti pada *Organization Workspace*. 

## 7. Reusable Components
- **`PersonWorkspaceClient`**: Struktur *sticky header* dengan *avatar* dan *GlideTabs* sudah sangat kokoh dan konsisten dengan *Organization Workspace*. Dapat dipertahankan 100% secara layout.
- **Privacy Notice**: Komponen `PrivateDataNotice.tsx` sangat bagus untuk memberikan transparansi kepada pengguna saat data di-blur/dihilangkan karena RLS.

## 8. Dead/Legacy Components
Tidak ditemukan sisa-sisa *Person component* yang mati/berceceran di luar `/components/workspace/person/`. Pembersihan di fase *Canonical Refactor* sangat efektif.

---

## 9. Proposed Person Workspace Sections (Alignment with EIA)
Untuk menjadikan Workspace ini sejajar dengan EIA dan mengurangi tab yang berlebihan, saya mengusulkan konsolidasi 8 tab eksisting menjadi **5 atau 6 Section Boundary** (menyesuaikan dengan konsep Feature 02):
1. **Overview** (Sama seperti Organisasi: *Read-model* agregat dari statistik, penugasan aktif, dan log pastoral terakhir).
2. **Profil** (Menggabungkan *Profil Utama* + *Data Keluarga* dengan catatan privasi).
3. **Penugasan** (Menggabungkan *Penugasan Pos*, *Jabatan Struktural*, dan *Riwayat Mutasi*).
4. **Kapasitas / Kompetensi** (Menggabungkan *Kompetensi* dan *Keterlibatan*).
5. **Pelayanan & Pastoral** (Menampilkan *Log Pastoral*).

## 10. Explicitly Deferred Capabilities
- Mutasi data Person (CRUD Personel, mutasi pelayan, dsb) kemungkinan besar sebaiknya ditunda, agar **Feature 02** berfokus penuh pada **penyatuan model (Universal Person Model)** terlebih dahulu, bukan operasi mutasinya.
- Relasi hirarki Person ke Person.

## 11. Risks Against Canonical Model
**Risiko Utama F2:** 
Jika kita langsung membangun UI tanpa memperbaiki `fetchUnifiedPersonData` dan abstraksi entitas di belakangnya, maka kita akan menciptakan *Person Workspace* yang eksklusif untuk Pendeta. Ini akan merusak *Canonical Entity Model* di mana setiap manusia di dalam SI GPIB seharusnya adalah `Person`. 

Langkah yang wajib dilakukan pada **Feature 02** adalah **memperluas `UnifiedPersonData` agar bisa menerima Diaken, Penatua, dan Relawan** tanpa membongkar arsitektur *Workspace*-nya.
