'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getDbClient(supabaseServerClient: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return createSupabaseAdmin(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseServerClient;
}

// --- FETCH ACTIONS ---
export async function getKeterlibatanAction(idPendeta?: string) {
  if (!idPendeta) return [];
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_keterlibatan_pendeta')
    .select('*')
    .eq('id_pendeta', idPendeta)
    .order('tgl_mulai', { ascending: false });

  if (error) {
    console.error('getKeterlibatanAction error:', error);
    return [];
  }
  return data || [];
}

export async function getKeluargaAction(idPendeta?: string) {
  if (!idPendeta) return [];
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_keluarga_pendeta')
    .select('*')
    .eq('id_pendeta', idPendeta)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getKeluargaAction error:', error);
    return [];
  }
  return data || [];
}

export async function getKompetensiAction(idPendeta?: string) {
  if (!idPendeta) return [];
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_kompetensi_pendeta')
    .select('*')
    .eq('id_pendeta', idPendeta)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getKompetensiAction error:', error);
    return [];
  }
  return data || [];
}

export async function getRiwayatMutasiAction(idPendeta?: string) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  let query = db
    .from('t_riwayat_mutasi_pendeta')
    .select(`
      *,
      jemaat_lama:m_jemaat_induk!t_riwayat_mutasi_pendeta_id_induk_lama_fkey(
        id_induk,
        nama_induk,
        id_mupel,
        mupel:m_mupel(id_mupel, nama_mupel)
      ),
      jemaat_baru:m_jemaat_induk!t_riwayat_mutasi_pendeta_id_induk_baru_fkey(
        id_induk,
        nama_induk,
        id_mupel,
        mupel:m_mupel(id_mupel, nama_mupel)
      )
    `)
    .order('tgl_mutasi', { ascending: false });

  if (idPendeta) {
    query = query.eq('id_pendeta', idPendeta);
  } else {
    query = query.limit(20);
  }

  const { data, error } = await query;
  let rawData = data;

  if (error || !data) {
    let fallbackQuery = db
      .from('t_riwayat_mutasi_pendeta')
      .select('*')
      .order('tgl_mutasi', { ascending: false });

    if (idPendeta) fallbackQuery = fallbackQuery.eq('id_pendeta', idPendeta);
    else fallbackQuery = fallbackQuery.limit(20);

    const { data: altData } = await fallbackQuery;
    rawData = altData;
  }

  return (rawData || []).map((m: any) => ({
    id_riwayat: m.id_riwayat || m.id_mutasi || String(m.id || ''),
    id_mutasi: m.id_mutasi || m.id_riwayat || String(m.id || ''),
    id_pendeta: m.id_pendeta,
    tgl_mutasi: m.tgl_mutasi || m.created_at || m.tanggal || m.tgl || null,
    jenis_mutasi: m.jenis_mutasi || 'Mutasi Penugasan',
    id_induk_lama: m.id_induk_lama || null,
    id_induk_baru: m.id_induk_baru || null,
    nama_induk_lama: (m.jemaat_lama as any)?.nama_induk || m.nama_induk_lama || m.id_induk_lama || null,
    nama_induk_baru: (m.jemaat_baru as any)?.nama_induk || m.nama_induk_baru || m.id_induk_baru || null,
    id_mupel_lama: (m.jemaat_lama as any)?.id_mupel || (m.jemaat_lama as any)?.mupel?.id_mupel || null,
    nama_mupel_lama: (m.jemaat_lama as any)?.mupel?.nama_mupel || null,
    id_mupel_baru: (m.jemaat_baru as any)?.id_mupel || (m.jemaat_baru as any)?.mupel?.id_mupel || null,
    nama_mupel_baru: (m.jemaat_baru as any)?.mupel?.nama_mupel || null,
    jemaat_lama: m.jemaat_lama || (m.nama_induk_lama ? { nama_induk: m.nama_induk_lama } : null),
    jemaat_baru: m.jemaat_baru || (m.nama_induk_baru ? { nama_induk: m.nama_induk_baru } : null),
    alasan: m.alasan || null,
    catatan: m.catatan || null,
  }));
}

// --- KETERLIBATAN ---
export async function createKeterlibatanAction(payload: any) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_keterlibatan_pendeta')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal menyimpan keterlibatan');
  return data;
}

export async function updateKeterlibatanAction(id_keterlibatan: string, payload: any) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_keterlibatan_pendeta')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id_keterlibatan', id_keterlibatan)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal memperbarui keterlibatan');
  return data;
}

export async function deleteKeterlibatanAction(id_keterlibatan: string) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { error } = await db
    .from('t_keterlibatan_pendeta')
    .delete()
    .eq('id_keterlibatan', id_keterlibatan);

  if (error) throw new Error(error.message || 'Gagal menghapus keterlibatan');
  return true;
}

// --- KELUARGA ---
export async function createKeluargaAction(payload: any) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_keluarga_pendeta')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal menyimpan data keluarga');
  return data;
}

export async function updateKeluargaAction(id_keluarga: string, payload: any) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_keluarga_pendeta')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id_keluarga', id_keluarga)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal memperbarui data keluarga');
  return data;
}

export async function deleteKeluargaAction(id_keluarga: string) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { error } = await db
    .from('t_keluarga_pendeta')
    .delete()
    .eq('id_keluarga', id_keluarga);

  if (error) throw new Error(error.message || 'Gagal menghapus data keluarga');
  return true;
}

// --- KOMPETENSI ---
export async function createKompetensiAction(payload: any) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_kompetensi_pendeta')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal menyimpan kompetensi');
  return data;
}

export async function updateKompetensiAction(id_kompetensi: string, payload: any) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { data, error } = await db
    .from('t_kompetensi_pendeta')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id_kompetensi', id_kompetensi)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal memperbarui kompetensi');
  return data;
}

export async function deleteKompetensiAction(id_kompetensi: string) {
  const supabase = await createClient();
  const db = getDbClient(supabase);
  const { error } = await db
    .from('t_kompetensi_pendeta')
    .delete()
    .eq('id_kompetensi', id_kompetensi);

  if (error) throw new Error(error.message || 'Gagal menghapus kompetensi');
  return true;
}
