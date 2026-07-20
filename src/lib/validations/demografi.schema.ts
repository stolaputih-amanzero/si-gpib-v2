import { z } from 'zod';

export const demografiSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  
  // Dikunci ketat hanya untuk 6 kategori resmi GPIB
  kategori_pelkat: z.enum(['PA', 'PT', 'GP', 'PKP', 'PKB', 'PKLU'], {
    message: 'Kategori pelkat tidak valid',
  }),
  
  jml_kk: z.number().int().min(0, 'Jumlah KK tidak boleh negatif'),
  laki: z.number().int().min(0, 'Jumlah laki-laki tidak boleh negatif'),
  perempuan: z.number().int().min(0, 'Jumlah perempuan tidak boleh negatif'),
  profesi: z.string().max(200).optional().nullable(),
  pendidikan: z.string().max(200).optional().nullable(),
  keterangan: z.string().max(500).optional().nullable(),
});

export type DemografiInput = z.infer<typeof demografiSchema>;

// Schema untuk filter
export const demografiFilterSchema = z.object({
  id_mupel: z.string().optional(),
  id_induk: z.string().optional(),
  id_pos: z.string().optional(),
  kategori_pelkat: z.string().optional(),
});

export type DemografiFilter = z.infer<typeof demografiFilterSchema>;
