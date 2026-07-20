import { z } from 'zod';

export const KATEGORI_JABATAN = [
  'BP Mupel',
  'Kepanitiaan Sinode',
  'Kepanitiaan Mupel',
  'Kepanitiaan Jemaat',
  'Unit Misioner',
  'Pokja',
  'Lainnya'
] as const;

export const TINGKAT_JABATAN = ['Sinode', 'Mupel', 'Jemaat'] as const;

export const NAMA_JABATAN_BP_MUPEL = [
  'Ketua', 'Ketua I', 'Ketua II', 'Ketua III', 'Ketua IV', 'Ketua V',
  'Sekretaris', 'Sekretaris I', 'Sekretaris II',
  'Bendahara', 'Bendahara I', 'Anggota'
] as const;

export const NAMA_JABATAN_UMUM = [
  'Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 
  'Anggota', 'Koordinator', 'Anggota Pokja'
] as const;

export const jabatanStrukturalSchema = z.object({
  id_pendeta: z.string().regex(/^PDT-\d{8}$/, 'Format ID Pendeta: PDT-XXXXXXXX'),
  kategori: z.enum(KATEGORI_JABATAN, {
    errorMap: () => ({ message: 'Pilih kategori jabatan yang valid' })
  } as any),
  nama_jabatan: z.string().min(2, 'Nama jabatan minimal 2 karakter').max(100),
  tingkat: z.enum(TINGKAT_JABATAN, {
    errorMap: () => ({ message: 'Pilih tingkat organisasi yang valid' })
  } as any),
  tgl_mulai: z.coerce.date(),
  tgl_selesai: z.coerce.date().optional().nullable(),
  no_sk: z.string().max(100).optional().nullable(),
  tgl_sk: z.coerce.date().optional().nullable(),
  status: z.enum(['Aktif', 'Selesai', 'Nonaktif']).default('Aktif'),
  keterangan: z.string().max(500).optional().nullable()
}).superRefine((data, ctx) => {
  // Validasi: tgl_selesai harus setelah tgl_mulai
  if (data.tgl_selesai && data.tgl_mulai && data.tgl_selesai < data.tgl_mulai) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tanggal selesai harus setelah tanggal mulai',
      path: ['tgl_selesai']
    });
  }
  
  // Validasi: Jika kategori BP Mupel, nama_jabatan harus dari daftar BP Mupel
  if (data.kategori === 'BP Mupel') {
    const validNames = NAMA_JABATAN_BP_MUPEL as readonly string[];
    if (!validNames.includes(data.nama_jabatan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nama jabatan tidak valid untuk kategori BP Mupel',
        path: ['nama_jabatan']
      });
    }
  }
});

export type JabatanStrukturalInput = z.infer<typeof jabatanStrukturalSchema>;
