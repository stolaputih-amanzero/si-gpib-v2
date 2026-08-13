/**
 * src/lib/authorization/engine/evaluators/lifecycle-evaluator.ts
 *
 * L5 — Lifecycle Constraint Evaluator.
 *
 * Ontological authority:
 *   - Gate 1C: Engine L2–L6 Implementation v1.0 (FROZEN)
 *   - Gate 3 Step 3 §4: Aid Request State Machine (CHG-01 amended)
 *   - Gate 3 Step 3 §2: Frozen Error Code → INVALID_LIFECYCLE_STATE
 *
 * Frozen Error Code: INVALID_LIFECYCLE_STATE
 *
 * G-3: State Transition ≠ Authorization.
 *      The lifecycle state is a precondition for authorization,
 *      not an authorization decision itself.
 *
 * RLS-04: RLS MUST NOT enforce L5 Lifecycle. Engine only.
 *
 * ENG-01/02/03: Pure, stateless, deterministic, no DB calls.
 * FAIL-01: MUST NOT produce ALLOW if dimension cannot be evaluated.
 * PIPE-06: NOT APPLICABLE ≠ skipped.
 */

import type { DimensionResult } from '../../types/decision.types';
import { FrozenErrorCode } from '../../types/error.types';
import type { EvaluationInput } from '../evaluation.types';

/**
 * Evaluates L5 — Lifecycle Constraint.
 *
 * Question: "Is the target entity in the correct lifecycle state for
 *            this operation to proceed?"
 *
 * Logic:
 *   1. If contract.dimensions.L5_Lifecycle is absent → NOT_APPLICABLE.
 *   2. If targetEntity or lifecycleState is missing → DENY (FAIL-01).
 *   3. If current state matches required/allowed states → ALLOW.
 *   4. Otherwise → DENY (INVALID_LIFECYCLE_STATE).
 *
 * CHG-01: Aid lifecycle states use Pending_Sinode (not Pending_Mupel).
 *
 * @param input - The complete evaluation input (pure DTO).
 * @returns DimensionResult with status ALLOW, DENY, or NOT_APPLICABLE.
 */
export function evaluateL5Lifecycle(input: EvaluationInput): DimensionResult {
  const { contract, targetEntity } = input;

  // PIPE-06: If L5_Lifecycle is not specified, this dimension is NOT APPLICABLE.
  if (!contract.dimensions.L5_Lifecycle) {
    return { dimension: 'L5', status: 'NOT_APPLICABLE' };
  }

  // FAIL-01: Cannot evaluate lifecycle without target entity state.
  if (!targetEntity?.lifecycleState) {
    return {
      dimension: 'L5',
      status: 'DENY',
      errorCode: FrozenErrorCode.INVALID_LIFECYCLE_STATE,
      diagnosticMessage:
        'L5 Lifecycle Constraint requires target entity lifecycle state, ' +
        'but none was provided. Fail-closed: DENY.',
    };
  }

  const constraint = contract.dimensions.L5_Lifecycle;
  const currentState = targetEntity.lifecycleState;

  // Determine allowed states: explicit allowedStates array, or single requiredState.
  const allowedStates: ReadonlyArray<string> =
    constraint.allowedStates ?? 
    (constraint.requiredState ? [constraint.requiredState] : []);

  // FAIL-01: If no allowed states are defined, cannot evaluate.
  if (allowedStates.length === 0) {
    return {
      dimension: 'L5',
      status: 'DENY',
      errorCode: FrozenErrorCode.INVALID_LIFECYCLE_STATE,
      diagnosticMessage:
        `L5 Lifecycle Constraint for contract '${contract.contractId}' ` +
        `has no defined allowed states. Fail-closed: DENY.`,
    };
  }

  // Check: Is the current state in the allowed states?
  if (allowedStates.includes(currentState)) {
    return { dimension: 'L5', status: 'ALLOW' };
  }

  return {
    dimension: 'L5',
    status: 'DENY',
    errorCode: FrozenErrorCode.INVALID_LIFECYCLE_STATE,
    diagnosticMessage:
      `Entity '${targetEntity.entityId}' is in lifecycle state '${currentState}', ` +
      `but operation '${contract.permissionId}' requires state: ` +
      `[${allowedStates.join(' | ')}].`,
  };
}
