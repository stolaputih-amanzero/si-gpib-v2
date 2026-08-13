/**
 * src/lib/authorization/__tests__/resolvers/contract-resolver.test.ts
 *
 * Contract Resolver tests (in-memory, no DB).
 *
 * CR-01: Every request MUST reference exactly one Contract ID.
 * CR-02: Invalid/unresolvable Contract → NO Authorization Decision.
 * CR-03: UNRESOLVED contracts → NOT evaluated.
 * CR-R2: UNRESOLVED/DEFERRED → Contract Resolution Failure.
 * ENG-07: UNRESOLVED contracts are NEVER evaluated.
 */

import { describe, it, expect } from 'vitest';
import { InMemoryContractResolver } from '../../engine/contract-resolver';
import { isResolutionFailure } from '../../engine/resolver.types';

describe('Contract Resolver (In-Memory)', () => {
  const resolver = new InMemoryContractResolver();

  it('CR-01: should resolve a valid ACTIVE contract', async () => {
    const result = await resolver.resolveContract('OC-AID-004');

    expect(isResolutionFailure(result)).toBe(false);

    if (!isResolutionFailure(result)) {
      expect(result.contractId).toBe('OC-AID-004');
      expect(result.permissionId).toBe('aid.approve.step_1');
      expect(result.status).toBe('ACTIVE');
      expect(result.dimensions).toBeDefined();
    }
  });

  it('CR-R2: should return CONTRACT_UNRESOLVED for OC-PERSON-007 (A-1)', async () => {
    const result = await resolver.resolveContract('OC-PERSON-007');

    expect(isResolutionFailure(result)).toBe(true);

    if (isResolutionFailure(result)) {
      expect(result.failureType).toBe('CONTRACT_UNRESOLVED');
      expect(result.diagnosticMessage).toContain('UNRESOLVED');
      expect(result.diagnosticMessage).toContain('A-1');
    }
  });

  it('CR-R3: should return CONTRACT_NOT_FOUND for non-existent contract', async () => {
    // This test uses a type-valid but non-existent Contract ID.
    // In TypeScript, this would be a type error, but we test the runtime behavior.
    const result = await resolver.resolveContract('OC-INVALID-999' as any);

    expect(isResolutionFailure(result)).toBe(true);

    if (isResolutionFailure(result)) {
      expect(result.failureType).toBe('CONTRACT_NOT_FOUND');
    }
  });

  it('ENG-07: UNRESOLVED contract MUST NOT produce ContractInstance', async () => {
    const result = await resolver.resolveContract('OC-PERSON-007');

    // The result MUST be a ResolutionFailure, not a ContractInstance.
    expect(isResolutionFailure(result)).toBe(true);

    if (isResolutionFailure(result)) {
      // FAIL-03: No Decision, No Error Code.
      expect(result).not.toHaveProperty('errorCode');
      expect(result).not.toHaveProperty('decision');
    }
  });

  it('CHG-01: OC-AID-005 should resolve with SUPER_ADMIN and SINODE', async () => {
    const result = await resolver.resolveContract('OC-AID-005');

    expect(isResolutionFailure(result)).toBe(false);

    if (!isResolutionFailure(result)) {
      expect(result.dimensions.L2_Actor).toContain('SUPER_ADMIN');
      expect(result.dimensions.L3_Context).toContain('SINODE');
    }
  });
});
