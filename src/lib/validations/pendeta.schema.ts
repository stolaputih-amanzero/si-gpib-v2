import { z } from 'zod';

export const pendetaSchema = z.object({
  id_induk: z.string().min(1, 'Jemaat Induk wajib dipilih'),
  nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter').max(150, 'Maksimal 150 karakter'),
  no_wa: z.string().regex(/^\+62\d{8,13}$/, 'Format No. WA harus diawali +62 (contoh: +6281234567890)'),
  jabatan: z.string().min(2, 'Jabatan pelayanan wajib diisi').max(100),
  tgl_lahir: z.coerce.date().optional().nullable(),
  gender: z.enum(['Laki-laki', 'Perempuan'], {
    message: 'Pilih jenis kelamin',
  }),
  status: z.enum(['Aktif', 'Emeritus', 'Cuti', 'Mutasi', 'Nonaktif']).default('Aktif'),
  tgl_tugas: z.coerce.date().optional().nullable(),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
  
  // Field baru untuk Organik/Non-Organik
  jenis_pendeta: z.enum(['Organik', 'Non-Organik']).default('Organik'),
  tgl_mulai_kontrak: z.coerce.date().optional().nullable(),
  tgl_akhir_kontrak: z.coerce.date().optional().nullable(),
  sumber_pembiayaan: z.string().max(100).optional().nullable(),
  eligible_rotasi: z.boolean().default(true),
  gereja_asal: z.string().max(150).optional().nullable(),
}).superRefine((data, ctx) => {
  // Validasi: Jika Non-Organik, tgl_akhir_kontrak wajib
  if (data.jenis_pendeta === 'Non-Organik' && !data.tgl_akhir_kontrak) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tanggal akhir kontrak wajib untuk Pendeta Non-Organik',
      path: ['tgl_akhir_kontrak']
    });
  }
  
  // Validasi: tgl_akhir_kontrak harus setelah tgl_mulai_kontrak
  if (data.tgl_mulai_kontrak && data.tgl_akhir_kontrak && 
      data.tgl_akhir_kontrak < data.tgl_mulai_kontrak) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tanggal akhir kontrak harus setelah tanggal mulai',
      path: ['tgl_akhir_kontrak']
    });
  }
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
