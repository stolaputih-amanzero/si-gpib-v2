import { createClient } from '@/lib/supabase/server';
import { UnifiedAssetData } from '@/types/asset.types';

export type { UnifiedAssetData };

export async function fetchUnifiedAssetData(id_asset: string): Promise<UnifiedAssetData | null> {
  const supabase = await createClient();

  // Call official F4 RPC get_asset_360
  const { data, error } = await supabase.rpc('get_asset_360', {
    p_id_asset: id_asset
  });

  if (error) {
    console.error('Error fetching get_asset_360:', error);
    return null;
  }

  if (!data) {
    return null; // Target not found or ambiguity guard returned null
  }

  return data as UnifiedAssetData;
}
