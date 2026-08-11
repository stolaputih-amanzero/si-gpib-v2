import { createClient } from '@/lib/supabase/client';
import { UnifiedAidRequestData } from '@/types/aidRequest.types';

export async function transitionAidRequest(
  id_ajuan: string,
  action: string,
  catatan?: string,
  requestId?: string
): Promise<UnifiedAidRequestData | null> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('transition_aid_request_atomic', {
    p_id_ajuan: id_ajuan,
    p_action: action,
    p_catatan: catatan || null,
    p_request_id: requestId || null
  });

  if (error) {
    console.error('Error in transition_aid_request_atomic:', error);
    throw new Error(error.message || 'Gagal mengubah status pengajuan');
  }

  return data as UnifiedAidRequestData;
}
