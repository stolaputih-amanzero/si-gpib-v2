import { z } from 'zod';

export const logPastoralSchema = z.object({
  id_pos: z.string().optional().nullable(),
  id_pendeta: z.string().min(1, 'Pendeta wajib dipilih'),
  tgl: z.date({
    message: 'Tanggal wajib diisi',
  }),
  kegiatan: z
    .string()
    .min(3, 'Kegiatan minimal 3 karakter')
    .max(200, 'Kegiatan maksimal 200 karakter'),
  jml_jiwa: z
    .number()
    .int('Jumlah jiwa harus bilangan bulat')
    .min(0, 'Jumlah jiwa tidak boleh negatif')
    .optional(),
  catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
  keterangan: z.string().max(500, 'Keterangan maksimal 500 karakter').optional(),
});

export type LogPastoralInput = z.infer<typeof logPastoralSchema>;

// Schema untuk filter
export const logPastoralFilterSchema = z.object({
  id_pos: z.string().optional(),
  id_pendeta: z.string().optional(),
  tanggal_mulai: z.date().optional(),
  tanggal_selesai: z.date().optional(),
});

export type LogPastoralFilter = z.infer<typeof logPastoralFilterSchema>;
