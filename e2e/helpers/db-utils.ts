import { createClient } from '@supabase/supabase-js';

// Setup Supabase admin client for direct DB checks during tests
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Menghitung jumlah log pastoral berdasarkan request ID.
 * Digunakan untuk memvalidasi idempotency.
 */
export async function countLogPastoralByRequestId(requestId: string): Promise<number> {
  const { count, error } = await supabase
    .from('t_log_pastoral')
    .select('id_log', { count: 'exact', head: true })
    // Kita asumsikan ada relasi atau metadata yang menyimpan request_id
    // Untuk saat ini fallback cek di sys_transaction_logs
    .ilike('catatan', `%${requestId}%`); // Kita cari uniqueId di dalam catatan
    
  if (error) {
    // Check sys_transaction_logs jika field ada di sana
    const { count: txCount } = await supabase
      .from('sys_transaction_logs')
      .select('id', { count: 'exact', head: true })
      .eq('request_id', requestId);
    return txCount || 0;
  }
  return count || 0;
}

/**
 * Verifikasi apakah sebuah data ada di DLQ
 */
export async function verifyDLQEntry(requestId: string): Promise<boolean> {
  // Dalam simulasi ini, kita anggap DLQ table adalah t_dead_letters
  const { data } = await supabase
    .from('t_dead_letters')
    .select('id')
    .eq('request_id', requestId)
    .maybeSingle();
    
  return !!data;
}
