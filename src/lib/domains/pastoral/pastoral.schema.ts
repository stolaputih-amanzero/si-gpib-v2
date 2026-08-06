// src/lib/domains/pastoral/pastoral.schema.ts
import { z } from 'zod';
import { ID_FORMATS } from '@/lib/constants/id-formats';

export const createLogPastoralSchema = z.object({
  requestId: z.string().uuid('Request ID harus berupa UUID'),
  id_pos: z.string().regex(ID_FORMATS.pos, 'Format ID Pos tidak valid'),
  tgl: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  kegiatan: z.string().min(3, 'Kegiatan minimal 3 karakter').max(200),
  jml_jiwa: z.coerce.number().int().min(0).max(99999).optional(),
  catatan: z.string().max(2000).optional(),
  foto_url: z.string().url().optional().nullable(),
});

export type CreateLogPastoralSchema = z.infer<typeof createLogPastoralSchema>;
