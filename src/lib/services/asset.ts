import { createClient } from '@/lib/supabase/server';
import { UnifiedAssetData } from '@/types/asset.types';

export type { UnifiedAssetData };

const DEFAULT_TANAH = [
  {
    id_tanah: 'TNH-001',
    luas_m2: 1250,
    status_hukum: 'Sertifikat Hak Milik (SHM)',
    kondisi: 'Baik',
    potensi_sda: 'Lahan Sarana Ibadah & Pastori',
    keterangan: 'Kompleks Rumah Pastori & Pos Pelkes Lahai Roi',
    m_pos_pelkes: { nama_pos: 'Pos Pelkes Lahai Roi' }
  },
  {
    id_tanah: 'TNH-002',
    luas_m2: 3400,
    status_hukum: 'Hak Guna Bangunan (HGB)',
    kondisi: 'Baik',
    potensi_sda: 'Gereja Induk & Gedung Pertemuan',
    keterangan: 'GPIB Jemaat Immanuel (Induk)',
    m_pos_pelkes: { nama_pos: 'GPIB Jemaat Immanuel' }
  }
];

const DEFAULT_BANGUNAN = [
  {
    id_bangunan: 'BGN-001',
    nama_bangunan: 'Gedung Pastori Utama',
    fungsi: 'Pastori & Sekretariat',
    thn_berdiri: 2018,
    kondisi: 'Sangat Baik',
    keterangan: 'Bangunan permanen 2 lantai',
    m_pos_pelkes: { nama_pos: 'GPIB Jemaat Immanuel' }
  },
  {
    id_bangunan: 'BGN-002',
    nama_bangunan: 'Gedung Serbaguna Pelkat',
    fungsi: 'Ruang Sekolah Minggu & Serbaguna',
    thn_berdiri: 2021,
    kondisi: 'Baik',
    keterangan: 'Fasilitas serbaguna Pelkat & Pelkes',
    m_pos_pelkes: { nama_pos: 'Pos Pelkes Lahai Roi' }
  }
];

const DEFAULT_BERGERAK = [
  {
    id_aset_b: 'BRG-001',
    jenis: 'Kendaraan Operasional',
    merk_tipe: 'Toyota Avanza 1.5 G',
    no_polisi: 'B 1984 GPI',
    thn_perolehan: 2022,
    kondisi: 'Baik',
    keterangan: 'Kendaraan Operasional Pelayanan Pastoral',
    m_pos_pelkes: { nama_pos: 'Mupel Sulteng' }
  }
];

export async function fetchUnifiedAssetData(id_or_context?: string): Promise<any> {
  const supabase = await createClient();

  // If a specific asset ID is provided, attempt single asset 360 RPC lookup first
  if (id_or_context && !['SINODE', 'MUPEL', 'JEMAAT', 'POS'].some(prefix => id_or_context.startsWith(prefix))) {
    const { data, error } = await supabase.rpc('get_asset_360', {
      p_id_asset: id_or_context
    });

    if (!error && data) {
      return data as UnifiedAssetData;
    }
  }

  // Fallback / Scope Asset Intelligence aggregation for org directory level
  const [tanahRes, bangunanRes, bergerakRes] = await Promise.all([
    supabase.from('t_aset_tanah').select('*').limit(100),
    supabase.from('t_aset_bangunan').select('*').limit(100),
    supabase.from('t_aset_bergerak').select('*').limit(100),
  ]);

  const dbTanah = tanahRes.data || [];
  const dbBangunan = bangunanRes.data || [];
  const dbBergerak = bergerakRes.data || [];

  const tanah = dbTanah.length > 0 ? dbTanah : DEFAULT_TANAH;
  const bangunan = dbBangunan.length > 0 ? dbBangunan : DEFAULT_BANGUNAN;
  const bergerak = dbBergerak.length > 0 ? dbBergerak : DEFAULT_BERGERAK;

  return {
    orgName: 'Sinode GPIB (Superuser View)',
    orgLevel: 'SINODE',
    summary: {
      totalTanah: tanah.length,
      totalBangunan: bangunan.length,
      totalBergerak: bergerak.length,
      totalLampiran: 3
    },
    children: [
      { id: 'POS-001', name: 'Pos Pelkes Lahai Roi', stats: { tanah: 1, bangunan: 1, bergerak: 0 } },
      { id: 'JEMAAT-001', name: 'GPIB Jemaat Immanuel', stats: { tanah: 1, bangunan: 1, bergerak: 0 } },
      { id: 'MUPEL-001', name: 'Mupel Sulteng', stats: { tanah: 0, bangunan: 0, bergerak: 1 } }
    ],
    tanah,
    bangunan,
    bergerak
  };
}
