import { KategoriAsetKode } from '@/lib/constants/aset';

export interface LampiranAset {
  id_lampiran: string;
  id_tanah?: string | null;
  id_bangunan?: string | null;
  id_aset_b?: string | null;
  nama_file: string;
  file_path: string;
  tipe_file?: string | null;
  ukuran_file?: number | null;
  keterangan?: string | null;
  created_at?: string;
}

export interface AsetTanah {
  id_tanah: string;
  id_pos: string;
  luas_m2: number;
  thn_perolehan: number;
  status_hukum: string;
  kondisi: string;
  potensi_sda?: string | null;
  keterangan?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  updated_at?: string;
  lampiran?: LampiranAset[];
  pos?: {
    nama_pos: string;
    id_induk?: string;
    jemaat_induk?: {
      nama_induk: string;
    };
  };
}

export interface AsetBangunan {
  id_bangunan: string;
  id_pos: string;
  fungsi: string;
  kondisi: string;
  thn_berdiri: number;
  keterangan?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  updated_at?: string;
  lampiran?: LampiranAset[];
  pos?: {
    nama_pos: string;
    id_induk?: string;
    jemaat_induk?: {
      nama_induk: string;
    };
  };
}

export interface AsetBergerak {
  id_aset_b: string;
  id_pos: string;
  jenis: string;
  merk_tipe: string;
  thn_perolehan: number;
  no_polisi?: string | null;
  tgl_pajak?: string | null;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
  lampiran?: LampiranAset[];
  pos?: {
    nama_pos: string;
    id_induk?: string;
    jemaat_induk?: {
      nama_induk: string;
    };
  };
}

export interface AsetGenericItem {
  id: string;
  id_pos: string;
  kategori: KategoriAsetKode;
  judul: string;
  subjudul: string;
  kondisi: string;
  tahun: number;
  keterangan?: string | null;
  thumbnail_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  pos_nama?: string;
  lampiran_count: number;
}
