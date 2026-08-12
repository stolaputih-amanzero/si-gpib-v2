# ACCOUNT SURFACE AUDIT V1 (/settings)

**Platform Layer:** Account Control Surface Layer  
**Platform Target:** Platform Baseline v2.2.0 (🔒 FROZEN ARCHITECTURE)  
**Governance Lineage:** `v2.0.0 ➔ SURFACE_NORMALIZATION_GATE_V1 ➔ ACCOUNT_SURFACE_AUDIT_V1`  
**Audit Verdict Status:** 🟢 **AUDIT COMPLETED — AUTHORIZED FOR MINIMAL-DELTA IMPLEMENTATION**  
**Date:** 2026-08-12  

---

## 🛑 FASE 2 INVARIANT: NO SECONDARY WORKSPACE IN /SETTINGS

> [!CAUTION]
> **SECONDARY WORKSPACE PREVENTION INVARIANT:**  
> **`/settings` is an Account Control Surface, NOT a Person Workspace.**  
> The "Profil Pelayanan Saya" link in `/settings` MUST remain a pure **Smart Entry Shortcut** redirecting to `/people/[id_person]`. Creating a duplicate profile page or tab inside `/settings` is strictly prohibited.

```text
/settings (Account Control Surface)
   │
   └── Profil Pelayanan Saya
           │
           ▼
      Smart Entry (/settings/profile)
           │
           ▼
/people/[id_person] (CANONICAL PERSON 360 WORKSPACE)
```

---

## 📊 1. CURRENT SURFACE INVENTORY

Based on actual codebase inspection of [`src/app/(dashboard)/settings/page.tsx`](file:///d:/PROJECT/si-gpib-v2/src/app/(dashboard)/settings/page.tsx):

1. **Header Hub**:
   - `h1`: `"Pengaturan & Profil Pengguna"` (Classical serif font).
   - Subtitle: `"Kelola profil akun, keamanan biometrik, otorisasi RBAC, dan sesi aplikasi SI GPIB."` (Leaks technical jargon `RBAC`).
2. **Profile Header Card**:
   - User avatar image / fallback icon.
   - User full name (`nama`) & email (`email`).
   - Raw database role badge (e.g. `super_user`, `kmj`, `pj`).
3. **"Profil 360° Saya" Card**:
   - Shortcut link to `/settings/profile`.
   - Floating card container with `border-brand-500/30 bg-brand-500/5`.
4. **"Manajemen User & Role (Superadmin)" Card**:
   - Conditional render via `isSuperUser`.
   - Floating card container with purple accent (`border-purple-500/30 bg-purple-500/5`).
   - Purple badge `SUPERUSER`.
   - Subtitle leaks jargon `"Poka-Yoke RBAC"`.
5. **Biometric Security Component (`BiometricSetup`)**:
   - Card for WebAuthn passkey registration & device status.
6. **"Tema Tampilan" Card**:
   - `ThemeToggle` component container.
7. **"Notifikasi Sistem" Card**:
   - System notification toggle switch.
8. **Account Options Card**:
   - Button `"Ubah Kata Sandi"` (Triggers modal dialog `isChangingPassword`).
   - Button `"Keluar Sesi"` (Triggers confirmation dialog & `logout()`).

---

## 🗺️ 2. SURFACE ➔ CANONICAL CONTRACT MAPPING

| Current UI Element | Canonical Mental Model | Normalized Surface Group |
| :--- | :--- | :--- |
| **Profile Header Card** | **IDENTITY** | **Identity Header** (Human-readable role presentation policy). |
| **Card "Profil 360° Saya"** | **ACCOUNT & PERSON** | **Profil Pelayanan Saya** (Smart Entry to `/people/[id_person]`). |
| **Biometric Card & Password Modal** | **ACCOUNT & SECURITY** | **Keamanan & Sesi** (Biometrics, Password Change, Session Logout). |
| **User & Role Management Card** | **ADMINISTRATION** | **Administrasi Sistem** (Gated User Management - Standard Neutral Styling). |
| **Theme & Notification Cards** | **PREFERENCES** | **Preferensi System** (Theme & Notifications). |

---

## 🛠️ 3. NORMALIZATION DELTA

1. **Grouped Section Restructuring**:
   Reorganize isolated floating cards into 4 semantic, clean sections with clear section headers:
   - **Section 1: Identitas & Profil Pelayanan** (Identity Header + F2 Smart Entry).
   - **Section 2: Keamanan & Akun** (Biometrics, Password Update, Logout).
   - **Section 3: Administrasi Sistem** (Gated User Management - Neutral styling).
   - **Section 4: Preferensi Sistem** (Theme & Notifications).

2. **Human-Readable Role Presentation Policy**:
   Replace raw database enum badges (`SUPER_USER`, `KMJ`, `PJ`) with human-centric presentation labels:
   - `super_user` + Scope National ➔ **Admin Nasional** / **Akses Penuh**
   - `kmj` ➔ **Ketua Majelis Jemaat**
   - `pj` ➔ **Pendeta Jemaat**

3. **Jargon Purge**:
   Remove technical terms `"RBAC"` and `"Poka-Yoke RBAC"` from all copy. Replace with natural Bahasa Indonesia (`"Hak Akses"` / `"Otorisasi Pengguna"`).

4. **Visual Token Alignment**:
   - Eliminate non-semantic purple accents on Superadmin card. Use normalized neutral/brand border tokens.
   - Apply F1.1 surface geometry tokens (`px-gutter-mobile`, `rounded-card`, `rounded-control`).

---

## 🔒 4. FORBIDDEN MUTATION LIST

> [!CAUTION]
> **FORBIDDEN MUTATION LIST (SACRED BOUNDARIES):**
> 1. ❌ **DO NOT create a secondary profile workspace inside `/settings`**: `/settings/profile` MUST remain a pure redirect shortcut to `/people/[id_person]`.
> 2. ❌ **DO NOT alter Authorization PDP / RLS Rules**: `isSuperUser` and role gating logic remain 100% unchanged.
> 3. ❌ **DO NOT alter Canonical Route `/settings`**: No new routes or URL changes.
> 4. ❌ **DO NOT alter Auth API / WebAuthn Endpoints**: Passkey endpoints, Supabase Auth `updateUser`, and `logout()` remain intact.

---

## 🚀 5. F2 IMPLEMENTATION PIPELINE

```text
F2.1  Role Presentation Helper (Human-readable label transformer)
      ↓
F2.2  Grouped Section Layout Restructuring in /settings/page.tsx
      ↓
F2.3  Identity Header & F2 Smart Entry Normalization
      ↓
F2.4  Security, Administration & Preferences Section Polish
      ↓
      ┌────────────────────────────────────────────────────────┐
      │ F2 VERIFICATION GATE:                                  │
      │ 1. npx tsc --noEmit (0 Errors)                         │
      │ 2. npm run build                                       │
      │ 3. F2 E2E Spec Pass (f2-person-workspace.spec.ts)      │
      │ 4. Smart Entry Shortcut Verification                   │
      └────────────────────────────────────────────────────────┘
```
