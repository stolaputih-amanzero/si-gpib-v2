/**
 * src/lib/authorization/engine/index.ts
 * Barrel export for the Engine module.
 *
 * Implementation Contract v1.1 — Public API Surface:
 * EXPOSED: AuthorizationEngine (evaluateContract).
 * NOT EXPOSED: Individual evaluators, Resolvers, Mutation functions.
 *
 * The Resolvers are NOT part of the public API surface.
 * They are instantiated and injected by enforceContract() (Gate 1D).
 * PIP-13: No second authorization registry.
 */

// ── Public API: The Engine orchestrator ───────────────────────────
export { evaluateContract } from './authorization-engine';

// ── Engine-specific types (needed by Gate 1D enforceContract) ─────
export type { EvaluationInput, ActiveContextObject } from './evaluation.types';

// ── Resolver interfaces (for dependency injection in Gate 1D) ─────
// These are exported as TYPES only, not implementations.
// Gate 1D will instantiate the concrete implementations.
export type { IIdentityResolver } from './identity-resolver';
export type { IContextResolver } from './context-resolver';
export type { IRoleBindingResolver } from './role-binding-resolver';
export type { IContractResolver } from './contract-resolver';

// ── Resolver failure types ────────────────────────────────────────
export type { ResolutionFailure } from './resolver.types';
export { isResolutionFailure } from './resolver.types';

// ── NOT EXPOSED: Individual evaluators (PIP compliance) ──────────
// They are imported internally by authorization-engine.ts only.
// ── NOT EXPOSED: Concrete resolver implementations ───────────────
// They are instantiated by enforceContract() (Gate 1D) via DI.
