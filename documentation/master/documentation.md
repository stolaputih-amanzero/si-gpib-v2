# 🏛️ SI GPIB v2.2

> **Sistem Informasi Pos Pelayanan Kesaksian (SI Pos Pelkes) GPIB**
> Mobile-First Progressive Web App for GPIB Church Administration

[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Mobile%20First-orange.svg)](https://web.dev/progressive-web-apps/)

---

## 📖 About

SI GPIB v2.2 is a **Mobile-First Progressive Web App** that serves as the **Single Source of Truth** for GPIB (Gereja Protestan Indonesia di Barat) church administration. It manages hierarchical data across 25 Mupel, 350+ Congregations, 500+ Ministry Posts, and 300+ Pastors throughout Indonesia.

### ✨ Key Features

- 📱 **Mobile-First PWA** — Optimized for pastors in the field (90%+ mobile users)
- 🔐 **Biometric Authentication** — Login in < 1 second with Fingerprint/Face ID
- 📸 **Camera + GPS Integration** — Photo assets + auto-fill coordinates
- 🌐 **Offline-Ready** — Form drafts + pending queue for weak signal areas
- 🗺️ **Geospatial Mapping** — Visualize ministry posts on interactive maps
- 📊 **Real-time Analytics** — Dashboard per role (Super User, Admin, KMJ, PJ)
- 🔄 **Multi-level Approval** — Workflow for assistance requests
- 📦 **Asset Management** — Track land, buildings, and movable assets

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ 
- **pnpm** (recommended) or npm/yarn
- **Supabase** account
- **Vercel** account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/si-gpib-v2.git
cd si-gpib-v2

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Setup Supabase
npx supabase init
npx supabase start

# Run database migrations
npx supabase db push

# Seed initial data
npx supabase db seed

# Generate TypeScript types
pnpm gen:types

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15+ (App Router) |
| **UI** | React 19+ + Tailwind CSS 4+ |
| **Components** | shadcn/ui |
| **Language** | TypeScript 5+ (strict mode) |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Forms** | React Hook Form + Zod |
| **Data Fetching** | TanStack Query |
| **ORM** | Drizzle ORM |
| **Maps** | React-Leaflet |
| **Charts** | Recharts |
| **PWA** | next-pwa + Workbox |
| **Biometric** | @simplewebauthn/browser + server |

---

## 📁 Project Structure

```
si-gpib-v2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── layout.tsx            # Bottom nav + safe area
│   │   │   ├── mupel/
│   │   │   ├── jemaat/
│   │   │   ├── pos-pelkes/
│   │   │   ├── pendeta/
│   │   │   ├── pastoral/
│   │   │   ├── aset/
│   │   │   └── settings/
│   │   ├── offline/page.tsx          # Offline fallback
│   │   └── api/                      # API Routes
│   │       └── auth/webauthn/        # Biometric endpoints
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (don't modify)
│   │   ├── mobile/                   # Mobile-specific
│   │   ├── camera/                   # Camera integration
│   │   ├── biometric/                # Biometric UI
│   │   ├── maps/                     # Leaflet components
│   │   └── forms/                    # Form components
│   ├── lib/
│   │   ├── supabase/                 # Supabase clients
│   │   ├── webauthn/                 # WebAuthn helpers
│   │   ├── db/                       # Drizzle schema
│   │   ├── camera/                   # Camera helpers
│   │   └── validations/              # Zod schemas
│   ├── hooks/                        # Custom React Hooks
│   ├── stores/                       # Zustand stores
│   └── types/                        # Global TypeScript types
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service Worker
│   └── icons/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
└── docs/                             # Documentation
```

---

## 📋 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed initial data
pnpm db:reset         # Reset database
pnpm gen:types        # Generate TypeScript types from Supabase

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests (Playwright)

# PWA
pnpm pwa:validate     # Validate PWA manifest
pnpm pwa:lighthouse   # Run Lighthouse audit
```

---

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SI GPIB v2.0"

# WebAuthn
NEXT_PUBLIC_RP_NAME="SI GPIB v2.0"
NEXT_PUBLIC_RP_ID=localhost

# PWA
NEXT_PUBLIC_ENABLE_PWA=true

# Camera
NEXT_PUBLIC_CAMERA_MAX_SIZE_KB=1024
NEXT_PUBLIC_CAMERA_ENABLE_GPS=true

# Biometric
NEXT_PUBLIC_BIOMETRIC_ENABLED=true
NEXT_PUBLIC_BIOMETRIC_MAX_DEVICES=5
```

---

## 📚 Documentation

- 📘 **[documentation.md](./documentation.md)** — Complete project documentation
- 📗 **[SI GPIB v2.2 — Blueprint.md](./docs/Blueprint.md)** — Architecture & stack
- 📙 **[SI GPIB v2.2 — PRD.md](./docs/PRD.md)** — User stories & acceptance criteria
- 📕 **[SI GPIB v2.2 — ERD.md](./docs/ERD.md)** — Database schema
- 📜 **[rules.md](./rules.md)** — AI agent guardrails

---

## 🏗️ Business Rules (Quick Reference)

### 🔴 CRITICAL

```
MUPEL (25)
  └── JEMAAT INDUK (350+)
        ├── 1 KMJ (Ketua Majelis Jemaat) — MUST be a Pastor
        ├── 0+ PJ (Pendeta Jemaat) — MUST be a Pastor
        └── POS PELKES (500+)
```

### 🆔 ID Formats

| Entity | Format | Example |
|--------|--------|---------|
| Mupel | `M - XX` | `M - 01` |
| Jemaat Induk | `XX-XX-XX` | `02-01-BM` |
| Pos Pelkes | `POS-XXXXX` | `POS-13055` |
| Pendeta | `PDT-XXXXXXXX` | `PDT-19060024` |

### 🔐 Atomic Operations

**All pastor mutations MUST use Database Functions (RPC):**

```typescript
// ✅ CORRECT
await supabase.rpc('mutasi_pendeta', {
  p_id_pendeta: 'PDT-19060024',
  p_id_induk_baru: '23-03-ET',
  p_alasan: 'Kebutuhan pelayanan'
});

// ❌ WRONG
await supabase.from('m_pendeta').update({ id_induk: '23-03-ET' });
```

---

## 📱 Mobile-First Guidelines

### 📏 Design Constraints

| Aspect | Mobile | Desktop |
|--------|--------|---------|
| Touch Target | **44x44px min** | 32x32px |
| Font Size | **16px min** | 14px min |
| Navigation | **Bottom Nav** | Sidebar |

### 🚫 Common Mistakes

```tsx
// ❌ DON'T: Font < 16px on mobile
<p className="text-xs">Small text</p>

// ✅ MUST: Minimum 16px
<p className="text-base">Readable text</p>

// ❌ DON'T: Hover-only interactions
<button className="hover:bg-blue-500">Submit</button>

// ✅ MUST: Touch-friendly with active state
<button className="active:bg-blue-600 hover:bg-blue-500">Submit</button>
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Critical Test Scenarios

- [ ] Login with biometric < 1 second
- [ ] Fallback to password if biometric fails
- [ ] RLS: KMJ only accesses their congregation
- [ ] Touch target 44x44px on all buttons
- [ ] Form draft auto-save when offline
- [ ] 1 Congregation = max 1 KMJ
- [ ] Pastor mutation atomic transaction

---

## 🚀 Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Supabase (Backend)

1. Create project at [supabase.com](https://supabase.com)
2. Run migrations: `npx supabase db push`
3. Seed data: `npx supabase db seed`
4. Setup RLS policies (see ERD documentation)

---

## 🤝 Contributing

### Development Workflow

1. Read the User Story in PRD
2. Check related Business Rules
3. Design database schema (if needed)
4. Write tests first (TDD recommended)
5. Implement Server Action / API
6. Implement UI (mobile-first)
7. Test on mobile device
8. Update documentation

### Pre-Commit Checklist

- [ ] TypeScript strict mode, no `any`
- [ ] Linting pass
- [ ] Mobile-first responsive (320px+)
- [ ] Touch target 44x44px minimum
- [ ] Accessibility (axe-core pass)
- [ ] Performance (Lighthouse > 90)
- [ ] Tests written & passing
- [ ] No console.log / debugger

---

## 📊 Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| JS Bundle Size | < 100KB gzipped |
| Lighthouse Mobile Score | > 90 |

---

## 📜 License

This project is proprietary software developed for GPIB (Gereja Protestan Indonesia di Barat).

---

## 🙏 Acknowledgments

- **GPIB Sinode** — For the vision and requirements
- **All Pastors & Congregations** — For their service and feedback
- **Open Source Community** — For the amazing tools and libraries

---

## 📞 Support

For questions or issues:
- 📧 Email: pelkes@gpib.org
- 📱 WhatsApp: +62 811 1550 543 (Bpk. Stolaputih)

---

**📅 Last Updated:** 20 July 2026  
**✍️ Maintained by:** SI GPIB v2.0 Development Team  
**🔗 Version:** 2.2 (Mobile First PWA + Biometric)