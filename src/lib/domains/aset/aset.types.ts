// src/lib/domains/aset/aset.types.ts
export type JenisAset = 'tanah' | 'bangunan' | 'bergerak';

export const KONDISI_ASET = ['Baik', 'Rusak Ringan', 'Rusak Berat'] as const;
export const STATUS_HUKUM_TANAH = ['SHM', 'HGB', 'Hak Pakai', 'Girik', 'Surat Keterangan', 'Lainnya'] as const;

export interface FotoAsetMeta {
  id_lampiran: string;   // LMP-{timestamp}-{random}
  nama_file: string;
  file_path: string;     // path deterministik di bucket 'assets'
  tipe_file: string;
  ukuran_file: number;
}

export const ASET_TARGETS = { CREATE: 'create_aset' } as const;
