# ⛪ SI GPIB v2.3.2 — Sistem Informasi Pos Pelayanan Kesaksian (Pilot Phase Ready)

[![Mobile-First PWA](https://img.shields.io/badge/PWA-Mobile--First-emerald.svg)](https://sigpib.org)
[![Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016.3%20(App%20Router)-black.svg)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/Library-React%2019-blue.svg)](https://react.dev)
[![Supabase Postgres](https://img.shields.io/badge/Database-Supabase%20Postgres%20%26%20RLS-emerald.svg)](https://supabase.com)
[![Playwright Tests](https://img.shields.io/badge/E2E-Playwright%20v1.62-orange.svg)](https://playwright.dev)

Sistem Informasi Pos Pelayanan Kesaksian (SI GPIB v2.3.2) adalah platform aplikasi **Mobile-First Progressive Web App (PWA)** bertaraf enterprise yang dibangun khusus untuk **Gereja Protestan di Indonesia bagian Barat (GPIB)**. 

Aplikasi ini mengintegrasikan pemetaan digital Pos Pelkes, pencatatan log pastoral dengan stempel GPS & timestamp, serta ketahanan **Offline Transactional Engine (Command Pattern, Idempotency Server `sys_transaction_logs`, Domain-Driven Conflict Policy, Dead-Letter Queue, & Telemetry Monitoring)** untuk pelayanan pendeta di daerah dengan jaringan internet lemah atau nir-sinyal (*zero signal*) seperti pedalaman Kaltim dan Papua.

---

## 🌟 Visi & Fitur Utama

1. **🗺️ Pemetaan Pos Pelkes & Bajem**: Peta interaktif berbasis Leaflet dengan *clustering marker* dan filter hierarki (Sinode -> Mupel -> Jemaat Induk -> Pos Pelkes).
2. **📝 Log Pastoral dengan Photo GPS Stamp**: Pencatatan kegiatan pastoral pendeta dilengkapi kamera bawaan yang secara otomatis membubuhkan stempel tanggal, jam, koordinat GPS, dan nama hierarki pada foto.
3. **📡 Offline Transactional Engine (Resiliensi Nir-Sinyal)**:
   - **Command Pattern Sync Engine**: Menyimpan "niat" transaksi (`requestId`, `operationType`, `targetIdentifier`, `payload`) di IndexedDB via Dexie v5, bukan HTTP request mentah.
   - **Server Idempotency**: Tabel `sys_transaction_logs` mencegah pengulangan data ganda akibat pengiriman ulang antrean.
   - **Domain-Driven Conflict Policy**: Strategi resolusi konflik otomatis per domain (`lww`, `optimistic_check`, `reject`).
   - **Dead-Letter Queue (DLQ)**: Item gagal >5x secara otomatis dipindahkan ke tabel `deadLetters` untuk diinspeksi via Queue Inspector (`/dashboard/developer/queue`).
   - **Telemetry Dashboard**: Monitoring real-time durasi, tingkat kegagalan, dan konflik via `/dashboard/developer/telemetry` + Sentry.
4. **🔑 Biometric Login (Passkeys / WebAuthn)**: Kemudahan masuk menggunakan sidik jari atau Face ID tanpa perlu mengetik kata sandi.
5. **👤 Profile 360° — Manajemen Pengguna Terpadu**: Satu medan pandang yang menyatukan seluruh dimensi seorang pengguna — akun & otorisasi, identitas pelayanan pendeta, hierarki wilayah (Mupel -> Jemaat -> Pos Pelkes), penugasan KMJ/PJ, riwayat mutasi, log pastoral, audit biometrik, dan draf PWA lokal.
6. **🛡️ Keamanan & Poka-Yoke RBAC**: Control akses berbasis peran (*Role-Based Access Control*) dengan kebijakan Supabase Row Level Security (RLS) serta penguncian hierarki otomatis berdasarkan penugasan user.

---

## 👤 Profile 360° — Manajemen Pengguna Terpadu

Fitur yang menyatukan **seluruh dimensi seorang pengguna** dalam satu medan pandang:

### Dua Mode Akses
| Mode | URL | Akses |
|---|---|---|
| **My Profile** | `/settings/profile` | Semua user — lihat & edit profil sendiri |
| **User Management** | `/settings/users` | Super User & Admin Mupel — kelola semua user |
| **Supervision** | `/settings/users/[id]` | Super User & Admin Mupel — lihat 360° user lain |

### 11 Section Profil (Reorganisasi 3 Grup Tab)
- **Grup Pribadi**:
  1. **Identitas Pelayanan** — data pendeta (nama, jabatan, gender, tgl tugas, flag KMJ/PJ)
  2. **Keluarga Pendeta** — 🆕 pasangan, anak, tanggungan, status hidup, pendidikan & pekerjaan (RLS Privat)
  3. **Kompetensi & Karunia** — 🆕 keahlian praktis, passion, karunia rohani, tingkat kemahiran & tahun mulai
- **Grup Pelayanan**:
  4. **Hierarki Pelayanan** — rantai Mupel → Jemaat Induk → Pos Pelkes (deep-link dua arah)
  5. **Peran & Penugasan** — blok KMJ, PJ, penugasan Pos aktif
  6. **Riwayat Mutasi** — timeline: kapan, dari mana → ke mana, jenis, alasan
  7. **Log Pastoral** — 8 log terakhir + link ke laporan lengkap
  8. **Keterlibatan Sinodal** — 🆕 VerticalTimeline Pokja, Komisi, Tim Kerja, Delegasi & Panitia Persidangan
- **Grup Sistem**:
  9. **Akun & Keamanan** — email, telepon, role, status, perangkat biometrik, push notification
  10. **Aktivitas & Audit** — jejak login, create, edit, approve (privat: diri sendiri + super_user)
  11. **Data Lokal** — draft PWA tersimpan (lanjutkan/hapus)

### Arsitektur Teknis
- **RPC:** `get_profile_stats(p_id_pendeta)` — agregat 1 round-trip (total log, jiwa, pos aktif, lama melayani)
- **Hooks:** 11 hook terisolasi di `src/hooks/use-profile.ts` (paralel, per-section)
- **Komponen:** 15+ komponen di `src/components/profile/`
- **RLS:** Asimetri privat/organisasional — audit & biometrik hanya diri sendiri + super_user

### Prinsip Desain
- **Dua sumbu:** Akun (via `users.id`) + Pelayanan (via `users.id_pendeta`)
- **Kekosongan anggun:** Non-pendeta menampilkan pesan penjelasan, bukan kotak kosong
- **Stat strip adaptif:** Metrik pelayanan (pendeta) vs metrik akun (non-pendeta)
- **Deep-link dua arah:** Dari profil ke entitas, dari entitas ke profil

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: [Next.js 15](https://nextjs.org) (App Router, Server & Client Components)
- **UI Library**: [React 19](https://react.dev) & [Tailwind CSS v4](https://tailwindcss.com)
- **State & Mutation Management**: [TanStack Query v5](https://tanstack.com/query) (React Query)
- **Database & Authentication**: [Supabase Postgres](https://supabase.com) dengan Row Level Security (RLS) & `@supabase/ssr`
- **Biometric Security**: [SimpleWebAuthn](https://simplewebauthn.dev) (WebAuthn / FIDO2 Passkeys)
- **PWA & Offline Storage**: Service Worker, IndexedDB, `localStorage`
- **Testing & Verification**: [Playwright](https://playwright.dev) (E2E Automated Testing), TypeScript strict mode

---

## 📁 Struktur Folder Utama

```text
si-gpib-v2/
├── docs/
│   ├── UAT_SCRIPT.md             # Panduan Pengujian UAT Lapangan (4 Persona)
│   └── USER_MANUAL_PENDETA.md    # Panduan Pengguna Awam untuk Pendeta
├── scripts/
│   ├── pre-deploy-check.ts       # Script Validasi Keamanan & Deployment (TypeScript)
│   └── pre-deploy-check.sh       # Shell Runner Pre-Deployment Check
├── src/
│   ├── app/                      # Next.js App Router (Auth, Dashboard, Hierarki, Offline)
│   ├── components/               # Komponen UI Reusable (Layout, Mobile, Hierarki, PhotoPicker)
│   ├── hooks/                    # Custom React Hooks (Offline, TanStack Query, Biometrics)
│   ├── lib/                      # Supabase Client, Formatters, & Validasi Zod
│   └── types/                    # TypeScript Type Definitions & Database Interfaces
├── tests/
│   └── e2e/                      # Playwright E2E Test Suite (CJ-1 s/d CJ-6 & Offline)
├── playwright.config.ts          # Konfigurasi E2E Testing Mobile Viewport
├── next.config.mjs               # Konfigurasi Next.js & PWA Service Worker
└── package.json                  # Dependencies & Scripts
```

---

## 🚀 Panduan Memulai di Lokal (Local Development)

### 1. Prasyarat
- Node.js v18.x atau lebih baru
- npm v9.x atau yarn / pnpm

### 2. Kloning Repository & Instalasi Dependencies
```bash
git clone https://github.com/stolaputih-amanzero/si-gpib-v2.git
cd si-gpib-v2
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Buat file `.env.local` di root folder dan isi dengan variabel berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# WebAuthn / Biometric RP_ID Configuration
NEXT_PUBLIC_RP_ID=localhost
```

### 4. Menjalankan Server Pengembang (Dev Server)
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🧪 Menjalankan Pengujian (Testing Suite)

### 1. Menjalankan E2E Automated Tests (Playwright)
```bash
# Menjalankan seluruh skrip pengujian E2E (Mobile Chrome & Mobile Safari)
npm run test:e2e

# Menjalankan pengujian dengan antarmuka UI Playwright Interactive
npx playwright test --ui
```

### 2. Menjalankan Pre-Deployment Validation Script
Sebelum melakukan *deployment* ke server produksi, jalankan validasi otomatis untuk memverifikasi keamanan dan kebersihan kode:
```bash
npm run pre-deploy-check
```

---

## 📄 Dokumentasi Terkait

- 📗 [Panduan Pengujian UAT (UAT_SCRIPT.md)](docs/UAT_SCRIPT.md) — Panduan skenario uji coba lapangan untuk 4 persona penguji.
- 📖 [Panduan Pengguna Pendeta (USER_MANUAL_PENDETA.md)](docs/USER_MANUAL_PENDETA.md) — Panduan instalasi PWA & login biometrik untuk pendeta.

---

## 📜 Lisensi & Pengembang
Hak Cipta © 2026 **Gereja Protestan di Indonesia bagian Barat (GPIB)**. Seluruh hak cipta dilindungi undang-undang.
