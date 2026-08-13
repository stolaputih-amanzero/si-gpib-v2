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
  let user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
    if (sessionCookie) {
      try {
        user = JSON.parse(sessionCookie);
      } catch {}
    }
  }
  
  if (!user) {
    throw new AuthorizationError('NOT_AUTHORIZED', 'Not authenticated');
  }

  const resolvedContextId = 
    cookieStore.get('sigpib_active_context')?.value || 
    (user as any)?.id_pos || 
    (user as any)?.user_metadata?.id_pos || 
    (user as any)?.id_induk || 
    (user as any)?.user_metadata?.id_induk || 
    'POS-43938';
  
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
