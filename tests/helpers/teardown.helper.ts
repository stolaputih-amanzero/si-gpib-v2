import { createClient } from '@supabase/supabase-js';

export async function cleanupTestData(payload: {
  logPastoralIds?: string[];
  asetIds?: string[];
  bantuanIds?: string[];
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return;

  const supabaseAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (payload.logPastoralIds && payload.logPastoralIds.length > 0) {
    await supabaseAdmin.from('t_log_pastoral').delete().in('id_log', payload.logPastoralIds);
  }

  if (payload.asetIds && payload.asetIds.length > 0) {
    await supabaseAdmin.from('t_aset_tanah').delete().in('id_tanah', payload.asetIds);
    await supabaseAdmin.from('t_aset_bangunan').delete().in('id_bangunan', payload.asetIds);
    await supabaseAdmin.from('t_aset_bergerak').delete().in('id_aset_b', payload.asetIds);
  }

  if (payload.bantuanIds && payload.bantuanIds.length > 0) {
    await supabaseAdmin.from('t_pengajuan_bantuan').delete().in('id_ajuan', payload.bantuanIds);
  }
}
