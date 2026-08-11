# WORKSPACE CONSUMER STANDARD V1

**Platform Layer:** Standardized Workspace Consumer Architecture (Layer above Baseline v2.0.0)  
**Parent Target:** Platform Architecture Baseline v2.0.0 (🔒 FROZEN)  
**Evidence Foundation:** F3 Organization Workspace (Certified) + F2 Person Workspace (Certified)  
**Standard Status:** 🟢 **CERTIFIED PLATFORM-LEVEL CONSUMER STANDARD**  
**Date:** 2026-08-12  

---

## 1. PURPOSE & ARCHITECTURAL LINEAGE

### 1.1 Purpose
Workspace Consumer Standard V1 standardizes the **Reusable Workspace Architecture Pattern** derived from the empirical verification of two certified reference implementations:
1. **F3 Organization Workspace** (Reference Consumer Pattern #1 — 7/7 E2E Passed)
2. **F2 Person Workspace** (Reference Consumer Pattern #2 — 13/13 E2E Passed)

This standard provides a strict, reusable blueprint for any future Workspace Transformation on top of Baseline v2.0.0, ensuring zero baseline modification, strict privacy preservation, and 100% deterministic deep-link geometry.

### 1.2 Lineage Diagram
```text
v2.0.0 FINAL (🔒 Frozen Baseline)
       │
       ├── F3 Organization Workspace ──► 🟢 Certified (7/7 E2E)
       │                                     │
       ├── F2 Person Workspace       ──► 🟢 Certified (13/13 E2E)
       │                                     │
       └─────────────────────────────────────┴──► WORKSPACE CONSUMER STANDARD V1
                                                        │
                                                        ▼
                                           Future Workspace Implementations
```

---

## 2. EMPIRICAL EVIDENCE COMPARISON MATRIX (F3 vs F2)

| Architectural Concern | F3 Organization Workspace | F2 Person Workspace | Standard V1 Requirement |
| :--- | :--- | :--- | :--- |
| **Canonical Route** | `/org/[id_org]` | `/people/[id_person]` | `/domain/[id_entity]` |
| **Identity Context** | Organization Entity 360 | Person Entity 360 | Single-entity UI Context |
| **Progressive Sections** | 6 Anchor Sections | 5 Anchor Sections | Progressive Vertical Sections |
| **Hash Deep-Link** | 🟢 Certified (`#overview`, etc.) | 🟢 Certified (`#overview`, etc.) | Mandatory Section Anchors |
| **Cold-Load Hash Landing** | 🟢 Certified (`behavior: 'auto'`) | 🟢 Certified (`behavior: 'auto'`) | Cold-load deterministik hash |
| **Sticky Header Offset** | 🟢 Certified (`scroll-mt-36`) | 🟢 Certified (`scroll-mt-36`) | `scroll-mt-36 md:scroll-mt-28` |
| **Active Section Observer**| 🟢 Certified (`IntersectionObserver`)| 🟢 Certified (`IntersectionObserver`)| Container-agnostic observer |
| **Mobile Bottom Clearance**| 🟢 Certified (`pb-36 md:pb-16`) | 🟢 Certified (`pb-36 md:pb-16`) | `pb-36 md:pb-16` on container |
| **Navigation Semantics** | Button / Anchor | Semantic `<a href="#id">` | `<a href="#id">` & `aria-current` |
| **Privacy Boundary** | F12 RLS PDP | F12 RLS PDP (`PrivacyStateNotice`) | Server-enforced Fail-Closed |
| **Baseline Modification**| 🔒 0 Drift / 0 SQL Change | 🔒 0 Drift / 0 SQL Change | 🔒 0 Baseline Modification |
| **E2E Verification Matrix**| 🟢 7/7 PASSED | 🟢 13/13 PASSED | 100% E2E Pass Mandated |
| **Completion Gate** | 🟢 Certified & Closed | 🟢 Certified & Closed | Mandatory Completion Gate Doc |

---

## 3. THE 9 STANDARDIZED WORKSPACE CONTRACTS

```text
                               WORKSPACE CONSUMER STANDARD V1
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                   ▼                   ▼                  ▼
1. Identity        2. Canonical        3. Section Anchor   4. Header Geometry 5. Mobile
   Context            Routing             Contract            Contract           Clearance
      │                  │                   │                   │                  │
      ▼                  ▼                   ▼                   ▼                  ▼
6. Accessibility   7. Loading &        8. Privacy State    9. E2E & Verification
   Semantics          Empty States        Fail-Closed         Contract Matrix
```

### 3.1 Contract 1: Identity Context Contract
- Workspace is a **UI View Context**, NOT an authorization scope.
- Navigating to a workspace MUST NEVER expand or alter user's F12 RLS authorization privileges.

### 3.2 Contract 2: Canonical Routing Contract
- Every workspace must have a single canonical entry route (`/domain/[id_entity]`).
- Smart Entry shortcuts (e.g. `/org/me`, `/settings/profile`) act purely as server-side redirectors and MUST NOT create client payload state.

### 3.3 Contract 3: Section Anchor Contract
- Main content area must present 3 to 7 progressive vertical sections, each with a unique `id="section"`.
- URL fragment hash (`#section`) MUST deterministically control scroll position on cold-load.

### 3.4 Contract 4: Geometry Contract
- All sections MUST include `className="scroll-mt-36 md:scroll-mt-28"` (or dynamic calculation) to compensate for sticky headers and top anchor bars.
- E2E geometry assertion requirement: `targetSection.top >= effectiveHeader.bottom`.

### 3.5 Contract 5: Mobile Clearance Contract
- Main container MUST include `pb-36 md:pb-16` padding to guarantee clearance above `SuperBottomNav`.
- Touch target sizes for all links, tabs, and buttons MUST be `min-h-[44px] min-w-[44px]`.

### 3.6 Contract 6: Accessibility & Navigation Semantics Contract
- Anchor navigation bars MUST use semantic `<a href="#section">` links.
- Active section state MUST be denoted with `aria-current="location"` rather than `role="button"` + `aria-selected`.

### 3.7 Contract 7: Loading, Empty, & Error State Contract
- Skeleton loader (`WorkspaceSkeleton`) required during Next.js page transitions.
- Sections with no data MUST render standardized `EmptyStateNotice`.
- Invalid or missing entity IDs MUST trigger Next.js `notFound()` 404 page.

### 3.8 Contract 8: Privacy Boundary Contract (Fail-Closed)
- Server-side F12 RLS PDP evaluates authorization during database queries.
- Unauthorized viewers receive `PRIVACY_MASKED` payload metadata and UI renders `PrivacyStateNotice`.
- **STRICT INVARIANT:** DOM string payload MUST NOT contain raw private data strings for unauthorized viewers.

### 3.9 Contract 9: E2E Verification & Evidence Contract
- Every workspace transformation MUST author a Playwright E2E spec verifying the 9 contracts before implementation.
- Milestone completion requires 100% E2E test pass rate and 0 baseline drift audit verification.

---

## 4. GOVERNANCE WORKFLOW DISCIPLINE

All future workspace transformations MUST strictly follow the 7-step governance lifecycle:

```text
01. Consumer Charter  ➔  02. Design Gate  ➔  03. E2E Spec  ➔  04. Consumer Implementation  
                       ➔  05. Verification  ➔  06. Baseline Drift Audit  ➔  07. Completion Gate
```

> [!CAUTION]
> **DEFECT ISOLATION RULE:**  
> Discovering a baseline defect during workspace transformation DOES NOT grant permission to patch frozen baseline code (`supabase/migrations/` or F2–F14 baseline helpers).  
> Defects MUST be isolated as **Pending ADRs** and resolved through formal architecture board reviews.

---

## 5. STANDARD CERTIFICATION & AUTHORIZATION

```text
> WORKSPACE CONSUMER STANDARD V1 IS OFFICIALLY CERTIFIED AND ACTIVE.
> It serves as the prerequisite Design Gate standard for all future Workspace Transformations.
```
