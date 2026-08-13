/**
 * src/lib/authorization/engine/evaluators/permission-evaluator.ts
 *
 * L2 — Permission Eligibility Evaluator.
 *
 * Ontological authority:
 *   - Gate 1C: Engine L2–L6 Implementation v1.0 (FROZEN)
 *   - Gate 3 Step 4 §2: Pipeline L2 Permission Eligibility
 *   - Gate 3 Step 3 §2: Frozen Error Code → NOT_AUTHORIZED
 *
 * Frozen Error Code: NOT_AUTHORIZED
 *
 * ENG-01: Pure, stateless.
 * ENG-02: Deterministic.
 * ENG-03: No DB calls.
 * FAIL-01: MUST NOT produce ALLOW if dimension cannot be evaluated.
 * PIPE-06: NOT APPLICABLE ≠ skipped.
 */

import type { DimensionResult } from '../../types/decision.types';
import { FrozenErrorCode } from '../../types/error.types';
import type { EvaluationInput } from '../evaluation.types';

/**
 * Evaluates L2 — Permission Eligibility.
 *
 * Question: "Does the actor's effective System Role hold the permission
 *            required by this contract?"
 *
 * Logic:
 *   1. If contract.dimensions.L2_Actor is absent → NOT_APPLICABLE.
 *   2. If effectiveSystemRole ∈ L2_Actor → ALLOW.
 *   3. Otherwise → DENY (NOT_AUTHORIZED).
 *
 * ID-04: effectiveSystemRole is the SINGLE SOURCE for system role.
 * AUTH-03: Permission Authority derives from the registry.
 *
 * @param input - The complete evaluation input (pure DTO).
 * @returns DimensionResult with status ALLOW, DENY, or NOT_APPLICABLE.
 */
export function evaluateL2Permission(input: EvaluationInput): DimensionResult {
  const { roleBinding, contract } = input;

  // PIPE-06: If L2_Actor is not specified, this dimension is NOT APPLICABLE.
  // NOT APPLICABLE ≠ skipped — the evaluator ran and determined non-applicability.
  if (!contract.dimensions.L2_Actor || contract.dimensions.L2_Actor.length === 0) {
    return { dimension: 'L2', status: 'NOT_APPLICABLE' };
  }

  // Check: Is the actor's effective System Role in the allowed actor list?
  if (contract.dimensions.L2_Actor.includes(roleBinding.effectiveSystemRole)) {
    return { dimension: 'L2', status: 'ALLOW' };
  }

  // FAIL-01: Engine MUST NOT produce ALLOW if dimension cannot be satisfied.
  // R-10: diagnosticMessage is human-readable, NOT machine-readable.
  return {
    dimension: 'L2',
    status: 'DENY',
    errorCode: FrozenErrorCode.NOT_AUTHORIZED,
    diagnosticMessage:
      `System role '${roleBinding.effectiveSystemRole}' does not hold ` +
      `permission '${contract.permissionId}'. ` +
      `Required roles: [${contract.dimensions.L2_Actor.join(', ')}].`,
  };
}
