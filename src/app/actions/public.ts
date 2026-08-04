'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

// ===== TYPES =====
export interface PublicPosPelkes {
  id_pos: string;
  nama_pos: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  tgl_berdiri: string | null;
  total_kk: number;
  total_jiwa: number;
  nama_jemaat: string;
  id_jemaat: string;
  nama_mupel: string;
  id_mupel: string;
  nama_pj: string | null;
  no_wa_pj: string | null;
  keterangan: string | null;
}

export interface PublicMupel {
  id_mupel: string;
  nama_mupel: string;
  total_jemaat: number;
  total_pos: number;
  total_jiwa: number;
}

// ===== SERVER ACTIONS =====

/**
 * Mengambil semua Pos Pelkes untuk peta publik
 * HANYA return data publik — tidak ada data sensitif
 */
export async function getPublicPosPelkes(): Promise<PublicPosPelkes[]> {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('m_pos_pelkes')
    .select(`
      id_pos,
      nama_pos,
      alamat,
      latitude,
      longitude,
      tgl_berdiri,
      keterangan,
      jemaat:m_jemaat_induk(
        id_induk,
        nama_induk,
        mupel:m_mupel(
          id_mupel,
          nama_mupel
        ),
        kmj:m_pendeta!fk_jemaat_kmj(
          nama_lengkap,
          no_wa
        )
      )
    `)
    .order('nama_pos', { ascending: true });

  if (error) {
    console.error('[getPublicPosPelkes] Supabase error:', error.message);
    throw new Error('Gagal memuat data Pos Pelkes');
  }

  return (data || []).map((pos: any) => {
    const jemaat = pos.jemaat || null;
    const mupel = jemaat?.mupel || null;
    const kmj = jemaat?.kmj || null;

    return {
      id_pos: pos.id_pos as string,
      nama_pos: pos.nama_pos as string,
      alamat: pos.alamat as string | null,
      latitude: pos.latitude ? Number(pos.latitude) : null,
      longitude: pos.longitude ? Number(pos.longitude) : null,
      tgl_berdiri: pos.tgl_berdiri as string | null,
      total_kk: 0,
      total_jiwa: 0,
      nama_jemaat: (jemaat?.nama_induk as string) || '-',
      id_jemaat: (jemaat?.id_induk as string) || '',
      nama_mupel: (mupel?.nama_mupel as string) || '-',
      id_mupel: (mupel?.id_mupel as string) || '',
      nama_pj: (kmj?.nama_lengkap as string) || null,
      no_wa_pj: (kmj?.no_wa as string) || null,
      keterangan: pos.keterangan as string | null,
    };
  });
}

/**
 * Mengambil daftar Mupel dengan statistik agregat
 * Untuk filter dropdown di peta publik
 */
export async function getMupelList(): Promise<PublicMupel[]> {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('m_mupel')
    .select(`
      id_mupel,
      nama_mupel,
      jemaat:m_jemaat_induk(
        id_induk,
        pos:m_pos_pelkes(
          id_pos
        )
      )
    `)
    .order('nama_mupel', { ascending: true });

  if (error) {
    console.error('[getMupelList] Supabase error:', error.message);
    throw new Error('Gagal memuat data Mupel');
  }

  return (data || []).map((mupel: any) => {
    const jemaatList = (mupel.jemaat as Array<any>) || [];
    const totalJemaat = jemaatList.length;
    const totalPos = jemaatList.reduce(
      (sum: number, j: any) => sum + (j.pos?.length || 0),
      0
    );

    return {
      id_mupel: mupel.id_mupel as string,
      nama_mupel: mupel.nama_mupel as string,
      total_jemaat: totalJemaat,
      total_pos: totalPos,
      total_jiwa: 0,
    };
  });
}
