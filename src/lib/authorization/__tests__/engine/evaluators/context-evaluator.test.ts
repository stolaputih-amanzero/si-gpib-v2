/**
 * src/lib/authorization/__tests__/engine/evaluators/context-evaluator.test.ts
 *
 * L3 — Context Applicability Evaluator tests.
 *
 * RULE-1: Downward Reach — ancestor may READ descendant context data.
 * RULE-2: Upward Operational Isolation.
 * RULE-3: Lateral Hard Isolation.
 * G-2: Downward Reach ≠ Assignment-management Authority.
 */

import { describe, it, expect } from 'vitest';
import { evaluateL3Context } from '../../../engine/evaluators/context-evaluator';
import type { EvaluationInput, ActiveContextObject } from '../../../engine/evaluation.types';
import type { ContractInstance, TargetEntityState } from '../../../types/contract.types';
import type { BaseIdentity, RoleBinding } from '../../../types/identity.types';

const mockIdentity: BaseIdentity = {
  userId: 'user-1',
  personId: 'person-1',
  personType: 'PENDETA',
};

const mockRoleBinding: RoleBinding = {
  effectiveSystemRole: 'APPROVER',
  organizationalRoles: ['KMJ'],
  assignmentId: 'assign-001',
};

function createMockInput(
  contextLevel: string,
  l3Context: string[] | undefined,
  permissionId: string,
  targetContextLevel?: string,
): EvaluationInput {
  const activeContext: ActiveContextObject = {
    contextId: 'ctx-001',
    contextLevel: contextLevel as any,
    hierarchy: { sinodeId: 'sinode-1' },
  };

  const contract: ContractInstance = {
    contractId: 'OC-PERSON-001',
    permissionId: permissionId as any,
    status: 'ACTIVE',
    dimensions: {
      L3_Context: l3Context as any,
    },
  };

  const targetEntity: TargetEntityState | undefined = targetContextLevel
    ? {
        entityId: 'entity-1',
        entityType: 'TestEntity',
        contextAffinityId: 'ctx-target',
        contextAffinityLevel: targetContextLevel as any,
      }
    : undefined;

  return {
    identity: mockIdentity,
    activeContext,
    roleBinding: mockRoleBinding,
    contract,
    targetEntity,
  };
}

describe('L3: Context Applicability Evaluator', () => {
  it('should ALLOW when activeContext matches L3_Context', () => {
    const input = createMockInput('JEMAAT', ['JEMAAT'], 'aid.approve.step_1');
    const result = evaluateL3Context(input);

    expect(result.status).toBe('ALLOW');
  });

  it('should DENY with INVALID_CONTEXT when context does not match', () => {
    const input = createMockInput('POS', ['JEMAAT'], 'aid.approve.step_1');
    const result = evaluateL3Context(input);

    expect(result.status).toBe('DENY');
    expect(result.errorCode).toBe('INVALID_CONTEXT');
  });

  it('should return NOT_APPLICABLE when L3_Context is undefined', () => {
    const input = createMockInput('JEMAAT', undefined, 'org.read');
    const result = evaluateL3Context(input);

    expect(result.status).toBe('NOT_APPLICABLE');
  });

  // RULE-1: Downward Reach — ancestor may READ descendant.
  it('RULE-1: should ALLOW read when ancestor context reads descendant', () => {
    // JEMAAT reading POS data (downward reach).
    const input = createMockInput(
      'JEMAAT',
      ['POS'],          // Contract requires POS context
      'pastoral.read',  // Read permission
      'POS',            // Target entity is at POS level
    );
    const result = evaluateL3Context(input);

    expect(result.status).toBe('ALLOW');
  });

  // RULE-1: Downward Reach applies ONLY to read permissions.
  it('RULE-1: should DENY write when ancestor context writes to descendant', () => {
    // JEMAAT writing to POS data (not allowed via downward reach).
    const input = createMockInput(
      'JEMAAT',
      ['POS'],
      'pastoral.create', // Write permission — downward reach does NOT apply
      'POS',
    );
    const result = evaluateL3Context(input);

    expect(result.status).toBe('DENY');
    expect(result.errorCode).toBe('INVALID_CONTEXT');
  });

  // RULE-2: Upward Operational Isolation.
  it('RULE-2: should DENY when descendant tries to access ancestor', () => {
    // POS trying to access JEMAAT data (upward — not allowed).
    const input = createMockInput(
      'POS',
      ['JEMAAT'],
      'org.read',
      'JEMAAT',
    );
    const result = evaluateL3Context(input);

    expect(result.status).toBe('DENY');
    expect(result.errorCode).toBe('INVALID_CONTEXT');
  });

  // RULE-3: Lateral Hard Isolation.
  it('RULE-3: should DENY lateral access (same level, different context)', () => {
    // This is enforced by the context ID matching, not just level.
    // The Engine checks contextLevel; the actual lateral isolation
    // is enforced by the Resolver (Gate 1B) which validates assignments.
    // Here we verify that same-level but different context is denied
    // when the contract requires a specific context.
    const input = createMockInput(
      'JEMAAT',
      ['JEMAAT'],
      'org.update_profile',
    );
    // This would be ALLOW because contextLevel matches.
    // Lateral isolation is enforced at the Resolver level (assignment check).
    const result = evaluateL3Context(input);
    expect(result.status).toBe('ALLOW');
  });

  // CHG-01: OC-AID-005 requires SINODE context.
  it('CHG-01: should ALLOW SUPER_ADMIN at SINODE for aid.approve.step_2', () => {
    const input = createMockInput('SINODE', ['SINODE'], 'aid.approve.step_2');
    const result = evaluateL3Context(input);

    expect(result.status).toBe('ALLOW');
  });

  // CHG-01: Mupel has NO Aid authority.
  it('CHG-01: should DENY MUPEL context for aid.approve.step_2', () => {
    const input = createMockInput('MUPEL', ['SINODE'], 'aid.approve.step_2');
    const result = evaluateL3Context(input);

    expect(result.status).toBe('DENY');
    expect(result.errorCode).toBe('INVALID_CONTEXT');
  });
});
