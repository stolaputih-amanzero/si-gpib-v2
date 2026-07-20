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
  jumlah_sektor: z.number().int().min(0).default(0),
  jumlah_kk: z.number().int().min(0).default(0),
  jumlah_jiwa: z.number().int().min(0).default(0),
});

export type AssignKmjInput = z.infer<typeof assignKmjSchema>;
export type AssignPjInput = z.infer<typeof assignPjSchema>;
export type MupelInput = z.infer<typeof mupelSchema>;
export type JemaatIndukInput = z.infer<typeof jemaatIndukSchema>;
