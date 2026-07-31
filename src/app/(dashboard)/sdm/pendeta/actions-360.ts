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
