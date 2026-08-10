import { createClient } from '@/lib/supabase/server';

export interface DemografiData {
  kategori_pelkat: string;
  jml_kk: number;
  laki: number;
  perempuan: number;
  profesi?: string | null;
  pendidikan?: string | null;
  keterangan?: string | null;
}

export interface ChildOrgSummary {
  id: string;
  name: string;
  type: string;
  address?: string | null;
  stats?: {
    pos_count?: number;
    bajem_count?: number;
  };
}

export interface SDMRecord {
  id: string;
  name: string;
  role: string;
  is_kmj?: boolean;
  is_pj?: boolean;
  contact?: string | null;
  subtitle?: string | null;
  avatar_url?: string | null;
}

export interface PastoralLogRecord {
  id: string;
  date: string;
  activity: string;
  description?: string | null;
  pastor_name?: string | null;
  attendance?: number | null;
}

export interface JadwalRecord {
  id: string;
  type: string;
  day: string;
  time: string;
  timezone?: string | null;
  description?: string | null;
}

export interface AssetRecord {
  id: string;
  category: 'TANAH' | 'BANGUNAN' | 'BERGERAK';
  name: string;
  condition?: string | null;
  legal_status?: string | null;
  value?: number | null;
  acquisition_date?: string | null;
}

export interface WilayahRecord {
  id: string;
  type: 'RISIKO' | 'POTENSI';
  category: string;
  name: string;
  description?: string | null;
}

export interface AidRequestRecord {
  id: string;
  title: string;
  status: string;
  date: string;
  amount_requested?: number | null;
  category?: string | null;
}

export interface UnifiedOrganizationData {
  id: string;
  name: string;
  level: 'MUPEL' | 'JEMAAT' | 'POS';
  subtype?: 'BAJEM' | 'JEMAAT_INDUK' | 'JEMAAT_INDUK_MANDIRI'; 
  profile: {
    address: string;
    lat: number | null;
    lng: number | null;
    photo_url?: string | null;
    created_at?: string | null;
  };
  kpis: {
    total_jiwa?: number;
    total_aset?: number;
    pending_aid_requests?: number;
    total_jemaat?: number;
    total_pos?: number;
    total_pendeta?: number;
  };
  demographics?: DemografiData[];
  child_organizations?: ChildOrgSummary[];
  sdm_list?: SDMRecord[];
  pastoral_logs?: PastoralLogRecord[];
  jadwal_ibadah?: JadwalRecord[];
  assets?: AssetRecord[];
  wilayah?: WilayahRecord[];
  aid_requests?: AidRequestRecord[];
  
  // Basic relationships
  parent_mupel?: { id: string; name: string } | null;
  parent_jemaat?: { id: string; name: string } | null;
}

export async function fetchUnifiedOrganizationData(id_org: string): Promise<UnifiedOrganizationData | null> {
  const supabase = await createClient();
  
  if (id_org.startsWith('MUPEL-')) {
    const { data: mupel } = await supabase.from('m_mupel').select('*').eq('id_mupel', id_org).maybeSingle();
    if (!mupel) return null;
    
    // Fetch children
    const { data: children } = await supabase.from('m_jemaat_induk').select('id_induk, nama_induk, alamat').eq('id_mupel', id_org);
    const mappedChildren: ChildOrgSummary[] = (children || []).map(c => ({
      id: c.id_induk,
      name: c.nama_induk,
      type: 'Jemaat Induk',
      address: c.alamat
    }));
    
    return {
      id: mupel.id_mupel,
      name: mupel.nama_mupel,
      level: 'MUPEL',
      profile: {
        address: mupel.keterangan || '',
        lat: null,
        lng: null,
        created_at: mupel.created_at,
      },
      kpis: {
        total_jemaat: mappedChildren.length,
      },
      child_organizations: mappedChildren,
    };
  } else if (id_org.startsWith('JEMAAT-')) {
    const { data: jemaat } = await supabase.from('m_jemaat_induk').select('*, mupel:m_mupel(nama_mupel)').eq('id_induk', id_org).maybeSingle();
    if (!jemaat) return null;
    
    // Fetch children
    const { data: children } = await supabase.from('m_pos_pelkes').select('id_pos, nama_pos, kategori, alamat').eq('id_induk', id_org);
    const mappedChildren: ChildOrgSummary[] = (children || []).map(c => ({
      id: c.id_pos,
      name: c.nama_pos,
      type: c.kategori || 'Pos Pelkes',
      address: c.alamat
    }));
    
    return {
      id: jemaat.id_induk,
      name: jemaat.nama_induk,
      level: 'JEMAAT',
      profile: {
        address: jemaat.keterangan || '',
        lat: jemaat.latitude,
        lng: jemaat.longitude,
        created_at: jemaat.created_at,
      },
      kpis: {
        total_pos: mappedChildren.length,
      },
      child_organizations: mappedChildren,
      parent_mupel: jemaat.id_mupel ? { id: jemaat.id_mupel, name: (Array.isArray(jemaat.mupel) ? jemaat.mupel[0] : jemaat.mupel)?.nama_mupel || '' } : null,
    };
  } else if (id_org.startsWith('POS-')) {
    const { data: pos } = await supabase.from('m_pos_pelkes')
      .select('*, jemaat_induk:m_jemaat_induk(id_induk, nama_induk, id_mupel, mupel:m_mupel(id_mupel, nama_mupel))')
      .eq('id_pos', id_org).maybeSingle();
    if (!pos) return null;
    
    const { data: demografi } = await supabase.from('t_demografi_pelkat').select('*').eq('id_pos', id_org);

    // Fetch lists concurrently
    const [
      { data: pelayan },
      { data: relawan },
      { data: logs },
      { data: jadwal },
      { data: kerawanan },
      { data: potensi },
      { data: asetTanah },
      { data: asetBangunan },
      { data: asetBergerak },
      { data: bantuan }
    ] = await Promise.all([
      supabase.from('t_pelayan').select('id_pelayan, nama, jabatan, foto_url').eq('id_pos', id_org).eq('status', 'Aktif').limit(10),
      supabase.from('t_relawan').select('id_relawan, nama, kategori, foto_url').eq('id_pos', id_org).limit(10),
      supabase.from('t_log_pastoral').select('id_log, tgl, kegiatan, catatan, pendeta:m_pendeta(nama_lengkap), jml_jiwa').eq('id_pos', id_org).order('tgl', { ascending: false }).limit(5),
      supabase.from('t_jadwal_ibadah').select('id_ibadah, jenis, hari, jam, keterangan').eq('id_pos', id_org).limit(10),
      supabase.from('t_kerawanan_wilayah').select('id_risiko, jenis_risiko, kategori, keterangan').eq('id_pos', id_org).limit(5),
      supabase.from('t_potensi_wilayah').select('id_potensi, nama_potensi, kategori, keterangan').eq('id_pos', id_org).limit(5),
      supabase.from('t_aset_tanah').select('id_aset, nama_aset, status_hukum, tgl_perolehan, nilai_aset').eq('id_pos', id_org).limit(5),
      supabase.from('t_aset_bangunan').select('id_aset, nama_aset, kondisi, tgl_perolehan, nilai_aset').eq('id_pos', id_org).limit(5),
      supabase.from('t_aset_bbergerak').select('id_aset, nama_aset, kondisi, tgl_perolehan, nilai_aset').eq('id_pos', id_org).limit(5),
      supabase.from('t_pengajuan_bantuan').select('id_ajuan, judul_ajuan, status_ajuan, tgl_pengajuan, nominal_disetujui').eq('id_pos', id_org).limit(5)
    ]);
    
    let subtype = undefined;
    const isJemaatInduk = Boolean(
      pos.kategori === 'Jemaat Induk' ||
      pos.kategori === 'Jemaat Induk Mandiri' ||
      pos.id_pos === pos.id_induk
    );
    if (isJemaatInduk) {
      subtype = 'JEMAAT_INDUK_MANDIRI';
    } else if (pos.kategori === 'Bajem' || pos.nama_pos.toLowerCase().includes('bajem')) {
      subtype = 'BAJEM';
    }

    const parentJemaat: any = Array.isArray(pos.jemaat_induk) ? pos.jemaat_induk[0] : pos.jemaat_induk;
    const parentMupel: any = parentJemaat?.mupel ? (Array.isArray(parentJemaat.mupel) ? parentJemaat.mupel[0] : parentJemaat.mupel) : null;

    return {
      id: pos.id_pos,
      name: pos.nama_pos,
      level: 'POS',
      subtype: subtype as any,
      profile: {
        address: pos.alamat || pos.keterangan || '',
        lat: pos.latitude,
        lng: pos.longitude,
        photo_url: pos.foto_url,
        created_at: pos.tgl_berdiri,
      },
      kpis: {
        total_jiwa: pos.jumlah_jiwa || 0,
      },
      demographics: demografi || [],
      sdm_list: [
        ...(pelayan || []).map((p: any) => ({ id: p.id_pelayan, name: p.nama, role: p.jabatan || 'Pelayan', avatar_url: p.foto_url })),
        ...(relawan || []).map((r: any) => ({ id: r.id_relawan, name: r.nama, role: r.kategori || 'Relawan', avatar_url: r.foto_url }))
      ],
      pastoral_logs: (logs || []).map((l: any) => ({
        id: l.id_log,
        date: l.tgl,
        activity: l.kegiatan,
        description: l.catatan,
        pastor_name: l.pendeta?.nama_lengkap,
        attendance: l.jml_jiwa
      })),
      jadwal_ibadah: (jadwal || []).map((j: any) => ({
        id: j.id_ibadah,
        type: j.jenis,
        day: j.hari,
        time: j.jam,
        description: j.keterangan
      })),
      assets: [
        ...(asetTanah || []).map((a: any) => ({ id: a.id_aset, category: 'TANAH' as const, name: a.nama_aset, legal_status: a.status_hukum, acquisition_date: a.tgl_perolehan, value: a.nilai_aset })),
        ...(asetBangunan || []).map((a: any) => ({ id: a.id_aset, category: 'BANGUNAN' as const, name: a.nama_aset, condition: a.kondisi, acquisition_date: a.tgl_perolehan, value: a.nilai_aset })),
        ...(asetBergerak || []).map((a: any) => ({ id: a.id_aset, category: 'BERGERAK' as const, name: a.nama_aset, condition: a.kondisi, acquisition_date: a.tgl_perolehan, value: a.nilai_aset }))
      ],
      wilayah: [
        ...(kerawanan || []).map((k: any) => ({ id: k.id_risiko, type: 'RISIKO' as const, category: k.kategori, name: k.jenis_risiko, description: k.keterangan })),
        ...(potensi || []).map((p: any) => ({ id: p.id_potensi, type: 'POTENSI' as const, category: p.kategori, name: p.nama_potensi, description: p.keterangan }))
      ],
      aid_requests: (bantuan || []).map((b: any) => ({
        id: b.id_ajuan,
        title: b.judul_ajuan,
        status: b.status_ajuan,
        date: b.tgl_pengajuan,
        amount_requested: b.nominal_disetujui
      })),
      parent_jemaat: parentJemaat ? { id: parentJemaat.id_induk, name: parentJemaat.nama_induk || '' } : null,
      parent_mupel: parentMupel ? { id: parentMupel.id_mupel, name: parentMupel.nama_mupel || '' } : null,
    };
  }
  
  return null;
}

export async function hasReadAccess(contextId: string, targetOrgId: string): Promise<boolean> {
  if (contextId === targetOrgId) return true;
  
  const supabase = await createClient();
  
  // Get hierarchy info for contextId
  let contextMupelId = null;
  let contextJemaatId = null;
  
  if (contextId.startsWith('POS-')) {
    const { data } = await supabase.from('m_pos_pelkes').select('id_induk, jemaat_induk:m_jemaat_induk(id_mupel)').eq('id_pos', contextId).maybeSingle();
    contextJemaatId = data?.id_induk;
    const ji: any = Array.isArray(data?.jemaat_induk) ? data?.jemaat_induk[0] : data?.jemaat_induk;
    contextMupelId = ji?.id_mupel;
  } else if (contextId.startsWith('JEMAAT-')) {
    contextJemaatId = contextId;
    const { data } = await supabase.from('m_jemaat_induk').select('id_mupel').eq('id_induk', contextId).maybeSingle();
    contextMupelId = data?.id_mupel;
  } else if (contextId.startsWith('MUPEL-')) {
    contextMupelId = contextId;
  }

  // Get hierarchy info for targetOrgId
  let targetMupelId = null;
  let targetJemaatId = null;

  if (targetOrgId.startsWith('POS-')) {
    const { data } = await supabase.from('m_pos_pelkes').select('id_induk, jemaat_induk:m_jemaat_induk(id_mupel)').eq('id_pos', targetOrgId).maybeSingle();
    targetJemaatId = data?.id_induk;
    const ji: any = Array.isArray(data?.jemaat_induk) ? data?.jemaat_induk[0] : data?.jemaat_induk;
    targetMupelId = ji?.id_mupel;
  } else if (targetOrgId.startsWith('JEMAAT-')) {
    targetJemaatId = targetOrgId;
    const { data } = await supabase.from('m_jemaat_induk').select('id_mupel').eq('id_induk', targetOrgId).maybeSingle();
    targetMupelId = data?.id_mupel;
  } else if (targetOrgId.startsWith('MUPEL-')) {
    targetMupelId = targetOrgId;
  }
  
  // Super user case (if they somehow have global context, e.g. SINODE)
  if (contextId.startsWith('SINODE-') || contextId === 'GLOBAL') return true;

  // 1. Downward Reach Check
  if (contextId.startsWith('MUPEL-') && targetMupelId === contextMupelId) return true;
  if (contextId.startsWith('JEMAAT-') && targetJemaatId === contextJemaatId) return true;

  // 2. Upward Reference Check
  if (contextId.startsWith('POS-')) {
    if (targetOrgId === contextJemaatId || targetOrgId === contextMupelId) return true;
  }
  if (contextId.startsWith('JEMAAT-')) {
    if (targetOrgId === contextMupelId) return true;
  }

  return false;
}
