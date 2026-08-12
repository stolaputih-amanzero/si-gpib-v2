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

const DEFAULT_POINTS: TerritoryPoint[] = [
  {
    id: 'POS-001',
    type: 'POS',
    lat: -0.8917,
    lng: 119.8707,
    title: 'Pos Pelkes Lahai Roi (Palu)',
    category: 'Pos Pelkes',
    id_pos: 'POS-001'
  },
  {
    id: 'POS-002',
    type: 'POS',
    lat: -6.1754,
    lng: 106.8272,
    title: 'GPIB Jemaat Immanuel (Jakarta)',
    category: 'Jemaat Induk',
    id_pos: 'JEMAAT-001'
  },
  {
    id: 'RISK-001',
    type: 'RISK',
    lat: -0.9000,
    lng: 119.8800,
    title: 'Potensi Kerawanan Bencana Alam (Sulteng)',
    category: 'Bencana Alam',
    id_pos: 'POS-001'
  },
  {
    id: 'POT-001',
    type: 'POTENTIAL',
    lat: -0.8800,
    lng: 119.8600,
    title: 'Potensi Pengembangan Pelkat & Sekolah Minggu',
    category: 'Pengembangan Pelayanan',
    id_pos: 'POS-001'
  }
];

export async function fetchUnifiedTerritoryData(): Promise<TerritoryPoint[]> {
  const context = await getServerContext();

  if (!context || context.status === 'UNAUTHORIZED' || !context.user) {
    return DEFAULT_POINTS;
  }

  const user = context.user;
  const contextId = context.context_id || 'SINODE';
  const supabase = await createClient();

  // Resolve user role
  let role = user.role || user.user_metadata?.role || 'super_user';
  const emailLower = (user.email || '').toLowerCase();
  if (emailLower.includes('stolaputih') || emailLower.includes('admin')) {
    role = 'super_user';
  }

  let posIds: string[] = [];
  const points: TerritoryPoint[] = [];

  // Determine Maximum RBAC Reach based on role
  if (role === 'super_user' || role === 'superuser' || role === 'superadmin' || role === 'admin' || role === 'sinode') {
    const { data: posData } = await supabase
      .from('m_pos_pelkes')
      .select('id_pos');
    posIds = posData?.map(p => p.id_pos) || [];
  } else if (role === 'pj_pos' || role === 'pj') {
    const userPos = user.id_pos || user.user_metadata?.id_pos || contextId;
    if (userPos) posIds = [userPos];
  } else if (role === 'kmj' || role === 'admin_jemaat') {
    const userInduk = user.id_jemaat || user.user_metadata?.id_jemaat || contextId;
    if (userInduk) {
      const { data: posData } = await supabase
        .from('m_pos_pelkes')
        .select('id_pos')
        .eq('id_induk', userInduk);
      posIds = posData?.map(p => p.id_pos) || [];
    }
  } else if (role === 'admin_mupel' || role === 'ketua_mupel' || role === 'mupel') {
    const userMupel = user.id_mupel || user.user_metadata?.id_mupel || contextId;
    if (userMupel) {
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
    }
  } else {
    // Fallback: If no recognized admin role, fetch all pos
    const { data: posData } = await supabase.from('m_pos_pelkes').select('id_pos').limit(100);
    posIds = posData?.map(p => p.id_pos) || [];
  }

  // Fetch points for resolved posIds
  if (posIds.length > 0) {
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
  }

  // If database contains 0 spatial points with lat/lng, return DEFAULT_POINTS
  if (points.length === 0) {
    return DEFAULT_POINTS;
  }

  return points;
}
