/**
 * src/lib/authorization/engine/evaluators/context-evaluator.ts
 *
 * L3 — Context Applicability Evaluator.
 *
 * Ontological authority:
 *   - Gate 1C: Engine L2–L6 Implementation v1.0 (FROZEN)
 *   - Gate 3 Step 1 §2: Golden Rules (RULE-1 through RULE-4)
 *   - Gate 3 Step 3 §2: Frozen Error Code → INVALID_CONTEXT
 *
 * Frozen Error Code: INVALID_CONTEXT
 *
 * Key rules implemented:
 *   RULE-1: Downward Reach — ancestor may READ descendant context data.
 *   RULE-2: Upward Operational Isolation — no general upward visibility.
 *   RULE-3: Lateral Hard Isolation — same-level contexts are isolated.
 *
 * ENG-01/02/03: Pure, stateless, deterministic, no DB calls.
 * FAIL-01: MUST NOT produce ALLOW if dimension cannot be evaluated.
 * PIPE-06: NOT APPLICABLE ≠ skipped.
 */

import type { ContextLevel } from '../../types/identity.types';
import type { DimensionResult } from '../../types/decision.types';
import { FrozenErrorCode } from '../../types/error.types';
import type { TargetEntityState } from '../../types/contract.types';
import type { EvaluationInput, ActiveContextObject } from '../evaluation.types';

/**
 * Context hierarchy ordering for Downward Reach (RULE-1) evaluation.
 * Index 0 = highest (SINODE), Index 3 = lowest (POS).
 * An ancestor has a LOWER index than its descendant.
 */
const CONTEXT_HIERARCHY_ORDER: ReadonlyArray<ContextLevel> = [
  'SINODE',
  'MUPEL',
  'JEMAAT',
  'POS',
] as const;

/**
 * Evaluates L3 — Context Applicability.
 *
 * Question: "Is the actor's Active Context compatible with the context
 *            levels specified by this contract?"
 *
 * Logic:
 *   1. If contract.dimensions.L3_Context is absent → NOT_APPLICABLE.
 *   2. If activeContext.contextLevel ∈ L3_Context → ALLOW.
 *   3. If permission is a READ and activeContext is ancestor of target
 *      entity's context → ALLOW (RULE-1 Downward Reach).
 *   4. Otherwise → DENY (INVALID_CONTEXT).
 *
 * AUTH-02: activeContext is server-validated, NOT a client claim.
 * G-1: Context Ownership ≠ Actor Ownership.
 * G-2: Downward Reach ≠ Assignment-management Authority.
 *
 * @param input - The complete evaluation input (pure DTO).
 * @returns DimensionResult with status ALLOW, DENY, or NOT_APPLICABLE.
 */
export function evaluateL3Context(input: EvaluationInput): DimensionResult {
  const { activeContext, contract, targetEntity } = input;

  // PIPE-06: If L3_Context is not specified, this dimension is NOT APPLICABLE.
  if (!contract.dimensions.L3_Context || contract.dimensions.L3_Context.length === 0) {
    return { dimension: 'L3', status: 'NOT_APPLICABLE' };
  }

  // Primary check: Is the active context level in the contract's allowed contexts?
  if (contract.dimensions.L3_Context.includes(activeContext.contextLevel)) {
    return { dimension: 'L3', status: 'ALLOW' };
  }

  // RULE-1: Downward Reach — Ancestor context may READ descendant context data.
  // G-2: Downward Reach ≠ Assignment-management Authority (read only).
  // This applies ONLY to read permissions (permission ends with '.read').
  if (
    isReadPermission(contract.permissionId) &&
    isAncestorOfTarget(activeContext, targetEntity)
  ) {
    return { dimension: 'L3', status: 'ALLOW' };
  }

  // FAIL-01: Cannot produce ALLOW if context is not applicable.
  return {
    dimension: 'L3',
    status: 'DENY',
    errorCode: FrozenErrorCode.INVALID_CONTEXT,
    diagnosticMessage:
      `Active context level '${activeContext.contextLevel}' is not applicable ` +
      `for permission '${contract.permissionId}'. ` +
      `Required contexts: [${contract.dimensions.L3_Context.join(', ')}].`,
  };
}

/**
 * Determines whether a permission is a read operation.
 *
 * Downward Reach (RULE-1) applies ONLY to read operations.
 * Write operations require explicit context match.
 *
 * @param permissionId - The permission atom identifier.
 * @returns true if the permission is a read operation.
 */
function isReadPermission(permissionId: string): boolean {
  return permissionId.endsWith('.read');
}

/**
 * Determines whether the active context is an ancestor of the target
 * entity's context affinity, enabling Downward Reach (RULE-1).
 *
 * This is a pure O(1) comparison using the hierarchy index.
 * No DB queries. No I/O. (Gate 1C design: "masterclass" — Principal Architect)
 *
 * RULE-2: Upward Operational Isolation is enforced by the index comparison —
 * a descendant (higher index) can NEVER be an ancestor of an ancestor (lower index).
 *
 * RULE-3: Lateral Hard Isolation is enforced because same-level contexts
 * have the same index, so activeIdx < targetIdx is false for lateral access.
 *
 * @param activeContext - The server-validated active context.
 * @param targetEntity  - The target entity with context affinity.
 * @returns true if activeContext is a strict ancestor of the target's context.
 */
function isAncestorOfTarget(
  activeContext: ActiveContextObject,
  targetEntity?: TargetEntityState,
): boolean {
  // FAIL-01: Cannot evaluate Downward Reach without target context affinity.
  if (!targetEntity?.contextAffinityLevel) {
    return false;
  }

  const activeIdx = CONTEXT_HIERARCHY_ORDER.indexOf(activeContext.contextLevel);
  const targetIdx = CONTEXT_HIERARCHY_ORDER.indexOf(targetEntity.contextAffinityLevel);

  // Guard against unknown context levels (defensive, FAIL-01).
  if (activeIdx === -1 || targetIdx === -1) {
    return false;
  }

  // Ancestor = strictly lower index (higher in hierarchy).
  // Strict inequality ensures no self-match and no lateral match.
  return activeIdx < targetIdx;
}
