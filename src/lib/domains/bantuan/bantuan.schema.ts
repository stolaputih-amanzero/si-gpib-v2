// src/lib/domains/bantuan/bantuan.schema.ts
// Zod validation schemas untuk domain Bantuan & Workflow
// Ref: PRD US-10.1–10.6, EIA v0.1.1

import { z } from 'zod';


// ============================================================
// SHARED SCHEMAS
// ============================================================

const estimasiBiayaSchema = z
  .number()
  .min(0, 'Estimasi biaya tidak boleh negatif')
  .max(10_000_000_000, 'Estimasi biaya melebihi batas maksimum');

// ============================================================
// CREATE — Pengajuan Bantuan Baru (PRD US-10.1)
// ============================================================

export const createBantuanSchema = z.object({
  id_pos: z
    .string()
    .min(1, 'Pos Pelkes wajib dipilih')
    .regex(/^POS-\d{5}$/, 'Format ID Pos Pelkes tidak valid (POS-XXXXX)'),

  jenis_bantuan: z
    .string()
    .min(3, 'Jenis bantuan minimal 3 karakter')
    .max(200, 'Jenis bantuan maksimal 200 karakter'),

  deskripsi: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(2000, 'Deskripsi maksimal 2000 karakter'),

  estimasi_biaya: estimasiBiayaSchema,

  urgensi: z.enum(['Rendah', 'Sedang', 'Tinggi', 'Darurat']),

  // Referensi aset — opsional per PRD US-10.1
  id_aset_tanah: z.string().nullable().optional(),
  id_aset_bangunan: z.string().nullable().optional(),
  id_aset_bergerak: z.string().nullable().optional(),
});

export type CreateBantuanInput = z.infer<typeof createBantuanSchema>;

// ============================================================
// UPDATE — Edit Draft (hanya saat status = Draft)
// ============================================================

export const updateBantuanSchema = z.object({
  id_ajuan: z.string().min(1),

  jenis_bantuan: z
    .string()
    .min(3, 'Jenis bantuan minimal 3 karakter')
    .max(200, 'Jenis bantuan maksimal 200 karakter')
    .optional(),

  deskripsi: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(2000, 'Deskripsi maksimal 2000 karakter')
    .optional(),

  estimasi_biaya: estimasiBiayaSchema.optional(),

  urgensi: z.enum(['Rendah', 'Sedang', 'Tinggi', 'Darurat']).optional(),

  id_aset_tanah: z.string().nullable().optional(),
  id_aset_bangunan: z.string().nullable().optional(),
  id_aset_bergerak: z.string().nullable().optional(),
});

export type UpdateBantuanInput = z.infer<typeof updateBantuanSchema>;

// ============================================================
// SUBMIT — Draft → Pending_KMJ
// ============================================================

export const submitBantuanSchema = z.object({
  id_ajuan: z.string().min(1, 'ID pengajuan wajib diisi'),
});

export type SubmitBantuanInput = z.infer<typeof submitBantuanSchema>;

// ============================================================
// REVIEW — Approve/Reject per tingkat (PRD US-10.2, 10.3, 10.4)
// ============================================================

export const reviewBantuanSchema = z.object({
  id_ajuan: z.string().min(1, 'ID pengajuan wajib diisi'),

  keputusan: z.enum(['approve', 'reject']),

  catatan: z
    .string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .nullable()
    .optional(),
});

export type ReviewBantuanInput = z.infer<typeof reviewBantuanSchema>;

// ============================================================
// AJUKAN ULANG — Rejected → Draft baru (PRD US-10.6, EIA v0.1.1)
// ============================================================

export const ajukanUlangSchema = z.object({
  /** ID pengajuan yang ditolak (status harus = Rejected) */
  id_ajuan_lama: z.string().min(1, 'ID pengajuan lama wajib diisi'),

  // Opsional: pemohon bisa langsung mengedit data saat mengajukan ulang
  jenis_bantuan: z
    .string()
    .min(3)
    .max(200)
    .optional(),

  deskripsi: z
    .string()
    .min(10)
    .max(2000)
    .optional(),

  estimasi_biaya: estimasiBiayaSchema.optional(),

  urgensi: z.enum(['Rendah', 'Sedang', 'Tinggi', 'Darurat']).optional(),
});

export type AjukanUlangInput = z.infer<typeof ajukanUlangSchema>;

// ============================================================
// FILTER & PAGINATION (untuk queries)
// ============================================================

export const bantuanFiltersSchema = z.object({
  status: z.enum(['Draft', 'Pending_KMJ', 'Pending_Mupel', 'Pending_Sinode', 'Approved', 'Rejected']).optional(),
  id_pos: z.string().optional(),
  urgensi: z.enum(['Rendah', 'Sedang', 'Tinggi', 'Darurat']).optional(),
  diajukan_oleh: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  includeHistoris: z.boolean().optional().default(false),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type BantuanFiltersInput = z.infer<typeof bantuanFiltersSchema>;

// ============================================================
// ID GENERATION
// ============================================================

/**
 * Format ID Pengajuan Bantuan:
 * BNT-{timestamp_ms}-{random_3digit}
 * Contoh: BNT-1778142941355-374
 * (Konsisten dengan pola JBT/HIS/LOG di rules.md)
 */
export function generateIdPengajuan(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 900) + 100; // 100-999
  return `BNT-${timestamp}-${random}`;
}

/**
 * Validasi format ID pengajuan bantuan
 */
export const idPengajuanSchema = z
  .string()
  .regex(/^BNT-\d{13}-\d{3}$/, 'Format ID pengajuan tidak valid');
