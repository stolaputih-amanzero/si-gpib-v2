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

export async function getLogPastoralListAction(search?: string, id_pos?: string) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  let query = db
    .from('t_log_pastoral')
    .select(`
      id_log,
      id_pos,
      id_pendeta,
      tgl,
      kegiatan,
      jml_jiwa,
      catatan,
      created_at,
      pos:m_pos_pelkes(
        id_pos,
        nama_pos,
        kategori,
        latitude,
        longitude,
        jemaat_induk:m_jemaat_induk(
          id_induk,
          nama_induk,
          latitude,
          longitude,
          mupel:m_mupel(id_mupel, nama_mupel)
        )
      ),
      pendeta:m_pendeta(id_pendeta, nama_lengkap)
    `)
    .order('tgl', { ascending: false });

  if (id_pos && id_pos !== 'all') {
    query = query.eq('id_pos', id_pos);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('getLogPastoralListAction join query error, trying fallback:', error);
    const { data: rawData, error: rawErr } = await db
      .from('t_log_pastoral')
      .select(`
        *,
        pos:m_pos_pelkes(
          id_pos,
          nama_pos,
          kategori,
          jemaat_induk:m_jemaat_induk(
            id_induk,
            nama_induk,
            mupel:m_mupel(id_mupel, nama_mupel)
          )
        ),
        pendeta:m_pendeta(id_pendeta, nama_lengkap)
      `)
      .order('tgl', { ascending: false });

    if (rawErr) {
      const { data: flatData, error: flatErr } = await db
        .from('t_log_pastoral')
        .select('*')
        .order('tgl', { ascending: false });

      if (flatErr) return [];
      return flatData || [];
    }
    return rawData || [];
  }

  let result = (data || []).map((log: any) => ({
    id_log: log.id_log,
    id_pos: log.id_pos,
    id_pendeta: log.id_pendeta,
    tgl: log.tgl,
    kegiatan: log.kegiatan,
    jml_jiwa: log.jml_jiwa,
    catatan: log.catatan,
    created_at: log.created_at,
    pos: log.pos || null,
    pendeta: log.pendeta || null,
  }));

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (l: any) =>
        l.kegiatan.toLowerCase().includes(q) ||
        (l.catatan || '').toLowerCase().includes(q) ||
        (l.pos?.nama_pos || '').toLowerCase().includes(q) ||
        (l.pos?.jemaat_induk?.nama_induk || '').toLowerCase().includes(q) ||
        (l.pos?.jemaat_induk?.mupel?.nama_mupel || '').toLowerCase().includes(q) ||
        (l.pendeta?.nama_lengkap || '').toLowerCase().includes(q)
    );
  }

  return result;
}

export async function createLogPastoralAction(payload: {
  id_log: string;
  id_pos?: string | null;
  id_pendeta: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa?: number | null;
  catatan?: string | null;
}) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  const { data, error } = await db
    .from('t_log_pastoral')
    .insert({
      id_log: payload.id_log,
      id_pos: payload.id_pos || null,
      id_pendeta: payload.id_pendeta,
      tgl: payload.tgl,
      kegiatan: payload.kegiatan,
      jml_jiwa: payload.jml_jiwa ? Number(payload.jml_jiwa) : null,
      catatan: payload.catatan || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('createLogPastoralAction error:', error);
    throw new Error(error.message || 'Gagal menyimpan log pastoral');
  }

  return data;
}

export async function updateLogPastoralAction(payload: {
  id_log: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa?: number | null;
  catatan?: string | null;
  id_pos?: string | null;
}) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  const { data, error } = await db
    .from('t_log_pastoral')
    .update({
      tgl: payload.tgl,
      kegiatan: payload.kegiatan,
      jml_jiwa: payload.jml_jiwa ? Number(payload.jml_jiwa) : null,
      catatan: payload.catatan || null,
      id_pos: payload.id_pos || null,
    })
    .eq('id_log', payload.id_log)
    .select('*')
    .single();

  if (error) {
    console.error('updateLogPastoralAction error:', error);
    throw new Error(error.message || 'Gagal memperbarui log pastoral');
  }

  return data;
}

export async function deleteLogPastoralAction(id_log: string) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  const { error } = await db
    .from('t_log_pastoral')
    .delete()
    .eq('id_log', id_log);

  if (error) {
    console.error('deleteLogPastoralAction error:', error);
    throw new Error(error.message || 'Gagal menghapus log pastoral');
  }

  return true;
}
