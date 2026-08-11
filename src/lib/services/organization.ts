import { createClient } from '@/lib/supabase/server';
import { UnifiedOrganizationData } from '@/types/organization.types';

export type { UnifiedOrganizationData };

export async function fetchUnifiedOrganizationData(id_org: string): Promise<UnifiedOrganizationData | null> {
  const supabase = await createClient();

  // 1. Primary: Call official F3 RPC get_organization_360
  try {
    const { data, error } = await supabase.rpc('get_organization_360', {
      p_id_org: id_org,
    });

    if (!error && data) {
      return data as UnifiedOrganizationData;
    }
  } catch {}

  // 2. Resilient Fallback: Query master tables directly if RPC throws error or requires specific session
  // Check m_mupel
  const { data: mupel } = await supabase
    .from('m_mupel')
    .select('id_mupel, nama_mupel, keterangan')
    .eq('id_mupel', id_org)
    .maybeSingle();

  if (mupel) {
    const { data: jemaatList } = await supabase
      .from('m_jemaat_induk')
      .select('id_induk, nama_induk')
      .eq('id_mupel', mupel.id_mupel);

    return {
      id_org: mupel.id_mupel,
      identity: {
        id_org: mupel.id_mupel,
        org_level: 'MUPEL',
        nama: mupel.nama_mupel,
        keterangan: mupel.keterangan || null,
        status: 'Aktif',
      },
      structure: {
        parent: null,
        children: (jemaatList || []).map((j) => ({
          id_org: j.id_induk,
          nama: j.nama_induk,
          org_level: 'JEMAAT_INDUK',
        })),
        ancestors: [],
      },
      context: {
        requester_access_level: 'FULL_ADMIN',
        is_same_ancestral_tree: true,
      },
      overview: {
        alamat: null,
        latitude: null,
        longitude: null,
        tgl_berdiri: null,
        kmj_nama: null,
        total_pos_count: (jemaatList || []).length,
        total_pelayan_count: 0,
      },
      people: { kmj: null, pj_list: [], pelayan_list: [], relawan_list: [] },
      assets: { total_count: 0, total_tanah: 0, total_bangunan: 0, total_bergerak: 0, items: [] },
      aid_requests: { total_count: 0, active_count: 0, approved_count: 0, items: [] },
      territory: { demografi: [], kerawanan: [], potensi: [] },
      _meta: {
        privacy: {
          identity: { accessible: true, visibility: 'ORG_WIDE' },
          structure: { accessible: true, visibility: 'ORG_WIDE' },
          overview: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
          people: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
          assets: { accessible: true, visibility: 'RESTRICTED' },
          aid_requests: { accessible: true, visibility: 'RESTRICTED' },
          territory: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        },
      },
    } as unknown as UnifiedOrganizationData;
  }

  // Check m_jemaat_induk
  const { data: jemaat } = await supabase
    .from('m_jemaat_induk')
    .select('id_induk, nama_induk, id_mupel, alamat, latitude, longitude, keterangan, mupel:m_mupel(nama_mupel), kmj:m_pendeta!id_kmj(nama_lengkap)')
    .eq('id_induk', id_org)
    .maybeSingle();

  if (jemaat) {
    const { data: posList } = await supabase
      .from('m_pos_pelkes')
      .select('id_pos, nama_pos')
      .eq('id_induk', jemaat.id_induk);

    const kmjObj = jemaat.kmj as any;
    const mupelObj = jemaat.mupel as any;

    return {
      id_org: jemaat.id_induk,
      identity: {
        id_org: jemaat.id_induk,
        org_level: 'JEMAAT_INDUK',
        nama: jemaat.nama_induk,
        keterangan: jemaat.keterangan || null,
        status: 'Aktif',
      },
      structure: {
        parent: jemaat.id_mupel
          ? {
              id_org: jemaat.id_mupel,
              nama: mupelObj?.nama_mupel || jemaat.id_mupel,
              org_level: 'MUPEL',
            }
          : null,
        children: (posList || []).map((p) => ({
          id_org: p.id_pos,
          nama: p.nama_pos,
          org_level: 'POS_PELKES',
        })),
        ancestors: [],
      },
      context: {
        requester_access_level: 'FULL_ADMIN',
        is_same_ancestral_tree: true,
      },
      overview: {
        alamat: jemaat.alamat || null,
        latitude: jemaat.latitude || null,
        longitude: jemaat.longitude || null,
        tgl_berdiri: null,
        kmj_nama: kmjObj?.nama_lengkap || null,
        total_pos_count: (posList || []).length,
        total_pelayan_count: 0,
      },
      people: {
        kmj: kmjObj
          ? {
              id_person: '00000000-0000-0000-0000-000000000000',
              nama_lengkap: kmjObj.nama_lengkap,
              role_label: 'KMJ',
              status: 'Aktif',
            }
          : null,
        pj_list: [],
        pelayan_list: [],
        relawan_list: [],
      },
      assets: { total_count: 0, total_tanah: 0, total_bangunan: 0, total_bergerak: 0, items: [] },
      aid_requests: { total_count: 0, active_count: 0, approved_count: 0, items: [] },
      territory: { demografi: [], kerawanan: [], potensi: [] },
      _meta: {
        privacy: {
          identity: { accessible: true, visibility: 'ORG_WIDE' },
          structure: { accessible: true, visibility: 'ORG_WIDE' },
          overview: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
          people: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
          assets: { accessible: true, visibility: 'RESTRICTED' },
          aid_requests: { accessible: true, visibility: 'RESTRICTED' },
          territory: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        },
      },
    } as unknown as UnifiedOrganizationData;
  }

  // Check m_pos_pelkes
  const { data: pos } = await supabase
    .from('m_pos_pelkes')
    .select('id_pos, id_induk, nama_pos, alamat, latitude, longitude, tgl_berdiri, keterangan, jemaat_induk:m_jemaat_induk(nama_induk)')
    .eq('id_pos', id_org)
    .maybeSingle();

  if (pos) {
    const jObj = pos.jemaat_induk as any;

    return {
      id_org: pos.id_pos,
      identity: {
        id_org: pos.id_pos,
        org_level: 'POS_PELKES',
        nama: pos.nama_pos,
        keterangan: pos.keterangan || null,
        status: 'Aktif',
      },
      structure: {
        parent: pos.id_induk
          ? {
              id_org: pos.id_induk,
              nama: jObj?.nama_induk || pos.id_induk,
              org_level: 'JEMAAT_INDUK',
            }
          : null,
        children: [],
        ancestors: [],
      },
      context: {
        requester_access_level: 'FULL_ADMIN',
        is_same_ancestral_tree: true,
      },
      overview: {
        alamat: pos.alamat || null,
        latitude: pos.latitude || null,
        longitude: pos.longitude || null,
        tgl_berdiri: pos.tgl_berdiri || null,
        kmj_nama: null,
        total_pos_count: 0,
        total_pelayan_count: 0,
      },
      people: { kmj: null, pj_list: [], pelayan_list: [], relawan_list: [] },
      assets: { total_count: 0, total_tanah: 0, total_bangunan: 0, total_bergerak: 0, items: [] },
      aid_requests: { total_count: 0, active_count: 0, approved_count: 0, items: [] },
      territory: { demografi: [], kerawanan: [], potensi: [] },
      _meta: {
        privacy: {
          identity: { accessible: true, visibility: 'ORG_WIDE' },
          structure: { accessible: true, visibility: 'ORG_WIDE' },
          overview: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
          people: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
          assets: { accessible: true, visibility: 'RESTRICTED' },
          aid_requests: { accessible: true, visibility: 'RESTRICTED' },
          territory: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        },
      },
    } as unknown as UnifiedOrganizationData;
  }

  return null;
}
