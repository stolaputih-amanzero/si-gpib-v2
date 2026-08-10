import { createClient } from '@/lib/supabase/server';
import { getServerContext } from '@/lib/utils/context';

export interface TerritoryPoint {
  id: string;
  type: 'POS' | 'RISK' | 'POTENTIAL';
  lat: number;
  lng: number;
  title: string;
  category: string;
  id_pos: string;
  count?: number;
}

export async function fetchUnifiedTerritoryData() {
  const context = await getServerContext();
  const contextId = context?.context_id;

  if (!context || !contextId) {
    return null;
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }

  // Get user's Maximum RBAC Reach (fetch their db record directly since this is server-side)
  const { data: dbUser } = await supabase
    .from('users')
    .select('role, id_mupel, id_jemaat, id_pos')
    .eq('id', session.user.id)
    .maybeSingle();

  // Determine effective role (same logic as api/auth/me)
  let role = dbUser?.role || session.user.user_metadata?.role || 'pendeta';
  const emailLower = (session.user.email || '').toLowerCase();
  if (role === 'kmj' && emailLower.includes('benbianco')) {
    role = 'pj';
  }

  let posIds: string[] = [];
  const points: TerritoryPoint[] = [];

  // Determine Maximum RBAC Reach based on role
  if (role === 'pj_pos' || role === 'pj') {
    const userPos = dbUser?.id_pos || session.user.user_metadata?.id_pos;
    if (!userPos) return null;
    posIds = [userPos];
  } else if (role === 'kmj' || role === 'admin_jemaat') {
    const userInduk = dbUser?.id_jemaat || session.user.user_metadata?.id_jemaat;
    if (!userInduk) return null;
    const { data: posData } = await supabase
      .from('m_pos_pelkes')
      .select('id_pos')
      .eq('id_induk', userInduk);
    posIds = posData?.map(p => p.id_pos) || [];
  } else if (role === 'admin_mupel' || role === 'ketua_mupel' || role === 'mupel') {
    const userMupel = dbUser?.id_mupel || session.user.user_metadata?.id_mupel;
    if (!userMupel) return null;
    // Get all Jemaat in Mupel
    const { data: jemaatData } = await supabase
      .from('m_jemaat_induk')
      .select('id_induk')
      .eq('id_mupel', userMupel);
    const indukIds = jemaatData?.map(j => j.id_induk) || [];
    
    if (indukIds.length > 0) {
      const { data: posData } = await supabase
        .from('m_pos_pelkes')
        .select('id_pos')
        .in('id_induk', indukIds);
      posIds = posData?.map(p => p.id_pos) || [];
    }
  } else if (role === 'super_user' || role === 'superuser' || role === 'superadmin' || role === 'admin' || role === 'sinode') {
    // Fetch all globally (limit logic if needed)
    const { data: posData } = await supabase
      .from('m_pos_pelkes')
      .select('id_pos');
    posIds = posData?.map(p => p.id_pos) || [];
  } else {
    // Fallback: If no recognized admin role, try to use contextId as limit
    if (contextId.startsWith('POS-')) {
      posIds = [contextId];
    } else if (contextId.startsWith('JEMAAT-')) {
      const { data: posData } = await supabase.from('m_pos_pelkes').select('id_pos').eq('id_induk', contextId);
      posIds = posData?.map(p => p.id_pos) || [];
    }
  }

  if (posIds.length === 0) return points;

  // Split into chunks to avoid URL too long / postgrest limits
  const chunkSize = 100;
  for (let i = 0; i < posIds.length; i += chunkSize) {
    const chunkIds = posIds.slice(i, i + chunkSize);

    // Fetch POS
    const { data: posList } = await supabase
      .from('m_pos_pelkes')
      .select('id_pos, nama_pos, latitude, longitude, status_pos')
      .in('id_pos', chunkIds)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (posList) {
      posList.forEach(pos => {
        points.push({
          id: `POS-${pos.id_pos}`,
          type: 'POS',
          lat: Number(pos.latitude),
          lng: Number(pos.longitude),
          title: pos.nama_pos || 'Pos Pelkes',
          category: pos.status_pos || 'Unknown',
          id_pos: pos.id_pos,
        });
      });
    }

    // Fetch RISKS
    const { data: risksList } = await supabase
      .from('t_kerawanan_wilayah')
      .select('id_risiko, jenis_risiko, kategori, latitude, longitude, id_pos')
      .in('id_pos', chunkIds)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (risksList) {
      risksList.forEach(risk => {
        points.push({
          id: `RISK-${risk.id_risiko}`,
          type: 'RISK',
          lat: Number(risk.latitude),
          lng: Number(risk.longitude),
          title: risk.jenis_risiko || 'Risiko',
          category: risk.kategori || 'Umum',
          id_pos: risk.id_pos!,
        });
      });
    }

    // Fetch POTENTIALS
    const { data: potList } = await supabase
      .from('t_potensi_wilayah')
      .select('id_potensi, nama_potensi, kategori, latitude, longitude, id_pos')
      .in('id_pos', chunkIds)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (potList) {
      potList.forEach(pot => {
        points.push({
          id: `POT-${pot.id_potensi}`,
          type: 'POTENTIAL',
          lat: Number(pot.latitude),
          lng: Number(pot.longitude),
          title: pot.nama_potensi || 'Potensi',
          category: pot.kategori || 'Umum',
          id_pos: pot.id_pos!,
        });
      });
    }
  }

  return points;
}
