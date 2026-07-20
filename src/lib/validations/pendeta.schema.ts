import { z } from 'zod';

export const pendetaSchema = z.object({
  id_induk: z.string().min(1, 'Jemaat Induk wajib dipilih'),
  nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter').max(150, 'Maksimal 150 karakter'),
  no_wa: z.string().regex(/^\+62\d{8,13}$/, 'Format No. WA harus diawali +62 (contoh: +6281234567890)'),
  jabatan: z.string().min(2, 'Jabatan pelayanan wajib diisi').max(100),
  tgl_lahir: z.string().optional().nullable(),
  gender: z.enum(['Laki-laki', 'Perempuan'], {
    message: 'Pilih jenis kelamin',
  }),
  status: z.enum(['Aktif', 'Emeritus', 'Cuti', 'Mutasi']),
  tgl_tugas: z.string().optional().nullable(),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
});

export const mutasiSchema = z.object({
  id_pendeta: z.string().min(1, 'Pendeta wajib dipilih'),
  id_induk_baru: z.string().min(1, 'Jemaat Induk tujuan wajib dipilih'),
  alasan: z.string().min(10, 'Alasan mutasi minimal 10 karakter').max(500, 'Maksimal 500 karakter'),
});

export const setKmjSchema = z.object({
  id_induk: z.string().min(1, 'Jemaat Induk wajib dipilih'),
  id_pendeta: z.string().min(1, 'Pendeta wajib dipilih'),
});

export type PendetaInput = z.infer<typeof pendetaSchema>;
export type MutasiInput = z.infer<typeof mutasiSchema>;
export type SetKmjInput = z.infer<typeof setKmjSchema>;
