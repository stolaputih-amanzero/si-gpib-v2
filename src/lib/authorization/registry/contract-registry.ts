/**
 * src/lib/authorization/registry/contract-registry.ts
 *
 * Contract Registry — the 41 frozen Operation Contracts.
 *
 * Ontological authority:
 *   - Gate 1A Contract Registry (41/41) v2 — AMENDED by CHG-01
 *   - Gate 3 Step 3 v1.3-FINAL-R1.2 — AMENDED by CHG-01
 *
 * Integrity constraints:
 *   - Integrity Test #2: Contract count = 41
 *   - Integrity Test #3: Permission-Contract 1:1 mapping
 *   - Integrity Test #4: Status distribution = 40 ACTIVE + 1 UNRESOLVED + 0 DEFERRED
 *   - Integrity Test #5: A-1 UNRESOLVED boundary (OC-PERSON-007)
 *   - Integrity Test #16: Contract/Permission bijection
 *
 * REG-01: Registry is immutable.
 * REG-02: Registry is declarative, NO logic.
 * REG-03: No authorization logic in registry (Integrity Test #9).
 * REG-04: Execution metadata separation (Integrity Test #10).
 *
 * CHG-01 amendments applied:
 *   - OC-AID-005: actor admin_mupel → SUPER_ADMIN; context MUPEL → SINODE
 *   - OC-AID-006: step 2 actor admin_mupel → SUPER_ADMIN; step 2 context → SINODE
 *   - Aid lifecycle states: Pending_Mupel → Pending_Sinode; Disetujui_Mupel → Disetujui_Sinode
 *   - SystemRole uses 9 Authorization Profiles (Gate 3 Step 2 v1.1)
 */

import type { ContractRegistryEntry } from '../types/contract.types';
import { SystemRole } from '../types/identity.types';
import { ContextLevel } from '../types/identity.types';

/**
 * Aid Request lifecycle states — CHG-01 amended.
 *
 * CHG-01 (D-15): Pending_Mupel → Pending_Sinode; Disetujui_Mupel → Disetujui_Sinode.
 * Mupel has NO Aid authority (coordination only, D-18).
 *
 * G-3: State Transition ≠ Authorization. These are lifecycle metadata,
 * referenced by L5 Lifecycle Constraints, not authorization rules themselves.
 */
export const AidLifecycleState = {
  DRAFT: 'Draft',
  PENDING_KMJ: 'Pending_KMJ',
  PENDING_SINODE: 'Pending_Sinode',
  APPROVED: 'Disetujui_Sinode',
  REJECTED: 'Ditolak',
} as const;

/**
 * THE FROZEN CONTRACT REGISTRY — 41 Contracts.
 *
 * Integrity Test #2: count === 41.
 * Integrity Test #4: 40 ACTIVE + 1 UNRESOLVED.
 * Integrity Test #3/#16: 1:1 bijection with PERMISSION_REGISTRY.
 *
 * IMMUTABLE (REG-01) and DECLARATIVE (REG-02). No logic (REG-03).
 */
export const CONTRACT_REGISTRY: ReadonlyArray<ContractRegistryEntry> = [
  // ════════════════════════════════════════════════════════════════
  // ORGANIZATIONAL (4) — OC-ORG-001 … OC-ORG-004
  // ════════════════════════════════════════════════════════════════
  {
    contractId: 'OC-ORG-001',
    permissionId: 'org.create',
    status: 'ACTIVE',
    description: 'Create organization entity. Sinode exclusive.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN],
      L3_Context: [ContextLevel.SINODE],
    },
  },
  {
    contractId: 'OC-ORG-002',
    permissionId: 'org.update_profile',
    status: 'ACTIVE',
    description: 'Update organization profile. KMJ at Jemaat, PJ at Pos, Presbiter at Jemaat, Admin at Mupel.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.ADMINISTRATOR,
      ],
      L3_Context: [ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-ORG-003',
    permissionId: 'org.elevate_status',
    status: 'ACTIVE',
    description: 'Elevate organization status (Pos→Bajem→Jemaat). Sinode exclusive, non-delegable (D-04).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN],
      L3_Context: [ContextLevel.SINODE],
    },
  },
  {
    contractId: 'OC-ORG-004',
    permissionId: 'org.read',
    status: 'ACTIVE',
    description: 'Read organization data. Contextual by assignment.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
        SystemRole.VOLUNTEER,
        SystemRole.VIEWER,
      ],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },

  // ════════════════════════════════════════════════════════════════
  // PERSON (7) — OC-PERSON-001 … OC-PERSON-007
  // ════════════════════════════════════════════════════════════════
  {
    contractId: 'OC-PERSON-001',
    permissionId: 'person.create',
    status: 'ACTIVE',
    description: 'Create Person record. Admin-level operation.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.ADMIN],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT],
    },
  },
  {
    contractId: 'OC-PERSON-002',
    permissionId: 'person.update',
    status: 'ACTIVE',
    description: 'Update Person data. Self-access allowed via L4.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
        SystemRole.VOLUNTEER,
      ],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-PERSON-003',
    permissionId: 'person.mutate',
    status: 'ACTIVE',
    description: 'Mutate/transfer Pendeta. Sinode exclusive, non-delegable (D-04).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN],
      L3_Context: [ContextLevel.SINODE],
    },
  },
  {
    contractId: 'OC-PERSON-004',
    permissionId: 'person.assign',
    status: 'ACTIVE',
    description: 'Assign Person to context/position. Admin-level operation.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.ADMIN],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL],
    },
  },
  {
    contractId: 'OC-PERSON-005',
    permissionId: 'person.read',
    status: 'ACTIVE',
    description: 'Read Person data. Contextual by assignment.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
        SystemRole.VOLUNTEER,
        SystemRole.VIEWER,
      ],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-PERSON-006',
    permissionId: 'person.update_family',
    status: 'ACTIVE',
    description: 'Update family members. Self-access for Pendeta (L4: is_self).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.MINISTRY],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
      L4_Relationship: { requiredRelationship: 'is_self' },
    },
  },
  {
    // ── A-1 BOUNDARY ─────────────────────────────────────────────
    // OC-PERSON-007 is UNRESOLVED.
    // CR-R2: UNRESOLVED → Contract Resolution Failure.
    // ENG-07: UNRESOLVED is NEVER evaluated.
    // SA-A1: MUST NOT be converted by inference.
    // PIP-05: NO RLS policy. PIP-15: NOT in enforceContract().
    // PIP-16: MUST NOT be changed via implementation.
    // Part 4 §2: NO inferred ALLOW/DENY/permission/RLS/enforcement/error code/UI restriction.
    // ───────────────────────────────────────────────────────────────
    contractId: 'OC-PERSON-007',
    permissionId: 'person.update_competency',
    status: 'UNRESOLVED',
    description: 'UNRESOLVED (A-1). No enforcement, no RLS, no inferred behavior. Requires formal change-management (CHG-01) to resolve.',
    // NO dimensions — UNRESOLVED contracts have no enforcement dimensions.
  },

  // ════════════════════════════════════════════════════════════════
  // PASTORAL (6) — OC-PASTORAL-001 … OC-PASTORAL-006
  // ════════════════════════════════════════════════════════════════
  {
    contractId: 'OC-PASTORAL-001',
    permissionId: 'pastoral.create',
    status: 'ACTIVE',
    description: 'Create pastoral log. Granted to all ministry personas including CONTRIBUTOR.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
      ],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-PASTORAL-002',
    permissionId: 'pastoral.update',
    status: 'ACTIVE',
    description: 'Update pastoral log. Creator/owner via L4.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
      ],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
      L4_Relationship: { requiredRelationship: 'creator' },
    },
  },
  {
    contractId: 'OC-PASTORAL-003',
    permissionId: 'pastoral.delete',
    status: 'ACTIVE',
    description: 'Delete pastoral log. NOT granted to CONTRIBUTOR (D-12).',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
      ],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-PASTORAL-004',
    permissionId: 'pastoral.read',
    status: 'ACTIVE',
    description: 'Read pastoral logs. Contextual by assignment.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
        SystemRole.VOLUNTEER,
        SystemRole.VIEWER,
      ],
      L3_Context: [ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-PASTORAL-005',
    permissionId: 'schedule.create',
    status: 'ACTIVE',
    description: 'Create worship schedule. KMJ and PJ.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-PASTORAL-006',
    permissionId: 'schedule.update',
    status: 'ACTIVE',
    description: 'Update worship schedule. KMJ and PJ.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },

  // ════════════════════════════════════════════════════════════════
  // ASSET (5) — OC-ASSET-001 … OC-ASSET-005
  // ════════════════════════════════════════════════════════════════
  {
    contractId: 'OC-ASSET-001',
    permissionId: 'asset.create',
    status: 'ACTIVE',
    description: 'Create asset record. KMJ, PJ, Presbiter.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.ADMINISTRATOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-ASSET-002',
    permissionId: 'asset.update',
    status: 'ACTIVE',
    description: 'Update asset record. KMJ, PJ, Presbiter.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.ADMINISTRATOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-ASSET-003',
    permissionId: 'asset.delete',
    status: 'ACTIVE',
    description: 'Delete asset record. KMJ, PJ (not Presbiter).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-ASSET-004',
    permissionId: 'asset.read',
    status: 'ACTIVE',
    description: 'Read asset data. Contextual by assignment.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
        SystemRole.VIEWER,
      ],
      L3_Context: [ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-ASSET-005',
    permissionId: 'asset.upload_attachment',
    status: 'ACTIVE',
    description: 'Upload asset attachment (G-4: Attachment Permission Separation).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.ADMINISTRATOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },

  // ════════════════════════════════════════════════════════════════
  // TERRITORY (4) — OC-TERRITORY-001 … OC-TERRITORY-004
  // ════════════════════════════════════════════════════════════════
  {
    contractId: 'OC-TERRITORY-001',
    permissionId: 'territory.create_risk',
    status: 'ACTIVE',
    description: 'Create territory risk point.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.ADMINISTRATOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-TERRITORY-002',
    permissionId: 'territory.create_potential',
    status: 'ACTIVE',
    description: 'Create territory potential point.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.ADMINISTRATOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-TERRITORY-003',
    permissionId: 'territory.update',
    status: 'ACTIVE',
    description: 'Update territory data.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.ADMINISTRATOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-TERRITORY-004',
    permissionId: 'territory.upload_attachment',
    status: 'ACTIVE',
    description: 'Upload territory attachment (G-4).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.ADMINISTRATOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },

  // ════════════════════════════════════════════════════════════════
  // DEMOGRAPHY (2) — OC-DEMO-001, OC-DEMO-002
  // ════════════════════════════════════════════════════════════════
  {
    contractId: 'OC-DEMO-001',
    permissionId: 'demography.upsert',
    status: 'ACTIVE',
    description: 'Upsert demography statistics. Granted to EXECUTOR (D-19).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER, SystemRole.EXECUTOR, SystemRole.ADMINISTRATOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-DEMO-002',
    permissionId: 'demography.read',
    status: 'ACTIVE',
    description: 'Read demography data.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
        SystemRole.VIEWER,
      ],
      L3_Context: [ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },

  // ════════════════════════════════════════════════════════════════
  // AID & WORKFLOW (7) — OC-AID-001 … OC-AID-007
  // CHG-01 AMENDMENTS APPLIED HERE
  // ════════════════════════════════════════════════════════════════
  {
    contractId: 'OC-AID-001',
    permissionId: 'aid.create',
    status: 'ACTIVE',
    description: 'Create aid request. EXECUTOR primary, APPROVER fallback (if no PJ).',
    dimensions: {
      L2_Actor: [SystemRole.APPROVER, SystemRole.EXECUTOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
    },
  },
  {
    contractId: 'OC-AID-002',
    permissionId: 'aid.update',
    status: 'ACTIVE',
    description: 'Update aid request draft. Creator via L4.',
    dimensions: {
      L2_Actor: [SystemRole.APPROVER, SystemRole.EXECUTOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
      L4_Relationship: { requiredRelationship: 'creator' },
    },
  },
  {
    contractId: 'OC-AID-003',
    permissionId: 'aid.submit',
    status: 'ACTIVE',
    description: 'Submit aid request to KMJ.',
    dimensions: {
      L2_Actor: [SystemRole.APPROVER, SystemRole.EXECUTOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
      L4_Relationship: { requiredRelationship: 'creator' },
    },
  },
  {
    contractId: 'OC-AID-004',
    permissionId: 'aid.approve.step_1',
    status: 'ACTIVE',
    description: 'Approve aid step 1 (KMJ at JEMAAT).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER],
      L3_Context: [ContextLevel.JEMAAT],
      L5_Lifecycle: { requiredState: AidLifecycleState.PENDING_KMJ },
    },
  },
  {
    contractId: 'OC-AID-005',
    permissionId: 'aid.approve.step_2',
    status: 'ACTIVE',
    description: 'Approve aid step 2 (Sinode at GLOBAL). CHG-01 amended.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN],
      L3_Context: [ContextLevel.SINODE],
      L5_Lifecycle: { requiredState: AidLifecycleState.PENDING_SINODE },
    },
  },
  {
    contractId: 'OC-AID-006',
    permissionId: 'aid.reject',
    status: 'ACTIVE',
    description: 'Reject aid request (KMJ or Sinode).',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.APPROVER],
      L3_Context: [ContextLevel.SINODE, ContextLevel.JEMAAT],
      L5_Lifecycle: { allowedStates: [AidLifecycleState.PENDING_KMJ, AidLifecycleState.PENDING_SINODE] },
    },
  },
  {
    contractId: 'OC-AID-007',
    permissionId: 'aid.resubmit',
    status: 'ACTIVE',
    description: 'Resubmit aid request after rejection (creator).',
    dimensions: {
      L2_Actor: [SystemRole.APPROVER, SystemRole.EXECUTOR],
      L3_Context: [ContextLevel.JEMAAT, ContextLevel.POS],
      L4_Relationship: { requiredRelationship: 'creator' },
      L5_Lifecycle: { requiredState: AidLifecycleState.REJECTED },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // USER & SECURITY (6) — OC-USER-001 … OC-USER-006
  // ════════════════════════════════════════════════════════════════
  {
    contractId: 'OC-USER-001',
    permissionId: 'user.create',
    status: 'ACTIVE',
    description: 'Create user account. Admin-level operation.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.ADMIN],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT],
    },
  },
  {
    contractId: 'OC-USER-002',
    permissionId: 'user.update_role',
    status: 'ACTIVE',
    description: 'Update user role. Admin-level operation.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.ADMIN],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT],
    },
  },
  {
    contractId: 'OC-USER-003',
    permissionId: 'user.update_status',
    status: 'ACTIVE',
    description: 'Update user status.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.ADMIN],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT],
    },
  },
  {
    contractId: 'OC-USER-004',
    permissionId: 'user.delete',
    status: 'ACTIVE',
    description: 'Delete user account.',
    dimensions: {
      L2_Actor: [SystemRole.SUPER_ADMIN, SystemRole.ADMIN],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT],
    },
  },
  {
    contractId: 'OC-USER-005',
    permissionId: 'user.update_own_profile',
    status: 'ACTIVE',
    description: 'Update own profile.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
        SystemRole.VOLUNTEER,
        SystemRole.VIEWER,
      ],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
      L4_Relationship: { requiredRelationship: 'is_self' },
    },
  },
  {
    contractId: 'OC-USER-006',
    permissionId: 'user.toggle_biometric',
    status: 'ACTIVE',
    description: 'Toggle biometric authentication.',
    dimensions: {
      L2_Actor: [
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMIN,
        SystemRole.APPROVER,
        SystemRole.EXECUTOR,
        SystemRole.MINISTRY,
        SystemRole.ADMINISTRATOR,
        SystemRole.CONTRIBUTOR,
        SystemRole.VOLUNTEER,
        SystemRole.VIEWER,
      ],
      L3_Context: [ContextLevel.SINODE, ContextLevel.MUPEL, ContextLevel.JEMAAT, ContextLevel.POS],
      L4_Relationship: { requiredRelationship: 'is_self' },
    },
  },
] as const;
