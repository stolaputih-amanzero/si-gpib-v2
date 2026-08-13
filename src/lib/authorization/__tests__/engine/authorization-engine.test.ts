/**
 * src/lib/authorization/__tests__/engine/authorization-engine.test.ts
 *
 * Authorization Engine — Pure Orchestrator tests.
 *
 * AUTH-04: Fixed Evaluation Order (L2 → L3 → L4 → L5 → L6).
 * AUTH-05: Binary Decision (ALLOW or DENY only).
 * PIPE-02: Sequential, short-circuit.
 * PIPE-06: NOT APPLICABLE ≠ skipped.
 * FAIL-01: MUST NOT produce ALLOW if dimension cannot be evaluated.
 */

import { describe, it, expect } from 'vitest';
import { evaluateContract } from '../../engine/authorization-engine';
import type { EvaluationInput } from '../../engine/evaluation.types';
import type { ContractInstance, TargetEntityState } from '../../types/contract.types';
import type { BaseIdentity, RoleBinding } from '../../types/identity.types';
import type { ActiveContextObject } from '../../engine/evaluation.types';

function createFullInput(overrides: Partial<EvaluationInput> = {}): EvaluationInput {
  const identity: BaseIdentity = {
    userId: 'user-1',
    personId: 'person-1',
    personType: 'PENDETA',
  };

  const activeContext: ActiveContextObject = {
    contextId: 'jemaat-001',
    contextLevel: 'JEMAAT',
    hierarchy: { sinodeId: 'sinode-1', mupelId: 'mupel-1', jemaatId: 'jemaat-001' },
  };

  const roleBinding: RoleBinding = {
    effectiveSystemRole: 'APPROVER',
    organizationalRoles: ['KMJ'],
    assignmentId: 'assign-001',
  };

  const contract: ContractInstance = {
    contractId: 'OC-AID-004',
    permissionId: 'aid.approve.step_1',
    status: 'ACTIVE',
    dimensions: {
      L2_Actor: ['APPROVER'],
      L3_Context: ['JEMAAT'],
      L5_Lifecycle: { requiredState: 'Pending_KMJ' },
    },
  };

  const targetEntity: TargetEntityState = {
    entityId: 'aid-001',
    entityType: 'AidRequest',
    lifecycleState: 'Pending_KMJ',
    contextAffinityId: 'jemaat-001',
    contextAffinityLevel: 'JEMAAT',
  };

  return {
    identity,
    activeContext,
    roleBinding,
    contract,
    targetEntity,
    ...overrides,
  };
}

describe('Authorization Engine — Pure Orchestrator', () => {
  it('should produce ALLOW when all dimensions pass', () => {
    const input = createFullInput();
    const result = evaluateContract(input);

    expect(result.decision.decision).toBe('ALLOW');
    expect(result.evaluatedDimensions.L2.status).toBe('ALLOW');
    expect(result.evaluatedDimensions.L3.status).toBe('ALLOW');
    expect(result.evaluatedDimensions.L5.status).toBe('ALLOW');
  });

  it('AUTH-05: should produce binary decision (ALLOW or DENY only)', () => {
    const input = createFullInput();
    const result = evaluateContract(input);

    expect(['ALLOW', 'DENY']).toContain(result.decision.decision);
  });

  it('PIPE-02: should short-circuit on L2 DENY (not evaluate L3-L6)', () => {
    const input = createFullInput({
      roleBinding: {
        effectiveSystemRole: 'EXECUTOR', // Not APPROVER
        organizationalRoles: ['PJ'],
        assignmentId: 'assign-002',
      },
    });

    const result = evaluateContract(input);

    expect(result.decision.decision).toBe('DENY');
    expect(result.decision.errorCode).toBe('NOT_AUTHORIZED');

    // L2 should be DENY.
    expect(result.evaluatedDimensions.L2.status).toBe('DENY');

    // L3-L6 should be NOT_APPLICABLE (short-circuit).
    expect(result.evaluatedDimensions.L3.status).toBe('NOT_APPLICABLE');
    expect(result.evaluatedDimensions.L4.status).toBe('NOT_APPLICABLE');
    expect(result.evaluatedDimensions.L5.status).toBe('NOT_APPLICABLE');
    expect(result.evaluatedDimensions.L6.status).toBe('NOT_APPLICABLE');
  });

  it('PIPE-02: should short-circuit on L3 DENY', () => {
    const input = createFullInput({
      activeContext: {
        contextId: 'pos-001',
        contextLevel: 'POS', // Not JEMAAT
        hierarchy: { sinodeId: 'sinode-1' },
      },
    });

    const result = evaluateContract(input);

    expect(result.decision.decision).toBe('DENY');
    expect(result.decision.errorCode).toBe('INVALID_CONTEXT');
    expect(result.evaluatedDimensions.L2.status).toBe('ALLOW');
    expect(result.evaluatedDimensions.L3.status).toBe('DENY');
    expect(result.evaluatedDimensions.L5.status).toBe('NOT_APPLICABLE');
  });

  it('PIPE-02: should short-circuit on L5 DENY (wrong lifecycle state)', () => {
    const input = createFullInput({
      targetEntity: {
        entityId: 'aid-001',
        entityType: 'AidRequest',
        lifecycleState: 'Draft', // Not Pending_KMJ
        contextAffinityId: 'jemaat-001',
        contextAffinityLevel: 'JEMAAT',
      },
    });

    const result = evaluateContract(input);

    expect(result.decision.decision).toBe('DENY');
    expect(result.decision.errorCode).toBe('INVALID_LIFECYCLE_STATE');
    expect(result.evaluatedDimensions.L2.status).toBe('ALLOW');
    expect(result.evaluatedDimensions.L3.status).toBe('ALLOW');
    expect(result.evaluatedDimensions.L5.status).toBe('DENY');
  });

  it('FAIL-01: should DENY when L5 lifecycle state is missing', () => {
    const input = createFullInput({
      targetEntity: {
        entityId: 'aid-001',
        entityType: 'AidRequest',
        // lifecycleState is missing
        contextAffinityId: 'jemaat-001',
        contextAffinityLevel: 'JEMAAT',
      },
    });

    const result = evaluateContract(input);

    expect(result.decision.decision).toBe('DENY');
    expect(result.decision.errorCode).toBe('INVALID_LIFECYCLE_STATE');
  });

  it('PIPE-06: should mark non-applicable dimensions as NOT_APPLICABLE', () => {
    const input = createFullInput({
      contract: {
        contractId: 'OC-ORG-004',
        permissionId: 'org.read',
        status: 'ACTIVE',
        dimensions: {
          L2_Actor: ['APPROVER'],
          L3_Context: ['JEMAAT'],
          // No L4, L5, L6 — these are NOT_APPLICABLE.
        },
      },
      targetEntity: {
        entityId: 'org-001',
        entityType: 'Organization',
        contextAffinityId: 'jemaat-001',
        contextAffinityLevel: 'JEMAAT',
      },
    });

    const result = evaluateContract(input);

    expect(result.decision.decision).toBe('ALLOW');
    expect(result.evaluatedDimensions.L2.status).toBe('ALLOW');
    expect(result.evaluatedDimensions.L3.status).toBe('ALLOW');
    expect(result.evaluatedDimensions.L4.status).toBe('NOT_APPLICABLE');
    expect(result.evaluatedDimensions.L5.status).toBe('NOT_APPLICABLE');
    expect(result.evaluatedDimensions.L6.status).toBe('NOT_APPLICABLE');
  });

  it('AUTH-07: evaluatedDimensions is separate from decision', () => {
    const input = createFullInput();
    const result = evaluateContract(input);

    // Decision and evaluatedDimensions are separate fields.
    expect(result.decision).toBeDefined();
    expect(result.evaluatedDimensions).toBeDefined();
    expect(result.decision).not.toHaveProperty('evaluatedDimensions');
  });

  it('CHG-01: should ALLOW SUPER_ADMIN at SINODE for aid.approve.step_2', () => {
    const input = createFullInput({
      activeContext: {
        contextId: 'sinode-1',
        contextLevel: 'SINODE',
        hierarchy: { sinodeId: 'sinode-1' },
      },
      roleBinding: {
        effectiveSystemRole: 'SUPER_ADMIN',
        organizationalRoles: [],
        assignmentId: 'assign-sinode',
      },
      contract: {
        contractId: 'OC-AID-005',
        permissionId: 'aid.approve.step_2',
        status: 'ACTIVE',
        dimensions: {
          L2_Actor: ['SUPER_ADMIN'],
          L3_Context: ['SINODE'],
          L5_Lifecycle: { requiredState: 'Pending_Sinode' },
        },
      },
      targetEntity: {
        entityId: 'aid-001',
        entityType: 'AidRequest',
        lifecycleState: 'Pending_Sinode',
        contextAffinityId: 'sinode-1',
        contextAffinityLevel: 'SINODE',
      },
    });

    const result = evaluateContract(input);
    expect(result.decision.decision).toBe('ALLOW');
  });
});
