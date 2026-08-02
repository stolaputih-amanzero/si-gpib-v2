'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { demografiBatchSchema, DemografiBatchInput } from '@/lib/validations/demografi.schema';
import { revalidatePath } from 'next/cache';

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

export async function upsertDemografiBatchAction(payload: DemografiBatchInput) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  // 1. Validate payload with Zod
  const validated = demografiBatchSchema.parse(payload);

  // 2. Format batch upsert data array
  const upsertRows = Object.entries(validated.data).map(([kategoriKey, rowValues]) => {
    const isPkp = kategoriKey === 'PKP';
    const isPkb = kategoriKey === 'PKB';

    return {
      id_pos: validated.id_pos,
      kategori_pelkat: kategoriKey,
      jml_kk: Number(rowValues.jml_kk || 0),
      laki: isPkp ? 0 : Number(rowValues.laki || 0), // Poka-Yoke rule
      perempuan: isPkb ? 0 : Number(rowValues.perempuan || 0), // Poka-Yoke rule
      profesi: rowValues.profesi || null,
      pendidikan: rowValues.pendidikan || null,
      keterangan: rowValues.keterangan || null,
    };
  });

  // 3. Perform batch upsert transaction (onConflict: id_pos,kategori_pelkat)
  const { data, error } = await db
    .from('t_demografi_pelkat')
    .upsert(upsertRows, { onConflict: 'id_pos,kategori_pelkat' })
    .select('*');

  if (error) {
    console.error('upsertDemografiBatchAction error:', error);
    throw new Error(error.message || 'Gagal menyimpan batch data demografi pelkat.');
  }

  // 4. Record activity log if user session exists
  const { data: authUser } = await supabase.auth.getUser();
  if (authUser?.user) {
    await db.from('t_log_aktivitas').insert({
      id_user: authUser.user.id,
      waktu: new Date().toISOString(),
      aktor: authUser.user.email || authUser.user.phone || 'Pelayan Pos',
      aksi: 'UPDATE',
      objek_type: 'demografi',
      objek_id: validated.id_pos,
      keterangan: `Update batch demografi 6 kategori Pelkat pos ${validated.id_pos}`,
    });
  }

  // 5. Revalidate paths
  revalidatePath(`/demografi/${validated.id_pos}`);
  revalidatePath(`/dashboard/pos-pelkes/${validated.id_pos}`);
  revalidatePath('/dashboard');

  return data;
}
