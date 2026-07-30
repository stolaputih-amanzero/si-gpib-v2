# 📝 Changelog SI GPIB v2.2

Seluruh perubahan besar, penyempurnaan fitur, dan perbaikan sistem dicatat di berkas ini.

---

## [2.2.2] — 2026-07-31

### 🆕 Added — Arsitektur Identitas Terpadu (Unified Identity Model)
- **Migration `20260801_unified_identity.sql`**:
  - Partial unique index `uq_users_pendeta_aktif` (1 pendeta = max 1 akun aktif)
  - Integrity foreign keys (RESTRICT/SET NULL untuk 5 tabel histori & m_jemaat_induk; CASCADE untuk 3 tabel personal 360°)
  - Trigger `sync_pendeta_status_to_user` (otomatis update status akun saat status pendeta berubah)
  - Trigger `on_pendeta_deleted_deactivate_user` (deaktivasi akun dan reset `id_pendeta` ke NULL sebelum row `m_pendeta` dihapus)
  - RPC `link_user_to_pendeta(p_user_id, p_id_pendeta)` untuk pengaitan akun secara atomic
  - RPC `get_pendeta_360(p_id_pendeta)` dengan **Asymmetric Privacy Guard** (blok keluarga HANYA untuk Pemilik Data & Super User, Admin Mupel tidak diberi akses)
  - RLS policies real-time lookup `(SELECT id_pendeta FROM public.users WHERE id = auth.uid())` tanpa ketergantungan klaim JWT basi
- **Single Gate Frontend**:
  - `src/lib/identity/get-current-pendeta.ts` (`getCurrentPendetaId`)
  - `src/hooks/use-current-pendeta.ts` (`useCurrentPendeta` dengan cache query 5 menit)
  - Single source of truth nama pendeta via `m_pendeta.nama_lengkap` di `useProfileAkun`

---

## [2.2.1] — 2026-07-31

### 🆕 Added — Tiga Dimensi Baru Profile 360° (Keluarga, Kompetensi & Karunia, Keterlibatan Sinodal)
- **Tabel Database**: `t_keluarga_pendeta`, `t_kompetensi_pendeta`, `t_keterlibatan_pendeta` (`supabase/migrations/20260731_pendeta_360_dimensions.sql`)
- **ID Patterns Baru**: `KLG-XXXXXXXX`, `KMP-XXXXXXXX`, `KTL-XXXXXXXX` (8 digit random)
- **KeluargaSection**: Pencatatan data pasangan, anak, orang tua, status hidup, dan tanggungan keluarga (RLS Privat: pemilik + super_user)
- **KompetensiSection**: Pencatatan keahlian praktis, passion, dan karunia rohani dengan badge tonal & filter chip kategori
- **KeterlibatanSection**: VerticalTimeline kronologis keterlibatan di Jemaat, Mupel, Sinodal, dan Eksternal (Pokja, Komisi, Panitia, Delegasi)
- **Reorganisasi Tab ProfileTabs**: 3 Grup Utama (Pribadi, Pelayanan, Sistem)
- **Hooks & Validasi Zod**: `use-pendeta-360.ts`, `pendeta-360.schema.ts`, `pendeta-360.constants.ts`

### 🔒 Security
- Strict RLS Policy untuk `t_keluarga_pendeta`: Diri Sendiri + Super User SAJA (KMJ & Admin Mupel dilarang membaca)
- RLS Policy untuk `t_kompetensi_pendeta` & `t_keterlibatan_pendeta`: Diri Sendiri + Super User + Admin Mupel

---

## [2.2.x] — 2026-07-30

### 🆕 Added — Profile 360° (Manajemen Pengguna Terpadu)
- **My Profile** (`/settings/profile`): 8 section profil terpadu (akun, pelayanan, hierarki, mutasi, log, aktivitas, perangkat, draft)
- **User Management** (`/settings/users`): Daftar pengguna dengan search & filter (Super User & Admin Mupel)
- **Supervision Mode** (`/settings/users/[id]`): Profile 360° untuk user lain dengan aksi administratif
- **RPC `get_profile_stats`**: Agregat stat strip dalam 1 round-trip
- **11 hook terisolasi** di `use-profile.ts` (paralel, per-section)
- **15+ komponen** di `src/components/profile/`
- **VerticalTimeline** reusable untuk mutasi & aktivitas
- **RoleBadge** dengan warna tonal per role
- **Deep-link dua arah**: profil ↔ entitas (jemaat, pos, log)
- **RLS asimetri**: audit & biometrik privat (diri sendiri + super_user)
- **Stat strip adaptif**: metrik pelayanan (pendeta) vs metrik akun (non-pendeta)
- **Kekosongan anggun**: non-pendeta menampilkan pesan penjelasan

### 🔒 Security
- RLS policy untuk `t_log_aktivitas` & `m_webauthn_credentials`: diri sendiri + super_user SAJA
- RLS scope untuk admin_mupel: terbatas ke Mupel sendiri
- RPC `get_profile_stats`: STABLE, SECURITY DEFINER dengan guard scope

### 📝 Documentation
- Updated: `README.md`, `SI GPIB v2.2 — Blueprint.md`, `SI GPIB v2.2 — PRD.md`, `SI GPIB v2.2 — ERD.md`, `docs/UAT_SCRIPT.md`, `docs/USER_MANUAL_PENDETA.md`, `CHANGELOG.md`
