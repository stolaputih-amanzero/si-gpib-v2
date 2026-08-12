# PLATFORM SURFACE GOVERNANCE GATE V1 (SURFACE NORMALIZATION)

**Platform Layer:** Cross-Feature UX Surface & Presentation Layer  
**Platform Target:** Platform Baseline v2.2.0 (🔒 FROZEN ARCHITECTURE)  
**Governance Lineage:** `v2.0.0 ➔ F2 Ref #1 ➔ F3 Evidence ➔ WORKSPACE_CONSUMER_STANDARD_V1 ➔ SURFACE_NORMALIZATION_GATE_V1`  
**Audit Verdict Status:** 🟢 **GOVERNANCE GATE CERTIFIED — AUTHORIZED FOR PHASED CONSUMER SURFACE IMPLEMENTATION**  
**Date:** 2026-08-12  

---

## 🛑 THE SURFACE NORMALIZATION IRON LAW

> [!CAUTION]
> **IRON LAW OF SURFACE NORMALIZATION:**  
> **No surface refactor may alter Domain, Entity, Context, Workspace, Section, Action, Route, Authorization Boundary, or Persistence Model.**

```text
Domain                 ❌ FROZEN (Zero Domain Alteration)
Entity                 ❌ FROZEN (Zero Entity Classification Changes)
Context                ❌ FROZEN (Zero Active Context Logic Changes)
Workspace              ❌ FROZEN (Zero Workspace Type Additions)
Section                ❌ FROZEN (Zero Section Anchor Re-definitions)
Action                 ❌ FROZEN (Zero Action Workflow Contract Changes)
Route                  ❌ FROZEN (Zero Canonical Route Alterations)
RLS / PDP              ❌ FROZEN (Zero Authorization Policy Changes)
Database Schema        ❌ FROZEN (Zero Migration / Table Changes)
─────────────────────────────────────────────────────────────────────────────
Surface Tokens         ✅ EDITABLE (Colors, Geometry, Radius, Elevations)
Typography             ✅ EDITABLE (Font Family, Scale, Weight, Tabular Nums)
Spacing & Gutters      ✅ EDITABLE (Fluid Margins, Rhythm Scale 4/8pt)
Containers & Rows      ✅ EDITABLE (Semantic Cards, Hairline Row Dividers)
Color Semantics        ✅ EDITABLE (Blue Primary, Green Success, Amber Warning)
Copy & UI Labels       ✅ EDITABLE (Human-Centric Bahasa Indonesia Alignment)
Navigation Presentation✅ EDITABLE (Root Header v2, Bottom Nav Single-Line)
```

---

## 🏛️ 1. THREE-TIER REFERENCE STANDARD MATRIX

To eliminate ad-hoc redesigns, all visual implementations must strictly conform to the 3-Tier Reference Matrix:

```text
                                PLATFORM BASELINE (FROZEN)
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           ▼                                ▼                                ▼
   VISUAL SURFACE REFERENCE       WORKSPACE GEOMETRY REFERENCE    PRIVACY & DEEP-LINK REFERENCE
      (Login Screen)              (F3 Organization Workspace)         (F2 Person Workspace)
           │                                │                                │
 └─ Single Purpose                └─ Responsive Geometry          └─ Fail-closed Privacy (F12)
 └─ Single Gutter                 └─ Sticky Anchor                └─ 5 Deep-link Anchors
 └─ Single Accent                 └─ Viewport Boundaries          └─ Self Profile Shortcut
```

| Reference | Domain of Authority | Enforcement Rule |
| :--- | :--- | :--- |
| **1. Login Reference** | **Visual Surface & Hierarchy** | • *One Purpose ➔ One Hierarchy ➔ One Gutter ➔ One Visual Language*<br>• Eliminate card soup & random floating containers<br>• Single accent color (Primary Blue) with high-contrast text |
| **2. F3 Organization Workspace** | **Workspace Interaction & Geometry** | • Responsive viewport boundaries & responsive grid<br>• Header offset (`scroll-mt`) & bottom nav clearance (`pb-36 / pb-16`)<br>• Sticky sub-navigation & dynamic section anchor observer |
| **3. F2 Person Workspace** | **Privacy, Routing & Deep-Link** | • Dynamic 5 Anchors (`#overview`, `#profile`, `#roles`, `#competencies`, `#pastoral`)<br>• *Fail-closed RLS Policy* (`PRIVACY_MASKED` notice enforcement)<br>• Smart Entry via `/settings/profile` ➔ `/people/[id_person]` |

---

## 🔒 2. PROTECTED CERTIFIED SURFACE BOUNDARIES

| System Layer / Element | Governance Status | Permitted Mutations |
| :--- | :--- | :--- |
| **F2 Route & Anchors** | 🔒 Protected | Zero changes to `/people/[id_person]` routes or `#anchor` names. |
| **F2 Privacy & Smart Entry** | 🔒 Protected | Zero changes to RLS privacy notices or `/settings/profile` shortcut contract. |
| **F3 Workspace & Sections** | 🔒 Protected | Zero changes to `/org/[id]` workspace boundaries or section contracts. |
| **RLS / PDP / Database Schema** | 🔒 Protected | Zero changes to PostgreSQL policies, tables, columns, or RPC functions. |
| **Surface Tokens & Geometry** | 🟢 Editable | Full standardization of tokens, padding, radius, and elevation. |
| **App Header & Bottom Nav** | 🟢 Editable | Surface presentation refactoring (single-line nav, root header v2). |
| **Card & Row Presentation** | 🟢 Editable | Conversion of list items from floating cards to full-width hairline dividers. |
| **Typography & Copy** | 🟢 Editable | Font unification, tabular numbers for stats, 100% Bahasa Indonesia copy. |

---

## 📐 3. SURFACE CONTRACT SPECIFICATIONS

### 3.1 Semantic Container Policy
Containers are strictly bound by semantic intent rather than used as default background wrappers:

```text
  • Card     ➔ Semantic Emphasis ONLY (Hero blocks, highlight callouts)
  • Surface  ➔ Default Layout Container (Page background, structural sections)
  • Divider  ➔ Default Item Separation (1px hairline border for list items)
  • Sheet    ➔ Transient Action Gateway (Bottom Sheet via FAB "+")
```

### 3.2 Root Header v2 Contract
App bar header serves one clear purpose: *"In what context am I working?"*

```text
ROOT TAB VIEW (Beranda, Organisasi, SDM, Akun):
  ┌────────────────────────────────────────────────────────────────────────┐
  │  [ ContextChip: ⛪ Sinode GPIB ⌄ ]                             [ 🔔³ ]  │
  └────────────────────────────────────────────────────────────────────────┘

PUSHED VIEW (Sub-Halaman / Detail):
  ┌────────────────────────────────────────────────────────────────────────┐
  │  [ ← ] [ ContextChip Compact ]                        [ ⚙️ / ⋮ ]        │
  └────────────────────────────────────────────────────────────────────────┘
```
- **Root destinations MUST NOT render back buttons (`←`).**
- Header title string is strictly omitted from the root bar.

### 3.3 Bottom Navigation Surface Contract
- **5-Slot Frozen Model**: `Beranda` · `Organisasi` · `(+)` · `SDM` · `Akun`.
- **Single-Line Label Rule**: Bottom navigation labels **must remain single-line and must not truncate**. Labels may exceed 8 characters when necessary for semantic clarity (e.g. `Organisasi` = 10 chars), provided the 5-slot geometry remains stable.
- **Active State**: Single visual signal (Primary color on active Icon + Label).
- **Safe Area**: Bottom inset (`env(safe-area-inset-bottom)`) themed to match the navigation surface background.

### 3.4 FAB Action Gateway Contract
```text
FAB "+"
  ↓
Quick Actions Sheet (Transient Bottom Sheet)
  ↓
Actions Filtered By:
  ├── Active Context (e.g. Sinode vs Pos Pelkes)
  ├── User Capability (e.g. Admin vs Pelayan)
  └── Current Workflow State (e.g. Pending Drafts)
```
- **FAB is NOT a hardcoded shortcut to a single feature.**
- FAB is the **sole Action Gateway** for context-sensitive quick actions. Duplicate quick action chips on the Home screen are strictly removed.

### 3.5 Attention-First Home Canonical Model
Home is an **Operational Work Entry Point**, NOT a static Business Intelligence dashboard:

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ CONTEXT       ➔  [ Context Chip: Sinode GPIB · Admin Nasional ]           │
├───────────────────────────────────────────────────────────────────────────┤
│ ATTENTION     ➔  • 3 ajuan perlu persetujuan                              │
│                  • 2 draft offline belum tersinkronisasi                  │
│                  • 1 telemetry sync warning                               │
├───────────────────────────────────────────────────────────────────────────┤
│ ACTION        ➔  [ Grid Aksi Cepat Fluid (Monokrom + Label Pendek) ]       │
├───────────────────────────────────────────────────────────────────────────┤
│ INSIGHT       ➔  [ Strip / Grid Statistik Ringkas (Sans Tabular Nums) ]   │
└───────────────────────────────────────────────────────────────────────────┘
```

### 3.6 Role Presentation Policy & Systemic Colors
- **Role Presentation Policy (`users.role Is Not Ontological Truth`)**: Technical database roles (`super_user`, `kmj`, `pj`) are NEVER rendered raw to users. Roles are transformed via presentation policies based on scope (e.g., `super_user` + National Scope ➔ **Admin Nasional** / **Akses Penuh**).
- **Systemic Semantic Color System**:
  - `Primary` (Blue) ➔ Brand & primary interactive triggers.
  - `Success` (Green) ➔ Active states, completed actions, sync success.
  - `Warning` (Amber) ➔ Pending approvals, offline drafts, warnings.
  - `Danger` (Red) ➔ Error states, destructive actions, out-of-scope notices.
  - `Neutral` (Slate/Zinc) ➔ Structural dividers & neutral text.
  - `Purple` ➔ **Reserved / Unassigned** (Strictly prohibited without documented semantic policy).

### 3.7 Five Execution Guardrails
1. **Component API Semantic Isolation**: Surface components (`Header`, `BottomNav`, `Row`, `Card`, `Sheet`) MUST NOT perform Domain, Context, or Authorization decision-making. They pure-render passed UI props.
2. **FAB Engine Boundary**: FAB capability filtering is pure UI presentation layer. Capabilities MUST originate strictly from the existing authorization/context layer.
3. **Home Attention Layer Projection**: Attention cards (e.g. pending approvals, offline drafts, telemetry warnings) MUST NOT invent new workflows. They aggregate existing status & actions.
4. **Zero-Route-Drift Assertion**: Canonical routes and anchor link IDs (`/people/[id_person]`, `/org/[id]`, `#overview`, etc.) MUST remain 100% identical before and after Surface Normalization.
5. **Visual Regression Evidence Protocol**: Verification requires automated/E2E visual check across 7 states: Mobile (390px), Desktop (1280px), Root Tab, Pushed View, Safe-Area Bottom, FAB ➔ Sheet, and Certified F2/F3 Workspace routes.

---

## 🚀 4. PHASED IMPLEMENTATION PIPELINE

Implementation MUST proceed strictly sequentially. Phase 1 must be 100% closed and verified before Phase 2 begins:

```text
F1.1  Design Tokens (CSS Variables, Color Scale, Radius, Gutter)
      ↓
F1.2  App Shell & Layout Gutters (Fluid Edge-to-Edge)
      ↓
F1.3  Root Header v2 (Root Tab vs Pushed View Context Chip)
      ↓
F1.4  Bottom Navigation v2 (Single-line labels, Themed Safe Area)
      ↓
F1.5  FAB ➔ Quick Actions Sheet Gateway Component
      ↓
F1.6  Semantic Row & Hairline Divider Components
      ↓
F1.7  Typography Normalization (Sans-serif, Tabular Numbers)
      ↓
F1.8  Safe-area Bottom Inset Normalization
      ↓
      ┌────────────────────────────────────────────────────────┐
      │ VERIFICATION GATE:                                     │
      │ 1. npx tsc --noEmit                                    │
      │ 2. npm run build                                       │
      │ 3. F2 Person Workspace E2E Pass                        │
      │ 4. F3 Organization Workspace E2E Pass                  │
      │ 5. Surface Regression Verification                     │
      └────────────────────────────────────────────────────────┘
```

---

## 🟢 VERDICT & CERTIFICATION

```text
PLATFORM SURFACE GOVERNANCE VERDICT
────────────────────────────────────────────────────────────
Architecture Layer           🔒 100% FROZEN (Zero RLS, Schema, or Route changes)
Visual Reference             🟢 CERTIFIED (Login Screen Gutter & Hierarchy Model)
Geometry Reference           🟢 CERTIFIED (F3 Organization Workspace Geometry)
Privacy & Deep-Link Reference🟢 CERTIFIED (F2 Person Workspace & Self Shortcut)
Execution Status             🟢 FASE 1 - FASE 4, ORG DIRECTORY, TRANSFERS & VAULT CERTIFIED CLOSED
FASE 1 E2E RECONCILIATION    🟢 18 Feature Specs (12 F2 + 6 F3) + 1 Auth Setup = 19 Runner Passes
FASE 2 E2E RECONCILIATION    🟢 15 Feature Specs (12 F2 + 3 CJ7) + 1 Auth Setup = 16 Runner Passes
FASE 3 E2E RECONCILIATION    🟢 15 Feature Specs (12 F2 + 3 F3 Directory) + 1 Auth Setup = 16 Runner Passes
FASE 4 E2E RECONCILIATION    🟢 1 Feature Spec (Home Reconstruction 4-Layer) + 1 Auth Setup = 2 Runner Passes
ORG DIRECTORY E2E            🟢 9 Feature Specs (/org Directory & Workspace) = 9 Runner Passes
CAPABILITY E2E EVIDENCE      🟢 4 Feature Specs (/transfers F16 + /vault F17) = 4 Runner Passes
TOTAL RUNNER EXECUTIONS     🟢 62 Feature Specs + 4 Auth Setup Passes = 66 Total Runner Executions
────────────────────────────────────────────────────────────
VERDICT                      🟢 ALL 10 BUSINESS CAPABILITIES CERTIFIED CLOSED — GOVERNANCE FREEZE RE-ESTABLISHED
```
