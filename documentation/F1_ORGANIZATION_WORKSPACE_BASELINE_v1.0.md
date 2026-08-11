# Feature 01 Completion Baseline: Organization Workspace Foundation

**Status:** COMPLETE & FROZEN
**Version:** 1.0
**Date:** 11 August 2026

Dokumen ini adalah rekam jejak final dan *baseline* pasca selesainya **Feature 01: Organization Workspace Foundation**. Dokumen ini menjadi kontrak yang harus dibaca dan ditaati sebelum memulai *Feature 02*, untuk mencegah regresi arsitektur dan menjaga kemurnian batas-batas yang telah disepakati pada *Enterprise Information Architecture* (EIA).

---

## 1. Final Structure & Architecture Map

Batas-batas struktural SI GPIB saat ini secara arsitektural terpusat pada *Context-Bound Capability Container* di bawah *Organization Workspace*. 

```text
                         SI GPIB
                            │
              ┌─────────────┴─────────────┐
              │                           │
       Primary Navigation           Cross-Context
          5 Slots                    Projections
              │                           │
       ┌──────┴──────┐          ┌─────────┴─────────┐
       │             │          │                   │
   Organization    Person     Analytics          Intelligence
    Workspace     Workspace    / Reports           / Queues
       │
       ├── Overview
       ├── Profil
       ├── SDM
       ├── Aset ───────────────→ Asset Detail
       ├── Bantuan ────────────→ Aid Request Detail
       └── Program & Pastoral
```

### Prinsip Utama yang Berlaku:
1. **Workspace owns context.** (Menyimpan identitas *Organization* sebagai titik pijak).
2. **Section owns capability.** (Membagi kapabilitas menjadi 6 *Section* khusus).
3. **Projection owns cross-context intelligence.** (Queues/Analisis tetap di luar Workspace).
4. **Detail View owns entity inspection.** (Entitas diperiksa di rutenya masing-masing).

---

## 2. Route Map

| Tipe | Route | Peran / Deskripsi |
|---|---|---|
| **Workspace** | `/dashboard/org/[id_org]` | *Entry point* operasional murni. Menangani semua 6 Section lewat UI *Client* (`activeTab`). |
| **Workspace** | `/dashboard/people/[id_person]` | Canonical Person Workspace / Detail View. (Dimasuki melalui Section SDM). |
| **Detail View** | `/dashboard/assets/[id_asset]` | Canonical Asset Detail. (Dimasuki melalui Section Aset). |
| **Detail View** | `/dashboard/aid-requests/[id_ajuan]`| Canonical Aid Request Detail. (Dimasuki melalui Section Bantuan). |
| **Projection**| `/dashboard/analytics` / `reports` | Canonical Projections (Tidak masuk ke dalam Workspace). |
| **Projection**| `/dashboard/aid-requests` | Canonical Aid Review Queue. |

---

## 3. Section, Entity, & Action Matrix

Berikut matriks kapabilitas di dalam *Organization Workspace* saat ini:

| Section | Entity Terkait | Sifat Data | Status Mutasi / Action |
|---|---|---|---|
| **Overview** | KPI, Pastoral Log, SDM Summary | Agregasi / *Read-Model* | **Zero Mutation (Kunci Mati)** |
| **Profil** | Organization Profile, Demographics| *Context-bound* | `Update Alamat` & `Update GPS` (*Deferred / Alert Only*) |
| **SDM** | Pelayan, Pendeta, Relawan | *Integration* ke Person | Mutasi / CRUD dialihkan ke detail Person (atau *Deferred*) |
| **Aset** | Aset Tanah, Bangunan, Bergerak | *Integration* ke Asset | List murni. Create dialihkan ke form Asset. Detail di klik *Outbound*. |
| **Bantuan** | Pengajuan Bantuan (Aid Requests)| *Integration* ke Aid | List murni. Detail ditarik *Outbound*. |
| **Program** | Jadwal Ibadah, Log Pastoral | *Placeholder* / *Read-Model*| Belum ada *lifecycle* mutasi. (Status: *Deferred*) |

> **Catatan UX Security**: Akses terhadap *Action Button* divisualisasikan melalui *gating* variabel UI `canWrite` (bernilai `true/false` dari `ContextResolver` backend). Namun, UI *Gating* ini **bukan** sebuah *security boundary*. Segala _submission_ pada form mutasi nantinya (saat diimplementasi) wajib divalidasi mutlak oleh Server Action + RLS.

---

## 4. Pre-Existing Dependencies Utilized
- **Backend / DB Resolver**: `fetchUnifiedOrganizationData(id_org)` dan `hasReadAccess(context_id, target_org_id)` dari `src/lib/services/organization.ts`.
- **UI Components**: `CollapsingMapHeader` (digunakan sebagai *Sticky Identity Header*), `GlideTabs` (digunakan untuk memecah batas 6 *Section* mutlak), `AnalyticsStatCard` (untuk metriks *Overview*).
- **Navigation Contract**: Tetap mempertahankan kontrak 5-slot pada `src/lib/constants/navigation.ts`.

---

## 5. Deferred Items (Daftar Pekerjaan yang Tertunda/Di-defer)
Hal-hal di bawah ini dieksplisitkan bukan sebagai defek (cacat), melainkan sebagai daftar fitur di masa mendatang agar implementasi F1 tidak bocor fokusnya:
1. **Active Context API / Hierarchy Resolution**: F1 terpaksa masih mengonsumsi API `Pos-Only` bawaan. Perbaikan dukungan *Context Hierarchy* penuh di *Backend* ditunda.
2. **GPS & Address Mutation Implementation**: Action dari Section Profil saat ini masih *visual-only* dengan *Placeholder Alert*. *BottomSheet/Modal* dan eksekusi Server Action untuk mutasi riil belum dibangun.
3. **Program & Pastoral Lifecycle**: Saat ini hanya berupa *Read-Model Placeholder* untuk melihat histori *Log Pastoral* dan *Jadwal Ibadah*. Fungsionalitas utuhnya ditunda.
4. **Baseline Technical Debt**: Terdapat tunggakan *Linter* & *Unit Test* yang diabaikan sementara (Lihat bagian Regression Baseline).

---

## 6. Regression Baseline (Technical Debt Frozen State)
Agar fitur selanjutnya tidak perlu mencari-cari penyebab kegagalan CI/CD, berikut adalah utang teknis *baseline* yang kita kunci dan **tidak boleh memburuk**:
- **Workspace Navigation / Boundry**: 2 Workspace, 5 Primary Navigation Slots.
- **Database / RLS Schema**: *Unchanged* (Murni *Baseline*).
- **Linter Failures**: `119 failures` (Status: Baseline Debt).
- **Unit Test Failures**: `7 failures` (Vitest/Mocking issues) (Status: Baseline Debt).
- **TypeScript (tsc)**: `0 errors` (Wajib dipertahankan *PASS* pada setiap fitur selanjutnya).
