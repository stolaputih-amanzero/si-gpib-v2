# 📝 Changelog SI GPIB v2.2

Seluruh perubahan besar, penyempurnaan fitur, dan perbaikan sistem dicatat di berkas ini.

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
