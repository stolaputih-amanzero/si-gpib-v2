/**
 * src/lib/authorization/types/contract.types.ts
 *
 * Operation Contract type definitions.
 *
 * Ontological authority:
 *   - Gate 3 Step 3 v1.3-FINAL-R1.2 (Operation Contract Architecture) — AMENDED by CHG-01
 *   - Part 1 v1.3 §1 Contract Resolution Model
 *   - Gate 1A Contract Registry (41/41) v2
 *
 * AUTH-01: Contract Authority.
 * AUTH-03: Permission Authority.
 */

import type { ContextLevel, SystemRole } from './identity.types';

/**
 * Permission ID — one of the 41 frozen Permission Atoms.
 *
 * Source: Gate 3 Step 3 §3 Permission Registry (41 IDs).
 * This is a closed set. Adding a permission requires formal change-management.
 * REG-01: Registry is immutable.
 */
export type PermissionId =
  // Organizational (4)
  | 'org.create'
  | 'org.update_profile'
  | 'org.elevate_status'
  | 'org.read'
  // Person (7)
  | 'person.create'
  | 'person.update'
  | 'person.mutate'
  | 'person.assign'
  | 'person.read'
  | 'person.update_family'
  | 'person.update_competency'
  // Pastoral (6)
  | 'pastoral.create'
  | 'pastoral.update'
  | 'pastoral.delete'
  | 'pastoral.read'
  | 'schedule.create'
  | 'schedule.update'
  // Asset (5)
  | 'asset.create'
  | 'asset.update'
  | 'asset.delete'
  | 'asset.read'
  | 'asset.upload_attachment'
  // Territory (4)
  | 'territory.create_risk'
  | 'territory.create_potential'
  | 'territory.update'
  | 'territory.upload_attachment'
  // Demography (2)
  | 'demography.upsert'
  | 'demography.read'
  // Aid & Workflow (7)
  | 'aid.create'
  | 'aid.update'
  | 'aid.submit'
  | 'aid.approve.step_1'
  | 'aid.approve.step_2'
  | 'aid.reject'
  | 'aid.resubmit'
  // User & Security (6)
  | 'user.create'
  | 'user.update_role'
  | 'user.update_status'
  | 'user.delete'
  | 'user.update_own_profile'
  | 'user.toggle_biometric';

/**
 * Contract ID — one of the 41 frozen Operation Contracts.
 *
 * Source: Gate 1A Contract Registry (41/41) v2.
 * Bijection: 41 PermissionId ↔ 41 ContractId (Integrity Test #3, #16).
 * ECB-02: Contract ID MUST NOT be determined dynamically.
 * PIP-14: Dynamic Contract ID from user input is PROHIBITED.
 */
export type ContractId =
  // Organizational (4)
  | 'OC-ORG-001'
  | 'OC-ORG-002'
  | 'OC-ORG-003'
  | 'OC-ORG-004'
  // Person (7)
  | 'OC-PERSON-001'
  | 'OC-PERSON-002'
  | 'OC-PERSON-003'
  | 'OC-PERSON-004'
  | 'OC-PERSON-005'
  | 'OC-PERSON-006'
  | 'OC-PERSON-007'
  // Pastoral (6)
  | 'OC-PASTORAL-001'
  | 'OC-PASTORAL-002'
  | 'OC-PASTORAL-003'
  | 'OC-PASTORAL-004'
  | 'OC-PASTORAL-005'
  | 'OC-PASTORAL-006'
  // Asset (5)
  | 'OC-ASSET-001'
  | 'OC-ASSET-002'
  | 'OC-ASSET-003'
  | 'OC-ASSET-004'
  | 'OC-ASSET-005'
  // Territory (4)
  | 'OC-TERRITORY-001'
  | 'OC-TERRITORY-002'
  | 'OC-TERRITORY-003'
  | 'OC-TERRITORY-004'
  // Demography (2)
  | 'OC-DEMO-001'
  | 'OC-DEMO-002'
  // Aid & Workflow (7)
  | 'OC-AID-001'
  | 'OC-AID-002'
  | 'OC-AID-003'
  | 'OC-AID-004'
  | 'OC-AID-005'
  | 'OC-AID-006'
  | 'OC-AID-007'
  // User & Security (6)
  | 'OC-USER-001'
  | 'OC-USER-002'
  | 'OC-USER-003'
  | 'OC-USER-004'
  | 'OC-USER-005'
  | 'OC-USER-006';

/**
 * Contract status in the Registry.
 *
 * Source: Gate 1A §2 Registry Status Distribution.
 * ACTIVE: 40 · UNRESOLVED: 1 (OC-PERSON-007) · DEFERRED: 0
 *
 * CR-R2: UNRESOLVED/DEFERRED → Contract Resolution Failure.
 * ENG-07: UNRESOLVED contracts are NEVER evaluated.
 */
export type ContractStatus = 'ACTIVE' | 'UNRESOLVED' | 'DEFERRED';

/**
 * Relationship Constraint — L4 dimension.
 *
 * Source: Gate 3 Step 1 North Star — "Relationship determines WHY
 * the actor may cross a Context boundary."
 */
export type RelationshipType =
  | 'is_self'
  | 'creator'
  | 'owner'
  | 'family_linkage';

export interface RelationshipConstraint {
  readonly requiredRelationship: RelationshipType;
}

/**
 * Lifecycle Constraint — L5 dimension.
 *
 * G-3: State Transition ≠ Authorization.
 * RLS-04: RLS MUST NOT enforce L5 Lifecycle (Engine only).
 *
 * CHG-01: Aid state machine uses Pending_Sinode (not Pending_Mupel).
 */
export interface LifecycleConstraint {
  /** Single required state, OR use allowedStates for multiple. */
  readonly requiredState?: string;
  /** Alternative: multiple allowed states. */
  readonly allowedStates?: ReadonlyArray<string>;
}

/**
 * Operation Preconditions — L6 dimension.
 *
 * RLS-05: RLS MUST NOT enforce L6 Preconditions (Engine only).
 * PIP-15: C/D/E items MUST NOT be placed in enforceContract().
 */
export interface PreconditionConstraint {
  readonly preconditionType: string;
  readonly params?: Readonly<Record<string, unknown>>;
}

/**
 * Contract Dimensions — the L2–L6 evaluation axes.
 *
 * AUTH-04: Fixed Evaluation Order (L2 → L3 → L4 → L5 → L6).
 * PIPE-06: Only applicable dimensions evaluated; NOT APPLICABLE ≠ skipped.
 *
 * A dimension that is absent/undefined is NOT APPLICABLE for this contract.
 */
export interface ContractDimensions {
  /** L2 — Permission Eligibility. Which System Roles hold this permission. */
  readonly L2_Actor?: ReadonlyArray<SystemRole>;
  /** L3 — Context Applicability. In which context levels this operation is valid. */
  readonly L3_Context?: ReadonlyArray<ContextLevel>;
  /** L4 — Relationship Constraint (optional). */
  readonly L4_Relationship?: RelationshipConstraint;
  /** L5 — Lifecycle Constraint (optional). */
  readonly L5_Lifecycle?: LifecycleConstraint;
  /** L6 — Operation Preconditions (optional). */
  readonly L6_Preconditions?: PreconditionConstraint;
}

/**
 * Contract Instance — the runtime-resolved contract passed to the Engine.
 *
 * CR-R3: Type-valid ContractId ≠ Registry-resolved ≠ ACTIVE ≠ ALLOW.
 * Only ACTIVE contracts are resolved into ContractInstance.
 * UNRESOLVED (OC-PERSON-007) and DEFERRED contracts NEVER become ContractInstance.
 */
export interface ContractInstance {
  readonly contractId: ContractId;
  readonly permissionId: PermissionId;
  /** Always 'ACTIVE' for a resolved ContractInstance. */
  readonly status: 'ACTIVE';
  readonly dimensions: ContractDimensions;
}

/**
 * Registry Entry — the static declaration in contract-registry.ts.
 *
 * REG-02: Registry is declarative, no logic.
 * This type includes UNRESOLVED/DEFERRED entries (they exist in the registry
 * but are never resolved into ContractInstance by the ContractResolver).
 */
export interface ContractRegistryEntry {
  readonly contractId: ContractId;
  readonly permissionId: PermissionId;
  readonly status: ContractStatus;
  /** Present only for ACTIVE contracts. Absent for UNRESOLVED/DEFERRED. */
  readonly dimensions?: ContractDimensions;
  /** Human-readable description (documentation only, not evaluated). */
  readonly description?: string;
}

/**
 * Target Entity State — input for L4/L5/L6 evaluation.
 *
 * Resolved by Gate 1B Resolver before Engine invocation.
 * EB-06: Execution-time validation = technical integrity ONLY.
 */
export interface TargetEntityState {
  readonly entityId: string;
  readonly entityType: string;

  /** L4 — Relationship Constraint inputs. */
  readonly creatorPersonId?: string;
  readonly ownerPersonId?: string;

  /** L5 — Lifecycle Constraint input. */
  readonly lifecycleState?: string;

  /** L3 — Context affinity (for Downward Reach / RULE-1). */
  readonly contextAffinityId?: string;
  readonly contextAffinityLevel?: ContextLevel;

  /** Additional metadata for L4 family_linkage / L6 preconditions. */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Operation Input — passed to enforceContract() alongside ContractId.
 *
 * OPI-01: MUST NOT contain authorization decisions.
 * OPI-02: MUST NOT contain Contract ID (separate parameter).
 * OPI-03: MUST NOT contain user identity (resolved from session).
 * OPI-04: Technical integrity data, NOT authorization data.
 */
export interface OperationInput {
  readonly targetEntity?: TargetEntityState;
  readonly preconditionContext?: Readonly<Record<string, unknown>>;
}
