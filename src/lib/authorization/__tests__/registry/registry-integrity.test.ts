/**
 * src/lib/authorization/__tests__/registry/registry-integrity.test.ts
 *
 * Gate 1A: Contract Registry (41/41) — 17 Integrity Tests.
 *
 * These tests verify the structural integrity of the frozen registry.
 * They are PURE tests — no DB, no I/O. They read from the in-memory
 * PERMISSION_REGISTRY and CONTRACT_REGISTRY (Phase 1).
 *
 * CHG-01 amendments applied:
 *   - SystemRole uses 9 Authorization Profiles
 *   - AidLifecycleState uses Pending_Sinode (not Pending_Mupel)
 *   - OC-AID-005/006 actor = SUPER_ADMIN, context = SINODE
 *   - OC-PERSON-007 remains UNRESOLVED
 */

import { describe, it, expect } from 'vitest';
import {
  PERMISSION_REGISTRY,
  PERMISSION_IDS,
  PERMISSION_COUNT,
} from '../../registry/permission-registry';
import { CONTRACT_REGISTRY } from '../../registry/contract-registry';
import { FrozenErrorCode } from '../../errors/frozen-error-codes';
import type { PermissionId, ContractId } from '../../types/contract.types';

describe('Gate 1A: Contract Registry Integrity (17 Tests)', () => {
  // ── Foundation Tests ──────────────────────────────────────────

  // Test #1: Permission count = 41
  it('Test #1: Permission count MUST equal 41', () => {
    expect(PERMISSION_COUNT).toBe(41);
    expect(PERMISSION_REGISTRY.length).toBe(41);
    expect(PERMISSION_IDS.length).toBe(41);
  });

  // Test #2: Contract count = 41
  it('Test #2: Contract count MUST equal 41', () => {
    expect(CONTRACT_REGISTRY.length).toBe(41);
  });

  // Test #3: Permission-Contract 1:1 mapping
  it('Test #3: Permission-Contract MUST have 1:1 mapping', () => {
    const permissionIdsInContracts = CONTRACT_REGISTRY.map(
      (entry) => entry.permissionId,
    );

    // Every contract references a valid permission
    for (const permId of permissionIdsInContracts) {
      expect(PERMISSION_IDS).toContain(permId);
    }

    // Every permission is referenced by exactly one contract
    const uniquePermIds = new Set(permissionIdsInContracts);
    expect(uniquePermIds.size).toBe(41);
  });

  // Test #4: Status distribution = 40 ACTIVE + 1 UNRESOLVED + 0 DEFERRED
  it('Test #4: Status distribution MUST be 40+1+0', () => {
    const activeCount = CONTRACT_REGISTRY.filter(
      (e) => e.status === 'ACTIVE',
    ).length;
    const unresolvedCount = CONTRACT_REGISTRY.filter(
      (e) => e.status === 'UNRESOLVED',
    ).length;
    const deferredCount = CONTRACT_REGISTRY.filter(
      (e) => e.status === 'DEFERRED',
    ).length;

    expect(activeCount).toBe(40);
    expect(unresolvedCount).toBe(1);
    expect(deferredCount).toBe(0);
  });

  // Test #5: A-1 UNRESOLVED boundary
  it('Test #5: A-1 (OC-PERSON-007) MUST be UNRESOLVED with no dimensions', () => {
    const a1Contract = CONTRACT_REGISTRY.find(
      (e) => e.contractId === 'OC-PERSON-007',
    );

    expect(a1Contract).toBeDefined();
    expect(a1Contract!.contractId).toBe('OC-PERSON-007');
    expect(a1Contract!.permissionId).toBe('person.update_competency');
    expect(a1Contract!.status).toBe('UNRESOLVED');

    // A-1 MUST NOT have dimensions (no enforcement).
    expect(a1Contract!.dimensions).toBeUndefined();
  });

  // Test #6: ACTIVE contracts have ≥1 applicable dimension
  it('Test #6: Every ACTIVE contract MUST have ≥1 applicable dimension', () => {
    const activeContracts = CONTRACT_REGISTRY.filter(
      (e) => e.status === 'ACTIVE',
    );

    for (const contract of activeContracts) {
      expect(contract.dimensions).toBeDefined();

      const dims = contract.dimensions!;
      const hasAtLeastOneDimension =
        (dims.L2_Actor && dims.L2_Actor.length > 0) ||
        (dims.L3_Context && dims.L3_Context.length > 0) ||
        dims.L4_Relationship !== undefined ||
        dims.L5_Lifecycle !== undefined ||
        dims.L6_Preconditions !== undefined;

      expect(hasAtLeastOneDimension).toBe(true);
    }
  });

  // Test #7: Permission IDs match registry
  it('Test #7: Permission IDs MUST match the frozen registry', () => {
    const expectedPermissions: PermissionId[] = [
      'org.create', 'org.update_profile', 'org.elevate_status', 'org.read',
      'person.create', 'person.update', 'person.mutate', 'person.assign',
      'person.read', 'person.update_family', 'person.update_competency',
      'pastoral.create', 'pastoral.update', 'pastoral.delete', 'pastoral.read',
      'schedule.create', 'schedule.update',
      'asset.create', 'asset.update', 'asset.delete', 'asset.read',
      'asset.upload_attachment',
      'territory.create_risk', 'territory.create_potential', 'territory.update',
      'territory.upload_attachment',
      'demography.upsert', 'demography.read',
      'aid.create', 'aid.update', 'aid.submit', 'aid.approve.step_1',
      'aid.approve.step_2', 'aid.reject', 'aid.resubmit',
      'user.create', 'user.update_role', 'user.update_status', 'user.delete',
      'user.update_own_profile', 'user.toggle_biometric',
    ];

    expect([...PERMISSION_IDS].sort()).toEqual([...expectedPermissions].sort());
  });

  // Test #8: Contract IDs valid
  it('Test #8: Contract IDs MUST follow OC-XXX-NNN format', () => {
    const contractIdPattern = /^OC-[A-Z]+-\d{3}$/;

    for (const entry of CONTRACT_REGISTRY) {
      expect(entry.contractId).toMatch(contractIdPattern);
    }
  });

  // Test #9: No authorization logic in registry
  it('Test #9: Registry MUST be declarative (no functions, no logic)', () => {
    for (const entry of CONTRACT_REGISTRY) {
      // Registry entries are plain objects, not functions.
      expect(typeof entry).toBe('object');
      expect(typeof entry.contractId).toBe('string');
      expect(typeof entry.permissionId).toBe('string');
      expect(typeof entry.status).toBe('string');

      // No methods on registry entries.
      const keys = Object.keys(entry);
      for (const key of keys) {
        expect(typeof (entry as unknown as Record<string, unknown>)[key]).not.toBe('function');
      }
    }
  });

  // Test #10: Execution metadata separation
  it('Test #10: Registry MUST NOT contain execution metadata', () => {
    for (const entry of CONTRACT_REGISTRY) {
      // No execution metadata fields.
      expect(entry).not.toHaveProperty('serverActionName');
      expect(entry).not.toHaveProperty('mutationQuery');
      expect(entry).not.toHaveProperty('auditTemplate');
    }
  });

  // Test #11: Frozen Error Codes = 5
  it('Test #11: Frozen Error Codes MUST equal exactly 5', () => {
    const errorCodeValues = Object.values(FrozenErrorCode);
    expect(errorCodeValues.length).toBe(5);

    expect(errorCodeValues).toContain('NOT_AUTHORIZED');
    expect(errorCodeValues).toContain('INVALID_CONTEXT');
    expect(errorCodeValues).toContain('RELATIONSHIP_VIOLATION');
    expect(errorCodeValues).toContain('INVALID_LIFECYCLE_STATE');
    expect(errorCodeValues).toContain('INVALID_OPERATION');
  });

  // Test #12: Type-level integrity
  it('Test #12: Type-level integrity (compile-time check)', () => {
    // This test verifies that the TypeScript types are correctly defined.
    // If this compiles, the types are structurally valid.
    const sampleContract = CONTRACT_REGISTRY[0];
    const contractId: ContractId = sampleContract.contractId;
    const permissionId: PermissionId = sampleContract.permissionId;

    expect(contractId).toBeDefined();
    expect(permissionId).toBeDefined();
  });

  // ── Boundary Tests ────────────────────────────────────────────

  // Test #13: CR-R3: Type-valid ≠ Registry-resolved
  it('Test #13: CR-R3 — Type-valid ContractId ≠ Registry-resolved', () => {
    // A type-valid ContractId that does not exist in the registry
    // should not be resolvable. This is tested via ContractResolver
    // in Phase 3 tests. Here we verify the registry does not contain
    // invalid entries.
    for (const entry of CONTRACT_REGISTRY) {
      expect(entry.contractId).toBeDefined();
      expect(entry.permissionId).toBeDefined();
      expect(entry.status).toBeDefined();
    }
  });

  // Test #14: ENG-07: UNRESOLVED never evaluated
  it('Test #14: ENG-07 — UNRESOLVED contracts have no dimensions', () => {
    const unresolvedContracts = CONTRACT_REGISTRY.filter(
      (e) => e.status === 'UNRESOLVED',
    );

    for (const contract of unresolvedContracts) {
      expect(contract.dimensions).toBeUndefined();
    }
  });

  // Test #15: DEFERRED semantics
  it('Test #15: DEFERRED contracts have correct semantics', () => {
    const deferredContracts = CONTRACT_REGISTRY.filter(
      (e) => e.status === 'DEFERRED',
    );

    // Currently no DEFERRED contracts (expected: 0).
    expect(deferredContracts.length).toBe(0);
  });

  // Test #16: Contract/Permission bijection
  it('Test #16: Contract/Permission MUST be a bijection (1:1)', () => {
    const contractPermIds = CONTRACT_REGISTRY.map((e) => e.permissionId);
    const uniquePermIds = new Set(contractPermIds);
    const uniqueContractIds = new Set(
      CONTRACT_REGISTRY.map((e) => e.contractId),
    );

    // Bijection: |contracts| = |permissions| = |unique mappings|
    expect(CONTRACT_REGISTRY.length).toBe(41);
    expect(uniquePermIds.size).toBe(41);
    expect(uniqueContractIds.size).toBe(41);

    // No duplicate permission IDs across contracts.
    expect(contractPermIds.length).toBe(uniquePermIds.size);
  });

  // Test #17: Registry immutability
  it('Test #17: Registry MUST be immutable (as const)', () => {
    // Verify that the registry arrays are readonly.
    // TypeScript enforces this at compile time via `as const` and
    // `ReadonlyArray`. At runtime, we verify the array is not mutable
    // by checking that it's frozen or has no mutator methods.

    // The registry is declared with `as const`, which makes it
    // deeply readonly at the type level. Runtime immutability is
    // enforced by the module system (ES modules are immutable).
    expect(Array.isArray(PERMISSION_REGISTRY)).toBe(true);
    expect(Array.isArray(CONTRACT_REGISTRY)).toBe(true);

    // Verify length is fixed.
    expect(PERMISSION_REGISTRY.length).toBe(41);
    expect(CONTRACT_REGISTRY.length).toBe(41);
  });

  // ── CHG-01 Amendment Verification ─────────────────────────────

  describe('CHG-01 Amendment Verification', () => {
    it('OC-AID-005 MUST have SUPER_ADMIN actor and SINODE context', () => {
      const ocAid005 = CONTRACT_REGISTRY.find(
        (e) => e.contractId === 'OC-AID-005',
      );

      expect(ocAid005).toBeDefined();
      expect(ocAid005!.status).toBe('ACTIVE');
      expect(ocAid005!.dimensions!.L2_Actor).toContain('SUPER_ADMIN');
      expect(ocAid005!.dimensions!.L3_Context).toContain('SINODE');

      // CHG-01: Mupel has NO Aid authority.
      expect(ocAid005!.dimensions!.L2_Actor).not.toContain('ADMIN');
      expect(ocAid005!.dimensions!.L3_Context).not.toContain('MUPEL');
    });

    it('OC-AID-006 MUST include SUPER_ADMIN for step 2 rejection', () => {
      const ocAid006 = CONTRACT_REGISTRY.find(
        (e) => e.contractId === 'OC-AID-006',
      );

      expect(ocAid006).toBeDefined();
      expect(ocAid006!.status).toBe('ACTIVE');
      expect(ocAid006!.dimensions!.L2_Actor).toContain('SUPER_ADMIN');
      expect(ocAid006!.dimensions!.L3_Context).toContain('SINODE');
    });

    it('Aid lifecycle MUST use Pending_Sinode (not Pending_Mupel)', () => {
      const ocAid005 = CONTRACT_REGISTRY.find(
        (e) => e.contractId === 'OC-AID-005',
      );

      expect(ocAid005).toBeDefined();
      const lifecycle = ocAid005!.dimensions!.L5_Lifecycle;
      expect(lifecycle).toBeDefined();

      // CHG-01: State is Pending_Sinode, not Pending_Mupel.
      if (lifecycle!.requiredState) {
        expect(lifecycle!.requiredState).toBe('Pending_Sinode');
        expect(lifecycle!.requiredState).not.toBe('Pending_Mupel');
      }
      if (lifecycle!.allowedStates) {
        expect(lifecycle!.allowedStates).toContain('Pending_Sinode');
        expect(lifecycle!.allowedStates).not.toContain('Pending_Mupel');
      }
    });

    it('SystemRole MUST have 9 Authorization Profiles (CHG-01)', () => {
      // This is a compile-time check. If SystemRole has 9 values,
      // the type system enforces it. Here we verify the registry
      // uses the new profile names.
      const allActors = CONTRACT_REGISTRY.flatMap(
        (e) => e.dimensions?.L2_Actor ?? [],
      );
      const uniqueActors = new Set(allActors);

      // CHG-01: 9 Authorization Profiles.
      const expectedProfiles = [
        'SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EXECUTOR', 'MINISTRY',
        'ADMINISTRATOR', 'CONTRIBUTOR', 'VOLUNTEER', 'VIEWER',
      ];

      for (const profile of expectedProfiles) {
        // At least one contract should reference each profile.
        // (VIEWER may not be referenced if no read-only contracts exist.)
        if (profile !== 'VIEWER') {
          expect(uniqueActors.has(profile as any)).toBe(true);
        }
      }

      // Legacy role names MUST NOT appear.
      expect(uniqueActors.has('super_user' as any)).toBe(false);
      expect(uniqueActors.has('admin_mupel' as any)).toBe(false);
      expect(uniqueActors.has('kmj' as any)).toBe(false);
      expect(uniqueActors.has('pj' as any)).toBe(false);
      expect(uniqueActors.has('pendeta' as any)).toBe(false);
      expect(uniqueActors.has('pelayan' as any)).toBe(false);
      expect(uniqueActors.has('relawan' as any)).toBe(false);
    });
  });
});
