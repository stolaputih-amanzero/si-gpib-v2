import { createClient } from '@/lib/supabase/server';
import { UnifiedPersonData } from '@/types/person.types';

export type { UnifiedPersonData };

export async function fetchUnifiedPersonData(personId: string): Promise<UnifiedPersonData | null> {
  const supabase = await createClient();

  // Call official F2 RPC get_person_360
  const { data, error } = await supabase.rpc('get_person_360', {
    p_id_person: personId,
    p_pastoral_limit: 10,
    p_pastoral_offset: 0
  });

  if (error) {
    console.error('Error fetching get_person_360:', error);
    return null;
  }

  if (!data) {
    return null; // Target not found or target resolution returned null
  }

  return data as UnifiedPersonData;
}
