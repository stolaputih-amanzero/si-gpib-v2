/**
 * src/lib/authorization/index.ts
 * Top-level barrel export for the Authorization Framework.
 *
 * Implementation Contract v1.1 — Public API Surface:
 * EXPOSED: enforceContract(), AuthorizationEngine, ContractRegistry,
 *          PermissionRegistry, FrozenErrorCodes, Types
 * NOT EXPOSED: Individual evaluators, Resolvers, Mutation functions.
 *
 * This is the SINGLE entry point for the Authorization Framework.
 * All consumers (Server Actions, middleware, tests) import from here.
 *
 * PIP-13: No second authorization registry.
 * PIP-01: if (user.role === ...) without enforceContract() is PROHIBITED.
 */

// ── Primary Enforcement API ───────────────────────────────────────
// SA-01: This is the ONLY authorization entry point.
export { enforceContract } from './enforce';

// ── Engine (for testing and advanced use) ─────────────────────────
// AUTH-04: Fixed Evaluation Order.
// AUTH-05: Binary Decision.
export { evaluateContract } from './engine';
export type { EvaluationInput, ActiveContextObject } from './engine';

// ── Registry (immutable, declarative) ─────────────────────────────
// REG-01: Registry is immutable.
// REG-02: Registry is declarative, no logic.
export {
  PERMISSION_REGISTRY,
  PERMISSION_IDS,
  PERMISSION_COUNT,
} from './registry/permission-registry';
export {
  CONTRACT_REGISTRY,
  AidLifecycleState,
} from './registry/contract-registry';

// ── Frozen Error Codes ────────────────────────────────────────────
// PIP-03: Adding a 6th error code is PROHIBITED.
export {
  FrozenErrorCode,
  AuthorizationError,
  InternalDiagnosticError,
  SystemError,
} from './errors';

// ── Types ─────────────────────────────────────────────────────────
// These are the public types for consumers.
export type {
  // Identity types
  PersonType,
  SystemRole,
  ContextLevel,
  OrganizationalRole,
  BaseIdentity,
  RoleBinding,
} from './types/identity.types';

export type {
  // Contract types
  PermissionId,
  ContractId,
  ContractStatus,
  ContractDimensions,
  ContractInstance,
  ContractRegistryEntry,
  TargetEntityState,
  OperationInput,
  RelationshipType,
  RelationshipConstraint,
  LifecycleConstraint,
  PreconditionConstraint,
} from './types/contract.types';

export type {
  // Decision types
  DimensionStatus,
  DimensionId,
  DimensionResult,
  EvaluatedDimensions,
  AuthorizationDecision,
  EngineOutput,
  SessionContext,
  ResolutionFailureType,
  EnforcementResult,
  EnforcementAllow,
  EnforcementDeny,
  EnforcementResolutionFailure,
} from './types/decision.types';

export type { FrozenErrorCode as FrozenErrorCodeType } from './types/error.types';

// ── NOT EXPOSED ───────────────────────────────────────────────────
// Individual evaluators (PIP compliance).
// Concrete Resolver implementations (internal to enforceContract).
// Mutation functions (not part of authorization module).
// Session variable setup (internal to enforceContract).
