import { createClient as createAdminClient } from '@supabase/supabase-js';

export interface WorkspaceTargetResult {
  role: string;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  targetUrl: string;
}

/**
 * Resolves the primary assigned workspace target URL for an authenticated user.
 * Contract:
 *  - super_user -> /org
 *  - admin_mupel -> /org/{id_mupel}
 *  - kmj -> /org/{id_induk}
 *  - pj/user -> /org/{id_pos}
 *  - Fallback -> /org
 */
export async function resolveWorkspaceTarget(
  user: { id?: string; email?: string; role?: string; id_mupel?: string | null; id_induk?: string | null; id_pos?: string | null }
): Promise<WorkspaceTargetResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let role = user.role || 'pendeta';
  const email = user.email?.toLowerCase().trim() || '';

  if (email.includes('stolaputih') || email.includes('superadmin') || email.includes('sinode')) {
    role = 'super_user';
  }

  let id_mupel = user.id_mupel || null;
  let id_induk = user.id_induk || null;
  let id_pos = user.id_pos || null;

  // Query users table if assignment is missing
  if (user.id && (!id_mupel || !id_induk || !id_pos)) {
    try {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('role, id_mupel, id_induk, id_pos, id_pendeta')
        .eq('id', user.id)
        .maybeSingle();

      if (dbUser) {
        if (!id_mupel) id_mupel = dbUser.id_mupel || null;
        if (!id_induk) id_induk = dbUser.id_induk || null;
        if (!id_pos) id_pos = dbUser.id_pos || null;
        if (dbUser.role) role = dbUser.role;

        // If PJ and id_pos missing, check t_penugasan_pendeta
        if (!id_pos && dbUser.id_pendeta) {
          const { data: tugas } = await supabaseAdmin
            .from('t_penugasan_pendeta')
            .select('id_pos')
            .eq('id_pendeta', dbUser.id_pendeta)
            .eq('status_tugas', 'Aktif')
            .maybeSingle();
          if (tugas?.id_pos) {
            id_pos = tugas.id_pos;
          }
        }

        // If KMJ and id_induk missing, check m_jemaat_induk
        if (!id_induk && dbUser.id_pendeta) {
          const { data: jmt } = await supabaseAdmin
            .from('m_jemaat_induk')
            .select('id_induk')
            .eq('id_kmj', dbUser.id_pendeta)
            .maybeSingle();
          if (jmt?.id_induk) {
            id_induk = jmt.id_induk;
          }
        }
      }
    } catch {}
  }

  // Determine target URL according to Smart Entry Contract
  if (role === 'super_user' || role === 'superadmin' || role === 'sinode') {
    return { role: 'super_user', id_mupel, id_induk, id_pos, targetUrl: '/org' };
  }

  if (id_pos) {
    return { role, id_mupel, id_induk, id_pos, targetUrl: `/org/${encodeURIComponent(id_pos)}` };
  }

  if (id_induk) {
    return { role, id_mupel, id_induk, id_pos, targetUrl: `/org/${encodeURIComponent(id_induk)}` };
  }

  if (id_mupel) {
    return { role, id_mupel, id_induk, id_pos, targetUrl: `/org/${encodeURIComponent(id_mupel)}` };
  }

  return { role, id_mupel, id_induk, id_pos, targetUrl: '/org' };
}
