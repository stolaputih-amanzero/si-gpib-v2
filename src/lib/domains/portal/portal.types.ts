export interface PublicPosPelkes {
  id_pos: string;
  nama_pos: string;
  alamat: string | null;
  latitude: number;
  longitude: number;
  kategori: string | null;
  jumlah_kk: number;
  jumlah_jiwa: number;
}

export interface JadwalIbadah {
  id_ibadah: string;
  jenis: string;
  hari: string;
  jam: string;
  keterangan: string | null;
}

export interface Pelayan {
  id_pelayan: string;
  nama: string;
  jabatan: string | null;
}

export interface PosDetail extends PublicPosPelkes {
  jadwal_ibadah: JadwalIbadah[];
  pelayan: Pelayan[];
}
