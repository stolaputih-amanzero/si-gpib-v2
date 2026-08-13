import { createClient as createServerClient } from '@/lib/supabase/server';
import {
  enforceContract,
  AuthorizationError,
  InternalDiagnosticError,
  type ContractId,
  type OperationInput,
} from '@/lib/authorization';

import { cookies } from 'next/headers';

export async function enforceReadAccess(
  contractId: ContractId,
  operationInput: OperationInput,
): Promise<void> {
  const supabase = await createServerClient();
  const cookieStore = await cookies();
  const resolvedContextId = cookieStore.get('sigpib_active_context')?.value || '';
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  const result = await enforceContract(
    contractId,
    operationInput,
    supabase,
    user.id,
    resolvedContextId
  );
  
  if (result.status === 'DENY') {
    throw new AuthorizationError(result.errorCode, result.errorDetail);
  }
  if (result.status === 'RESOLUTION_FAILURE') {
    throw new InternalDiagnosticError(result.diagnosticMessage);
  }
}
