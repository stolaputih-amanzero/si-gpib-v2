import { z } from 'zod';

/**
 * Zod Schema untuk input data Kerawanan Wilayah (US-13.1)
 */
export const kerawananSchema = z.object({
  id_pos: z.string().optional().nullable(),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  jenis_risiko: z.string().min(1, 'Jenis risiko wajib diisi'),
  frekuensi: z.enum(['Rendah', 'Sedang', 'Tinggi', 'Kritis'], {
    message: 'Pilih frekuensi yang valid',
  }),
  keterangan: z.string().max(500, 'Keterangan maksimal 500 karakter').optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  updated_by: z.string().optional().nullable(),
});

/**
 * Zod Schema untuk input data Potensi Wilayah (US-13.2)
 */
export const potensiSchema = z.object({
  id_pos: z.string().optional().nullable(),
  nama_potensi: z.string().min(1, 'Nama potensi wajib diisi'),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi').max(1000, 'Deskripsi maksimal 1000 karakter'),
  keterangan: z.string().max(500, 'Keterangan maksimal 500 karakter').optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  updated_by: z.string().optional().nullable(),
});

export type KerawananInput = z.infer<typeof kerawananSchema>;
export type PotensiInput = z.infer<typeof potensiSchema>;

/**
 * Opsi Kategori Kerawanan Standard
 */
export const KATEGORI_KERAWANAN_OPTIONS = [
  'Bencana Alam',
  'Sosial & Kemasyarakatan',
  'Infrastruktur & Aksesibilitas',
  'Ekonomi & Mata Pencaharian',
  'Kesehatan & Sanitasi',
] as const;

/**
 * Opsi Kategori Potensi Standard
 */
export const KATEGORI_POTENSI_OPTIONS = [
  'SDM (Sumber Daya Manusia)',
  'Alam & Perkebunan',
  'Ekonomi & Usaha Lokal',
  'Fisik & Bangunan',
  'Sosial & Budaya',
] as const;
