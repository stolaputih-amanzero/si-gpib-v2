# PHASE6_GATE7_DEPENDENCIES

| Caller File | Context | Blocked Target | Reason |
|---|---|---|---|
| `src/lib/offline/action-dispatcher.ts` | Client-side Offline Dispatcher | `src/lib/domains/pastoral/pastoral.service.ts` | The dispatcher directly references `createLogPastoralAction`. Since it runs client-side, it cannot invoke `enforceContract` directly. A proper server execution boundary must be designed in Gate 7. Phase 6.0 is BLOCKED for `pastoral.service.ts` deletion. |
