/**
 * src/lib/authorization/engine/evaluators/relationship-evaluator.ts
 *
 * L4 — Relationship Constraint Evaluator.
 *
 * Ontological authority:
 *   - Gate 1C: Engine L2–L6 Implementation v1.0 (FROZEN)
 *   - Gate 3 Step 1 North Star: "Relationship determines WHY the actor
 *     may cross a Context boundary."
 *   - Gate 3 Step 3 §2: Frozen Error Code → RELATIONSHIP_VIOLATION
 *
 * Frozen Error Code: RELATIONSHIP_VIOLATION
 *
 * Supported relationship types:
 *   - is_self:         actor IS the target entity's owner/subject
 *   - creator:         actor CREATED the target entity
 *   - owner:           actor OWNS the target entity
 *   - family_linkage:  actor is a family member of the target's subject
 *
 * ENG-01/02/03: Pure, stateless, deterministic, no DB calls.
 * FAIL-01: MUST NOT produce ALLOW if dimension cannot be evaluated.
 * PIPE-06: NOT APPLICABLE ≠ skipped.
 */

import type { RelationshipType } from '../../types/contract.types';
import type { DimensionResult } from '../../types/decision.types';
import { FrozenErrorCode } from '../../types/error.types';
import type { EvaluationInput } from '../evaluation.types';

/**
 * Evaluates L4 — Relationship Constraint.
 *
 * Question: "Does the actor have the required relationship to the target
 *            entity for this operation?"
 *
 * Logic:
 *   1. If contract.dimensions.L4_Relationship is absent → NOT_APPLICABLE.
 *   2. If targetEntity is missing → DENY (FAIL-01).
 *   3. If actor satisfies the required relationship → ALLOW.
 *   4. Otherwise → DENY (RELATIONSHIP_VIOLATION).
 *
 * RLS-03: RLS is NOT REQUIRED to reproduce L4. Engine is authoritative.
 *
 * @param input - The complete evaluation input (pure DTO).
 * @returns DimensionResult with status ALLOW, DENY, or NOT_APPLICABLE.
 */
export function evaluateL4Relationship(input: EvaluationInput): DimensionResult {
  const { identity, contract, targetEntity } = input;

  // PIPE-06: If L4_Relationship is not specified, this dimension is NOT APPLICABLE.
  if (!contract.dimensions.L4_Relationship) {
    return { dimension: 'L4', status: 'NOT_APPLICABLE' };
  }

  // FAIL-01: Cannot evaluate relationship without target entity state.
  if (!targetEntity) {
    return {
      dimension: 'L4',
      status: 'DENY',
      errorCode: FrozenErrorCode.RELATIONSHIP_VIOLATION,
      diagnosticMessage:
        'L4 Relationship Constraint requires target entity state, ' +
        'but none was provided. Fail-closed: DENY.',
    };
  }

  const requiredRelationship = contract.dimensions.L4_Relationship.requiredRelationship;
  const actorPersonId = identity.personId;

  // Evaluate the specific relationship type.
  if (checkRelationship(requiredRelationship, actorPersonId, targetEntity)) {
    return { dimension: 'L4', status: 'ALLOW' };
  }

  return {
    dimension: 'L4',
    status: 'DENY',
    errorCode: FrozenErrorCode.RELATIONSHIP_VIOLATION,
    diagnosticMessage:
      `Actor does not satisfy required relationship '${requiredRelationship}' ` +
      `for entity '${targetEntity.entityId}' (${targetEntity.entityType}).`,
  };
}

/**
 * Checks whether the actor satisfies the specified relationship type.
 *
 * G-6: No implicit inference. Each relationship type is explicitly checked.
 * FAIL-01: Unknown relationship type → DENY (no implicit ALLOW).
 *
 * @param relationship   - The required relationship type.
 * @param actorPersonId  - The actor's linked Person ID (may be null).
 * @param targetEntity   - The target entity state.
 * @param input          - Full evaluation input (for metadata access).
 * @returns true if the relationship is satisfied.
 */
function checkRelationship(
  relationship: RelationshipType,
  actorPersonId: string | null,
  targetEntity: NonNullable<EvaluationInput['targetEntity']>,
): boolean {
  // No person linkage means no relationship can be established.
  // FAIL-01: Cannot produce ALLOW without identity.
  if (!actorPersonId) {
    return false;
  }

  switch (relationship) {
    case 'is_self':
      // Actor IS the subject of the target entity.
      // Used for: person.update_family, user.update_own_profile, user.toggle_biometric.
      return targetEntity.ownerPersonId === actorPersonId;

    case 'creator':
      // Actor CREATED the target entity.
      // Used for: aid.update, aid.resubmit, pastoral.update.
      return targetEntity.creatorPersonId === actorPersonId;

    case 'owner':
      // Actor OWNS the target entity.
      // Semantically equivalent to is_self for most entities,
      // but distinguished for clarity in contract definitions.
      return targetEntity.ownerPersonId === actorPersonId;

    case 'family_linkage': {
      // Actor is a family member of the target's subject.
      // Family linkage IDs are pre-resolved by Gate 1B Resolver
      // and passed via targetEntity.metadata.
      // G-6: No implicit inference — explicit metadata check only.
      const familyIds = targetEntity.metadata?.familyLinkagePersonIds;
      if (!Array.isArray(familyIds)) {
        return false;
      }
      return familyIds.includes(actorPersonId);
    }

    default:
      // FAIL-01: Unknown relationship type → DENY.
      // G-6: No implicit inference.
      return false;
  }
}
