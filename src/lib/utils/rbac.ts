// src/lib/utils/rbac.ts
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { User } from '@supabase/supabase-js';

export async function assertPosWriteAccess(idPos: string): Promise<{ user: User; id_pendeta?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('Sesi tidak valid. Silakan login ulang.');
  }

  const role = user.user_metadata?.role;
  const idPendeta = user.user_metadata?.id_pendeta;

  if (role === 'super_user') {
    return { user, id_pendeta: idPendeta };
  }

  // Pre-check for PJ or user
  if (role === 'pj' || role === 'user') {
    if (idPendeta) {
      const { data: penugasan } = await supabase
        .from('t_penugasan_pendeta')
        .select('id_tugas')
        .eq('id_pendeta', idPendeta)
        .eq('id_pos', idPos)
        .eq('status_tugas', 'Aktif')
        .is('tgl_selesai', null)
        .maybeSingle();

      if (penugasan) return { user, id_pendeta: idPendeta };
    }

    if (user.user_metadata?.id_pos === idPos) {
      return { user, id_pendeta: idPendeta };
    }
    
    logger.warn('RBAC Pre-check failed: User not assigned to this Pos', {
      userId: user.id,
      idPos,
    });
    throw new Error('Anda tidak memiliki akses tulis ke Pos Pelkes ini.');
  }

  // Pre-check for admin_mupel (checks if pos is in their mupel)
  if (role === 'admin_mupel') {
    const idMupel = user.user_metadata?.id_mupel;
    if (idMupel) {
      // Need to join m_pos_pelkes -> m_jemaat -> id_mupel
      // Fortunately we can just query m_pos_pelkes and m_jemaat
      const { data: pos } = await supabase
        .from('m_pos_pelkes')
        .select('id_pos, m_jemaat!inner(id_mupel)')
        .eq('id_pos', idPos)
        .eq('m_jemaat.id_mupel', idMupel)
        .maybeSingle();
      
      if (pos) return { user, id_pendeta: idPendeta };
    }
    logger.warn('RBAC Pre-check failed: Admin Mupel tried to access pos outside their mupel', {
      userId: user.id,
      idPos,
      idMupel,
    });
    throw new Error('Pos Pelkes ini tidak berada di bawah Mupel Anda.');
  }

  // Pre-check for KMJ (checks if pos is in their jemaat)
  if (role === 'kmj') {
    const idJemaat = user.user_metadata?.id_induk;
    if (idJemaat) {
      const { data: pos } = await supabase
        .from('m_pos_pelkes')
        .select('id_pos')
        .eq('id_pos', idPos)
        .eq('id_induk', idJemaat)
        .maybeSingle();
      
      if (pos) return { user, id_pendeta: idPendeta };
    }
    
    logger.warn('RBAC Pre-check failed: KMJ tried to access pos outside their jemaat', {
      userId: user.id,
      idPos,
      idJemaat,
    });
    throw new Error('Pos Pelkes ini tidak berada di bawah Jemaat Anda.');
  }

  throw new Error('Peran Anda tidak diizinkan.');
}
