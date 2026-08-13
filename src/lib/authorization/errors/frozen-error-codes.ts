/**
 * src/lib/authorization/errors/frozen-error-codes.ts
 *
 * Frozen Error Taxonomy + Error Classes.
 *
 * Ontological authority:
 *   - Gate 3 Step 3 §2 Frozen Error Taxonomy (5 Codes)
 *   - Implementation Contract v1.1 ERR-R1–R4
 *
 * ERR-R1: Authorization errors propagate as FrozenErrorCodes.
 * ERR-R2: Resolution failures propagate as InternalDiagnosticEvent.
 * ERR-R3: Technical errors propagate as SystemError.
 * ERR-R4: No error code mapping for UNRESOLVED contracts.
 *
 * PIP-03: Adding a 6th error code is PROHIBITED.
 * PIP-04: Mapping Contract Resolution Failure to NOT_AUTHORIZED is PROHIBITED.
 */

import { FrozenErrorCode } from '../types/error.types';

// Re-export the frozen code constants for public API surface.
export { FrozenErrorCode };
export type { FrozenErrorCode as FrozenErrorCodeType } from '../types/error.types';

/**
 * AuthorizationError — thrown when the Engine returns DENY.
 *
 * ERR-R1: Carries one of the 5 FrozenErrorCodes.
 * R-10: errorDetail is human-readable, NOT machine-readable.
 * SA-05: DENY is hard execution stop — Server Actions MUST throw this.
 */
export class AuthorizationError extends Error {
  public readonly errorCode: FrozenErrorCode;
  public readonly errorDetail: string;

  constructor(errorCode: FrozenErrorCode, errorDetail: string) {
    super(errorDetail);
    this.name = 'AuthorizationError';
    this.errorCode = errorCode;
    this.errorDetail = errorDetail;
  }
}

/**
 * InternalDiagnosticError — thrown on Resolution Failure.
 *
 * ERR-R2: Resolution failures propagate as diagnostic events.
 * FAIL-03: No Decision, No Error Code.
 * PIP-04: This is NOT an AuthorizationError and carries NO FrozenErrorCode.
 * R-15: Context Resolution Failure ≠ L3 INVALID_CONTEXT.
 */
export class InternalDiagnosticError extends Error {
  public readonly diagnosticMessage: string;

  constructor(diagnosticMessage: string) {
    super(diagnosticMessage);
    this.name = 'InternalDiagnosticError';
    this.diagnosticMessage = diagnosticMessage;
  }
}

/**
 * SystemError — thrown on technical failures (DB, network, RPC).
 *
 * ERR-R3: Technical errors are NOT authorization errors.
 */
export class SystemError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'SystemError';
    this.code = code;
  }
}
