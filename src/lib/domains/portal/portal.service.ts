'use server';

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { PublicPosPelkes, PosDetail } from './portal.types';

// Create a service client to bypass RLS for public data
// (Data is safe to expose as it only contains aggregated and public-facing info)
function getAdminClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

export async function getPublicPosPelkes(): Promise<PublicPosPelkes[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc('get_public_pos_pelkes');

  if (error) {
    console.error('[PortalService] Error fetching public pos pelkes:', error);
    throw new Error('Gagal memuat data Pos Pelkes');
  }

  return data as PublicPosPelkes[];
}

export async function getPosDetail(idPos: string): Promise<PosDetail> {
  const supabase = getAdminClient();

  // 1. Fetch base Pos info (using the same logic as the RPC to ensure consistency)
  const { data: posData, error: posError } = await supabase
    .from('m_pos_pelkes')
    .select('id_pos, nama_pos, alamat, latitude, longitude, kategori, jumlah_kk, jumlah_jiwa')
    .eq('id_pos', idPos)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .single();

  if (posError || !posData) {
    console.error('[PortalService] Error fetching pos detail:', posError);
    throw new Error('Pos Pelkes tidak ditemukan atau tidak aktif');
  }

  // 2. Fetch Jadwal Ibadah
  const { data: jadwalData } = await supabase
    .from('t_jadwal_ibadah')
    .select('id_ibadah, jenis, hari, jam, keterangan')
    .eq('id_pos', idPos);

  // 3. Fetch Pelayan
  const { data: pelayanData } = await supabase
    .from('t_pelayan')
    .select('id_pelayan, nama, jabatan')
    .eq('id_pos', idPos)
    .eq('status', 'Aktif');

  return {
    ...posData,
    jumlah_kk: posData.jumlah_kk || 0,
    jumlah_jiwa: posData.jumlah_jiwa || 0,
    jadwal_ibadah: jadwalData || [],
    pelayan: pelayanData || [],
  } as PosDetail;
}
