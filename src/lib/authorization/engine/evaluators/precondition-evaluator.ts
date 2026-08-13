/**
 * src/lib/authorization/engine/evaluators/precondition-evaluator.ts
 *
 * L6 — Operation Preconditions Evaluator.
 *
 * Ontological authority:
 *   - Gate 1C: Engine L2–L6 Implementation v1.0 (FROZEN)
 *   - Gate 3 Step 3 §2: Frozen Error Code → INVALID_OPERATION
 *
 * Frozen Error Code: INVALID_OPERATION
 *
 * RLS-05: RLS MUST NOT enforce L6 Preconditions. Engine only.
 * PIP-15: C/D/E items MUST NOT be placed in enforceContract().
 *
 * L6 preconditions are business rules that must be satisfied for an
 * operation to proceed, beyond role/context/relationship/lifecycle.
 * Examples: "KMJ must be Pendeta", "Jemaat must have ≥1 Pos for elevation".
 *
 * ENG-01/02/03: Pure, stateless, deterministic, no DB calls.
 * FAIL-01: MUST NOT produce ALLOW if dimension cannot be evaluated.
 * PIPE-06: NOT APPLICABLE ≠ skipped.
 */

import type { PreconditionConstraint } from '../../types/contract.types';
import type { PersonType } from '../../types/identity.types';
import type { DimensionResult } from '../../types/decision.types';
import { FrozenErrorCode } from '../../types/error.types';
import type { EvaluationInput } from '../evaluation.types';

/**
 * Evaluates L6 — Operation Preconditions.
 *
 * Question: "Are all business preconditions satisfied for this operation?"
 *
 * Logic:
 *   1. If contract.dimensions.L6_Preconditions is absent → NOT_APPLICABLE.
 *   2. Evaluate the precondition based on its type.
 *   3. If satisfied → ALLOW.
 *   4. Otherwise → DENY (INVALID_OPERATION).
 *
 * G-6: No implicit inference. Unknown precondition types → DENY.
 * FAIL-01: Cannot produce ALLOW if precondition cannot be evaluated.
 *
 * @param input - The complete evaluation input (pure DTO).
 * @returns DimensionResult with status ALLOW, DENY, or NOT_APPLICABLE.
 */
export function evaluateL6Preconditions(input: EvaluationInput): DimensionResult {
  const { identity, contract, targetEntity, preconditionContext } = input;

  // PIPE-06: If L6_Preconditions is not specified, this dimension is NOT APPLICABLE.
  if (!contract.dimensions.L6_Preconditions) {
    return { dimension: 'L6', status: 'NOT_APPLICABLE' };
  }

  const precondition = contract.dimensions.L6_Preconditions;

  // Evaluate the precondition based on its type.
  const satisfied = evaluatePrecondition(
    precondition,
    identity.personType,
    targetEntity,
    preconditionContext,
  );

  if (satisfied) {
    return { dimension: 'L6', status: 'ALLOW' };
  }

  return {
    dimension: 'L6',
    status: 'DENY',
    errorCode: FrozenErrorCode.INVALID_OPERATION,
    diagnosticMessage:
      `Operation precondition '${precondition.preconditionType}' ` +
      `not satisfied for contract '${contract.contractId}'.`,
  };
}

/**
 * Evaluates a specific precondition type.
 *
 * G-6: No implicit inference. Each precondition type is explicitly handled.
 * FAIL-01: Unknown precondition type → DENY.
 *
 * @param precondition        - The precondition constraint.
 * @param actorPersonType     - The actor's Person Type (may be null).
 * @param targetEntity        - The target entity state (may be undefined).
 * @param preconditionContext  - Additional context from OperationInput.
 * @returns true if the precondition is satisfied.
 */
function evaluatePrecondition(
  precondition: PreconditionConstraint,
  actorPersonType: PersonType | null,
  targetEntity?: EvaluationInput['targetEntity'],
  preconditionContext?: Readonly<Record<string, unknown>>,
): boolean {
  switch (precondition.preconditionType) {
    case 'person_type_required': {
      // Example: KMJ must be Pendeta (D-01).
      // Example: Sekretaris Jemaat must be Presbiter (D-10).
      const requiredType = precondition.params?.requiredPersonType as PersonType | undefined;
      if (!requiredType) {
        // FAIL-01: Cannot evaluate without required type.
        return false;
      }
      return actorPersonType === requiredType;
    }

    case 'entity_count_minimum': {
      // Example: Jemaat must have ≥1 Pos for status elevation.
      // The count is pre-resolved by Gate 1B Resolver and passed via metadata.
      const minimum = precondition.params?.minimumCount as number | undefined;
      const actual = targetEntity?.metadata?.entityCount as number | undefined;
      if (minimum === undefined || actual === undefined) {
        // FAIL-01: Cannot evaluate without both minimum and actual.
        return false;
      }
      return actual >= minimum;
    }

    case 'organizational_role_required': {
      // Example: Ketua BP Mupel must also be KMJ at a Jemaat.
      // The role membership is pre-resolved and passed via preconditionContext.
      const requiredRole = precondition.params?.requiredOrganizationalRole as string | undefined;
      if (!requiredRole || !preconditionContext) {
        return false;
      }
      const heldRoles = preconditionContext.organizationalRoles as string[] | undefined;
      if (!Array.isArray(heldRoles)) {
        return false;
      }
      return heldRoles.includes(requiredRole);
    }

    default:
      // FAIL-01: Unknown precondition type → DENY.
      // G-6: No implicit inference.
      return false;
  }
}
