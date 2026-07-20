import { z } from 'zod';

export const asetTanahSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  luas_m2: z.number().min(1, 'Luas minimal 1 m²'),
  thn_perolehan: z.number().int().min(1900, 'Tahun perolehan tidak valid').max(new Date().getFullYear() + 1, 'Tahun tidak boleh melebihi tahun sekarang'),
  status_hukum: z.string().min(1, 'Status hukum wajib diisi'),
  kondisi: z.string().min(1, 'Kondisi wajib diisi'),
  potensi_sda: z.string().optional().nullable(),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const asetBangunanSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  fungsi: z.string().min(1, 'Fungsi bangunan wajib diisi'),
  kondisi: z.string().min(1, 'Kondisi wajib diisi'),
  thn_berdiri: z.number().int().min(1900, 'Tahun berdiri tidak valid').max(new Date().getFullYear() + 1, 'Tahun tidak boleh melebihi tahun sekarang'),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const asetBergerakSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  jenis: z.string().min(1, 'Jenis aset bergerak wajib diisi'),
  merk_tipe: z.string().min(1, 'Merk/Tipe wajib diisi'),
  thn_perolehan: z.number().int().min(1900, 'Tahun perolehan tidak valid').max(new Date().getFullYear() + 1, 'Tahun tidak boleh melebihi tahun sekarang'),
  no_polisi: z.string().max(20, 'Maksimal 20 karakter').optional().nullable(),
  tgl_pajak: z.string().optional().nullable(),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
});

export type AsetTanahInput = z.infer<typeof asetTanahSchema>;
export type AsetBangunanInput = z.infer<typeof asetBangunanSchema>;
export type AsetBergerakInput = z.infer<typeof asetBergerakSchema>;

export const asetFilterSchema = z.object({
  id_pos: z.string().optional(),
  kategori: z.string().optional(),
  search: z.string().optional(),
});

export type AsetFilter = z.infer<typeof asetFilterSchema>;
