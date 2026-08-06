// src/lib/domains/pastoral/pastoral.types.ts
export interface LogPastoral {
  id_log: string;
  id_pos: string;
  id_pendeta: string;
  tgl: string; // ISO Date string (YYYY-MM-DD)
  kegiatan: string;
  jml_jiwa: number | null;
  catatan: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLogPastoralInput {
  requestId: string; // UUID untuk idempotency
  id_pos: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa?: number;
  catatan?: string;
  foto_url?: string;
}

export const PASTORAL_TARGETS = {
  CREATE_LOG: 'create_log_pastoral',
} as const;
