# PHASE6_CALLER_AUDIT_MATRIX

## Blocker 1: `src/lib/utils/rbac.ts`
| # | Function Name | Caller File | Caller Line | Caller Context | Supabase Client Used | Credential Used | Classification |
|---|---|---|---|---|---|---|---|
| 1 | `assertPosWriteAccess` | `src/lib/domains/aset/aset.service.ts` | 27 | Server Action | Default server client | Auth Session | `ACTIVE — Server Action (Not Migrated)` |

## Blocker 2: `src/lib/domains/bantuan/bantuan.service.ts`
| # | Caller File | Caller Line | Function Used | Supabase Client | Credential | Classification |
|---|---|---|---|---|---|---|
| 1 | `bantuan.queries.ts` | 18, 241 | `createPengajuanBantuan` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (WRITE / OC-AID-001)` |
| 2 | `bantuan.queries.ts` | 18, 241 | `reviewByKMJ` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (WRITE / OC-AID-004)` |
| 3 | `bantuan.queries.ts` | 18, 241 | `ajukanUlangBantuan` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (WRITE / OC-AID-007)` |
| 4 | `bantuan.queries.ts` | 18, 241 | `updatePengajuanBantuan` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (WRITE / OC-AID-002)` |
| 5 | `bantuan.queries.ts` | 18, 241 | `submitPengajuanBantuan` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (WRITE / OC-AID-003)` |
| 6 | `bantuan.queries.ts` | 18, 241 | `reviewByAdminMupel` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (WRITE / WORKFLOW)` |
| 7 | `bantuan.queries.ts` | 18, 241 | `reviewBySuperUser` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (WRITE / WORKFLOW)` |
| 8 | `bantuan.queries.ts` | 18, 241 | `deletePengajuanBantuan` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (WRITE / DELETE)` |
| 9 | `bantuan.queries.ts` | 18, 241 | `getPengajuanDetail` | Server Client | Auth Session | `ACTIVE — Unmigrated Domain Logic (READ / No Contract)` |

## Blocker 3: `src/lib/domains/pastoral/pastoral.service.ts`
| # | Caller File | Caller Line | Function Used | Supabase Client | Credential | Caller Context | Classification |
|---|---|---|---|---|---|---|---|
| 1 | `src/lib/offline/action-dispatcher.ts` | 4, 14 | `createLogPastoralAction` | N/A | N/A | Client-side dispatcher | **GATE 7 DEPENDENCY** |
| 2 | `src/app/(dashboard)/pastoral/page.tsx` | 16, 40 | `exportLogPastoralToExcel` | Server Client | Auth Session | Server Action | `ACTIVE — Server Action (Migrated)` |
