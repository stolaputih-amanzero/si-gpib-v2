# ADR ASSESSMENT: BASELINE DEFECT ON `status_tugas` EVALUATION (P0)

**Date**: 2026-08-12
**Status**: 🔴 PENDING ARCHITECTURE REVIEW
**Target Component**: `src/hooks/use-hierarki-selector.ts` (`useUserMupelAuth`)
**Governance Classification**: Baseline Logic Discrepancy (Not authorized for direct modification without ADR approval)

## 1. Description of Discrepancy
The UI hook `useUserMupelAuth` acts as an active workspace identity resolver in the client layer. 
However, it fails to enforce the `status_tugas = 'Aktif'` clause when querying `t_penugasan_pendeta` to resolve a Pendeta Jemaat (PJ)'s active Pos Pelkes. 

### Expected Contract (Design Gate):
```sql
SELECT id_pos 
FROM t_penugasan_pendeta 
WHERE id_pendeta = [id] 
  AND status_tugas = 'Aktif'
```

### Actual Implementation (`use-hierarki-selector.ts`):
```typescript
const { data: penugasan } = await supabase
  .from('t_penugasan_pendeta')
  .select('id_pos')
  .eq('id_pendeta', id_pendeta)
  .maybeSingle(); // MISSING: .eq('status_tugas', 'Aktif')
```

## 2. Impact Analysis
- **Security / Authorization Risk**: No direct authorization expansion risk because F12 (PDP RLS) on the database level will reject unauthorized data access. 
- **UX Risk**: High. The UI might resolve the active workspace to an expired, revoked, or historical assignment `id_pos`. The user would be redirected to a workspace they no longer hold, resulting in empty data or "Access Denied" screens (due to F12 RLS blocking).

## 3. Governance Context
`use-hierarki-selector.ts` is considered part of the frozen **F2-F14 Baseline Components**. 
According to governance principles: 
> "Implementation Audit Finding ≠ Authorization to Modify Baseline."

Although this is a confirmed defect compared to business logic, direct modification is strictly prohibited without ADR approval to avoid unintentional regressions in the v2.0.0 freeze state.

## 4. Pending Review Questions
Before proceeding with an implementation fix, the following architectural questions must be answered by the Architecture Board:
1. Is `useUserMupelAuth()` intended to be the **canonical authorization/assignment resolver** in the UI, or is it a legacy helper that should be deprecated?
2. Since `workspace-target-resolver.ts` correctly enforces this logic server-side, should we refactor the UI to depend entirely on the server-side target resolution instead of rewriting the logic in a client hook?

**Verdict Requested**: Architecture review needed to decide whether to (A) patch the baseline hook or (B) deprecate the client hook in favor of server-side canonical resolution.
