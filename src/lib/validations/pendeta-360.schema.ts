import { z } from 'zod';
import {
  HUBUNGAN_KELUARGA,
  KATEGORI_KOMPETENSI,
  JENIS_KOMPETENSI,
  TINGKAT_KOMPETENSI,
  TINGKAT_KETERLIBATAN,
  JENIS_KETERLIBATAN,
  JABATAN_KETERLIBATAN,
} from '@/lib/constants/pendeta-360.constants';

export const keluargaSchema = z.object({
  hubungan: z.enum(HUBUNGAN_KELUARGA as unknown as [string, ...string[]]),
  nama_lengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(150),
  gender: z.string().optional().nullable(),
  foto_url: z.string().optional().nullable(),
  tgl_lahir: z.string().optional().nullable(),
  no_wa: z.string().optional().nullable(),
  pendidikan: z.string().optional().nullable(),
  pekerjaan: z.string().optional().nullable(),
  status_hidup: z.enum(['Hidup', 'Meninggal']).default('Hidup'),
  is_tanggungan: z.boolean().default(false),
  keterangan: z.string().optional().nullable(),
});

export type KeluargaSchemaInput = z.infer<typeof keluargaSchema>;

export const kompetensiSchema = z.object({
  kategori: z.enum(KATEGORI_KOMPETENSI as unknown as [string, ...string[]]),
  nama_kompetensi: z.string().min(2, 'Nama kompetensi minimal 2 karakter').max(150),
  jenis: z.enum(JENIS_KOMPETENSI as unknown as [string, ...string[]]).default('Kompetensi'),
  tingkat: z.enum(TINGKAT_KOMPETENSI as unknown as [string, ...string[]]).optional().nullable(),
  tahun_mulai: z.number().int().min(1950).max(new Date().getFullYear()).optional().nullable(),
  dokumen_url: z.string().optional().nullable(),
  keterangan: z.string().optional().nullable(),
});

export type KompetensiSchemaInput = z.infer<typeof kompetensiSchema>;

export const keterlibatanSchema = z.object({
  tingkat: z.enum(TINGKAT_KETERLIBATAN as unknown as [string, ...string[]]),
  id_mupel: z.string().optional().nullable(),
  jenis: z.enum(JENIS_KETERLIBATAN as unknown as [string, ...string[]]),
  nama_kegiatan: z.string().min(2, 'Nama kegiatan minimal 2 karakter').max(200),
  jabatan: z.enum(JABATAN_KETERLIBATAN as unknown as [string, ...string[]]).optional().nullable(),
  tgl_mulai: z.string().optional().nullable(),
  tgl_selesai: z.string().optional().nullable(),
  status: z.enum(['Aktif', 'Selesai']).default('Aktif'),
  keterangan: z.string().optional().nullable(),
});

export type KeterlibatanSchemaInput = z.infer<typeof keterlibatanSchema>;
