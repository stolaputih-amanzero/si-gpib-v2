/**
 * src/lib/authorization/types/error.types.ts
 *
 * Frozen Error Taxonomy type definitions.
 *
 * Ontological authority:
 *   - Gate 3 Step 3 §2 Frozen Error Taxonomy (5 Codes)
 *   - Integrity Test #11: Frozen Error Codes = 5
 *
 * PIP-03: Adding a 6th error code is PROHIBITED.
 * ALH-05: No Frozen Error Code mapping for unresolved contracts.
 */

/**
 * The 5 Frozen Error Codes. This is a CLOSED set.
 *
 * Each code maps to exactly one pipeline layer:
 *   NOT_AUTHORIZED          → L2 Permission Eligibility
 *   INVALID_CONTEXT         → L3 Context Applicability
 *   RELATIONSHIP_VIOLATION  → L4 Relationship Constraint
 *   INVALID_LIFECYCLE_STATE → L5 Lifecycle Constraint
 *   INVALID_OPERATION       → L6 Operation Preconditions
 *
 * PIP-03: Do NOT add a 6th code.
 * PIP-04: Do NOT map Contract Resolution Failure to NOT_AUTHORIZED.
 */
export const FrozenErrorCode = {
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  INVALID_CONTEXT: 'INVALID_CONTEXT',
  RELATIONSHIP_VIOLATION: 'RELATIONSHIP_VIOLATION',
  INVALID_LIFECYCLE_STATE: 'INVALID_LIFECYCLE_STATE',
  INVALID_OPERATION: 'INVALID_OPERATION',
} as const;

export type FrozenErrorCode =
  (typeof FrozenErrorCode)[keyof typeof FrozenErrorCode];
