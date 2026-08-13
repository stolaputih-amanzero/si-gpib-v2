/**
 * src/lib/authorization/registry/permission-registry.ts
 *
 * Permission Registry — the 41 frozen Permission Atoms.
 *
 * Ontological authority:
 *   - Gate 3 Step 3 §3 Permission Registry (41 IDs)
 *   - Integrity Test #1: Permission count = 41
 *   - Integrity Test #7: Permission IDs match registry
 *
 * REG-01: Registry is immutable.
 * REG-02: Registry is declarative, NO logic.
 * REG-03: No authorization logic in registry (Integrity Test #9).
 * AUTH-03: Permission Authority derives from this registry.
 *
 * CHG-01: Permission Registry is UNCHANGED (41 atoms preserved).
 * Only actor/context mapping changed (in contract-registry.ts).
 */

import type { PermissionId } from '../types/contract.types';

/**
 * Domain grouping for documentation/traceability only.
 * This is metadata, NOT authorization logic (REG-02, Integrity Test #9).
 */
export const PermissionDomain = {
  ORGANIZATIONAL: 'ORGANIZATIONAL',
  PERSON: 'PERSON',
  PASTORAL: 'PASTORAL',
  ASSET: 'ASSET',
  TERRITORY: 'TERRITORY',
  DEMOGRAPHY: 'DEMOGRAPHY',
  AID_WORKFLOW: 'AID_WORKFLOW',
  USER_SECURITY: 'USER_SECURITY',
} as const;

export type PermissionDomain =
  (typeof PermissionDomain)[keyof typeof PermissionDomain];

export interface PermissionRegistryEntry {
  readonly id: PermissionId;
  readonly domain: PermissionDomain;
  /** Human-readable description (documentation only). */
  readonly description: string;
}

/**
 * THE FROZEN PERMISSION REGISTRY — 41 Atoms.
 *
 * Integrity Test #1: count === 41.
 * Integrity Test #7: IDs match Gate 3 Step 3 §3.
 *
 * This array is the single source of truth for permission atoms.
 * It is IMMUTABLE (REG-01) and DECLARATIVE (REG-02).
 */
export const PERMISSION_REGISTRY: ReadonlyArray<PermissionRegistryEntry> = [
  // ── Organizational (4) ────────────────────────────────────────────
  { id: 'org.create', domain: 'ORGANIZATIONAL', description: 'Create a new organization entity.' },
  { id: 'org.update_profile', domain: 'ORGANIZATIONAL', description: 'Update organization profile.' },
  { id: 'org.elevate_status', domain: 'ORGANIZATIONAL', description: 'Elevate organization status (Pos→Bajem→Jemaat). Sinode exclusive (D-04).' },
  { id: 'org.read', domain: 'ORGANIZATIONAL', description: 'Read organization data.' },

  // ── Person (7) ────────────────────────────────────────────────────
  { id: 'person.create', domain: 'PERSON', description: 'Create a new Person record.' },
  { id: 'person.update', domain: 'PERSON', description: 'Update Person data.' },
  { id: 'person.mutate', domain: 'PERSON', description: 'Mutate/transfer Pendeta. Sinode exclusive (D-04).' },
  { id: 'person.assign', domain: 'PERSON', description: 'Assign Person to a context/position.' },
  { id: 'person.read', domain: 'PERSON', description: 'Read Person data.' },
  { id: 'person.update_family', domain: 'PERSON', description: 'Update family members (self-access for Pendeta).' },
  { id: 'person.update_competency', domain: 'PERSON', description: 'Update competency. UNRESOLVED (A-1 / OC-PERSON-007).' },

  // ── Pastoral (6) ──────────────────────────────────────────────────
  { id: 'pastoral.create', domain: 'PASTORAL', description: 'Create pastoral log.' },
  { id: 'pastoral.update', domain: 'PASTORAL', description: 'Update pastoral log.' },
  { id: 'pastoral.delete', domain: 'PASTORAL', description: 'Delete pastoral log. NOT granted to CONTRIBUTOR (D-12).' },
  { id: 'pastoral.read', domain: 'PASTORAL', description: 'Read pastoral logs.' },
  { id: 'schedule.create', domain: 'PASTORAL', description: 'Create worship schedule.' },
  { id: 'schedule.update', domain: 'PASTORAL', description: 'Update worship schedule.' },

  // ── Asset (5) ─────────────────────────────────────────────────────
  { id: 'asset.create', domain: 'ASSET', description: 'Create asset record.' },
  { id: 'asset.update', domain: 'ASSET', description: 'Update asset record.' },
  { id: 'asset.delete', domain: 'ASSET', description: 'Delete asset record.' },
  { id: 'asset.read', domain: 'ASSET', description: 'Read asset data.' },
  { id: 'asset.upload_attachment', domain: 'ASSET', description: 'Upload asset attachment (G-4).' },

  // ── Territory (4) ─────────────────────────────────────────────────
  { id: 'territory.create_risk', domain: 'TERRITORY', description: 'Create territory risk point.' },
  { id: 'territory.create_potential', domain: 'TERRITORY', description: 'Create territory potential point.' },
  { id: 'territory.update', domain: 'TERRITORY', description: 'Update territory data.' },
  { id: 'territory.upload_attachment', domain: 'TERRITORY', description: 'Upload territory attachment (G-4).' },

  // ── Demography (2) ────────────────────────────────────────────────
  { id: 'demography.upsert', domain: 'DEMOGRAPHY', description: 'Upsert demography statistics. Granted to EXECUTOR (D-19).' },
  { id: 'demography.read', domain: 'DEMOGRAPHY', description: 'Read demography data.' },

  // ── Aid & Workflow (7) ────────────────────────────────────────────
  { id: 'aid.create', domain: 'AID_WORKFLOW', description: 'Create aid request (PJ primary, KMJ fallback).' },
  { id: 'aid.update', domain: 'AID_WORKFLOW', description: 'Update aid request draft.' },
  { id: 'aid.submit', domain: 'AID_WORKFLOW', description: 'Submit aid request (PJ primary, KMJ fallback).' },
  { id: 'aid.approve.step_1', domain: 'AID_WORKFLOW', description: 'Approve aid step 1 (KMJ at JEMAAT).' },
  { id: 'aid.approve.step_2', domain: 'AID_WORKFLOW', description: 'Approve aid step 2 (Sinode at GLOBAL). CHG-01: moved from Mupel to Sinode.' },
  { id: 'aid.reject', domain: 'AID_WORKFLOW', description: 'Reject aid request (KMJ step 1, Sinode step 2). CHG-01: step 2 moved to Sinode.' },
  { id: 'aid.resubmit', domain: 'AID_WORKFLOW', description: 'Resubmit aid request after rejection (creator).' },

  // ── User & Security (6) ───────────────────────────────────────────
  { id: 'user.create', domain: 'USER_SECURITY', description: 'Create user account.' },
  { id: 'user.update_role', domain: 'USER_SECURITY', description: 'Update user role.' },
  { id: 'user.update_status', domain: 'USER_SECURITY', description: 'Update user status.' },
  { id: 'user.delete', domain: 'USER_SECURITY', description: 'Delete user account.' },
  { id: 'user.update_own_profile', domain: 'USER_SECURITY', description: 'Update own profile (self-access).' },
  { id: 'user.toggle_biometric', domain: 'USER_SECURITY', description: 'Toggle biometric/passkey (self-access).' },
] as const;

/**
 * Derived immutable set of all Permission IDs.
 * Used for Integrity Test #1 (count = 41) and #7 (ID validation).
 */
export const PERMISSION_IDS: ReadonlyArray<PermissionId> =
  PERMISSION_REGISTRY.map((entry) => entry.id);

/** Total permission count. MUST equal 41 (Integrity Test #1). */
export const PERMISSION_COUNT: number = PERMISSION_REGISTRY.length;
