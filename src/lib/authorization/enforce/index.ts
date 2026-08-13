/**
 * src/lib/authorization/enforce/index.ts
 * Barrel export for the enforce module.
 *
 * Implementation Contract v1.1 — Public API Surface:
 * EXPOSED: enforceContract()
 * NOT EXPOSED: Individual evaluators, Resolvers, Mutation functions.
 *
 * PIP-13: No second authorization registry.
 * SA-01: Server Action is enforcement boundary, not authorization authority.
 *
 * This module exposes ONLY enforceContract as its public API.
 * All internal implementation details (Resolvers, Engine, session setup)
 * are NOT exported. They are accessed only through enforceContract().
 */

export { enforceContract } from './enforce-contract';
