import { createClient } from '@/lib/supabase/server';
import { UnifiedAidRequestData } from '@/types/aidRequest.types';

export type { UnifiedAidRequestData };

export async function fetchUnifiedAidRequestData(id_ajuan: string): Promise<UnifiedAidRequestData | null> {
  const supabase = await createClient();

  // Call official F5 RPC get_aid_request_360
  const { data, error } = await supabase.rpc('get_aid_request_360', {
    p_id_ajuan: id_ajuan
  });

  if (error) {
    console.error('Error fetching get_aid_request_360:', error);
    return null;
  }

  if (!data) {
    return null; // Target not found or ambiguity guard returned null
  }

  return data as UnifiedAidRequestData;
}
