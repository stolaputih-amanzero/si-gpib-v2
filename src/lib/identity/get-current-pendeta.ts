import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Single Gate Helper untuk mendapatkan `id_pendeta` dari pengguna yang sedang login.
 * Melakukan lookup real-time ke tabel `users` berdasarkan `auth.uid()`.
 *
 * @param supabase - Instance SupabaseClient
 * @returns `string` (id_pendeta) atau `null` jika pengguna bukan/belum dikaitkan dengan pendeta.
 */
export async function getCurrentPendetaId(supabase: SupabaseClient): Promise<string | null> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) return null;

  const { data: dbUser } = await supabase
    .from('users')
    .select('id_pendeta')
    .eq('id', userId)
    .maybeSingle();

  return dbUser?.id_pendeta || null;
}
