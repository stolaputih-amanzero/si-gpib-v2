/**
 * src/lib/authorization/engine/authorization-engine.ts
 *
 * Authorization Engine — Pure Orchestrator.
 *
 * Ontological authority:
 *   - Gate 1C: Engine L2–L6 Implementation v1.0 (FROZEN)
 *   - Part 1 v1.3: Core Authorization Engine & Context Resolver
 *   - Gate 3 Step 4: Authorization Enforcement Architecture v1.2
 *
 * AUTH-04: Fixed Evaluation Order (L2 → L3 → L4 → L5 → L6).
 * AUTH-05: Binary Decision (ALLOW or DENY only).
 * AUTH-07: Diagnostic Separation (evaluated_dimensions ≠ decision).
 * PIPE-02: L2–L6 sequential, short-circuit.
 * PIPE-06: Only applicable dimensions evaluated; NOT APPLICABLE ≠ skipped.
 * PIPE-07: Pipeline ordering fixed.
 *
 * ENG-01: Engine is stateless.
 * ENG-02: Engine is deterministic.
 * ENG-03: Engine has NO DB calls.
 * FAIL-01: Engine MUST NOT produce ALLOW if dimension cannot be evaluated.
 *
 * R-10: error_detail is human-readable, NOT machine-readable.
 * R-11: evaluated_dimensions is SEPARATE from AuthorizationDecision.
 *
 * This function is PURE. It receives DTOs and returns a decision.
 * It never fetches, queries, mutates, or logs.
 */

import type {
  AuthorizationDecision,
  DimensionResult,
  EngineOutput,
  EvaluatedDimensions,
} from '../types/decision.types';
import type { EvaluationInput } from './evaluation.types';
import { evaluateL2Permission } from './evaluators/permission-evaluator';
import { evaluateL3Context } from './evaluators/context-evaluator';
import { evaluateL4Relationship } from './evaluators/relationship-evaluator';
import { evaluateL5Lifecycle } from './evaluators/lifecycle-evaluator';
import { evaluateL6Preconditions } from './evaluators/precondition-evaluator';

/**
 * The Authorization Engine — evaluates L2–L6 in fixed order.
 *
 * This is the SINGLE evaluation entry point for the Engine layer.
 * It is called by enforceContract() (Gate 1D) after all Resolvers
 * (Gate 1B) have produced the required DTOs.
 *
 * AUTH-04: Evaluation order is FIXED: L2 → L3 → L4 → L5 → L6.
 * PIPE-02: Short-circuit — first DENY stops evaluation immediately.
 * AUTH-05: Output is binary — ALLOW or DENY. No PARTIAL, no MAYBE.
 *
 * @param input - The complete evaluation input (all DTOs pre-resolved).
 * @returns EngineOutput containing the decision and diagnostic artifact.
 */
export function evaluateContract(input: EvaluationInput): EngineOutput {
  // Initialize all dimensions as NOT_APPLICABLE internally.
  // We use a mutable object locally to build the final read-only DTO.
  const dims = {
    L2: { dimension: 'L2', status: 'NOT_APPLICABLE' } as DimensionResult,
    L3: { dimension: 'L3', status: 'NOT_APPLICABLE' } as DimensionResult,
    L4: { dimension: 'L4', status: 'NOT_APPLICABLE' } as DimensionResult,
    L5: { dimension: 'L5', status: 'NOT_APPLICABLE' } as DimensionResult,
    L6: { dimension: 'L6', status: 'NOT_APPLICABLE' } as DimensionResult,
  };

  // ── L2: Permission Eligibility ──────────────────────────────────
  // AUTH-04: Fixed order. L2 is ALWAYS first.
  dims.L2 = evaluateL2Permission(input);
  if (dims.L2.status === 'DENY') {
    // PIPE-02: Short-circuit. Do not evaluate L3–L6.
    return buildDenyOutput(dims.L2, dims);
  }

  // ── L3: Context Applicability ─────────────────────────────────
  dims.L3 = evaluateL3Context(input);
  if (dims.L3.status === 'DENY') {
    return buildDenyOutput(dims.L3, dims);
  }

  // ── L4: Relationship Constraint ─────────────────────────────────
  dims.L4 = evaluateL4Relationship(input);
  if (dims.L4.status === 'DENY') {
    return buildDenyOutput(dims.L4, dims);
  }

  // ── L5: Lifecycle Constraint ────────────────────────────────────
  dims.L5 = evaluateL5Lifecycle(input);
  if (dims.L5.status === 'DENY') {
    return buildDenyOutput(dims.L5, dims);
  }

  // ── L6: Operation Preconditions ─────────────────────────────────
  dims.L6 = evaluateL6Preconditions(input);
  if (dims.L6.status === 'DENY') {
    return buildDenyOutput(dims.L6, dims);
  }

  const evaluatedDimensions: EvaluatedDimensions = dims;

  // ── ALL DIMENSIONS PASSED ───────────────────────────────────────
  // AUTH-05: Binary decision. All dimensions ALLOW or NOT_APPLICABLE → ALLOW.
  // FAIL-01: We only reach here if no dimension produced DENY.
  const decision: AuthorizationDecision = { decision: 'ALLOW' };

  return {
    decision,
    evaluatedDimensions,
  };
}

/**
 * Builds a DENY output from a failed dimension result.
 *
 * R-11: evaluatedDimensions is included as a diagnostic artifact,
 *       but the decision is derived solely from the failed dimension.
 * R-10: errorDetail is human-readable.
 *
 * @param failedDimension   - The dimension that produced DENY.
 * @param evaluatedDimensions - The diagnostic artifact (all dimensions).
 * @returns EngineOutput with DENY decision.
 */
function buildDenyOutput(
  failedDimension: DimensionResult,
  evaluatedDimensions: EvaluatedDimensions,
): EngineOutput {
  const decision: AuthorizationDecision = {
    decision: 'DENY',
    errorCode: failedDimension.errorCode,
    errorDetail: failedDimension.diagnosticMessage,
  };

  return {
    decision,
    evaluatedDimensions,
  };
}
