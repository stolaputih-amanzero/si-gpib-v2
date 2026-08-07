# 🎨 UX Blueprint & Architecture Manual v0.2.0

## SI GPIB v2 — System Overview & Journey Status

This document defines the complete user experience, architectural standards, role-based security, and offline resilience for SI GPIB v2.

---

## 🏆 Critical Journey Inventory (PRD §12)

| Journey | Module | Primary Role | Status | Key Technical Feature |
|---|---|---|---|---|
| **CJ-1** | Log Pastoral Input | Penanggung Jawab Pos | ✅ Production Ready | Dexie IndexedDB + Background Command Queue |
| **CJ-2** | KMJ Review Log | KMJ / Admin | ✅ Production Ready | Stats Aggregation RPC + Excel/CSV Export |
| **CJ-3** | Mutasi Pendeta | Super User (Sinode) | ✅ Production Ready | Atomic Transactional RPC `mutasi_pendeta` |
| **CJ-4** | Bantuan Workflow | PJ Pos / KMJ / BPP | ✅ Production Ready | Multi-level Approval + Resubmission State |
| **CJ-5** | Aset + Camera + GPS | Pengelola Aset | ✅ Production Ready | Native HTML5 Capture + Canvas Compression + EXIF GPS |
| **CJ-6** | Offline Stress Test | System Automated | ✅ 7/7 Scenarios PASS | Idempotency Logs + DLQ + Session Guards |
| **CJ-7** | Profile 360° | Semua Role | ✅ Production Ready | Asymmetric Privacy (EIA v0.1.1) + 8 Section Layout |

---

## 🔒 Security & Privacy Architecture

### 1. Asymmetric Privacy (EIA v0.1.1 Compliance)
- **Private Sections**: Keluarga and Biometric sections are strictly hidden from DOM for unauthorized users (Admin Mupel).
- **Role Control**: Only the target Pendeta and Super User can view private biometrics and family records.

### 2. Role-Based Access Control (RLS)
- **Hierarchical Access**: Umat < PJ Pos < KMJ < Admin Mupel < Super User.
- **Atomic Operations**: Critical state changes (Mutasi, Approval, Log Insert) run via PostgreSQL functions with `SECURITY DEFINER`.

---

## ⚡ Offline-First Architecture & Performance

### 1. Dexie IndexedDB Queue
- Offline submissions stored in IndexedDB `pendingSubmissions` table.
- Exponential backoff retry logic (1s, 2s, 4s, DLQ after max attempts).

### 2. Idempotency Protection
- All offline payloads include client-generated UUID `requestId`.
- PostgreSQL checks `sys_transaction_logs` or primary key constraints to prevent duplicate insertions on network retries.

### 3. Monitoring & Error Tracking
- Integrated `@sentry/nextjs` with automatic breadcrumb capture and privacy header sanitization.
- Lighthouse CI performance budgets enforcing NFR-25 (>90 score target).
