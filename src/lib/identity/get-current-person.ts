import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Single Gate Helper untuk mendapatkan `id_person` (Canonical Identity) dari pengguna yang sedang login.
 * Melakukan lookup real-time ke tabel `users` berdasarkan `auth.uid()`.
 *
 * @param supabase - Instance SupabaseClient
 * @returns `string` (id_person) atau `null` jika tidak ditemukan.
 *
 * PENTING (B2 Contract): Helper ini TIDAK melakukan fallback ke `id_pendeta`.
 * Jika `id_person` null, ini berarti sesi tidak memiliki konteks Person yang valid (Unauthorized/Abort).
 */
export async function getCurrentPersonId(supabase: SupabaseClient): Promise<string | null> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) return null;

  const { data: dbUser } = await supabase
    .from('users')
    .select('id_person')
    .eq('id', userId)
    .maybeSingle();

  return dbUser?.id_person || null;
}
