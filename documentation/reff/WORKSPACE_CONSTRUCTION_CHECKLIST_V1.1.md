# Workspace Construction Checklist v1.1 — Executable Protocol

**Status:** 🔒 **EXECUTABLE PROTOCOL STANDARD**  
**Parent Pattern:** `WORKSPACE_PATTERN_V1.1` & `EIA v0.1.1`

This checklist serves as the mandatory, step-by-step verification protocol for building any new Entity Workspace in SI GPIB. Every item MUST be explicitly checked and verified before advancing to subsequent phases.

---

## 📋 Phase 1: EIA Mapping & Identity Resolution

- [ ] **1.1 Canonical Entity Identified:** Define the root canonical entity (e.g. `m_person`, `m_jemaat_induk`). Establish that role or level does NOT hijack entity identity (*"Role/Level is NOT Identity"*).
- [ ] **1.2 Deterministic ID Resolution:** Establish a deterministic ID resolution algorithm. If `p_id` matches 0 or >1 rows, the backend MUST return `NULL` / `NOT_FOUND` / `AMBIGUOUS_ID` (**NO `LIMIT 1` GUESSING**).
- [ ] **1.3 Visibility Matrix Defined:** Classify all entity data fields into the 5 Visibility Classes:
  - `ORG_WIDE`
  - `PUBLIC_WITHIN_CONTEXT`
  - `RESTRICTED`
  - `PRIVATE`
  - `SYSTEM_ONLY`
- [ ] **1.4 Access Policy Ceiling Modifiers Defined:** Identify if any fields require `SELF_ONLY` or node-specific ancestry ceilings inside PostgreSQL RPCs. These act as *Backend Authorization Ceilings*, maintaining strictly 3 UI Render States (`DATA`, `EMPTY`, `PRIVACY_MASKED`) in the ACL layer.

---

## 📋 Phase 2: Type Contract Interface (`Unified[Entity]Data`)

- [ ] **2.1 Read-Model Interface Created:** Create `src/types/[entity].types.ts` defining `Unified[Entity]Data`.
- [ ] **2.2 Privacy Metadata Embedded:** Include `_meta.privacy: Record<string, PrivacyState>` annotation map for all non-public nodes.
- [ ] **2.3 Zero UI Concerns in Data Contract:** Ensure `Unified[Entity]Data` contains **0% UI flags** (e.g., NO `canEdit`, `isEditable`, `showButton`).
- [ ] **2.4 Zero `SYSTEM_ONLY` Exposure:** Verify that internal system credentials (`password_hash`, `p256dh_key`, etc.) are completely omitted from the interface.

---

## 📋 Phase 3: PostgreSQL RPC & Security Boundary (`get_[entity]_360`)

- [ ] **3.1 Security Definition:** Function created with `SECURITY DEFINER` and `SET search_path = public, pg_temp`.
- [ ] **3.2 Session Trust:** `auth.uid()` is the SOLE identity source for the requester. No client override parameters accepted.
- [ ] **3.3 Deterministic Query Resolution:** Execution uses exact PK checks without fallback `LIMIT 1`.
- [ ] **3.4 Bounded Projections (Anti-God RPC):** Projections to other entities (People, Assets, Aid Requests) are kept lightweight (`id`, `nama`, `status` only).
- [ ] **3.5 Integration Test Harness Executed:** Write `scratch/test_[entity]_api.ts` covering 5 security scenarios:
  - Unauthenticated access blocked
  - 404 / Ambiguity guard verified
  - Target node resolution verified
  - Negative Invariants: Zero `SYSTEM_ONLY` & zero forbidden field leaks
  - Type Contract shape compliance verified

---

## 📋 Phase 4: Anti-Corruption Layer (ACL Adapter)

- [ ] **4.1 ViewModel Types Created:** Create `src/types/[entity]ViewModel.types.ts` with `FieldRenderState<T>`.
- [ ] **4.2 Adapter Implemented:** Create `src/adapters/[entity]ViewModelAdapter.ts` performing pure transformation over `_meta.privacy`.
- [ ] **4.3 Zero Auth Logic in Adapter:** Adapter contains **0% role or session checks**. It maps `_meta.privacy` directly to UI states.
- [ ] **4.4 Invariant State Resolution Verified:**
  - `accessible = true` + data present ➔ `type: 'DATA'`
  - `accessible = true` + `null`/`[]` ➔ `type: 'EMPTY'` (*"Belum ada data"*)
  - `accessible = false` ➔ `type: 'PRIVACY_MASKED'` (*"Dibatasi oleh Kebijakan Privasi"*)
- [ ] **4.5 Adapter Unit Tests Executed:** Write & pass `scratch/test_[entity]_adapter.ts` covering Full Context, Restricted, Outside Context, and EMPTY vs MASKED invariants.

---

## 📋 Phase 5: Mobile-First Workspace UX & UI Shell

- [ ] **5.1 UX/IA Contract Locked:** Create `[ENTITY]_WORKSPACE_UX_CONTRACT_V0.1.md`.
- [ ] **5.2 Identity-First Header Implemented:** Create `[Entity]Header.tsx` displaying entity name as headline, with level/role as metadata badge, and copyable ID.
- [ ] **5.3 Single Top Sticky Anchor Bar Implemented:** Create `[Entity]NavigationAnchor.tsx` with top sticky positioning (`top-0 z-30`) and mobile horizontal scroll (`overflow-x-auto`). **Zero bottom sticky bars**.
- [ ] **5.4 Structural Predictability Maintained:** All progressive sections are rendered regardless of privacy. Restricted sections render `PrivacyStateNotice`.
- [ ] **5.5 Projection Cross-Links Connected:** Projection items contain explicit links to target workspaces/detail views:
  - Person Item ➔ `/dashboard/people/[id_person]`
  - Asset Item ➔ `/dashboard/assets/[id_asset]`
  - Aid Request Item ➔ `/dashboard/aid-requests/[id_ajuan]`
- [ ] **5.6 Deep-Linking Hash Navigation Active:** Section scroll updates URL fragment hashes (`#section`).
- [ ] **5.7 Next.js Route Integrated:** Create Server Page `/app/(dashboard)/[domain]/[id]/page.tsx` invoking service layer.

---

## 📋 Phase 6: Production Acceptance & Regression Gate

- [ ] **6.1 Global Type Check:** `npx tsc --noEmit` completes with **0 errors**.
- [ ] **6.2 Secret & Log Audit:** `npm run pre-deploy-check` passes with **0 service role key leaks** and **0 console.log residuals**.
- [ ] **6.3 Production Build Compilation:** `npm run build` compiles successfully and generates optimized route chunks.
- [ ] **6.4 Walkthrough & Governance Recorded:** Update `walkthrough.md` with test evidence and mark all items in `task.md` as COMPLETE.
