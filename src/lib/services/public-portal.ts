import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export interface PublicMapPoint {
  id_pos: string;
  nama_pos: string;
  kategori: string;
  alamat: string;
  latitude: number | null;
  longitude: number | null;
  nama_induk: string;
}

async function getPublicDataFromDb(): Promise<PublicMapPoint[]> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const { data, error } = await supabaseAdmin
    .from('m_pos_pelkes')
    .select(`
      id_pos,
      nama_pos,
      kategori,
      alamat,
      latitude,
      longitude,
      m_jemaat_induk ( nama_induk )
    `);

  if (error || !data) {
    console.error('Error fetching public map data:', error);
    return [];
  }

  return data.map((pos: any) => ({
    id_pos: pos.id_pos,
    nama_pos: pos.nama_pos || 'Pos Pelkes Tanpa Nama',
    kategori: pos.kategori || 'Pos Pelkes',
    alamat: pos.alamat || 'Alamat tidak tersedia',
    latitude: pos.latitude ? Number(pos.latitude) : null,
    longitude: pos.longitude ? Number(pos.longitude) : null,
    nama_induk: pos.m_jemaat_induk?.nama_induk || 'Jemaat Induk Tidak Diketahui',
  }));
}

export const fetchPublicMapData = unstable_cache(
  async () => {
    return await getPublicDataFromDb();
  },
  ['public-map-data'],
  {
    revalidate: 86400, // 24 hours
    tags: ['public-map'],
  }
);
