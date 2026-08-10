# PHASE6_DELETION_LOG

| File/Function Deleted | Reason | Verification of Zero References |
|---|---|---|
| `src/lib/utils/rbac.ts` | Replaced by `enforceContract` in `aset.service.ts` | Verified via `grep_search`. No other callers found. |
| `src/lib/domains/bantuan/bantuan.service.ts` | **RESTORED** | Initially deleted, but restored because it contains `ajukanUlangBantuan` and other functions not yet migrated to Gate 4 actions, which are still actively called by `bantuan.queries.ts`. |
