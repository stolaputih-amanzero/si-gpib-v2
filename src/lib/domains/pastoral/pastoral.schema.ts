// src/lib/domains/pastoral/pastoral.schema.ts
import { z } from 'zod';

export const createLogPastoralSchema = z.object({
  requestId: z.string().uuid('Request ID harus berupa UUID'),
  id_log: z.string().optional().nullable(),
  id_pos: z.string().optional().nullable(),
  id_pendeta: z.string().optional().nullable(),
  tgl: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  kegiatan: z.string().optional().nullable().transform(v => (v && v.length >= 3 ? v : 'Kunjungan Jemaat')),
  jml_jiwa: z.coerce.number().int().min(0).max(99999).optional().nullable(),
  catatan: z.string().max(2000).optional().nullable(),
  foto_url: z.string().url().optional().nullable(),
});

export type CreateLogPastoralSchema = z.infer<typeof createLogPastoralSchema>;
