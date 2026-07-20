# 📜 SI GPIB v2.2 — AI Agent Rules & Guardrails

> **File ini adalah "kontrak" untuk Gemini Agentic AI di Antigravity IDE**
> Setiap kode yang dihasilkan WAJIB mematuhi aturan di bawah ini.
> Versi: 2.2 | Update: 20 Juli 2026

---

## 🎯 IDENTITAS PROYEK

```yaml
project_name: SI GPIB v2.0
codename: SI Pos Pelkes
version: 2.2
architecture: Online-First + Mobile First PWA + Biometric Auth
primary_platform: Mobile PWA (90%+ pengguna)
lifecycle: 30-50 tahun (bulletproof)
language: Bahasa Indonesia (UI), English (code)
```

**Dokumen Referensi (WAJIB dibaca sebelum coding):**
- 📘 `SI GPIB v2.2 — Blueprint.md` — Arsitektur & stack
- 📗 `SI GPIB v2.2 — PRD.md` — User stories & acceptance criteria
- 📙 `SI GPIB v2.2 — ERD.md` — Skema database & relasi
- 📊 `GPIB.xlsx` — Data master (Mupel, Jemaat, Pos Pelkes, Pendeta, Users)

---

## 🛠️ STACK TEKNOLOGI (WAJIB)

### ✅ Core Stack — JANGAN DIGANTI

| Layer | Teknologi | Versi Min |
|-------|-----------|-----------|
| Framework | **Next.js** (App Router) | 15+ |
| UI Library | **React** | 19+ |
| Styling | **Tailwind CSS** | 4+ |
| Language | **TypeScript** (strict mode) | 5+ |
| Backend/BaaS | **Supabase** | Latest |
| UI Components | **shadcn/ui** | Latest |
| Form | **React Hook Form + Zod** | Latest |
| Data Fetching | **TanStack Query** | Latest |
| ORM | **Drizzle ORM** | Latest |
| Mapping | **React-Leaflet** | Latest |
| Charts | **Recharts** | Latest |
| Icons | **Lucide React** | Latest |
| State | **Zustand** | Latest |
| PWA | **next-pwa + Workbox** | Latest |
| Biometric | **@simplewebauthn/browser + server** | Latest |
| Date | **date-fns** | Latest |

### ❌ Library yang DILARANG

| Library | Alasan |
|---------|--------|
| WatermelonDB, IndexedDB langsung | Offline-first tidak dipakai |
| Redux, Redux Toolkit | Terlalu berat, gunakan Zustand |
| Material UI, Ant Design | Tidak konsisten dengan design system |
| Moment.js | Deprecated, gunakan date-fns |
| jQuery | Tidak relevan dengan React |
| Axios | Gunakan fetch + TanStack Query |
| styled-components, emotion | Gunakan Tailwind CSS |

---

## 📁 STRUKTUR FOLDER (WAJIB DIIKUTI)

```
si-gpib-v2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group: auth
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/              # Route group: protected
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
│   │   ├── (public)/                 # Public pages
│   │   ├── offline/page.tsx          # Offline fallback
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/webauthn/
│   │   │   ├── webhooks/
│   │   │   └── upload/
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (jangan dimodifikasi)
│   │   ├── mobile/                   # Mobile-specific components
│   │   ├── offline/                  # Offline handling
│   │   ├── camera/                   # Camera integration
│   │   ├── biometric/                # Biometric UI
│   │   ├── maps/                     # Leaflet components
│   │   ├── charts/                   # Recharts wrappers
│   │   ├── forms/                    # Form components
│   │   ├── tables/                   # DataTable components
│   │   └── layout/                   # Header, Sidebar, Footer
│   ├── lib/
│   │   ├── supabase/                 # Supabase clients
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts
│   │   ├── webauthn/                 # WebAuthn helpers
│   │   ├── db/                       # Drizzle schema + types
│   │   ├── draft/                    # Form draft storage
│   │   ├── camera/                   # Camera helpers
│   │   ├── geolocation/              # GPS helpers
│   │   ├── share/                    # Web Share API
│   │   ├── haptic/                   # Haptic feedback
│   │   ├── validations/              # Zod schemas
│   │   ├── utils/                    # Helper functions
│   │   └── constants/                # App constants
│   ├── hooks/                        # Custom React Hooks
│   ├── stores/                       # Zustand stores
│   ├── types/                        # Global TypeScript types
│   └── styles/
│       └── globals.css
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service Worker
│   ├── icons/
│   └── screenshots/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
└── docs/
```

### 📝 Konvensi Penamaan File

| Tipe | Format | Contoh |
|------|--------|--------|
| Page | `page.tsx` | `app/pos-pelkes/page.tsx` |
| Layout | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Component | `PascalCase.tsx` | `BottomNavigation.tsx` |
| Hook | `kebab-case.ts` | `use-network-status.ts` |
| Util | `kebab-case.ts` | `format-currency.ts` |
| Type | `kebab-case.ts` | `pos-pelkes.types.ts` |
| Schema | `kebab-case.ts` | `log-pastoral.schema.ts` |
| Test | `*.test.ts(x)` | `use-auth.test.ts` |
| Migration | `YYYYMMDD_description.sql` | `20260720_create_users.sql` |

---

## 🏗️ BUSINESS RULES (TIDAK BOLEH DILANGGAR)

### 🔴 KRITIS — Hierarki Gereja

```
MUPEL (25)
  └── JEMAAT INDUK (350+)
        ├── 1 KMJ (Ketua Majelis Jemaat) — WAJIB Pendeta
        ├── 0+ PJ (Pendeta Jemaat) — WAJIB Pendeta
        └── POS PELKES (500+)
              └── Pendeta yang ditugaskan
```

### 🔴 KRITIS — Aturan KMJ & PJ

```sql
-- RULE 1: 1 Jemaat = tepat 1 KMJ (atau NULL)
-- RULE 2: KMJ HARUS seorang Pendeta
-- RULE 3: 1 Pendeta = max 1 KMJ (partial unique index)
-- RULE 4: 1 Jemaat = 0 atau lebih PJ
-- RULE 5: PJ HARUS seorang Pendeta
-- RULE 6: Saat mutasi, flag is_kmj & is_pj harus di-reset
```

### 🔴 KRITIS — ID Pattern

| Entitas | Format | Contoh |
|---------|--------|--------|
| Mupel | `M - XX` | `M - 01`, `M - 25` |
| Jemaat Induk | `XX-XX-XX` | `02-01-BM`, `23-03-ET` |
| Pos Pelkes | `POS-XXXXX` | `POS-13055`, `POS-81917` |
| Pendeta | `PDT-XXXXXXXX` | `PDT-19060024` |
| Log Aktivitas | `LOG-{timestamp}-{random}` | `LOG-1778142941355-374` |

### 🟠 PENTING — Workflow Pengajuan Bantuan

```
Pos Pelkes → KMJ → Admin Mupel → Super User Sinode
   ↓          ↓         ↓              ↓
 Draft    Pending_KMJ  Pending_Mupel  Pending_Sinode
                                         ↓
                                   Approved / Rejected
```

### 🟠 PENTING — Mutasi Pendeta (Atomic)

Setiap mutasi pendeta WAJIB melalui Database Function (RPC), JANGAN update manual:

```typescript
// ✅ BENAR
const { error } = await supabase.rpc('mutasi_pendeta', {
  p_id_pendeta: 'PDT-19060024',
  p_id_induk_baru: '23-03-ET',
  p_alasan: 'Kebutuhan pelayanan'
});

// ❌ SALAH — jangan update manual
await supabase.from('m_pendeta').update({ id_induk: '23-03-ET' })
  .eq('id_pendeta', 'PDT-19060024');
```

---

## 📱 MOBILE-FIRST RULES (WAJIB)

### 🎯 Prinsip Utama

> "Mobile bukan versi kecil dari desktop. Mobile adalah pengalaman UTAMA."

### 📏 Design Constraints

| Aspek | Mobile | Desktop |
|-------|--------|---------|
| Touch Target | **44x44px minimum** | 32x32px |
| Font Size | **16px minimum** (body) | 14px minimum |
| Padding | 16px | 32px |
| Border Radius | 12px (cards) | 8px (cards) |
| Navigation | **Bottom Navigation** | Sidebar |

### 📱 Komponen Mobile yang WAJIB Ada

```tsx
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
```

### 🚫 Anti-Patterns Mobile

```tsx
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
```

---

## 🌐 PWA RULES (WAJIB)

### 📋 Manifest Requirements

```json
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
```

### 🗂️ Service Worker Strategy

```typescript
// ✅ BENAR: Cache strategy per tipe
const CACHE_STRATEGIES = {
  appShell: 'CacheFirst',      // HTML, CSS, JS app
  masterData: 'StaleWhileRevalidate',  // Data master
  images: 'CacheFirst',        // Gambar
  mutations: 'NetworkOnly'     // API POST/PUT/DELETE
};

// ❌ JANGAN: Cache semua API response
// ❌ JANGAN: Cache tanpa expiration
```

### 📶 Offline Handling

```typescript
// ✅ BENAR: Form draft auto-save setiap 30 detik
useEffect(() => {
  const interval = setInterval(() => {
    localStorage.setItem(`draft:${formKey}`, JSON.stringify(data));
  }, 30000);
  return () => clearInterval(interval);
}, [data]);

// ✅ BENAR: Pending submission queue dengan retry
const mutation = useMutation({
  mutationFn: submitData,
  retry: 3,
  retryDelay: (attempt) => Math.pow(2, attempt) * 1000,
  onSuccess: () => clearDraft()
});
```

---

## 🔐 SECURITY RULES (WAJIB)

### 🔒 Row Level Security (RLS)

**SEMUA tabel WAJIB punya RLS policy.** Jangan pernah disable RLS.

```sql
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
```

### 🔐 Biometric Auth Rules

```typescript
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
```

### 🔑 JWT Custom Claims

```json
{
  "sub": "uuid-user",
  "role": "kmj",
  "id_pendeta": "PDT-19060024",
  "id_induk": "02-01-BM",
  "id_mupel": "M - 02",
  "is_kmj": true,
  "is_pj": false,
  "auth_method": "biometric",
  "device_id": "iphone-15-pro-abc123"
}
```

### 🚫 Security Anti-Patterns

```typescript
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
```

---

## 🎨 DESIGN SYSTEM (WAJIB)

### 🎨 Color Palette

```typescript
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
```

### 🔤 Typography

```typescript
// Font families
const fonts = {
  sans: ['Inter', 'system-ui', 'sans-serif'],  // UI
  serif: ['Merriweather', 'serif'],  // Headings
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
```

### 📏 Spacing Scale

```typescript
// 8px grid system
const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px - Base
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
};
```

---

## 🧪 TESTING RULES (WAJIB)

### 📊 Coverage Targets

| Layer | Coverage | Tools |
|-------|----------|-------|
| Unit | **80%+** | Vitest + React Testing Library |
| Integration | **70%+** | Vitest + Supabase local |
| E2E | Critical flows | Playwright |
| Type Safety | **100%** | TypeScript strict |
| Accessibility | WCAG 2.1 AA | axe-core |

### ✅ Test Naming Convention

```typescript
// Format: describe('ComponentName', () => { it('should ...', ...) })
describe('BottomNavigation', () => {
  it('should render 5 navigation items', () => { ... });
  it('should highlight active item', () => { ... });
  it('should navigate on tap', () => { ... });
});
```

### 🎯 Critical Test Scenarios (WAJIB ADA)

```typescript
// 1. Auth flows
test('login with biometric < 1 detik');
test('fallback to password jika biometric gagal');
test('RLS: KMJ hanya bisa akses jemaat yang dipimpinnya');

// 2. Mobile UX
test('touch target 44x44px di semua tombol');
test('bottom navigation responsive');
test('safe area handling di iPhone notch');

// 3. Offline handling
test('form draft auto-save saat offline');
test('pending submission retry saat online');

// 4. Business rules
test('1 Jemaat = max 1 KMJ');
test('KMJ & PJ harus Pendeta');
test('mutasi pendeta atomic transaction');
```

---

## 📝 CODE QUALITY RULES

### ✅ TypeScript Strict Mode

```typescript
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
```

### 📦 Component Structure

```tsx
// ✅ BENAR: Struktur komponen yang konsisten
'use client';  // atau 'use server' jika Server Component

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
```

### 🔄 Server Actions Pattern

```typescript
// ✅ BENAR: Server Action dengan validation
'use server';

import { z } from 'zod';

const logPastoralSchema = z.object({
  id_pos: z.string().min(1),
  kegiatan: z.string().min(1).max(200),
  jml_jiwa: z.number().int().positive(),
  catatan: z.string().optional(),
});

export async function createLogPastoral(formData: FormData) {
  // 1. Validate input
  const validated = logPastoralSchema.parse({
    id_pos: formData.get('id_pos'),
    kegiatan: formData.get('kegiatan'),
    jml_jiwa: Number(formData.get('jml_jiwa')),
    catatan: formData.get('catatan'),
  });
  
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
```

### 🚫 Code Anti-Patterns

```typescript
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
logger.debug('data:', data);

// ❌ JANGAN: Magic numbers
if (status === 3) { ... }

// ✅ HARUS: Constants / enums
const STATUS = { DRAFT: 0, PENDING: 1, APPROVED: 3 };
if (status === STATUS.APPROVED) { ... }
```

---

## 🚀 PERFORMANCE RULES

### 📊 Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | **< 1.5s** |
| Largest Contentful Paint | **< 2.5s** |
| Time to Interactive | **< 3.5s** |
| Total Blocking Time | **< 200ms** |
| Cumulative Layout Shift | **< 0.1** |
| JS Bundle Size (gzipped) | **< 100KB** |
| CSS Size (gzipped) | **< 30KB** |
| Image Size per upload | **< 200KB** |

### ⚡ Optimization Rules

```tsx
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
```

---

## ♿ ACCESSIBILITY RULES (WAJIB)

### ✅ WCAG 2.1 AA Checklist

```tsx
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
```

---

## 🔄 WORKFLOW SAAT CODING

### 📋 Checklist Sebelum Commit

```markdown
- [ ] TypeScript strict mode, no `any`
- [ ] Linting pass (ESLint + Prettier)
- [ ] Mobile-first responsive (320px+)
- [ ] Touch target 44x44px minimum
- [ ] Accessibility (axe-core pass)
- [ ] Performance (Lighthouse > 90)
- [ ] Tests written & passing
- [ ] Documentation updated
- [ ] No console.log / debugger
- [ ] Environment variables di .env.local
```

### 🎯 Urutan Development per Fitur

```
1. Baca User Story di PRD
2. Cek Business Rules yang terkait
3. Design skema database (jika ada tabel baru)
4. Buat migration SQL
5. Generate TypeScript types
6. Tulis test dulu (TDD recommended)
7. Implementasi Server Action / API
8. Implementasi UI component (mobile-first)
9. Integrate dengan TanStack Query
10. Test di mobile device
11. Update dokumentasi
```

### 🚨 Saat Bingung / Tidak Yakin

1. **Cek Blueprint v2.2** — arsitektur & stack
2. **Cek PRD v2.2** — user stories & acceptance criteria
3. **Cek ERD v2.2** — skema database
4. **Cek GPIB.xlsx** — data master & format ID
5. **Tanya user** — jangan asumsikan

---

## 🚫 ABSOLUTE DON'TS (RED LINES)

### 🔴 JANGAN PERNAH:

1. ❌ **Disable RLS** di tabel manapun
2. ❌ **Expose service role key** di client-side
3. ❌ **Update manual** saat mutasi pendeta (gunakan RPC)
4. ❌ **Biarkan KMJ bukan Pendeta**
5. ❌ **Biarkan 1 Jemaat punya >1 KMJ**
6. ❌ **Hardcode credentials** di source code
7. ❌ **Gunakan `any`** di TypeScript
8. ❌ **Inline styles** (gunakan Tailwind)
9. ❌ **console.log** di production code
10. ❌ **Magic numbers** (gunakan constants)
11. ❌ **Skip validation** di server-side
12. ❌ **Implementasi offline-first** (gunakan online-first + PWA)
13. ❌ **Desktop-first design** (selalu mobile-first)
14. ❌ **Font < 16px** di mobile
15. ❌ **Touch target < 44x44px**
16. ❌ **Hover-only interactions** di mobile
17. ❌ **Cache API mutations** di Service Worker
18. ❌ **Simpan biometric credential** di localStorage
19. ❌ **Exceed performance budget** (100KB JS)
20. ❌ **Skip accessibility** (WCAG 2.1 AA wajib)

---

## ✅ ALWAYS DO (BEST PRACTICES)

### 🟢 SELALU:

1. ✅ **Mobile-first** — design untuk HP dulu, desktop nanti
2. ✅ **Type-safe** — TypeScript strict, no `any`
3. ✅ **Validate everywhere** — Zod di client + server
4. ✅ **Atomic operations** — gunakan DB functions untuk operasi kompleks
5. ✅ **Auto-save drafts** — setiap 30 detik untuk form panjang
6. ✅ **Haptic feedback** — untuk aksi penting di mobile
7. ✅ **Skeleton loading** — untuk UX loading yang smooth
8. ✅ **Error boundaries** — tangani error dengan graceful
9. ✅ **Image compression** — max 200KB per image
10. ✅ **Lazy loading** — untuk komponen berat (map, chart)
11. ✅ **Semantic HTML** — button, nav, main, section
12. ✅ **ARIA labels** — untuk icon-only buttons
13. ✅ **Focus management** — untuk keyboard navigation
14. ✅ **i18n-ready** — meskipun hanya Bahasa Indonesia, siapkan struktur
15. ✅ **Log aktivitas** — setiap aksi penting ke `t_log_aktivitas`

---

## 📚 REFERENSI CEPAT

### 🆔 Format ID

```typescript
const ID_FORMATS = {
  mupel: /^M - \d{2}$/,                    // M - 01
  jemaat: /^\d{2}-\d{2}-[A-Z]{2}$/,        // 02-01-BM
  pos: /^POS-\d{5}$/,                      // POS-13055
  pendeta: /^PDT-\d{8}$/,                  // PDT-19060024
  log: /^LOG-\d{13}-\d{3}$/,              // LOG-1778142941355-374
};
```

### 👥 Role Hierarchy

```typescript
const ROLES = {
  SUPER_USER: 'super_user',      // Akses global
  ADMIN_MUPEL: 'admin_mupel',    // Akses Mupel tertentu
  KMJ: 'kmj',                    // Akses Jemaat yang dipimpin
  PJ: 'pj',                      // Akses Jemaat + Pos yang ditugaskan
  USER: 'user',                  // Akses Pos yang ditugaskan
} as const;
```

### 📊 Data Master Count

```typescript
const DATA_MASTER = {
  mupel: 25,
  jemaat_induk: 350,
  pos_pelkes: 500,
  pendeta: 100,
  users: 100,
};
```

---

## 📝 CHANGE LOG

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 20 Juli 2026 | Initial rules untuk Gemini Agentic AI |

---

## 🎯 PENUTUP

> *"Rules ini adalah pagar, bukan penjara. Tujuannya agar AI agent menghasilkan kode yang:*
> - ✅ **Konsisten** dengan arsitektur yang sudah dirancang
> - ✅ **Aman** (security, data integrity)
> - ✅ **Cepat** (performance optimized)
> - ✅ **Aksesibel** (mobile-first, WCAG compliant)
> - ✅ **Bertahan lama** (30-50 tahun lifecycle)"*

**Jika ada konflik antara rules ini dengan permintaan user:**
1. **Jelaskan** kenapa rules ini penting
2. **Tawarkan alternatif** yang memenuhi rules + kebutuhan user
3. **Minta konfirmasi** sebelum melanggar rules

---

📅 *Terakhir diperbarui: 20 Juli 2026*
✍️ *Disusun untuk: Gemini Agentic AI @ Antigravity IDE*
🔗 *Referensi: Blueprint v2.2, PRD v2.2, ERD v2.2, GPIB.xlsx*

---
