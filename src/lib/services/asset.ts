import { createClient } from '@/lib/supabase/server';
import { getServerContext } from '@/lib/utils/context';

export interface UnifiedAssetData {
  orgName: string;
  orgLevel: string;
  summary: {
    totalTanah: number;
    totalBangunan: number;
    totalBergerak: number;
    totalLampiran: number;
  };
  tanah: any[];
  bangunan: any[];
  bergerak: any[];
  children?: {
    id: string;
    name: string;
    stats: {
      tanah: number;
      bangunan: number;
      bergerak: number;
    };
  }[];
}

export async function fetchUnifiedAssetData(orgId: string): Promise<UnifiedAssetData | null> {
  const supabase = await createClient();
  const context = await getServerContext();
  const contextId = context?.context_id;

  if (!context || !contextId) {
    return null;
  }

  // Determine org info
  let orgName = '';
  let orgLevel = '';
  let childIds: string[] = [];
  let children: any[] = [];

  if (orgId.startsWith('MUPEL-')) {
    orgLevel = 'MUPEL';
    const { data: mupel } = await supabase.from('m_mupel').select('nama_mupel').eq('id_mupel', orgId).single();
    orgName = mupel?.nama_mupel || orgId;

    // Get all pos under this mupel
    const { data: posList } = await supabase
      .from('m_pos_pelkes')
      .select('id_pos, nama_pos, m_jemaat_induk!inner(id_mupel)')
      .eq('m_jemaat_induk.id_mupel', orgId);
    
    if (posList) {
      childIds = posList.map((p: any) => p.id_pos);
      children = posList.map((p: any) => ({ id: p.id_pos, name: p.nama_pos, stats: { tanah: 0, bangunan: 0, bergerak: 0 } }));
    }
  } else if (orgId.startsWith('POS-')) {
    orgLevel = 'POS';
    const { data: pos } = await supabase.from('m_pos_pelkes').select('nama_pos').eq('id_pos', orgId).single();
    orgName = pos?.nama_pos || orgId;
    childIds = [orgId];
  } else {
    orgLevel = 'JEMAAT';
    const { data: jemaat } = await supabase.from('m_jemaat_induk').select('nama_induk').eq('id_induk', orgId).single();
    orgName = jemaat?.nama_induk || orgId;

    // Get all pos under this jemaat
    const { data: posList } = await supabase.from('m_pos_pelkes').select('id_pos, nama_pos').eq('id_induk', orgId);
    if (posList) {
      childIds = posList.map(p => p.id_pos);
      children = posList.map(p => ({ id: p.id_pos, name: p.nama_pos, stats: { tanah: 0, bangunan: 0, bergerak: 0 } }));
    }
  }

  // If no children found, return empty
  if (childIds.length === 0) {
    return {
      orgName,
      orgLevel,
      summary: { totalTanah: 0, totalBangunan: 0, totalBergerak: 0, totalLampiran: 0 },
      tanah: [],
      bangunan: [],
      bergerak: [],
      children: orgLevel !== 'POS' ? children : undefined
    };
  }

  // Fetch all assets for these pos
  const [tanahRes, bangunanRes, bergerakRes] = await Promise.all([
    supabase.from('t_aset_tanah').select('*, m_pos_pelkes(nama_pos)').in('id_pos', childIds),
    supabase.from('t_aset_bangunan').select('*, m_pos_pelkes(nama_pos)').in('id_pos', childIds),
    supabase.from('t_aset_bbergerak').select('*, m_pos_pelkes(nama_pos)').in('id_pos', childIds)
  ]);

  const tanah = tanahRes.data || [];
  const bangunan = bangunanRes.data || [];
  const bergerak = bergerakRes.data || [];

  // Populate children stats if MUPEL/JEMAAT
  if (orgLevel !== 'POS') {
    children.forEach(child => {
      child.stats.tanah = tanah.filter((t: any) => t.id_pos === child.id).length;
      child.stats.bangunan = bangunan.filter((b: any) => b.id_pos === child.id).length;
      child.stats.bergerak = bergerak.filter((b: any) => b.id_pos === child.id).length;
    });
  }

  return {
    orgName,
    orgLevel,
    summary: {
      totalTanah: tanah.length,
      totalBangunan: bangunan.length,
      totalBergerak: bergerak.length,
      totalLampiran: 0 // Will query if needed
    },
    tanah,
    bangunan,
    bergerak,
    children: orgLevel !== 'POS' ? children : undefined
  };
}
