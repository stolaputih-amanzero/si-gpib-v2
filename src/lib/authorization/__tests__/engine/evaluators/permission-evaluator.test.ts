/**
 * src/lib/authorization/__tests__/engine/evaluators/permission-evaluator.test.ts
 *
 * L2 — Permission Eligibility Evaluator tests.
 *
 * ENG-01: Pure, stateless. No DB calls.
 * ENG-02: Deterministic. Same input → same output.
 * FAIL-01: MUST NOT produce ALLOW if dimension cannot be evaluated.
 * PIPE-06: NOT APPLICABLE ≠ skipped.
 */

import { describe, it, expect } from 'vitest';
import { evaluateL2Permission } from '../../../engine/evaluators/permission-evaluator';
import type { EvaluationInput } from '../../../engine/evaluation.types';
import type { ContractInstance } from '../../../types/contract.types';
import type { BaseIdentity, RoleBinding } from '../../../types/identity.types';
import type { ActiveContextObject } from '../../../engine/evaluation.types';

// Test fixtures
const mockIdentity: BaseIdentity = {
  userId: 'user-1',
  personId: 'person-1',
  personType: 'PENDETA',
};

const mockActiveContext: ActiveContextObject = {
  contextId: 'jemaat-001',
  contextLevel: 'JEMAAT',
  hierarchy: { sinodeId: 'sinode-1', mupelId: 'mupel-1', jemaatId: 'jemaat-001' },
};

function createMockInput(
  effectiveSystemRole: string,
  l2Actor: string[] | undefined,
): EvaluationInput {
  const contract: ContractInstance = {
    contractId: 'OC-AID-004',
    permissionId: 'aid.approve.step_1',
    status: 'ACTIVE',
    dimensions: {
      L2_Actor: l2Actor as any,
    },
  };

  const roleBinding: RoleBinding = {
    effectiveSystemRole: effectiveSystemRole as any,
    organizationalRoles: ['KMJ'],
    assignmentId: 'assign-001',
  };

  return {
    identity: mockIdentity,
    activeContext: mockActiveContext,
    roleBinding,
    contract,
  };
}

describe('L2: Permission Eligibility Evaluator', () => {
  it('should ALLOW when effectiveSystemRole is in L2_Actor', () => {
    const input = createMockInput('APPROVER', ['APPROVER']);
    const result = evaluateL2Permission(input);

    expect(result.dimension).toBe('L2');
    expect(result.status).toBe('ALLOW');
    expect(result.errorCode).toBeUndefined();
  });

  it('should DENY with NOT_AUTHORIZED when role is not in L2_Actor', () => {
    const input = createMockInput('EXECUTOR', ['APPROVER']);
    const result = evaluateL2Permission(input);

    expect(result.dimension).toBe('L2');
    expect(result.status).toBe('DENY');
    expect(result.errorCode).toBe('NOT_AUTHORIZED');
    expect(result.diagnosticMessage).toContain('EXECUTOR');
    expect(result.diagnosticMessage).toContain('APPROVER');
  });

  it('should return NOT_APPLICABLE when L2_Actor is undefined', () => {
    const input = createMockInput('APPROVER', undefined);
    const result = evaluateL2Permission(input);

    expect(result.dimension).toBe('L2');
    expect(result.status).toBe('NOT_APPLICABLE');
  });

  it('should return NOT_APPLICABLE when L2_Actor is empty array', () => {
    const input = createMockInput('APPROVER', []);
    const result = evaluateL2Permission(input);

    expect(result.dimension).toBe('L2');
    expect(result.status).toBe('NOT_APPLICABLE');
  });

  it('should ALLOW when role is one of multiple allowed roles', () => {
    const input = createMockInput('ADMIN', ['SUPER_ADMIN', 'ADMIN']);
    const result = evaluateL2Permission(input);

    expect(result.status).toBe('ALLOW');
  });

  it('should DENY CONTRIBUTOR from pastoral.delete (D-12)', () => {
    const input = createMockInput('CONTRIBUTOR', [
      'SUPER_ADMIN', 'APPROVER', 'EXECUTOR', 'MINISTRY', 'ADMINISTRATOR',
    ]);
    const result = evaluateL2Permission(input);

    expect(result.status).toBe('DENY');
    expect(result.errorCode).toBe('NOT_AUTHORIZED');
  });
});
