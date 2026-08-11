import { createClient } from '@/lib/supabase/server';
import { UnifiedOrganizationData } from '@/types/organization.types';

export type { UnifiedOrganizationData };

export async function fetchUnifiedOrganizationData(id_org: string): Promise<UnifiedOrganizationData | null> {
  const supabase = await createClient();

  // Call official F3 RPC get_organization_360
  const { data, error } = await supabase.rpc('get_organization_360', {
    p_id_org: id_org
  });

  if (error) {
    console.error('Error fetching get_organization_360:', error);
    return null;
  }

  if (!data) {
    return null; // Target not found or ambiguity guard returned null
  }

  return data as UnifiedOrganizationData;
}
