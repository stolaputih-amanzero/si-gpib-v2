import { createClient } from '@/lib/supabase/server';
import { getServerContext } from '@/lib/utils/context';

export interface UnifiedPersonData {
  id: string;
  name: string;
  nip: string | null;
  status: string;
  avatar_url: string | null;
  bio: any;
  stats: any;
  keluarga: any[] | null; // null if unauthorized (privacy matrix)
  kompetensi: any[];
  keterlibatan: any[];
  mutasi: any[];
  jabatan: any[];
  biometric: any[] | null; // null if unauthorized
  audit_log: any[] | null;
  penugasan: any[]; // Hydrated concurrently
  log_pastoral: any[]; // Hydrated concurrently
  can_see_private: boolean;
}

export async function fetchUnifiedPersonData(personId: string): Promise<UnifiedPersonData | null> {
  const supabase = await createClient();
  const context = await getServerContext();
  const contextId = context?.context_id;

  if (!context || !contextId) {
    return null; // Must have active context
  }

  // Determine scope parameters for RPC
  let mupelScope = null;
  let jemaatScope = null;
  
  if (contextId.startsWith('MUPEL')) mupelScope = contextId;
  else if (contextId.startsWith('POS')) jemaatScope = null; // Assuming Pos uses Jemaat or no strict RPC scope
  else jemaatScope = contextId; // Assuming Jemaat ID

  // If POS, the RPC will fallback to user-level or KMJ level check if needed.
  // We pass activeCtx.role as requester_role, or fallback to 'user' if not available in ctx.
  // Note: activeContext may not have 'role' directly, so we map it based on the contract or we pass 'admin_mupel'/'kmj' based on the level if they have access.
  // But wait, the RPC expects p_requester_role ('super_user', 'admin_mupel', 'kmj', 'pj', 'user').
  // Let's get the user's role from auth or session.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Derive p_requester_role from context level since we don't store strict global roles here
  let p_requester_role = 'user';
  if (contextId.startsWith('MUPEL')) p_requester_role = 'admin_mupel';
  else if (contextId.startsWith('POS')) p_requester_role = 'pj';
  else p_requester_role = 'kmj';
  // Super admin check can be done via app_metadata
  if (user.app_metadata?.role === 'super_user') p_requester_role = 'super_user';

  // 1. Concurrent Fetching: RPC + Penugasan + Log Pastoral
  const [rpcRes, penugasanRes, logRes] = await Promise.all([
    supabase.rpc('get_pendeta_360', {
      p_id_pendeta: personId,
      p_requester_role,
      p_requester_scope_mupel: mupelScope,
      p_requester_scope_jemaat: jemaatScope
    }),
    supabase.from('t_penugasan_pendeta')
      .select('*, m_pos_pelkes(nama_pos, jemaat_induk)')
      .eq('id_pendeta', personId)
      .order('tgl_mulai', { ascending: false }),
    supabase.from('t_log_pastoral')
      .select('*, m_pos_pelkes(nama_pos)')
      .eq('id_pendeta', personId)
      .order('tgl', { ascending: false })
      .limit(15) // Limit initial payload
  ]);

  if (rpcRes.error) {
    console.error('Error fetching pendeta_360:', rpcRes.error);
    return null; // RBAC failure or not found
  }

  const data = rpcRes.data as any;
  if (!data || !data.pendeta) return null;

  // Guardrail A: Server-Side Privacy Enforcement
  // Explicitly nullify family and biometric if the user is not self or super_user
  const isSelf = user.user_metadata?.person_id === personId || user.id === personId; // Approximation depending on how id_pendeta is linked to auth.users
  // Actually, get_pendeta_360 RPC already handles `can_see_private` logic based on role!
  // BUT we add an extra layer of strict enforcement here just in case.
  const canSeePrivate = p_requester_role === 'super_user' || isSelf;

  return {
    id: data.pendeta.id_pendeta,
    name: data.pendeta.nama_lengkap,
    nip: data.pendeta.nip || null,
    status: data.pendeta.status_keaktifan || 'Aktif',
    avatar_url: data.pendeta.foto_url || null,
    bio: data.pendeta,
    stats: data.stats || {},
    keluarga: canSeePrivate ? data.keluarga : null,
    kompetensi: data.kompetensi || [],
    keterlibatan: data.keterlibatan || [],
    mutasi: data.mutasi || [],
    jabatan: data.jabatan || [],
    biometric: canSeePrivate ? data.biometric : null,
    audit_log: data.audit_log || null,
    penugasan: penugasanRes.data || [],
    log_pastoral: logRes.data || [],
    can_see_private: canSeePrivate
  };
}
