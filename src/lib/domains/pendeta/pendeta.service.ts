'use server';

import { createClient } from '@/lib/supabase/server';
import type { Pendeta360 } from './pendeta.types';

export async function getPendeta360(idPendeta: string): Promise<Pendeta360> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  const scopeMupel = user.user_metadata?.id_mupel || null;
  const scopeJemaat = user.user_metadata?.id_induk || null;

  const { data, error } = await supabase.rpc('get_pendeta_360', {
    p_id_pendeta: idPendeta,
    p_requester_role: role,
    p_requester_scope_mupel: scopeMupel,
    p_requester_scope_jemaat: scopeJemaat,
  });

  if (error) {
    if (error.message.includes('RBAC_VIOLATION')) {
      throw new Error('Anda tidak memiliki akses ke profil pendeta ini');
    }
    throw error;
  }

  return data as Pendeta360;
}
