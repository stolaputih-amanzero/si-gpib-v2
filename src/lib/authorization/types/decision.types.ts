import type { ContractId } from './contract.types';
import type { FrozenErrorCode } from './error.types';

export interface AuthorizationDecision {
  result: 'ALLOW' | 'DENY';
  error_code: FrozenErrorCode | null;
  error_detail: string | null;
  contract_id: ContractId;
}

export type EngineEvaluationResult =
  | { status: 'CONTRACT_RESOLUTION_FAILURE'; decision: null }
  | { status: 'EVALUATED'; decision: AuthorizationDecision };

export type AuthorizationResult =
  | { status: 'CONTRACT_RESOLUTION_FAILURE'; decision: null }
  | { 
      status: 'EVALUATED'; 
      decision: AuthorizationDecision;
      context_resolution: { active_context: import('./identity.types').ActiveContextObject | null };
      identity_resolution: { base_identity: import('./identity.types').BaseIdentity, full_identity: import('./identity.types').IdentityObject };
      role_binding: { effective_system_role: string };
    };

export type OperationPayload = Record<string, unknown>;

export interface OperationInput {
  target_entity: any;
  operation_payload: OperationPayload;
}

export type EvaluatorResult =
  | { passed: true }
  | { passed: false; error_code: FrozenErrorCode; error_detail: string };
