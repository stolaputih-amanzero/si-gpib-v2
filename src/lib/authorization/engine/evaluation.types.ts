/**
 * src/lib/authorization/engine/evaluation.types.ts
 *
 * Engine-specific evaluation types.
 *
 * These types bridge the Resolver layer (Gate 1B) and the Engine (Gate 1C).
 * They are consumed ONLY by pure evaluator functions — no I/O, no DB.
 *
 * Ontological authority:
 *   - Gate 1B: Resolver Interfaces v1.0 (FROZEN)
 *   - Gate 1C: Engine L2–L6 Implementation v1.0 (FROZEN)
 *   - Part 1 v1.3 §2 Identity Resolution Sequence
 *   - Part 1 v1.3 §4 Decision Model
 *
 * AUTH-02: Client Context = CLAIM; Server Resolution = TRUSTED RESULT.
 * AC-01: ActiveContextObject is SERVER-VALIDATED RESOLUTION RESULT.
 */

import type {
  BaseIdentity,
  ContextLevel,
  RoleBinding,
} from '../types/identity.types';
import type {
  ContractInstance,
  TargetEntityState,
} from '../types/contract.types';

/**
 * Active Context Object — the SERVER-VALIDATED context resolution result.
 *
 * AC-01: This is NOT the client's claimed context. It is the result of
 * server-side validation against the user's Assignments.
 *
 * AUTH-02: Client sends a claim; Resolver validates and produces this object.
 *
 * The `hierarchy` field carries ancestor IDs for Downward Reach (RULE-1)
 * evaluation in L3, enabling O(1) context comparison without DB queries.
 */
export interface ActiveContextObject {
  /** The validated context identifier. */
  readonly contextId: string;
  /** The validated context level. */
  readonly contextLevel: ContextLevel;
  /**
   * Ancestor hierarchy for Downward Reach (RULE-1) evaluation.
   * Populated by ContextResolver (Gate 1B) from DB.
   * The Engine uses this for O(1) ancestor/descendant comparison.
   */
  readonly hierarchy: {
    readonly sinodeId: string;
    readonly mupelId?: string;
    readonly jemaatId?: string;
    readonly posId?: string;
  };
}

/**
 * Evaluation Input — the complete bundle of DTOs passed to the Engine.
 *
 * ENG-01: Engine is stateless. All data arrives via this object.
 * ENG-03: Engine has NO DB calls. All data pre-resolved by Gate 1B.
 *
 * This is the ONLY input to evaluateContract(). The Engine never
 * fetches, queries, or mutates anything.
 */
export interface EvaluationInput {
  /** Resolved user identity (Gate 1B — IIdentityResolver). */
  readonly identity: BaseIdentity;
  /** Server-validated active context (Gate 1B — IContextResolver). */
  readonly activeContext: ActiveContextObject;
  /** Contextual role binding (Gate 1B — IRoleBindingResolver). */
  readonly roleBinding: RoleBinding;
  /** Resolved ACTIVE contract instance (Gate 1B — IContractResolver). */
  readonly contract: ContractInstance;
  /** Target entity state for L4/L5/L6 evaluation (optional). */
  readonly targetEntity?: TargetEntityState;
  /** Additional context for L6 precondition evaluation (optional). */
  readonly preconditionContext?: Readonly<Record<string, unknown>>;
}
