/**
 * SERVER ACTION INTEGRATION PATTERN (Phase 5 Reference)
 * 
 * async function createLogPastoralAction(formData: FormData) {
 *   // 1. Authorization (STATIC Contract ID — ECB-01)
 *   const result = await enforceContract('OC-PASTORAL-001', {
 *     target_entity: {
 *       entity_type: 'LogPastoral',
 *       entity_id: null,
 *       owning_context_id: formData.get('id_pos') as string,
 *     },
 *     operation_payload: {
 *       kegiatan: formData.get('kegiatan'),
 *       jml_jiwa: Number(formData.get('jml_jiwa')),
 *     },
 *   })
 * 
 *   // 2. Decision handling
 *   if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
 *     return { error: 'INTERNAL_ERROR' }
 *   }
 *   if (result.decision.result === 'DENY') {
 *     return { 
 *       error: result.decision.error_code, 
 *       detail: result.decision.error_detail 
 *     }
 *   }
 * 
 *   // 3. ALLOW → Execution (SA-04: technical validation ONLY)
 *   const supabase = createServerClient()
 *   // ... execute DB operation ...
 * 
 *   // 4. Layer 8 Audit (AFTER successful mutation — SA-07)
 *   // await auditLog.record({ ... })
 * 
 *   return { success: true }
 * }
 */

import { AuthorizationEngine } from '../engine/authorization-engine';
import type { 
  ContractId, 
  OperationInput, 
  AuthorizationResult,
  BaseIdentity,
  ActiveContextObject,
  IdentityObject
} from '../types';

import { getMockSession, getClaimedContextFromSession } from './session-helpers';
import { MockContextResolver } from '../engine/context-resolver';
import { MockIdentityResolver } from '../engine/identity-resolver';

export async function enforceContract(
  contractId: ContractId,
  operationInput: OperationInput
): Promise<AuthorizationResult> {
  
  // 1. Get current session (L1 Authentication boundary)
  const session = await getMockSession();
  if (!session) {
    // No valid session -> Context Resolution Failure equivalent
    return { status: 'CONTRACT_RESOLUTION_FAILURE', decision: null };
  }

  // 2. Base Identity Resolution (Step 2)
  const identityResolver = new MockIdentityResolver();
  const baseIdentity: BaseIdentity = await identityResolver.resolveBase(session);

  // 3. Active Context Resolution (Step 3)
  const claimedContextId = getClaimedContextFromSession(session);
  const contextResolver = new MockContextResolver();
  const activeContext: ActiveContextObject | null = await contextResolver.resolve(
    claimedContextId, 
    baseIdentity
  );

  // If Context Resolution fails -> NO Authorization Decision, NO Error Code
  if (!activeContext) {
    return { status: 'CONTRACT_RESOLUTION_FAILURE', decision: null };
  }

  // 4. Full Identity Resolution + Role Binding (Step 4)
  const fullIdentity: IdentityObject = await identityResolver.resolveFull(
    baseIdentity, 
    activeContext
  );

  // 5. Delegate to Authorization Engine (L2-L6)
  const engine = new AuthorizationEngine();
  const result = await engine.evaluate(contractId, operationInput, {
    identity: fullIdentity,
    activeContext: activeContext,
    currentState: operationInput.operation_payload?.currentState as string | null
  });

  if (result.status === 'EVALUATED') {
    return {
      ...result,
      context_resolution: { active_context: activeContext },
      identity_resolution: { base_identity: baseIdentity, full_identity: fullIdentity },
      role_binding: { effective_system_role: fullIdentity.role_bindings.effective_system_role }
    } as AuthorizationResult;
  }

  return result as AuthorizationResult;
}
