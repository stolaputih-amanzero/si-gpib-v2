import { createClient } from '@/lib/supabase/server';
import { UnifiedPersonData } from '@/types/person.types';

export type { UnifiedPersonData };

export async function fetchUnifiedPersonData(personId: string): Promise<UnifiedPersonData | null> {
  const supabase = await createClient();

  let targetUuid = personId;

  // If personId is not a valid UUID string (e.g. 'PDT-37549598'), resolve it from m_pendeta table
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(personId);
  if (!isUuid) {
    const { data: pendeta } = await supabase
      .from('m_pendeta')
      .select('id_person, id_pendeta')
      .or(`id_pendeta.eq.${personId},id_person.eq.${personId}`)
      .maybeSingle();

    if (pendeta?.id_person) {
      targetUuid = pendeta.id_person;
    }
  }

  // Call official F2 RPC get_person_360
  const { data, error } = await supabase.rpc('get_person_360', {
    p_id_person: targetUuid,
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
