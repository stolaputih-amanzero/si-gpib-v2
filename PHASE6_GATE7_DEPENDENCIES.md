# GATE 7 DEPENDENCY HANDOFF

## Dependency ID: G7-DEP-001
### Affected Caller
- **File:** `src/lib/offline/action-dispatcher.ts`
- **Line:** 4
- **Function:** `createLogPastoralAction`
- **Source:** `src/lib/domains/pastoral/pastoral.service.ts`

### Current State
- `action-dispatcher.ts` berjalan di browser (client-side)
- Memanggil `createLogPastoralAction` dari `pastoral.service.ts` secara langsung
- `pastoral.service.ts` mengandung legacy authorization logic

### Why Phase 6.0 Cannot Resolve This
- RULE P6.0-02: Client-side code TIDAK BOLEH memanggil `enforceContract()` langsung
- RULE P6.0-03: Jangan mengubah dispatcher. Jangan menghapus fungsi yang masih direferensikan.

### Required Gate 7 Resolution
Gate 7 (Offline-First Sync Architecture) harus membangun:
1. **Server Execution Boundary:** Endpoint/Server Action yang sudah memiliki
   Contract binding statis (`OC-PASTORAL-001`) untuk dipanggil oleh dispatcher.
2. **Re-authorization at Flush:** Server melakukan re-authorization saat
   flush queue, bukan pre-authorization di client.
3. **Context Preservation:** `origin_context_id` disertakan sebagai metadata
   dalam queue item, bukan sebagai authority.

### Interim State (Until Gate 7 Resolves)
- `pastoral.service.ts` TETAP ada di codebase
- `action-dispatcher.ts` TETAP tidak dimodifikasi
- Legacy authorization di `pastoral.service.ts` TETAP berlaku
  sebagai satu-satunya enforcement untuk offline pastoral creation
- RLS tetap berlaku sebagai safety net di database level

### Risk Assessment
- **Severity:** MEDIUM
- **Impact:** Offline pastoral creation masih menggunakan legacy auth path
- **Mitigation:** RLS di database level tetap aktif sebagai safety net.
  Data yang dibuat via offline path tetap harus melewati RLS saat
  di-persist ke Supabase.

---

# GATE 6.1 DEPENDENCY HANDOFF

## Dependency ID: G6.1-DEP-001
### Affected Callers
- **Files:** `BantuanReviewActions.tsx`, `BantuanForm.tsx`, `AjukanUlangButton.tsx` (and other UI components)
- **Functions:** WRITE functions in `src/lib/domains/bantuan/bantuan.service.ts` via `bantuan.queries.ts`

### Current State
- UI components call `bantuan.queries.ts` which imports directly from `bantuan.service.ts`
- WRITE functions in `bantuan.service.ts` contain active shadow authorization checks

### Required Gate 6.1 Resolution
- Migrate client-side UI components to call Server Actions directly from `src/app/actions/bantuan.ts` using `enforceContract()`.
- After migration, remove the remaining orphaned WRITE functions in `bantuan.service.ts`.
