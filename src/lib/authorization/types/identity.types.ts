/**
 * src/lib/authorization/types/identity.types.ts
 *
 * Identity-layer type definitions.
 *
 * Ontological authority:
 *   - Gate 3 Step 2 v1.1 (Identity & Role Model) — AMENDED by CHG-01
 *   - 05-UX-Canonical-Model-v1.0.md §2.7–§2.9
 *   - ADR-UX-004 (Person Unification)
 *
 * CHG-01 amendments applied:
 *   - PersonType refined to 4 values (Presbiter / Pelaksana split).
 *   - SystemRole expanded to 9 Authorization Profiles.
 *
 * VC-01: Person Type ≠ Organizational Role ≠ System Role.
 * AD-G3-02-07: users.role is NOT ontological truth.
 */

/**
 * Person Type / Ministry Identity — "Who is this person in the ministry?"
 *
 * CHG-01: Pelayan split into Presbiter (Penatua/Diaken) and Pelaksana
 * (Non-Presbiter, Komisi). This resolves the ontological gap where the
 * frozen baseline only modeled "Pelayan/Presbiter (Penatua, Diaken)".
 *
 * Source: Gate 3 Step 2 v1.1 §3 Person Model.
 */
export const PersonType = {
  /** Pendeta — Organik / Non-Organik. Eligible: KMJ, PJ. */
  PENDETA: 'PENDETA',
  /** Pelayan Presbiter — Penatua, Diaken. 5-year term, elected. Eligible: Sekretaris, Bendahara, BP Mupel. */
  PELAYAN_PRESBITER: 'PELAYAN_PRESBITER',
  /** Pelayan Pelaksana — Non-Penatua/Diaken. 2.5-year term, Komisi only. NOT eligible for structural roles. */
  PELAYAN_PELAKSANA: 'PELAYAN_PELAKSANA',
  /** Relawan — skill-based, not organizationally bound. NOT eligible for any Organizational Role. */
  RELAWAN: 'RELAWAN',
} as const;

export type PersonType = (typeof PersonType)[keyof typeof PersonType];

/**
 * System Role — Authorization Profile — "What capacity do you hold in the app?"
 *
 * CHG-01: Expanded from 8 legacy roles to 9 Authorization Profiles.
 * These are authorization capacities, NOT organizational identities.
 *
 * Legacy mapping (traceability only — do NOT use legacy names in code):
 *   super_user   → SUPER_ADMIN
 *   admin_mupel  → ADMIN
 *   kmj          → APPROVER
 *   pj           → EXECUTOR
 *   pendeta      → MINISTRY (non-KMJ/PJ) / APPROVER / EXECUTOR (by assignment)
 *   pelayan      → ADMINISTRATOR (Presbiter) / CONTRIBUTOR (Pelaksana)
 *   relawan      → VOLUNTEER
 *   user         → VIEWER
 *
 * Source: Gate 3 Step 2 v1.1 §4 System Role Mapping.
 * ID-04: effective_system_role is the SINGLE SOURCE for system role.
 */
export const SystemRole = {
  /** Full system control. Global scope. Holds person.mutate, org.elevate_status, aid.approve.step_2. */
  SUPER_ADMIN: 'SUPER_ADMIN',
  /** Mupel coordination. Read-only Aid visibility. Holds person.assign (Mupel scope). */
  ADMIN: 'ADMIN',
  /** KMJ — Jemaat approval & managerial authority. Holds aid.approve.step_1, aid.reject (step 1). */
  APPROVER: 'APPROVER',
  /** PJ / Kepala Pos — Pos operational & managerial authority. Holds aid.create, aid.submit, demography.upsert. */
  EXECUTOR: 'EXECUTOR',
  /** Pendeta without structural position — pastoral base + self-access. */
  MINISTRY: 'MINISTRY',
  /** Presbiter (Penatua/Diaken) as Sekretaris/Bendahara — Jemaat administrative authority. */
  ADMINISTRATOR: 'ADMINISTRATOR',
  /** Pelaksana Komisi (Non-Presbiter) — pastoral.create + pastoral.read ONLY. */
  CONTRIBUTOR: 'CONTRIBUTOR',
  /** Relawan — skill-based, very limited task-specific access. */
  VOLUNTEER: 'VOLUNTEER',
  /** Read-only observer. */
  VIEWER: 'VIEWER',
} as const;

export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];

/**
 * Context Level — Execution Scope hierarchy.
 *
 * Source: Gate 3 Step 1 §1 Context Hierarchy.
 * VC-04: Context ≠ Organization Entity (shared physical source, distinct ontology).
 */
export const ContextLevel = {
  /** LEVEL 0 — Global Scope. Implicit physical representation (SUPER_ADMIN). */
  SINODE: 'SINODE',
  /** LEVEL 1 — Regional Scope. Physical source: m_mupel. */
  MUPEL: 'MUPEL',
  /** LEVEL 2 — Local Church Scope. Physical source: m_jemaat_induk. */
  JEMAAT: 'JEMAAT',
  /** LEVEL 3 — Outpost Scope. Physical source: m_pos_pelkes. */
  POS: 'POS',
} as const;

export type ContextLevel = (typeof ContextLevel)[keyof typeof ContextLevel];

/**
 * Organizational Role — "In what capacity does this person work in the organization?"
 *
 * VC-01: Organizational Role ≠ System Role.
 * AD-G3-02-02: No Direct Role Equivalence.
 *
 * These are business positions, NOT authorization profiles.
 */
export const OrganizationalRole = {
  KMJ: 'KMJ',
  PJ: 'PJ',
  PJ_POS: 'PJ_POS',
  SEKRETARIS_JEMAAT: 'SEKRETARIS_JEMAAT',
  BENDAHARA_JEMAAT: 'BENDAHARA_JEMAAT',
  KETUA_BP_MUPEL: 'KETUA_BP_MUPEL',
  ANGGOTA_BP_MUPEL: 'ANGGOTA_BP_MUPEL',
  ADMIN_MUPEL: 'ADMIN_MUPEL',
  ANGGOTA_KOMISI: 'ANGGOTA_KOMISI',
} as const;

export type OrganizationalRole =
  (typeof OrganizationalRole)[keyof typeof OrganizationalRole];

/**
 * Base Identity — resolved by IIdentityResolver (Gate 1B).
 *
 * PR-04: Person ≠ User Account. Relation is 0..1.
 * ADR-UX-004: Person without Account is VALID.
 */
export interface BaseIdentity {
  /** User Account ID (System Identity). */
  readonly userId: string;
  /** Linked Person ID (Business Identity). Null if no Person linkage. */
  readonly personId: string | null;
  /** Person Type / Ministry Identity. Null if no Person linkage. */
  readonly personType: PersonType | null;
}

/**
 * Role Binding — resolved by IRoleBindingResolver (Gate 1B).
 *
 * ID-04: effectiveSystemRole is the SINGLE SOURCE for system role.
 * CI-G3-02-03: Effective Role is contextual.
 * AD-G3-02-03: Assignment as Scope Bridge.
 */
export interface RoleBinding {
  /** The contextual effective System Role (Authorization Profile). */
  readonly effectiveSystemRole: SystemRole;
  /** Organizational Roles held in this context (for audit / L8 traceability). */
  readonly organizationalRoles: ReadonlyArray<OrganizationalRole>;
  /** The Assignment that grants this role in this context (SA-08 traceability). */
  readonly assignmentId: string;
}
