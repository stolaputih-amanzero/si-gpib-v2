import { z } from 'zod';

export const demografiKategoriSchema = z.object({
  id_pos: z.string().optional(),
  kategori_pelkat: z.string().optional(),
  updated_by: z.string().optional(),
  jml_kk: z
    .number()
    .int('Jumlah KK harus berupa angka bulat')
    .min(0, 'Jumlah KK tidak boleh negatif')
    .max(9999, 'Jumlah KK maksimal 9999'),
  laki: z
    .number()
    .int('Jumlah Laki-Laki harus berupa angka bulat')
    .min(0, 'Jumlah Laki-Laki tidak boleh negatif')
    .max(9999, 'Jumlah Laki-Laki maksimal 9999'),
  perempuan: z
    .number()
    .int('Jumlah Perempuan harus berupa angka bulat')
    .min(0, 'Jumlah Perempuan tidak boleh negatif')
    .max(9999, 'Jumlah Perempuan maksimal 9999'),
  profesi: z.string().max(200, 'Profesi maksimal 200 karakter').optional().nullable(),
  pendidikan: z.string().max(200, 'Pendidikan maksimal 200 karakter').optional().nullable(),
  keterangan: z.string().max(1000, 'Keterangan maksimal 1000 karakter').optional().nullable(),
});

export const demografiBatchSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib ditentukan'),
  data: z.record(z.string(), demografiKategoriSchema),
});

export type DemografiKategoriInput = z.infer<typeof demografiKategoriSchema>;
export type DemografiBatchInput = z.infer<typeof demografiBatchSchema>;

export type DemografiInput = DemografiKategoriInput;

export interface DemografiFilter {
  id_pos?: string;
  kategori_pelkat?: string;
  search?: string;
}
