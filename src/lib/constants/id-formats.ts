// src/lib/constants/id-formats.ts
export const ID_FORMATS = {
  // MASTER DATA (short, semantic IDs from GPIB.xlsx)
  mupel:  /^M-\d{2}$/,                     // M-01 ... M-25
  jemaat: /^\d{2}-\d{2}-[A-Z]{2}$/,        // 02-01-BM, 23-03-ET
  pos:    /^POS-\d{5}$/,                   // POS-13055
  pendeta: /^PDT-\d{8}$/,                  // PDT-19060024

  // PROFILE 360° DIMENSIONS (fixed-length IDs)
  keluarga:   /^KLG-\d{8}$/,               // KLG-83719402
  kompetensi: /^KMP-\d{8}$/,               // KMP-19304857
  keterlibatan: /^KTL-\d{8}$/,             // KTL-92837410

  // TIMESTAMPED IDS ({prefix}-{13-digit timestamp}-{3-digit random})
  jabatan:      /^JBT-\d{13}-\d{3}$/,      // JBT-1778142941355-374
  histori:      /^HIS-\d{13}-\d{3}$/,      // HIS-1778142941355-374
  log:          /^LOG-\d{13}-\d{3}$/,      // LOG-1778142941355-374
  tugas:        /^TGS-\d{13}-\d{3}$/,      // TGS-1778142941355-374

  // CJ-5 ASET (timestamped)
  tanah:        /^TNT-\d{13}-\d{3}$/,      // TNT-1778142941355-374
  bangunan:     /^BGN-\d{13}-\d{3}$/,      // BGN-1778142941355-374
  asetBergerak: /^ABG-\d{13}-\d{3}$/,      // ABG-1778142941355-374
  lampiran:     /^LMP-\d{13}-\d{3}$/,      // LMP-1778142941355-374
} as const;

// Only timestamped prefixes go through the generator
export type TimestampIdPrefix = 
  | 'JBT' | 'HIS' | 'LOG' | 'TGS' 
  | 'TNT' | 'BGN' | 'ABG' | 'LMP';

export function generateTimestampId(prefix: TimestampIdPrefix): string {
  const timestamp = Date.now().toString().padStart(13, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Separate generator for fixed-length master IDs (if needed)
export function generateFixedId(prefix: 'KLG' | 'KMP' | 'KTL'): string {
  const random = Math.floor(Math.random() * 100_000_000).toString().padStart(8, '0');
  return `${prefix}-${random}`;
}
