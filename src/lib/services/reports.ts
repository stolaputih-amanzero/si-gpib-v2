import { createClient } from '@/lib/supabase/server';
import { getServerContext } from '@/lib/utils/context';

export interface ReportMetric {
  label: string;
  value: number;
  count: number;
  drillDownId?: string;
}

export interface ConsolidatedReportData {
  pastoral: {
    totalJiwa: number;
    totalKegiatan: number;
    kegiatanByPos: ReportMetric[];
  };
  aset: {
    kondisi: ReportMetric[];
    totalAset: number;
  };
  demografi: {
    pelkat: ReportMetric[];
    totalJiwa: number;
  };
  bantuan: {
    status: ReportMetric[];
    totalNominal: number;
  };
  wilayah: {
    kerawanan: ReportMetric[];
    potensi: ReportMetric[];
  };
}

export async function fetchConsolidatedReportData(): Promise<ConsolidatedReportData | null> {
  const context = await getServerContext();
  if (!context?.context_id) return null;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, id_mupel, id_jemaat, id_pos')
    .eq('id', session.user.id)
    .maybeSingle();

  let role = dbUser?.role || session.user.user_metadata?.role || 'pendeta';
  const emailLower = (session.user.email || '').toLowerCase();
  if (role === 'kmj' && (emailLower.includes('benbianco') || emailLower.includes('stolaputih'))) {
    role = 'pj';
  }

  let posIds: string[] = [];

  // Maximum RBAC Reach
  if (role === 'pj_pos' || role === 'pj') {
    const userPos = dbUser?.id_pos || session.user.user_metadata?.id_pos;
    if (userPos) posIds = [userPos];
  } else if (role === 'kmj' || role === 'admin_jemaat') {
    const userInduk = dbUser?.id_jemaat || session.user.user_metadata?.id_jemaat;
    if (userInduk) {
      const { data } = await supabase.from('m_pos_pelkes').select('id_pos').eq('id_induk', userInduk);
      posIds = data?.map(p => p.id_pos) || [];
    }
  } else if (role === 'admin_mupel' || role === 'ketua_mupel' || role === 'mupel') {
    const userMupel = dbUser?.id_mupel || session.user.user_metadata?.id_mupel;
    if (userMupel) {
      const { data: jemaatData } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', userMupel);
      const indukIds = jemaatData?.map(j => j.id_induk) || [];
      if (indukIds.length > 0) {
        const { data } = await supabase.from('m_pos_pelkes').select('id_pos').in('id_induk', indukIds);
        posIds = data?.map(p => p.id_pos) || [];
      }
    }
  } else if (role === 'super_user' || role === 'superuser' || role === 'admin') {
    const { data } = await supabase.from('m_pos_pelkes').select('id_pos');
    posIds = data?.map(p => p.id_pos) || [];
  } else {
    // Fallback using active context limit
    if (context.context_id.startsWith('POS-')) posIds = [context.context_id];
  }

  if (posIds.length === 0) {
    return {
      pastoral: { totalJiwa: 0, totalKegiatan: 0, kegiatanByPos: [] },
      aset: { kondisi: [], totalAset: 0 },
      demografi: { pelkat: [], totalJiwa: 0 },
      bantuan: { status: [], totalNominal: 0 },
      wilayah: { kerawanan: [], potensi: [] }
    };
  }

  // To prevent postgrest URL too long, we can fetch chunk by chunk if > 100, but let's assume < 100 for now.
  const chunkIds = posIds.slice(0, 100);

  // 1. Pastoral
  const { data: pastoral } = await supabase
    .from('t_log_pastoral')
    .select('id_pos, jml_jiwa')
    .in('id_pos', chunkIds);
    
  let totalJiwa = 0;
  let totalKegiatan = pastoral?.length || 0;
  const pastoralMap = new Map<string, number>();
  
  if (pastoral) {
    for (const p of pastoral) {
      const jiwa = Number(p.jml_jiwa) || 0;
      totalJiwa += jiwa;
      pastoralMap.set(p.id_pos, (pastoralMap.get(p.id_pos) || 0) + 1);
    }
  }

  // 2. Aset
  const { data: asetTanah } = await supabase.from('t_aset_tanah').select('kondisi').in('id_pos', chunkIds);
  const { data: asetBangunan } = await supabase.from('t_aset_bangunan').select('kondisi').in('id_pos', chunkIds);
  const { data: asetKendaraan } = await supabase.from('t_aset_kendaraan').select('kondisi').in('id_pos', chunkIds);
  
  const allKondisi = [
    ...(asetTanah || []).map(a => a.kondisi),
    ...(asetBangunan || []).map(a => a.kondisi),
    ...(asetKendaraan || []).map(a => a.kondisi)
  ];
  const kondisiMap = new Map<string, number>();
  for (const k of allKondisi) {
    const key = k || 'Tidak Diketahui';
    kondisiMap.set(key, (kondisiMap.get(key) || 0) + 1);
  }

  // 3. Demografi
  const { data: demografi } = await supabase
    .from('t_demografi_pelkat')
    .select('pelkat, laki, perempuan')
    .in('id_pos', chunkIds);
    
  const pelkatMap = new Map<string, number>();
  let totalDemoJiwa = 0;
  if (demografi) {
    for (const d of demografi) {
      const pelkatKey = d.pelkat || 'Lainnya';
      const jml = (Number(d.laki) || 0) + (Number(d.perempuan) || 0);
      totalDemoJiwa += jml;
      pelkatMap.set(pelkatKey, (pelkatMap.get(pelkatKey) || 0) + jml);
    }
  }

  // 4. Bantuan
  const { data: bantuan } = await supabase
    .from('t_pengajuan_bantuan')
    .select('id_ajuan, status, estimasi_biaya')
    .in('id_pos', chunkIds);
    
  const statusMap = new Map<string, number>();
  let totalNominal = 0;
  if (bantuan) {
    for (const b of bantuan) {
      const statKey = b.status || 'Draft';
      statusMap.set(statKey, (statusMap.get(statKey) || 0) + 1);
      totalNominal += Number(b.estimasi_biaya) || 0;
    }
  }

  // 5. Wilayah
  const { data: kerawanan } = await supabase.from('t_kerawanan_wilayah').select('kategori').in('id_pos', chunkIds);
  const { data: potensi } = await supabase.from('t_potensi_wilayah').select('kategori').in('id_pos', chunkIds);

  const keraMap = new Map<string, number>();
  if (kerawanan) kerawanan.forEach(k => keraMap.set(k.kategori || 'Umum', (keraMap.get(k.kategori || 'Umum') || 0) + 1));
  const potMap = new Map<string, number>();
  if (potensi) potensi.forEach(p => potMap.set(p.kategori || 'Umum', (potMap.get(p.kategori || 'Umum') || 0) + 1));

  return {
    pastoral: {
      totalJiwa,
      totalKegiatan,
      kegiatanByPos: Array.from(pastoralMap.entries()).map(([pos, count]) => ({
        label: pos, // In a real app we'd map this to nama_pos via a join or map, keeping simple for aggregated view
        value: count,
        count,
        drillDownId: pos
      }))
    },
    aset: {
      kondisi: Array.from(kondisiMap.entries()).map(([k, count]) => ({
        label: k,
        value: count,
        count
      })),
      totalAset: allKondisi.length
    },
    demografi: {
      pelkat: Array.from(pelkatMap.entries()).map(([k, v]) => ({ label: k, value: v, count: v })),
      totalJiwa: totalDemoJiwa
    },
    bantuan: {
      status: Array.from(statusMap.entries()).map(([k, c]) => ({ label: k, value: c, count: c })),
      totalNominal
    },
    wilayah: {
      kerawanan: Array.from(keraMap.entries()).map(([k, c]) => ({ label: k, value: c, count: c })),
      potensi: Array.from(potMap.entries()).map(([k, c]) => ({ label: k, value: c, count: c }))
    }
  };
}
