# 🗺️ SI GPIB — Enterprise Information Architecture (EIA) v0.1.1

**Versi Dokumen:** 0.1.1 (Final)
**Tanggal:** 2026
**Arsitektur:** Online-First + Mobile-First PWA + Biometric Auth
**Referensi:** `rules.md` v2.3.2 · ERD v2.2.2 · Blueprint v2.2 · PRD v2.2
**Status:** ✅ Final — siap diturunkan ke UX Blueprint & Design System

> **Posisi dokumen ini:**
> `rules.md` menjawab **HOW to build**. ERD menjawab **WHAT data exists**.
> **EIA menjawab: WHAT exists, WHY it exists, WHO can see it, WHERE it appears — dari sudut pandang manusia.**

---

## 📑 Daftar Isi

0. [Pendahuluan & Prinsip](#0-pendahuluan--prinsip)
1. [Organization Model](#1-organization-model)
2. [Identity & Scope Model](#2-identity--scope-model)
3. [Domain Map](#3-domain-map)
4. [Entity Relationship Map (Human View)](#4-entity-relationship-map-human-view)
5. [State Model (Dua Lapis)](#5-state-model-dua-lapis)
6. [Permission Matrix](#6-permission-matrix)
7. [Context Model](#7-context-model)
8. [Navigation Model](#8-navigation-model)
9. [Workspace Pattern](#9-workspace-pattern)
10. [Traceability (EIA ↔ Sumber)](#10-traceability)
11. [Open Questions](#11-open-questions)
12. [Change Log](#12-change-log)

---

## 0. Pendahuluan & Prinsip

### 0.1 Masalah yang dijawab EIA

Di platform sehirarkis SI GPIB, kebingungan terbesar pengguna bukanlah "fiturnya kurang", melainkan empat pertanyaan kontekstual:

> 1. *"Saya sedang berada di konteks apa?"* (Mupel / Jemaat / Pos mana?)
> 2. *"Saya sedang melihat data siapa?"* (milik saya / jemaat saya / seluruh GPIB?)
> 3. *"Mengapa saya bisa (atau tidak bisa) melihat data ini?"* (role + scope + privasi)
> 4. *"Apa hubungan data ini dengan organisasi?"* (hierarki & elevasi)

EIA adalah peta yang menjawab keempat pertanyaan itu secara eksplisit, sekali, lalu diturunkan konsisten ke UX Blueprint → Design System → `src/lib/domains/`.

### 0.2 Prinsip Desain EIA

| # | Prinsip | Konsekuensi |
|---|---|---|
| P1 | **Satu bahasa untuk semua peran** | Istilah organisasi (Mupel/Jemaat/Pos) dipakai konsisten, bukan nama tabel |
| P2 | **Entity + State + Permission = UX** | Setiap layar adalah fungsi dari ketiganya, bukan sekadar "tampilkan data" |
| P3 | **Dua lapis state** | Lifecycle (bisnis) dan Sync (offline) dimodelkan terpisah |
| P4 | **Selaras dengan kode** | Business Domain di EIA dipetakan 1:1 ke `src/lib/domains/` |
| P5 | **Hormati constraint mobile** | Navigasi global maksimal 5 slot bottom-nav; touch ≥ 44px; font ≥ 16px |
| P6 | **Traceable** | Setiap aturan EIA menunjuk balik ke ERD / PRD / rules.md |

---

## 1. Organization Model

### 1.1 Hierarki Organisasi GPIB

```text
SINODE GPIB (Nasional — tidak dimodelkan sebagai tabel, diwakili super_user)
└── MUPEL (25)                          → m_mupel        [M-XX]
     └── JEMAAT INDUK (350+)            → m_jemaat_induk [XX-XX-XX]
          ├── 1 KMJ (WAJIB Pendeta)     → m_jemaat_induk.id_kmj (UNIQUE)
          ├── 0+ PJ (WAJIB Pendeta)     → t_pj_jemaat
          └── POS PELKES / BAJEM (500+) → m_pos_pelkes   [POS-XXXXX]
               ├── Pelayan & Relawan
               ├── Kegiatan (Pastoral, Ibadah)
               ├── Aset (Tanah/Bangunan/Bergerak)
               └── Wilayah (Kerawanan/Potensi)
```

### 1.2 Aturan Organisasi (Business Rules)

| # | Aturan | Sumber |
|---|---|---|
| O1 | 1 Mupel → N Jemaat Induk → N Pos Pelkes | ERD §8 |
| O2 | **1 Jemaat Induk = tepat 1 KMJ** (atau NULL); KMJ WAJIB Pendeta aktif | ERD §8, rules RULE 1–2 |
| O3 | 1 Jemaat Induk = 0 atau lebih PJ; PJ WAJIB Pendeta | ERD §8, rules RULE 4–5 |
| O4 | 1 Pendeta hanya boleh menjabat PJ aktif di 1 Jemaat Induk | ERD §8 |
| O5 | Pendeta dibedakan **Organik** vs **Non-Organik** (kontrak + gereja asal) | ERD `m_pendeta.jenis_pendeta` |
| O6 | Saat mutasi, flag `is_kmj` & `is_pj` WAJIB di-reset | rules RULE 6 |

---

## 2. Identity & Scope Model

### 2.1 Lima Role Sistem

| Role | Kode (`users.role`) | Cakupan | Tipikal Pengguna |
|---|---|---|---|
| **Super User** | `super_user` | Global (seluruh GPIB) | Admin Sinode (Bpk. Stolaputih) |
| **Admin Mupel** | `admin_mupel` | 1 Mupel tertentu | Koordinator wilayah (Bpk. Junior) |
| **KMJ** | `kmj` | 1 Jemaat Induk yang dipimpin | Pdt. Anita (KMJ 02-01-BM) |
| **PJ** | `pj` | Jemaat + Pos yang ditugaskan | Pdt. Otniel (PJ 23-03-ET) |
| **User** | `user` | Pos yang ditugaskan | Pendeta/petugas di lapangan |

---

## 3. Domain Map

| # | Business Domain (EIA) | Code Domain (`src/lib/domains/`) | Fase |
|---|---|---|---|
| D1 | **Identitas & Akses** | `auth`, `webauthn` | 1 |
| D2 | **Organisasi & Hierarki** | `mupel`, `jemaat`, `pos-pelkes`, `elevasi` | 1–2 |
| D3 | **SDM Pendeta** | `pendeta`, `mutasi` | 2 |
| D4 | **Pelayanan & Pastoral** | `pastoral`, `demografi` | 2–3 |
| D5 | **Aset** | `aset` | 2 |
| D6 | **Bantuan & Workflow** | `bantuan` | 3 |
| D7 | **Wilayah & Risiko** | `kerawanan`, `potensi` | 3 |
| D8 | **Observabilitas & Audit** | `telemetry`, `logger` | 6 |

---

## 5. State Model (Dua Lapis)

### 5.1 Layer A — Lifecycle State

- **Pengajuan Bantuan**: `Draft → Pending_KMJ → Pending_Mupel → Pending_Sinode → Approved / Rejected`
- **Rejected**: Boleh **Ajukan Ulang** (membuat record baru dengan `id_ajuan_sebelumnya`).

---

## 6. Permission Matrix

### Privasi Profile 360° (Final v0.1.1)

| Section | Pemilik | super_user | admin_mupel | kmj |
|---|---|---|---|---|
| **Keluarga** | ✅ | ✅ | ❌ | ❌ |
| **Aktivitas (audit)** | ✅ | ✅ | ✅ (Mupel) | ✅ (Jemaat) |
| **Perangkat Biometrik** | ✅ | ✅ | ❌ | ❌ |
