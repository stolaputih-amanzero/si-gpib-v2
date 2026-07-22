import { z } from 'zod';

export const KATEGORI_RELAWAN = ['Pemuda', 'Wanita', 'Pria', 'Umum', 'Medis/Kesehatan', 'Pendidikan'] as const;

export const relawanSchema = z.object({
  id_pos: z.string().optional().nullable(),
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(150),
  no_wa: z.string().regex(/^\+62\d{8,13}$/, 'Format No. WA harus diawali +62 (contoh: +6281234567890)'),
  tgl_lahir: z.string().optional().nullable(),
  gender: z.enum(['Laki-laki', 'Perempuan'], {
    message: 'Pilih jenis kelamin',
  }),
  kategori: z.string().min(2, 'Kategori relawan wajib diisi'),
  pelatihan: z.string().max(200, 'Maksimal 200 karakter').optional().nullable(),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
});

export type RelawanInput = z.infer<typeof relawanSchema>;
