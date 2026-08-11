# F2 PERSON WORKSPACE E2E CONTRACT V1

**Platform Target:** Platform Baseline v2.0.0 (🔒 FROZEN)  
**Parent Contract:** `F2_PERSON_WORKSPACE_DESIGN_GATE_V1.md`  
**Test Suite Path:** `e2e/f2-person-workspace.spec.ts`  
**Date:** 2026-08-12  

---

## 1. E2E SUITE PURPOSE & INVARIANTS

The F2 Person Workspace E2E Test Suite enforces the **12-Point Mandated Verification Matrix** established in Design Gate V1. 

Beyond standard UI navigation and geometry assertions, this suite explicitly validates the **Server-Side Fail-Closed Privacy Contract (Invariants 10–12)** to guarantee that unauthorized viewers never receive raw private payloads (family or biometric data) in the DOM or network responses.

---

## 2. MANDATED 12-POINT VERIFICATION MATRIX

```text
===============================================================================
                       F2 E2E VERIFICATION MATRIX
===============================================================================
 01. Canonical /people/{id}               : Default load opens #overview
 02. Cold-load #profile                   : Deterministic landing on #profile
 03. Cold-load #roles                     : Deterministic landing on #roles
 04. Cold-load #competencies              : Deterministic landing on #competencies
 05. Cold-load #pastoral                  : Deterministic landing on #pastoral
 06. Internal anchor navigation           : Click anchor link updates hash & scrolls
 07. Mobile geometry contract             : Target top >= effectiveHeaderBottom (390px)
 08. Desktop geometry contract            : Target top >= effectiveHeaderBottom (1280px)
 09. Unknown id_person                    : Triggers Next.js 404 notFound()
 10. Authorized viewer (Self / Super)     : Full private data cards rendered
 11. Unauthorized viewer                  : PrivacyStateNotice component rendered
 12. Raw payload leak assertion           : DOM absent of raw private data strings
===============================================================================
```

---

## 3. PRIVACY LEAK ASSERTION SPECIFICATION (TESTS 10–12)

```text
                                  E2E PRIVACY AUDIT
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
        Super User / Self View                          Unauthorized View
                   │                                             │
                   ▼                                             ▼
         Data Cards Rendered                         PrivacyStateNotice Rendered
                   │                                             │
                   ▼                                             ▼
    Assert: DOM contains raw data                Assert: DOM DOES NOT contain
    (e.g., family member names)                   raw private data payload strings
```

---

## 4. PRE-IMPLEMENTATION BASELINE ASSESSMENT INSTRUCTIONS

Before any consumer UI layer code modifications take place:
1. The Playwright test file `e2e/f2-person-workspace.spec.ts` MUST be created.
2. The test suite MUST be executed against the current baseline to establish empirical pre-implementation test results.
3. Any test failures due to UI anchor differences (e.g. missing `scroll-mt-*` or `aria-current="location"`) MUST be recorded as pre-implementation baseline state.
