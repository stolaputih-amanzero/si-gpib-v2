import { z } from 'zod';

export const pelayanSchema = z.object({
  id_pos: z.string().optional().nullable(),
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(150, 'Maksimal 150 karakter'),
  no_wa: z.string().regex(/^\+62\d{8,13}$/, 'Format No. WA harus diawali +62 (contoh: +6281234567890)'),
  jabatan: z.string().min(2, 'Jabatan wajib diisi').max(100),
  tgl_lahir: z.string().optional().nullable(),
  gender: z.enum(['Laki-laki', 'Perempuan'], {
    message: 'Pilih jenis kelamin',
  }),
  status: z.enum(['Aktif', 'Nonaktif']),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
});

export type PelayanInput = z.infer<typeof pelayanSchema>;
