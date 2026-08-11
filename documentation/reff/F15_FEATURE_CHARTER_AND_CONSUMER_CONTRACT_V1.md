# F15 Feature Charter & Consumer Contract Specification

**Feature:** F15 — Organization Directory Workspace  
**Route:** `/org`  
**Document Version:** v1.0  
**Platform Baseline:** v2.0.0  
**Baseline Release Commit:** `8a34a3cfca6f663dd48c75f6cb92b4d42781e2e2`  
**Baseline Tag:** `v2.0.0`  
**Governance Status:** 🟢 PURE CONSUMER  
**Baseline Modification:** 0%  
**ADR Required:** No  
**Implementation Status:** ⏸️ PRE-CODING / CHARTER REVIEW

---

## 0. Governance Header

F15 — Organization Directory Workspace merupakan **First Consumer Validation** terhadap Platform Architecture Baseline v2.0.

F15 wajib mengonsumsi kontrak dan capability F2–F14 yang telah disertifikasi dan difreeze tanpa melakukan modifikasi langsung terhadap baseline tersebut.

### Governance invariants

1. F2–F14 tetap immutable.
2. `supabase/migrations/` baseline tidak boleh dimodifikasi untuk kebutuhan F15.
3. Core authorization, audit, telemetry, transaction, dan security contracts tidak boleh di-bypass.
4. F15 hanya boleh menambahkan capability domain baru pada boundary yang telah disediakan baseline.
5. Setiap kebutuhan yang ternyata mengharuskan perubahan F2–F14 harus dihentikan dan dievaluasi melalui ADR Governance Policy.
6. F15 tidak boleh mengklaim capability production-scale yang belum dibuktikan.

### Consumer Compatibility Gate

```text
F15 Consumer Compatibility
────────────────────────────────────────
Baseline:                 v2.0.0
Baseline modification:    0%
F2–F14 bypass:            0
New baseline contract:    0
ADR required:             NO
Consumer model:            PURE CONSUMER
Status:                    🟢 GO — SUBJECT TO CHARTER APPROVAL
```

---

# 1. Feature Charter

## 1.1 Problem

Sidebar aplikasi telah menyediakan entry point **Direktori Organisasi** menuju `/org`, tetapi route tersebut saat ini menghasilkan `404` karena workspace:

```text
src/app/(dashboard)/org/page.tsx
```

belum tersedia.

Masalah ini bukan alasan untuk mengubah baseline platform. F15 menyelesaikan kebutuhan tersebut sebagai **consumer application capability** di atas baseline v2.0.0.

## 1.2 Objective

Menyediakan **Organization Directory Workspace** sebagai titik masuk terpusat untuk:

- menemukan organisasi;
- memahami struktur hierarki organisasi;
- mencari organisasi berdasarkan identitas atau atribut utama;
- memfilter organisasi berdasarkan konteks;
- berpindah ke detail organisasi;
- mempertahankan authorization dan tenant isolation melalui kontrak platform.

## 1.3 Scope

F15 mencakup:

- `/org`;
- organizational directory;
- hierarchy browsing;
- search;
- filtering;
- organizational summary/card;
- deep-link ke detail organisasi;
- authorization-aware visibility;
- observability untuk action penting;
- konsumsi capability F2–F14.

## 1.4 Non-Goals

F15 **tidak** mencakup:

- perubahan struktur database baseline;
- perubahan F3 Organization contract;
- pembuatan authorization engine baru;
- pembuatan audit engine baru;
- pembuatan telemetry/outbox engine baru;
- penggantian RLS;
- migrasi database baseline;
- perubahan model multi-tenant F2–F14;
- perubahan transaction semantics platform.

---

# 2. Domain Contract

F15 beroperasi sebagai read-oriented domain workspace yang mengorkestrasi capability organisasi yang telah tersedia.

## 2.1 Organizational Tree Traversal

Konsep navigasi:

```text
GPIB
 │
 ├── Mupel
 │    └── Jemaat
 │         └── Pos Pelkes
 │
 └── Organizational Units lain
```

F15 tidak menciptakan hierarchy engine baru.

Traversal harus menggunakan relationship dan domain capability yang telah tersedia pada F3.

## 2.2 Hierarchy Filter

Workspace dapat menyediakan filtering berdasarkan:

- tingkat organisasi;
- Mupel;
- Jemaat Induk;
- Pos Pelkes;
- status organisasi;
- atribut directory yang memang tersedia dari F3.

Filter hanya boleh mempersempit data yang **sudah authorized**.

Urutan keamanan:

```text
Authentication
      ↓
F12 Authorization
      ↓
RLS Boundary
      ↓
Directory Query
      ↓
Search / Filter
      ↓
Presentation
```

Search dan filter tidak boleh digunakan untuk menghindari authorization boundary.

## 2.3 Search Contract

Search dapat mencakup identifier atau atribut directory yang telah disetujui oleh domain F3.

Search harus:

- deterministic;
- authorization-aware;
- bounded;
- tidak mengekspos record yang tidak visible;
- tidak melakukan unrestricted database scan apabila platform contract menyediakan query boundary yang lebih tepat.

## 2.4 Domain Invariants

F15 wajib mempertahankan:

```text
Authorized user
    ≠
Automatically authorized to every organization
```

Visibility organisasi tetap ditentukan oleh authorization dan RLS boundary.

---

# 3. Entity Inventory

F15 menggunakan entity yang telah tersedia pada baseline/domain organization.

### Primary Organization Entities

| Entity | Consumer Role |
|---|---|
| `m_mupel` | Organizational hierarchy / regional context |
| `m_jemaat_induk` | Primary congregation directory |
| `m_pos_pelkes` | Pelayanan/Pelkes organizational directory |

F15 tidak boleh membuat duplicate organization master table.

## 3.1 View Models

F15 dapat membentuk application-level view model untuk kebutuhan UI.

Contoh konseptual:

```text
OrganizationDirectoryItem
├── id
├── name
├── organizationType
├── parentId
├── hierarchyPath
├── locationSummary
├── status
└── capabilityFlags
```

View model bukan persistence entity baru.

---

# 4. Context & Workspace

## 4.1 Route

```text
/org
```

merupakan **Organization Directory Workspace**.

## 4.2 Primary Workspace

Konsep workspace:

```text
┌─────────────────────────────────┐
│ Organization Directory          │
│                                 │
│ [ Search organization... ]      │
│ [Mupel] [Type] [Status]         │
│                                 │
│ Hierarchy / Directory           │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Organization Card           │ │
│ │ Name                        │ │
│ │ Type                        │ │
│ │ Context                     │ │
│ │ → View Detail               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 4.3 Deep Link

Detail organization mengikuti existing domain routing contract:

```text
/org/[id_org]
```

F15 tidak boleh membuat competing organization detail architecture jika detail workspace telah tersedia.

## 4.4 Mobile-First Requirement

Workspace harus dirancang mobile-first:

- search tetap mudah diakses;
- filter tidak mendominasi viewport;
- hierarchy tidak bergantung pada desktop-only interaction;
- cards/list dapat dipindai cepat;
- deep-link dapat digunakan langsung;
- loading/error/empty state eksplisit.

---

# 5. F2–F14 Consumer Map

| Baseline Capability | F15 Consumption |
|---|---|
| **F3 Organization Workspace** | Organization entities, hierarchy, directory semantics |
| **F2 Person Identity** | Hanya jika directory membutuhkan identity/person reference |
| **F12 PDP Authorization** | Authorization decision sebelum protected organization access |
| **F13 Audit Chain** | Audit evidence untuk action yang memang audit-worthy |
| **F11 Telemetry Outbox** | Operational telemetry/event emission melalui existing contract |
| F14 Webhook Delivery | Tidak diperlukan kecuali F15 menghasilkan event outbound yang secara eksplisit membutuhkan webhook delivery |

### Consumer Rule

F15 **memanggil capability**.

F15 tidak:

- menyalin implementasi capability;
- membuat replacement;
- bypass service/domain boundary;
- memodifikasi helper baseline.

---

# 6. Authorization Contract

F15 wajib menggunakan F12 PDP dan RLS sebagai security boundary.

## 6.1 Authorization Flow

```text
Request /org
      ↓
Authenticated Session
      ↓
F12 PDP Evaluation
      ↓
Allowed?
 ┌────┴────┐
 NO        YES
 ↓          ↓
DENY       RLS
            ↓
       Organization Query
            ↓
       Authorized Result
```

## 6.2 PDP Inputs

Authorization context dapat mencakup:

- authenticated principal;
- role;
- organization context;
- requested resource;
- requested action;
- tenant/context identifiers;
- applicable policy attributes.

F15 tidak menentukan ulang policy engine.

## 6.3 Deny-by-Default

Jika authorization context tidak memenuhi policy:

```text
DENY
```

harus terjadi sebelum protected mutation atau privileged action dijalankan.

---

# 7. Transaction Contract

F15 merupakan primarily **read-heavy workspace**.

## 7.1 Read Operations

Directory browsing dan search menggunakan existing domain query/service boundary.

Tidak ada kebutuhan transaction mutation khusus untuk operasi read.

## 7.2 Mutations

Apabila F15 kemudian menyediakan action mutation, mutation tersebut wajib:

```text
F12 Authorization
       ↓
Domain Mutation
       ↓
F13 Audit Evidence
       ↓
F11 Transactional Outbox
       ↓
Commit
       ↓
F14 Async Delivery (if applicable)
```

F15 tidak boleh membuat transaction orchestration yang bertentangan dengan baseline.

## 7.3 Atomicity Rule

Jika audit evidence atau transactional outbox merupakan bagian dari mandatory mutation contract, kegagalannya harus mempertahankan atomicity sebagaimana ditetapkan F2–F14.

---

# 8. Audit & Observability Contract

## 8.1 F13 Audit

F15 hanya menghasilkan audit evidence untuk action yang memang memiliki audit significance.

Contoh:

- privileged organization action;
- administrative mutation;
- sensitive access;
- explicit governance-sensitive operation.

Routine rendering atau ordinary search tidak otomatis menjadi audit record kecuali baseline policy mensyaratkannya.

## 8.2 F11 Telemetry

F15 dapat menghasilkan telemetry untuk:

- workspace availability;
- query latency;
- authorization denial;
- unexpected error;
- important action lifecycle.

Telemetry harus menggunakan existing F11 contract.

## 8.3 Observability Lineage

Jika event/action membutuhkan tracing:

```text
request
  ↓
F15 action
  ↓
F12 authorization
  ↓
domain operation
  ↓
F13 / F11
```

Correlation identifiers harus dipertahankan tanpa memasukkan secret atau PII yang tidak diperlukan.

---

# 9. Multi-Tenant / RLS Contract

F15 wajib menghormati isolation boundary baseline.

## 9.1 Visibility Principle

```text
User Context
     ↓
Authorized Organization Scope
     ↓
RLS
     ↓
Visible Directory
```

F15 tidak boleh mengambil seluruh organization dataset lalu melakukan filtering security di browser.

## 9.2 Mupel / Jemaat Boundary

Directory visibility harus mengikuti organizational context dan policy yang berlaku.

Contoh konseptual:

```text
Global authorized user
    → allowed organization scope

Mupel-scoped user
    → organizations within permitted Mupel scope

Jemaat-scoped user
    → organizations within permitted Jemaat scope
```

Implementasi final mengikuti policy F12/RLS yang sudah certified, bukan policy baru yang didefinisikan F15.

## 9.3 Client Security Rule

Client-side filtering adalah UX optimization, **bukan security boundary**.

Security boundary tetap:

```text
F12 PDP + PostgreSQL RLS
```

---

# 10. Acceptance & Invariant Tests

F15 harus memiliki test suite yang membuktikan bahwa fitur merupakan consumer murni.

## 10.1 Functional Acceptance

- `/org` tidak lagi menghasilkan 404.
- Authorized user dapat membuka directory.
- Organization hierarchy dapat ditampilkan.
- Search bekerja.
- Filter bekerja.
- Organization detail dapat dibuka.
- Empty state bekerja.
- Error state bekerja.
- Loading state bekerja.

## 10.2 Security Acceptance

- Unauthorized organization tidak muncul.
- Cross-tenant access ditolak.
- Direct URL access tetap melewati authorization.
- Client-side manipulation tidak dapat bypass RLS.
- Tidak ada sensitive data leakage.

## 10.3 Consumer Compatibility Tests

Test harus memastikan:

```text
F15
 ↓
F3
 ↓
F12
 ↓
F13/F11 where applicable
```

tanpa perubahan terhadap baseline implementation.

## 10.4 Baseline Integrity Tests

Wajib diverifikasi:

```text
supabase/migrations/
    → unchanged

F2–F14 core helpers
    → unchanged

F2–F14 contracts
    → unchanged

Baseline tag v2.0.0
    → unchanged
```

## 10.5 Invariant Tests

Minimum invariants:

| ID | Invariant |
|---|---|
| F15-I01 | No unauthorized organization exposure |
| F15-I02 | RLS remains authoritative |
| F15-I03 | F12 authorization cannot be bypassed |
| F15-I04 | F15 does not mutate F2–F14 contracts |
| F15-I05 | No duplicate organization master entity |
| F15-I06 | F15 remains functional consumer of existing F3 capability |
| F15-I07 | Mandatory mutation audit/outbox semantics remain intact |
| F15-I08 | No production-scale capability claim is introduced |

---

# 11. ADR Assessment & Consumer Compatibility Gate

## 11.1 ADR Assessment

**Assessment:** 🟢 NO ADR REQUIRED

Reason:

F15 introduces an application workspace consuming existing capabilities. It does not alter:

- F2 Person Identity;
- F3 Organization contract;
- F11 Outbox;
- F12 PDP;
- F13 Audit;
- F14 Webhook Delivery;
- cross-cutting invariants;
- baseline database contract.

## 11.2 Consumer Compatibility Gate

```text
┌────────────────────────────────────────────────────────────┐
│             F15 CONSUMER COMPATIBILITY GATE               │
├────────────────────────────────────────────────────────────┤
│ Baseline Version                  v2.0.0                  │
│ Baseline Commit                   8a34a3c...               │
│ Baseline Modification             0%                      │
│ Migration Modification            0%                      │
│ Core Contract Modification        0%                      │
│ Authorization Bypass              0                     │
│ RLS Bypass                        0                     │
│ Duplicate Master Entity           0                     │
│ ADR Required                      NO                      │
│ Consumer Model                    PURE CONSUMER           │
├────────────────────────────────────────────────────────────┤
│ VERDICT                          🟢 GO FOR IMPLEMENTATION  │
└────────────────────────────────────────────────────────────┘
```

## 11.3 Stop Condition

Implementation **MUST STOP** if development discovers that F15 requires:

- modification of F2–F14;
- new baseline security helper;
- alteration of existing RLS semantics;
- modification of transactional invariants;
- modification of migration history;
- replacement of F12 PDP;
- replacement of F13 Audit Chain;
- replacement of F11 Outbox;
- modification of frozen baseline contracts.

Such a requirement must be escalated to:

```text
ADR Proposal
    ↓
Architecture Review
    ↓
Approval / Rejection
    ↓
Baseline Version Decision
```

---

# Final Governance Declaration

F15 — Organization Directory Workspace is formally classified as:

> **FIRST CONSUMER VALIDATION OF PLATFORM ARCHITECTURE BASELINE v2.0.**

The objective of F15 is therefore not merely to remove the `/org` 404.

It is to demonstrate empirically that a new domain capability can be implemented **without reopening, modifying, or weakening the frozen F2–F14 architecture boundary**.

The expected implementation relationship is:

```text
                 PLATFORM BASELINE v2.0.0
                         │
          ┌──────────────┼──────────────┐
          │              │              │
         F2             F3             F12
       Identity      Organization       PDP
          │              │              │
          └──────────────┼──────────────┘
                         │
                    F15 Consumer
                         │
                Organization Directory
                         │
                 /org Workspace
```

**F15 implementation may proceed only after this charter is approved.**

**Current status: ⏸️ CHARTER REVIEW — NO CODE IMPLEMENTATION AUTHORIZED.**
