📜 SI GPIB v2.3 — AI Agent Rules & Guardrails
(Sistem Informasi Organisasi Sinode — SI GPIB)

File ini adalah "kontrak" untuk AI Agent di IDE
Setiap kode yang dihasilkan WAJIB mematuhi aturan di bawah ini.

Versi: 2.3.2 | Update: 6 Agustus 2026 (Phase 6: Production Readiness & Pilot Phase)
⚠️ PWA: Workbox custom + @serwist/next (build tool only)

⚠️ PERUBAHAN KRITIS dari v2.3.1 (Tahap 6 Hardening):
- Offline Engine: Command Pattern Sync Engine (Dexie v5 + Dead-Letter Queue)
- Conflict Resolution: Domain-Driven Conflict Policy Engine (menggantikan generic LWW)
- Server Idempotency: Centralized `sys_transaction_logs` Supabase table
- Observability: Dual-Write Telemetry (`sys_telemetry` + Sentry Dashboard at `/dashboard/developer/telemetry`)
- RLS Token Expiry Mitigation: P0 Hotfix session verification before pending queue loop
- Incident Runbook: Formally defined at `docs/runbooks/offline-sync-incident.md`

🎯 IDENTITAS PROYEK

project_name: SI GPIB v2.0
codename: SI Pos Pelkes
version: 2.3.1
architecture: Online-First + Mobile First PWA + Biometric Auth
primary_platform: Mobile PWA (90%+ pengguna)
lifecycle: 30-50 tahun (bulletproof)
language: Bahasa Indonesia (UI), English (code)

Dokumen Referensi (WAJIB dibaca sebelum coding):
📘 `SI GPIB v2.2 — Blueprint.md` — Arsitektur & stack
📗 `SI GPIB v2.2 — PRD.md` — User stories & acceptance criteria
📙 `SI GPIB v2.2 — ERD.md` — Skema database & relasi
📊 `GPIB.xlsx` — Data master (Mupel, Jemaat, Pos Pelkes, Pendeta, Users)

🛠️ STACK TEKNOLOGI (WAJIB)

✅ Core Stack — JANGAN DIGANTI (kecuali dengan persetujuan Tech Lead)

| Layer | Teknologi | Versi Min |
|---|---|---|
| Runtime | Node.js (LTS) | 22+ |
| Package Manager | pnpm/npm | 9+ |
| Framework | Next.js (App Router) | **16+** |
| UI Library | React | 19+ |
| Language | TypeScript (strict mode) | 5+ |
| Styling | Tailwind CSS | 4+ |
| Backend/BaaS | Supabase | Latest |
| ORM | Drizzle ORM | Latest |
| UI Components | shadcn/ui | Latest |
| Icons | Lucide React | Latest |
| Form | React Hook Form + Zod | Latest |
| Validation | Zod | Latest |
| Data Fetching | TanStack Query | Latest |
| Tables | TanStack Table | Latest |
| Mapping | React-Leaflet | Latest |
| Charts | Recharts | Latest |
| Date | date-fns | Latest |
| State (Server) | TanStack Query | Latest |
| State (UI Global) | React Context | Latest |
| State (Form) | React Hook Form | Latest |
| State (Session) | Supabase Auth | Latest |
| State (URL) | Next.js searchParams | Latest |
| PWA | Workbox 7+ (custom SW) + @serwist/next (build tool) | Latest |
| Offline Storage | Dexie (IndexedDB) | Latest |
| Biometric | @simplewebauthn/browser + server | Latest |
| Monitoring | Sentry (Free Tier) | Latest |
| Env Validation | @t3-oss/env-nextjs | Latest |

📌 CATATAN PENTING:
- `next-pwa` (shadowwalker/original) SUDAH TIDAK MAINTAINED sejak 2022.
  JANGAN digunakan. Gunakan Workbox langsung via custom Service Worker.
- Zustand TIDAK ada di core stack. Gunakan React Context untuk UI state
  global sederhana. Jika UI state menjadi sangat kompleks, diskusikan
  dengan Tech Lead sebelum menambahkan library state tambahan.
- React Compiler BELUM digunakan. Tunggu hingga benar-benar stable.
  Jangan tambahkan `react-compiler` atau `babel-plugin-react-compiler`.

❌ Library yang DILARANG

| Library | Alasan |
|---|---|
| next-pwa (shadowwalker/original) | Dead sejak 2022, tidak kompatibel Next 16+ |
| next-pwa (fork lain sebagai abstraction) | Gunakan @serwist/next hanya sebagai build tool |
| Redux, Redux Toolkit | Terlalu berat; gunakan React Context + TanStack Query |
| Material UI, Ant Design | Tidak konsisten dengan design system |
| Moment.js | Deprecated, gunakan date-fns |
| jQuery | Tidak relevan dengan React |
| Axios | Gunakan fetch + TanStack Query |
| styled-components, emotion | Gunakan Tailwind CSS |
| WatermelonDB, IndexedDB langsung (tanpa wrapper) | Gunakan Dexie sebagai wrapper IndexedDB |
| tRPC | Over-engineering; Supabase client sudah type-safe |
| react-compiler / babel-plugin-react-compiler | Belum stable; tunggu mature |

📁 STRUKTUR FOLDER (WAJIB DIIKUTI)

si-gpib-v2/
 ├── src/
 │   ├── app/                          # Next.js App Router (routes)
 │   │   ├── (auth)/
 │   │   │   ├── login/
 │   │   │   ├── register/
 │   │   │   └── forgot-password/
 │   │   ├── (dashboard)/
 │   │   │   ├── layout.tsx            # Bottom nav + safe area
 │   │   │   ├── page.tsx              # Dashboard home
 │   │   │   ├── mupel/
 │   │   │   ├── jemaat/
 │   │   │   ├── pos-pelkes/
 │   │   │   ├── pendeta/
 │   │   │   ├── mutasi/
 │   │   │   ├── pastoral/
 │   │   │   ├── aset/
 │   │   │   ├── bantuan/
 │   │   │   ├── demografi/
 │   │   │   └── settings/
 │   │   ├── (public)/
 │   │   ├── offline/page.tsx          # Offline fallback
 │   │   ├── api/                      # API Routes (HANYA untuk endpoint publik)
 │   │   │   ├── auth/webauthn/
 │   │   │   ├── webhooks/
 │   │   │   └── upload/
 │   │   └── layout.tsx                # Root layout
 │   │
 │   ├── components/
 │   │   ├── ui/                       # shadcn/ui (jangan dimodifikasi)
 │   │   ├── mobile/                   # Mobile-specific components
 │   │   ├── offline/                  # Offline handling
 │   │   ├── camera/                   # Camera integration
 │   │   ├── biometric/                # Biometric UI
 │   │   ├── maps/                     # Leaflet components
 │   │   ├── charts/                   # Recharts wrappers
 │   │   ├── forms/                    # Form components
 │   │   ├── tables/                   # TanStack Table wrappers
 │   │   └── layout/                   # Header, Sidebar, Footer
 │   │
 │   ├── lib/
 │   │   ├── domains/                  # 🆕 Domain logic colocation
 │   │   │   ├── pos-pelkes/
 │   │   │   │   ├── pos-pelkes.service.ts    # Business logic
 │   │   │   │   ├── pos-pelkes.schema.ts     # Zod schemas
 │   │   │   │   ├── pos-pelkes.types.ts      # Types
 │   │   │   │   └── pos-pelkes.queries.ts    # TanStack Query hooks
 │   │   │   ├── pendeta/
 │   │   │   ├── mutasi/
 │   │   │   ├── elevasi/
 │   │   │   ├── pastoral/
 │   │   │   ├── aset/
 │   │   │   ├── bantuan/
 │   │   │   ├── demografi/
 │   │   │   ├── jemaat/
 │   │   │   └── mupel/
 │   │   ├── supabase/                 # Supabase clients
 │   │   │   ├── client.ts
 │   │   │   ├── server.ts
 │   │   │   └── middleware.ts
 │   │   ├── webauthn/                 # WebAuthn helpers
 │   │   ├── db/                       # Drizzle schema + types
 │   │   ├── offline/                  # 🆕 Offline & PWA
 │   │   │   ├── dexie.ts              # Dexie database setup
 │   │   │   ├── sync-manager.ts       # Pending submission queue
 │   │   │   └── cache-strategies.ts   # Workbox strategy config
 │   │   ├── camera/                   # Camera helpers
 │   │   ├── geolocation/              # GPS helpers
 │   │   ├── share/                    # Web Share API
 │   │   ├── haptic/                   # Haptic feedback
 │   │   ├── validations/              # Shared Zod schemas
 │   │   ├── utils/                    # Helper functions
 │   │   ├── constants/                # App constants
 │   │   ├── env.ts                    # 🆕 Env validation (@t3-oss/env-nextjs)
 │   │   └── logger.ts                 # 🆕 Centralized logger + Sentry
 │   │
 │   ├── hooks/                        # Custom React Hooks
 │   ├── stores/                       # React Context providers
 │   ├── types/                        # Global TypeScript types
 │   └── styles/
 │       └── globals.css
 │
 ├── public/
 │   ├── manifest.json                 # PWA manifest
 │   ├── sw.js                         # 🆕 Custom Service Worker (Workbox)
 │   ├── sw.js.map
 │   ├── icons/
 │   └── screenshots/
 │
 ├── supabase/
 │   ├── migrations/
 │   ├── functions/
 │   └── seed.sql
 │
 ├── .github/
 │   └── workflows/
 │       └── ci.yml                    # 🆕 CI/CD pipeline
 │
 ├── sentry.client.config.ts           # 🆕 Sentry client config
 ├── sentry.server.config.ts           # 🆕 Sentry server config
 ├── sentry.edge.config.ts             # 🆕 Sentry edge config
 ├── docs/
 ├── .env.local
 ├── next.config.js
 ├── tailwind.config.ts
 ├── tsconfig.json
 └── package.json

📝 Konvensi Penamaan File

| Tipe | Format | Contoh |
|---|---|---|
| Page | page.tsx | app/pos-pelkes/page.tsx |
| Layout | layout.tsx | app/(dashboard)/layout.tsx |
| Component | PascalCase.tsx | BottomNavigation.tsx |
| Hook | kebab-case.ts | use-network-status.ts |
| Util | kebab-case.ts | format-currency.ts |
| Type | kebab-case.ts | pos-pelkes.types.ts |
| Schema | kebab-case.ts | log-pastoral.schema.ts |
| Service | kebab-case.ts | pos-pelkes.service.ts |
| Query | kebab-case.ts | pos-pelkes.queries.ts |
| Test | *.test.ts(x) | use-auth.test.ts |
| Migration | YYYYMMDD_description.sql | 20260720_create_users.sql |

🔗 IMPORT & EXPORT RULES (WAJIB)

### Alias Imports
Selalu gunakan alias `@/` — JANGAN gunakan relative path `../../`:
// ✅ BENAR
import { createClient } from '@/lib/supabase/client';
import { PosPelkesCard } from '@/components/mobile/PosPelkesCard';

// ❌ JANGAN
import { createClient } from '../../lib/supabase/client';
import { PosPelkesCard } from '../components/mobile/PosPelkesCard';

### No Barrel Exports
JANGAN membuat `index.ts` barrel export, KECUALI untuk `components/ui/`
(shadcn/ui) yang memang memerlukannya:
// ❌ JANGAN: barrel export di setiap folder
// src/lib/domains/pos-pelkes/index.ts
export * from './pos-pelkes.service';
export * from './pos-pelkes.schema';
export * from './pos-pelkes.types';
export * from './pos-pelkes.queries';

// ✅ BENAR: import langsung dari file
import { createPosPelkes } from '@/lib/domains/pos-pelkes/pos-pelkes.service';
import { posPelkesSchema } from '@/lib/domains/pos-pelkes/pos-pelkes.schema';

// ✅ EXCEPTION: components/ui boleh punya barrel
// src/components/ui/index.ts (hanya untuk shadcn/ui)
export { Button } from './button';
export { Input } from './input';
export { Dialog } from './dialog';

### Domain Logic Colocation
Semua business logic per domain WAJIB colocated di `src/lib/domains/{domain}/`:
// Struktur per domain:
src/lib/domains/pos-pelkes/
├── pos-pelkes.service.ts    # Server Actions + business logic
├── pos-pelkes.schema.ts     # Zod validation schemas
├── pos-pelkes.types.ts      # TypeScript types
└── pos-pelkes.queries.ts    # TanStack Query hooks (client-side)

// JANGAN pisah ke folders berdasarkan tipe:
// ❌ src/services/pos-pelkes.ts
// ❌ src/schemas/pos-pelkes.ts
// ❌ src/types/pos-pelkes.ts

🏗️ BUSINESS RULES (TIDAK BOLEH DILANGGAR)

🔴 KRITIS — Hierarki Gereja

MUPEL (25)
  └── JEMAAT INDUK (350+)
        ├── 1 KMJ (Ketua Majelis Jemaat) — WAJIB Pendeta
        ├── 0+ PJ (Pendeta Jemaat) — WAJIB Pendeta
        └── POS PELKES (500+)
              └── Pendeta yang ditugaskan

🔴 KRITIS — Aturan KMJ & PJ

-- RULE 1: 1 Jemaat = tepat 1 KMJ (atau NULL)
-- RULE 2: KMJ HARUS seorang Pendeta
-- RULE 3: 1 Pendeta = max 1 KMJ (partial unique index)
-- RULE 4: 1 Jemaat = 0 atau lebih PJ
-- RULE 5: PJ HARUS seorang Pendeta
-- RULE 6: Saat mutasi, flag is_kmj & is_pj harus di-reset

🔴 KRITIS — ID Pattern

| Entitas | Format | Contoh |
|---|---|---|
| Mupel | M-XX | M-01, M-25 |
| Jemaat Induk | XX-XX-XX | 02-01-BM, 23-03-ET |
| Pos Pelkes | POS-XXXXX | POS-13055, POS-81917 |
| Pendeta | PDT-XXXXXXXX | PDT-19060024 |
| Keluarga Pendeta | KLG-XXXXXXXX | KLG-83719402 |
| Kompetensi Pendeta | KMP-XXXXXXXX | KMP-19304857 |
| Keterlibatan Pendeta | KTL-XXXXXXXX | KTL-92837410 |
| Jabatan Struktural | JBT-{timestamp}-{random} | JBT-1778142941355-374 |
| Histori Status | HIS-{timestamp}-{random} | HIS-1778142941355-374 |
| Log Aktivitas | LOG-{timestamp}-{random} | LOG-1778142941355-374 |

🟠 PENTING — Workflow Pengajuan Bantuan

Pos Pelkes → KMJ → Admin Mupel → Super User Sinode
   ↓          ↓         ↓              ↓
 Draft    Pending_KMJ  Pending_Mupel  Pending_Sinode
                                         ↓
                                   Approved / Rejected
                                         ↓ (Ajukan Ulang)
                                  Draft (Record Baru)

Catatan Pengajuan Ulang:
- Jika status `Rejected`, pemohon (PJ/User) dapat melakukan **Ajukan Ulang**.
- Aksi ini membuat record baru (`t_pengajuan_bantuan`) ber-status `Draft` dan mereferensikan ID lama via kolom `id_pengajuan_sebelumnya`.
- Record lama tetap tersimpan sebagai `Rejected` untuk audit trail.

🟠 PENTING — Mutasi Pendeta (Atomic)

Setiap mutasi pendeta WAJIB melalui Database Function (RPC), JANGAN update manual:
// ✅ BENAR
const { error } = await supabase.rpc('mutasi_pendeta', {
  p_id_pendeta: 'PDT-19060024',
  p_id_induk_baru: '23-03-ET',
  p_alasan: 'Kebutuhan pelayanan'
});

// ❌ SALAH — jangan update manual
await supabase.from('m_pendeta').update({ id_induk: '23-03-ET' })
  .eq('id_pendeta', 'PDT-19060024');

🟠 PENTING — Elevasi Status Pos (Atomic)

Elevasi Pos Pelkes → Bajem → Jemaat Induk WAJIB via RPC:
// ✅ BENAR
const { error } = await supabase.rpc('process_status_elevation', {
  p_id_pos: 'POS-13055',
  p_target_status: 'BAJEM',  // atau 'JEMAAT_INDUK'
  p_tanggal_perubahan: '2026-08-06',
  p_keterangan: 'SK Sinode No. 123/2026'
});

📱 MOBILE-FIRST RULES (WAJIB)

🎯 Prinsip Utama
"Mobile bukan versi kecil dari desktop. Mobile adalah pengalaman UTAMA."

📏 Design Constraints

| Aspek | Mobile | Desktop |
|---|---|---|
| Touch Target | 44x44px minimum | 32x32px |
| Font Size | 16px minimum (body) | 14px minimum |
| Padding | 16px | 32px |
| Border Radius | 12px (cards) | 8px (cards) |
| Navigation | Bottom Navigation | Sidebar |

📱 Komponen Mobile yang WAJIB Ada

// 1. Bottom Navigation (Thumb Zone)
<BottomNavigation>
  <NavItem icon={Home} label="Beranda" href="/dashboard" />
  <NavItem icon={Map} label="Peta" href="/pos-pelkes" />
  <NavItem icon={Plus} label="Input" href="/quick-action" isMain />
  <NavItem icon={FileText} label="Laporan" href="/pastoral" />
  <NavItem icon={User} label="Profil" href="/settings" />
</BottomNavigation>

// 2. Safe Area Handling (notch, home indicator)
<div className="pb-[env(safe-area-inset-bottom)]">
  {children}
</div>

// 3. Touch Button (44x44px minimum)
<button className="min-h-[44px] min-w-[44px] p-3">
  {children}
</button>

🚫 Anti-Patterns Mobile

// ❌ JANGAN: Hover-only interactions
<button className="hover:bg-blue-500">Submit</button>

// ✅ HARUS: Touch-friendly dengan active state
<button className="active:bg-blue-600 hover:bg-blue-500">Submit</button>

// ❌ JANGAN: Tabel lebar tanpa horizontal scroll
<table className="w-full">...</table>

// ✅ HARUS: Card view di mobile, tabel di desktop
<div className="md:hidden"><CardView /></div>
<div className="hidden md:block"><TableView /></div>

// ❌ JANGAN: Font < 16px di mobile
<p className="text-xs">Text kecil</p>

// ✅ HARUS: Minimal 16px
<p className="text-base">Text readable</p>

🌐 PWA RULES (WAJIB — Workbox Custom + Serwist Build)

### Arsitektur PWA

Service Worker ditulis MANUAL menggunakan Workbox API di `src/sw.ts`.
`@serwist/next` HANYA digunakan sebagai build tool untuk:
1. Inject `__WB_MANIFEST` (daftar file hasil build Next.js)
2. Compile `sw.ts` → `public/sw.js` saat `pnpm build`
3. Menangani precaching asset list secara otomatis

JANGAN gunakan `next-pwa` atau wrapper abstraction lainnya.

### Konfigurasi Build

// next.config.mjs
import withSerwist from '@serwist/next';

const withSerwistConfig = withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwistConfig({
  // Next.js 16 config lainnya
});

### Service Worker Custom (src/sw.ts)

Lihat template lengkap di bagian "Eksekusi Tahap 1" — file `src/sw.ts`.

### Background Sync: Strategi Bertingkat

// Android Chrome: Background Sync API (native)
// iOS Safari: Fallback ke manual sync saat online event
// Implementasi di src/lib/offline/sync-manager.ts

### Manifest Requirements

{
  "name": "SI GPIB v2.0",
  "short_name": "SI GPIB",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1E40AF",
  "background_color": "#ffffff",
  "lang": "id-ID",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "purpose": "maskable" }
  ]
}

📶 OFFLINE & DRAFT RULES (WAJIB)

### Storage: IndexedDB via Dexie (BUKAN localStorage)

localStorage TIDAK cukup untuk foto, file, dan ribuan draft.
Gunakan Dexie (wrapper IndexedDB) untuk semua offline storage.

// ✅ BENAR: Dexie untuk draft + offline queue
import { db } from '@/lib/offline/dexie';

// Simpan draft form
await db.drafts.put({
  formKey: 'log-pastoral-new',
  data: formData,
  timestamp: Date.now()
});

// Ambil draft
const draft = await db.drafts.get('log-pastoral-new');

// Hapus draft setelah submit sukses
await db.drafts.delete('log-pastoral-new');

// ❌ JANGAN: localStorage untuk data besar atau foto
localStorage.setItem('draft:log-pastoral', JSON.stringify(formData));
localStorage.setItem('foto-aset', base64String); // ❌ Terlalu besar!

### Dexie Schema (v5 - Command Pattern & DLQ)
// src/lib/offline/dexie.ts
import Dexie, { type Table } from 'dexie';

export interface Draft {
  formKey: string;
  data: unknown;
  timestamp: number;
}

export interface DraftPhoto {
  formKey: string;
  photoIndex: number;
  blob: Blob;
  timestamp: number;
}

export interface PendingSubmission {
  id?: number;
  requestId: string; // UUID v7 / UUID v4
  operationType: 'rpc' | 'insert' | 'update';
  targetIdentifier: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  lastError?: string;
  createdAt: number;
}

export interface PendingAttachment {
  id?: number;
  submissionId: number;
  file: Blob;
  path: string;
  status: 'pending' | 'uploading' | 'done' | 'failed';
  attempts: number;
  lastError?: string;
  createdAt: number;
}

export interface DeadLetter {
  id?: number;
  requestId: string;
  operationType: 'rpc' | 'insert' | 'update';
  targetIdentifier: string;
  payload: Record<string, unknown>;
  failureReason: string;
  httpStatus?: number;
  errorCode?: string;
  attempts: number;
  createdAt: number;
  movedToDLQAt: number;
}

class SIOSDatabase extends Dexie {
  drafts!: Table<Draft, string>;
  draftPhotos!: Table<DraftPhoto>;
  pendingSubmissions!: Table<PendingSubmission>;
  pendingAttachments!: Table<PendingAttachment>;
  deadLetters!: Table<DeadLetter>;

  constructor() {
    super('sigpib-offline');
    this.version(5).stores({
      drafts: 'formKey, timestamp',
      draftPhotos: '++id, [formKey+photoIndex], timestamp',
      pendingSubmissions: '++id, requestId, status, createdAt',
      pendingAttachments: '++id, submissionId, status, createdAt',
      deadLetters: '++id, requestId, createdAt, movedToDLQAt',
    });
  }
}

export const db = new SIOSDatabase();

### TanStack Query Persist
Gunakan `@tanstack/react-query-persist-client` untuk offline data fetching:

**Catatan:** Untuk data besar (foto, file), simpan Blob langsung di Dexie
(IndexedDB), BUKAN di TanStack Query cache. TanStack Query cache hanya
untuk data JSON terstruktur.

import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createIndexedDBStorage } from '@tanstack/query-persist-client-indexeddb';

persistQueryClient({
  queryClient,
  persister: createIndexedDBStorage({
    key: 'sigpib-query-cache',
  }),
  maxAge: 24 * 60 * 60 * 1000, // 24 jam
});

🧠 STATE MANAGEMENT RULES (WAJIB)

### Peta State per Jenis

| Jenis State | Tool | Contoh di sigpib |
|---|---|---|
| Server State | TanStack Query | Data Pos, Mupel, Pendeta |
| UI State Global | React Context | Bottom nav active, theme |
| Form State | React Hook Form | Form log pastoral, form aset |
| Session | Supabase Auth | JWT, user role |
| URL State | Next.js searchParams | Filter, sort, page |
| Offline Queue | Dexie + TQ Persist | Pending submissions |

### Aturan Ketat
// ❌ JANGAN: Semua state di satu store
const useStore = create((set) => ({
  posPelkes: [],     // ← Server state → TanStack Query
  filters: {},       // ← URL state → searchParams
  formData: {},      // ← Form state → RHF
  isModalOpen: false, // ← OK, ini UI state
}));

// ✅ BENAR: Pisahkan per jenis

// Server state → TanStack Query
const { data: posPelkes } = useQuery({
  queryKey: ['pos-pelkes', filters],
  queryFn: () => fetchPosPelkes(filters),
});

// URL state → searchParams
const searchParams = useSearchParams();
const filter = searchParams.get('mupel');

// Form state → React Hook Form
const { register, handleSubmit } = useForm<LogPastoralSchema>();

// UI state → React Context (hanya yang benar-benar global)
const { activeTab, setActiveTab } = useNavigationContext();

### React Context Guidelines
// ✅ BENAR: Context untuk UI state global sederhana
// src/stores/navigation-context.tsx
'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBottomSheetOpen: boolean;
  setBottomSheetOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('beranda');
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab, isBottomSheetOpen, setBottomSheetOpen }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigationContext must be used within NavigationProvider');
  return ctx;
}

⚡ NEXT.JS 16 SPECIFIC RULES (WAJIB)

### 🔴 KRITIS — Async params & searchParams

Next.js 15+ mengubah `params` dan `searchParams` menjadi async.
Akses synchronous akan menyebabkan ERROR di runtime.

// ❌ JANGAN: Akses synchronous (akan error di Next 16)
export default function Page({ params, searchParams }) {
  const id = params.id;                        // ❌ Error: params is a Promise
  const filter = searchParams.get('filter');   // ❌ Error: searchParams is a Promise
}

// ✅ HARUS Pola 1: Async Page Component
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const { filter } = await searchParams;
  // ...
}

// ✅ HARUS Pola 2: Client Component dengan React.use()
'use client';
import { use } from 'react';

export default function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = use(params);
  const { filter } = use(searchParams);
  // ...
}

### 🟠 PENTING — Cache Semantics Baru

`fetch()` TIDAK lagi cache-by-default di App Router Next 15+.
Gunakan `unstable_cache` atau PPR untuk caching eksplisit.

// ❌ JANGAN: Asumsi fetch di-cache otomatis
const data = await fetch('https://api.example.com/data'); // TIDAK di-cache!

// ✅ HARUS: Explicit caching jika perlu
import { unstable_cache } from 'next/cache';

const getMupels = unstable_cache(
  async () => await db.select().from(m_mupel),
  ['mupels'],
  { revalidate: 3600 } // 1 jam
);

### 🟠 PENTING — Partial Pre-Rendering (PPR)

Gunakan PPR untuk halaman master data agar shell statis + data dinamis:
// ✅ BENAR: PPR untuk halaman list yang butuh shell cepat
export const experimental_ppr = true;

export default async function MupelPage() {
  const mupels = await getMupels(); // Dinamis
  return <MupelList mupels={mupels} />; // Shell statis
}

### 🟠 PENTING — Server Actions > API Routes

Semua mutasi internal WAJIB via Server Actions, BUKAN API Route.
API Route HANYA untuk endpoint publik (webhook, upload, public API).

// ✅ BENAR: Server Action untuk CRUD internal
'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const createPosSchema = z.object({
  nama_pos: z.string().min(1).max(150),
  id_induk: z.string().min(1),
  kategori: z.enum(['Pos Pelkes', 'Bajem']).default('Pos Pelkes'),
});

export async function createPosPelkes(data: z.infer<typeof createPosSchema>) {
  const validated = createPosSchema.parse(data);
  const supabase = createClient();
  // ... execute
  revalidatePath('/pos-pelkes');
}

// ❌ JANGAN: API Route untuk CRUD internal
// src/app/api/pos-pelkes/route.ts
export async function POST(req: Request) { ... } // ❌ Tidak perlu!

🔐 SECURITY RULES (WAJIB)

🔒 Row Level Security (RLS)
SEMUA tabel WAJIB punya RLS policy. Jangan pernah disable RLS.

-- ✅ BENAR: RLS per role
CREATE POLICY "KMJ akses jemaat yang dipimpinnya"
ON m_jemaat_induk FOR ALL
USING (
    id_induk IN (
        SELECT id_induk FROM m_jemaat_induk 
        WHERE id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
    )
);

-- ❌ JANGAN: Disable RLS
ALTER TABLE m_jemaat_induk DISABLE ROW LEVEL SECURITY;

🔴 KRITIS — Privasi Profile 360° (RLS Asimetri EIA v0.1.1)

- `t_log_aktivitas` (Audit Log): Diri sendiri + super_user + admin_mupel (scope Mupel) + kmj (scope Jemaat)
- Data keluarga (`t_keluarga_pendeta`): HANYA pemilik + super_user (via RPC `get_pendeta_360`)
- `m_webauthn_credentials` (Device Biometrik): HANYA diri sendiri + super_user
- Data pelayanan (hierarki, mutasi, log pastoral): sesuai scope role
- JANGAN pernah longgarkan data keluarga atau biometrik ke admin_mupel atau kmj

🔐 Biometric Auth Rules

// ✅ BENAR: Max 5 device per user
const MAX_BIOMETRIC_DEVICES = 5;

// ✅ BENAR: Auto-expire 90 hari
const BIOMETRIC_EXPIRE_DAYS = 90;

// ✅ BENAR: Fallback ke password jika biometric gagal
try {
  await loginWithBiometric();
} catch (err) {
  fallbackToPassword();
}

// ❌ JANGAN: Simpan credential di localStorage
localStorage.setItem('biometric_credential', credential);

// ❌ JANGAN: Expose public_key ke client
return { credential_id, public_key }; // JANGAN

🔑 JWT Custom Claims

{
  "sub": "uuid-user",
  "role": "kmj",
  "id_pendeta": "PDT-19060024",
  "id_induk": "02-01-BM",
  "id_mupel": "M-02",
  "is_kmj": true,
  "is_pj": false,
  "auth_method": "biometric",
  "device_id": "iphone-15-pro-abc123"
}

🚫 Security Anti-Patterns

// ❌ JANGAN: Expose service role key di client
const supabase = createClient(SERVICE_ROLE_KEY); // BAHAYA!

// ✅ HARUS: Gunakan anon key di client
const supabase = createClient(ANON_KEY);

// ❌ JANGAN: Password di plain text
const password = 'admin123';

// ✅ HARUS: Hash dengan bcrypt
const hashed = await bcrypt.hash(password, 10);

// ❌ JANGAN: SQL string concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ HARUS: Parameterized query / Drizzle ORM
const query = db.select().from(users).where(eq(users.id, userId));

📊 OBSERVABILITY RULES (WAJIB)

### Error Tracking: Sentry

Semua unhandled error WAJIB dilaporkan ke Sentry.
Source maps di-upload saat CI/CD build.

// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});

### Logging: Centralized Logger

Gunakan logger utility terpusat, JANGAN console.log:
// ✅ BENAR: Logger terpusat
import { logger } from '@/lib/utils/logger';

logger.info('Pos Pelkes created', { id_pos, user_id });
logger.error('Mutasi pendeta gagal', error);

// ❌ JANGAN: console.log
console.log('data:', data);

// src/lib/utils/logger.ts
import * as Sentry from '@sentry/nextjs';

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${msg}`, meta);
    } else {
      Sentry.addBreadcrumb({ message: msg, data: meta, level: 'info' });
    }
  },
  error: (msg: string, error?: Error, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${msg}`, error, meta);
    }
    Sentry.captureException(error ?? new Error(msg));
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${msg}`, meta);
    }
    Sentry.addBreadcrumb({ message: msg, data: meta, level: 'warning' });
  },
};

### Env Validation

Gunakan `@t3-oss/env-nextjs` untuk validasi semua environment variables:
// src/lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SENTRY_DSN: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});

// ❌ JANGAN: Akses process.env langsung tanpa validasi
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // ❌

// ✅ HARUS: Via env object
const key = env.SUPABASE_SERVICE_ROLE_KEY; // ✅

🔄 CI/CD RULES (WAJIB)

### Pipeline GitHub Actions

GitHub Actions adalah source of truth untuk quality gate.
Vercel HANYA deployment target.

# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # 1. Lint
      - run: pnpm lint

      # 2. Type check
      - run: pnpm type-check

      # 3. Unit tests
      - run: pnpm test -- --coverage

      # 4. E2E tests (critical journeys)
      - run: pnpm test:e2e

      # 5. Build
      - run: pnpm build

      # 6. Lighthouse audit
      - run: pnpm lighthouse

      # 7. Upload Sentry source maps
      - run: pnpm sentry:sourcemaps

### Branch Protection

| Branch | Required Checks |
|---|---|
| `main` | lint + typecheck + unit test + E2E + build + lighthouse |
| `develop` | lint + typecheck + unit test |
| Feature branches | lint + typecheck |

### Pre-commit Hooks (Husky + lint-staged)

// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}

# .husky/pre-commit
pnpm lint-staged
pnpm type-check

🎨 DESIGN SYSTEM (WAJIB)

🎨 Color Palette

// tailwind.config.ts
const colors = {
  gpib: {
    blue: '#1E40AF',      // Primary
    'blue-light': '#3B82F6',
    'blue-dark': '#1E3A8A',
    gold: '#F59E0B',      // Accent
    'gold-light': '#FCD34D',
    'gold-dark': '#D97706',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

🔤 Typography

| Font Layer | Font Family | Peran |
|---|---|---|
| UI/Body | Inter | Netral, readable |
| Display/KPI | Fraunces | Headings besar, angka KPI |

const fonts = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Fraunces', 'Merriweather', 'serif'],
};

// Font sizes (mobile-first)
const fontSizes = {
  xs: '0.75rem',   // 12px - HANYA untuk label kecil
  sm: '0.875rem',  // 14px - Secondary text
  base: '1rem',    // 16px - Body text (MINIMUM)
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
};

📏 Spacing Scale (8px grid)

const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px - Base
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
};

🧪 TESTING RULES (WAJIB)

📊 Coverage Targets

| Layer | Coverage | Tools |
|---|---|---|
| Unit | 80%+ | Vitest + React Testing Library |
| Integration | 70%+ | Vitest + Supabase local |
| E2E | Critical flows | Playwright |
| Type Safety | 100% | TypeScript strict |
| Accessibility | WCAG 2.1 AA | axe-core |

✅ Test Naming Convention

// Format: describe('ComponentName', () => { it('should ...', ...) })
describe('BottomNavigation', () => {
  it('should render 5 navigation items', () => { ... });
  it('should highlight active item', () => { ... });
  it('should navigate on tap', () => { ... });
});

🎯 Critical Test Scenarios (WAJIB ADA)

// 1. Auth flows
test('login with biometric < 1 detik');
test('fallback to password jika biometric gagal');
test('RLS: KMJ hanya bisa akses jemaat yang dipimpinnya');

// 2. Mobile UX
test('touch target 44x44px di semua tombol');
test('bottom navigation responsive');
test('safe area handling di iPhone notch');

// 3. Offline handling
test('form draft auto-save ke IndexedDB saat offline');
test('pending submission retry saat online');
test('TanStack Query persist resume saat reconnect');

// 4. Business rules
test('1 Jemaat = max 1 KMJ');
test('KMJ & PJ harus Pendeta');
test('mutasi pendeta atomic transaction');
test('elevasi status pos via RPC process_status_elevation');

// 5. Next.js 16 compatibility
test('page dengan async params render tanpa error');
test('PPR bekerja di halaman master data');
test('PWA install prompt muncul di device yang support');

// 6. State management
test('server state via TanStack Query, bukan Context');
test('URL state via searchParams, bukan store');
test('form state via React Hook Form, bukan store');

📝 CODE QUALITY RULES

✅ TypeScript Strict Mode

// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// ❌ JANGAN: any type
const data: any = await fetchData();

// ✅ HARUS: Typed
const data: PosPelkes = await fetchData();

📦 Component Structure

// ✅ BENAR: Struktur komponen yang konsisten
'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PosPelkesCardProps {
  pos: PosPelkes;
  className?: string;
}

export function PosPelkesCard({ pos, className }: PosPelkesCardProps) {
  // 1. Hooks
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 2. Derived state
  const isActive = pos.status === 'Aktif';
  
  // 3. Handlers
  const handleExpand = () => setIsExpanded(!isExpanded);
  
  // 4. Render
  return (
    <div className={cn('rounded-xl p-4', className)}>
      {/* content */}
    </div>
  );
}

🔄 Server Actions Pattern

// ✅ BENAR: Server Action dengan validation di domain layer
// src/lib/domains/pastoral/pastoral.service.ts
'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logPastoralSchema } from './pastoral.schema';

export async function createLogPastoral(data: z.infer<typeof logPastoralSchema>) {
  // 1. Validate input
  const validated = logPastoralSchema.parse(data);
  
  // 2. Check auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // 3. Execute
  const { error } = await supabase
    .from('t_log_pastoral')
    .insert({ ...validated, id_pendeta: user.id });
  
  if (error) throw error;
  
  // 4. Revalidate
  revalidatePath('/pastoral');
}

🚫 Code Anti-Patterns

// ❌ JANGAN: Inline styles
<div style={{ padding: '16px', color: 'blue' }}>

// ✅ HARUS: Tailwind classes
<div className="p-4 text-blue-600">

// ❌ JANGAN: useEffect untuk data fetching
useEffect(() => {
  fetch('/api/data').then(...)
}, []);

// ✅ HARUS: TanStack Query
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

// ❌ JANGAN: console.log di production code
console.log('data:', data);

// ✅ HARUS: Gunakan logger utility
logger.info('data:', data);

// ❌ JANGAN: Magic numbers
if (status === 3) { ... }

// ✅ HARUS: Constants / enums
const STATUS = { DRAFT: 0, PENDING: 1, APPROVED: 3 };
if (status === STATUS.APPROVED) { ... }

// ❌ JANGAN: Barrel exports
// src/lib/domains/pos-pelkes/index.ts
export * from './pos-pelkes.service';
export * from './pos-pelkes.schema';

// ✅ HARUS: Import langsung dari file
import { createPosPelkes } from '@/lib/domains/pos-pelkes/pos-pelkes.service';

🚀 PERFORMANCE RULES

📊 Performance Budget

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Total Blocking Time | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| JS Bundle Size (gzipped) | < 100KB |
| CSS Size (gzipped) | < 30KB |
| Image Size per upload | < 200KB |

⚡ Optimization Rules

// ✅ BENAR: Lazy load heavy components
const MapView = dynamic(() => import('@/components/maps/MapView'), {
  ssr: false,
  loading: () => <MapSkeleton />
});

// ✅ BENAR: Image optimization
import Image from 'next/image';
<Image
  src={pos.foto}
  alt={pos.nama}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>

// ✅ BENAR: Memoize expensive calculations
const totalJiwa = useMemo(() => 
  posPelkes.reduce((sum, pos) => sum + pos.jml_jiwa, 0),
  [posPelkes]
);

// ✅ BENAR: Debounce search input
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);

// ❌ JANGAN: Import semua icons
import { Home, Map, User, ... } from 'lucide-react';

// ✅ HARUS: Import individual
import { Home } from 'lucide-react';

♿ ACCESSIBILITY RULES (WAJIB)

✅ WCAG 2.1 AA Checklist

// ✅ BENAR: Semantic HTML
<button onClick={handleClick}>Submit</button>

// ✅ BENAR: ARIA labels untuk icon-only buttons
<button aria-label="Tutup">
  <XIcon />
</button>

// ✅ BENAR: Alt text untuk gambar
<Image src={foto} alt={`Foto ${pos.nama}`} />

// ✅ BENAR: Focus indicators
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">

// ✅ BENAR: Color contrast min 4.5:1
<p className="text-gray-900 bg-white">  {/* ✅ Good */}
<p className="text-gray-300 bg-white">  {/* ❌ Bad */}

// ✅ BENAR: Reduce motion support
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}

🔄 WORKFLOW SAAT CODING

📋 Checklist Sebelum Commit

- [ ] TypeScript strict mode, no `any`
- [ ] Linting pass (ESLint + Prettier)
- [ ] Mobile-first responsive (320px+)
- [ ] Touch target 44x44px minimum
- [ ] Accessibility (axe-core pass)
- [ ] Performance (Lighthouse > 90)
- [ ] Tests written & passing
- [ ] Documentation updated
- [ ] No console.log / debugger
- [ ] Environment variables via `env.ts` (@t3-oss/env-nextjs)
- [ ] Next 16: params & searchParams sudah async-aware
- [ ] State dipisahkan (server/UI/form/session/URL)
- [ ] Draft & offline queue menggunakan Dexie (bukan localStorage)
- [ ] PWA: service worker custom Workbox terdaftar
- [ ] Sentry: error tracking aktif
- [ ] Import menggunakan alias `@/` (bukan relative path)
- [ ] Tidak ada barrel export (kecuali components/ui/)
- [ ] Business logic di `src/lib/domains/{domain}/` (bukan di component)

🎯 Urutan Development per Fitur

1. Baca User Story di PRD
2. Cek Business Rules yang terkait
3. Design skema database (jika ada tabel baru)
4. Buat migration SQL
5. Generate TypeScript types
6. Tulis test dulu (TDD recommended)
7. Implementasi domain layer: schema → service → queries
8. Implementasi Server Action (bukan API Route)
9. Implementasi UI component (mobile-first)
10. Integrate dengan TanStack Query
11. Test di mobile device
12. Update dokumentasi

🚨 Saat Bingung / Tidak Yakin

- Cek Blueprint v2.2 — arsitektur & stack
- Cek PRD v2.2 — user stories & acceptance criteria
- Cek ERD v2.2 — skema database
- Cek GPIB.xlsx — data master & format ID
- Tanya user — jangan asumsikan

🚫 ABSOLUTE DON'TS (RED LINES)

🔴 JANGAN PERNAH:

❌ Disable RLS di tabel manapun
❌ Expose service role key di client-side
❌ Update manual saat mutasi pendeta (gunakan RPC)
❌ Update manual saat elevasi status pos (gunakan RPC)
❌ Biarkan KMJ bukan Pendeta
❌ Biarkan 1 Jemaat punya >1 KMJ
❌ Hardcode credentials di source code
❌ Gunakan `any` di TypeScript
❌ Inline styles (gunakan Tailwind)
❌ console.log di production code
❌ Magic numbers (gunakan constants)
❌ Skip validation di server-side
❌ Implementasi offline-first (gunakan online-first + PWA)
❌ Desktop-first design (selalu mobile-first)
❌ Font < 16px di mobile
❌ Touch target < 44x44px
❌ Hover-only interactions di mobile
❌ Cache API mutations di Service Worker
❌ Simpan biometric credential di localStorage
❌ Exceed performance budget (100KB JS)
❌ Skip accessibility (WCAG 2.1 AA wajib)
❌ Gunakan `next-pwa` (sudah dead) — WAJIB Workbox langsung
❌ Akses `params`/`searchParams` secara synchronous di Next 16
❌ Simpan draft/foto di localStorage — gunakan Dexie (IndexedDB)
❌ Semua state di satu store — pisahkan per jenis state
❌ Buat API Route untuk CRUD internal — gunakan Server Actions
❌ Gunakan barrel exports (kecuali components/ui/)
❌ Relative imports `../../` — gunakan alias `@/`
❌ Tambah React Compiler sebelum stable
❌ Tambah library tanpa persetujuan Tech Lead

✅ ALWAYS DO (BEST PRACTICES)

🟢 SELALU:

✅ Mobile-first — design untuk HP dulu, desktop nanti
✅ Type-safe — TypeScript strict, no `any`
✅ Validate everywhere — Zod di client + server
✅ Atomic operations — gunakan DB functions untuk operasi kompleks
✅ Auto-save drafts — setiap 30 detik ke Dexie (IndexedDB)
✅ Haptic feedback — untuk aksi penting di mobile
✅ Skeleton loading — untuk UX loading yang smooth
✅ Error boundaries — per feature (Map, Chart, Form terpisah)
✅ Image compression — max 200KB per image
✅ Lazy loading — untuk komponen berat (map, chart)
✅ Semantic HTML — button, nav, main, section
✅ ARIA labels — untuk icon-only buttons
✅ Focus management — untuk keyboard navigation
✅ i18n-ready — meskipun hanya Bahasa Indonesia, siapkan struktur
✅ Log aktivitas — setiap aksi penting ke `t_log_aktivitas`
✅ Sentry — semua unhandled error dilaporkan
✅ Logger utility — JANGAN console.log
✅ Domain colocation — business logic di `src/lib/domains/`
✅ Server Actions — JANGAN API Route untuk CRUD internal
✅ Alias imports — `@/` bukan `../../`
✅ Direct imports — JANGAN barrel exports
✅ Async params — selalu await params/searchParams di Next 16

📚 REFERENSI CEPAT

🆔 Format ID

const ID_FORMATS = {
  mupel: /^M-\d{2}$/,                    // M-01
  jemaat: /^\d{2}-\d{2}-[A-Z]{2}$/,      // 02-01-BM
  pos: /^POS-\d{5}$/,                    // POS-13055
  pendeta: /^PDT-\d{8}$/,                // PDT-19060024
  jabatan: /^JBT-\d{13}-\d{3}$/,         // JBT-1778142941355-374
  histori: /^HIS-\d{13}-\d{3}$/,         // HIS-1778142941355-374
  log: /^LOG-\d{13}-\d{3}$/,             // LOG-1778142941355-374
};

👥 Role Hierarchy

const ROLES = {
  SUPER_USER: 'super_user',      // Akses global
  ADMIN_MUPEL: 'admin_mupel',    // Akses Mupel tertentu
  KMJ: 'kmj',                    // Akses Jemaat yang dipimpin
  PJ: 'pj',                      // Akses Jemaat + Pos yang ditugaskan
  USER: 'user',                  // Akses Pos yang ditugaskan
} as const;

📊 Data Master Count

const DATA_MASTER = {
  mupel: 25,
  jemaat_induk: 350,
  pos_pelkes: 500,
  pendeta: 100,
  users: 100,
};

📝 CHANGE LOG

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 20 Juli 2026 | Initial rules untuk Gemini Agentic AI |
| 2.2 | 20 Juli 2026 | Mobile First PWA + Biometric |
| 2.3 | 6 Agustus 2026 | KRITIKAL: Next 16+, Workbox custom + @serwist/next (build tool), Dexie, Sentry, CI/CD, State rules, Server Actions, Domain colocation, No barrel exports |
| 2.3.2 | 6 Agustus 2026 | Tahap 6 Hardening: Offline Command Engine (Dexie v5), Conflict Policy Engine, Server Idempotency (sys_transaction_logs), Dual-Write Telemetry, DLQ, & Incident Runbooks |

🎯 PENUTUP

"Rules ini adalah pagar, bukan penjara. Tujuannya agar AI agent menghasilkan kode yang:
✅ Konsisten dengan arsitektur yang sudah dirancang
✅ Aman (security, data integrity)
✅ Cepat (performance optimized)
✅ Aksesibel (mobile-first, WCAG compliant)
✅ Bertahan lama (30-50 tahun lifecycle)"

Jika ada konflik antara rules ini dengan permintaan user:
- Jelaskan kenapa rules ini penting
- Tawarkan alternatif yang memenuhi rules + kebutuhan user
- Minta konfirmasi sebelum melanggar rules

📅 Terakhir diperbarui: 6 Agustus 2026
✍️ Disusun untuk: AI Agent Development Team
🔗 Referensi: Blueprint v2.2, PRD v2.2, ERD v2.2, GPIB.xlsx
