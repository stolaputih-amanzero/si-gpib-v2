import { z } from 'zod';

/**
 * Validasi Format ID Hierarki (Poka Yoke Standard SI GPIB v2.2)
 */
export const idMupelSchema = z
  .string()
  .min(1, 'ID Mupel wajib diisi');

export const idJemaatSchema = z
  .string()
  .min(1, 'ID Jemaat Induk wajib diisi');

export const idPosSchema = z
  .string()
  .min(1, 'ID Pos Pelkes wajib diisi');

export const idPendetaSchema = z
  .string()
  .min(1, 'ID Pendeta wajib diisi');

/**
 * Zod Schema penetapan KMJ (Ketua Majelis Jemaat)
 */
export const assignKmjSchema = z.object({
  id_induk: idJemaatSchema,
  id_pendeta: idPendetaSchema,
});

/**
 * Zod Schema penugasan PJ (Pendeta Jemaat)
 */
export const assignPjSchema = z.object({
  id_induk: idJemaatSchema,
  id_pendeta: idPendetaSchema,
  tanggal_mulai: z.string().optional(),
});

/**
 * Zod Schema Mupel (CRUD)
 */
export const mupelSchema = z.object({
  id_mupel: idMupelSchema,
  nama_mupel: z.string().min(1, 'Nama Mupel wajib diisi'),
  keterangan: z.string().optional(),
});

/**
 * Zod Schema Jemaat Induk (CRUD)
 */
export const jemaatIndukSchema = z.object({
  id_induk: idJemaatSchema,
  id_mupel: idMupelSchema,
  nama_induk: z.string().min(1, 'Nama Jemaat Induk wajib diisi'),
  alamat: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  id_kmj: z.string().nullable().optional(),
  keterangan: z.string().optional(),
  jumlah_sektor: z.coerce.number().int().min(0),
  jumlah_kk: z.coerce.number().int().min(0),
  jumlah_jiwa: z.coerce.number().int().min(0),
});

/**
 * Zod Schema Pos Pelkes / Bajem (CRUD)
 */
export const posPelkesSchema = z.object({
  id_pos: idPosSchema,
  id_induk: idJemaatSchema,
  nama_pos: z.string().min(1, 'Nama Pos Pelkes wajib diisi'),
  kategori: z.enum(['Pos Pelkes', 'Bajem']),
  alamat: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  tgl_berdiri: z.string().optional(),
  keterangan: z.string().optional(),
  jumlah_kk: z.coerce.number().int().min(0),
  jumlah_jiwa: z.coerce.number().int().min(0),
});

/**
 * Zod Schema Peningkatan Status (Pos Pelkes -> Bajem -> Jemaat Induk)
 */
export const elevateStatusSchema = z.object({
  id_pos: z.string().min(1, 'ID Pos wajib diisi'),
  target_status: z.enum(['BAJEM', 'JEMAAT_INDUK']),
  tanggal_perubahan: z.string().min(1, 'Tanggal perubahan wajib diisi'),
  keterangan_perubahan: z.string().min(5, 'Keterangan / Nomor SK minimal 5 karakter').max(500),
  id_induk_baru: z.string().optional(),
  nama_induk_baru: z.string().optional(),
}).refine((data) => {
  if (data.target_status === 'JEMAAT_INDUK') {
    return !!data.id_induk_baru && data.id_induk_baru.trim().length > 0 && !!data.nama_induk_baru && data.nama_induk_baru.trim().length > 0;
  }
  return true;
}, {
  message: 'ID dan Nama Jemaat Induk baru wajib diisi untuk elevasi ke Jemaat Induk',
  path: ['id_induk_baru'],
});

export type AssignKmjInput = z.infer<typeof assignKmjSchema>;
export type AssignPjInput = z.infer<typeof assignPjSchema>;
export type MupelInput = z.infer<typeof mupelSchema>;
export type JemaatIndukInput = z.infer<typeof jemaatIndukSchema>;
export type PosPelkesInput = z.infer<typeof posPelkesSchema>;
export type ElevateStatusInput = z.infer<typeof elevateStatusSchema>;
