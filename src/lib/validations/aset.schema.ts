import { z } from 'zod';

export const asetTanahSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes / Bajem / Jemaat wajib dipilih'),
  luas_m2: z.number().positive('Luas tanah harus positif'),
  thn_perolehan: z.number().int().min(1900, 'Tahun perolehan minimal 1900').max(2100, 'Tahun tidak valid'),
  status_hukum: z.enum(['SHM', 'HGB', 'Girik', 'Lainnya']),
  kondisi: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat', 'Sengketa']),
  potensi_sda: z.string().optional(),
  keterangan: z.string().max(500, 'Keterangan maksimal 500 karakter').optional(),
  latitude: z.number().min(-90).max(90, 'Latitude tidak valid'),
  longitude: z.number().min(-180).max(180, 'Longitude tidak valid'),
});

export const asetBangunanSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes / Bajem / Jemaat wajib dipilih'),
  nama_bangunan: z.string().optional(),
  fungsi: z.enum(['Gereja', 'Pastori', 'Sekolah', 'Kantor', 'Lainnya']),
  kondisi: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat', 'Tidak Layak']),
  thn_berdiri: z.number().int().min(1900, 'Tahun berdiri minimal 1900').max(2100, 'Tahun tidak valid'),
  keterangan: z.string().max(500, 'Keterangan maksimal 500 karakter').optional(),
  latitude: z.number().min(-90).max(90, 'Latitude tidak valid'),
  longitude: z.number().min(-180).max(180, 'Longitude tidak valid'),
});

export const asetBergerakSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes / Bajem / Jemaat wajib dipilih'),
  jenis: z.enum(['Kendaraan', 'Alat Musik', 'Elektronik', 'Furniture', 'Lainnya']),
  merk_tipe: z.string().min(1, 'Merk / Tipe wajib diisi'),
  kondisi: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat']),
  thn_perolehan: z.number().int().min(1900, 'Tahun perolehan minimal 1900').max(2100, 'Tahun tidak valid'),
  no_polisi: z.string().optional(),
  tgl_pajak: z.union([z.string(), z.date()]).optional(),
  keterangan: z.string().max(500, 'Keterangan maksimal 500 karakter').optional(),
  latitude: z.number().min(-90).max(90, 'Latitude tidak valid'),
  longitude: z.number().min(-180).max(180, 'Longitude tidak valid'),
});

export type AsetTanahInput = z.infer<typeof asetTanahSchema>;
export type AsetBangunanInput = z.infer<typeof asetBangunanSchema>;
export type AsetBergerakInput = z.infer<typeof asetBergerakSchema>;

export interface AsetFilter {
  id_pos?: string;
  kategori?: 'tanah' | 'bangunan' | 'bergerak' | 'all' | string;
  jenis_aset?: 'tanah' | 'bangunan' | 'bergerak' | 'all' | string;
  search?: string;
}
