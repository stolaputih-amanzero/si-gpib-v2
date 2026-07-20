import { KategoriPelkatKode } from '@/lib/constants/pelkat';

export interface DemografiPelkat {
  id_pos: string;
  kategori_pelkat: KategoriPelkatKode;
  jml_kk: number;
  laki: number;
  perempuan: number;
  profesi?: string | null;
  pendidikan?: string | null;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
  pos?: {
    nama_pos: string;
    id_induk?: string;
    jemaat_induk?: {
      nama_induk: string;
      id_mupel?: string;
    };
  };
}

export interface DemografiSummary {
  kategori_pelkat: KategoriPelkatKode;
  laki: number;
  perempuan: number;
  total: number;
  jml_kk: number;
}
