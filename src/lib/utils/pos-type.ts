export type PosType = 'pos_pelkes' | 'bajem';

const BAJEM_PATTERN = /bajem|bakal jemaat/i;

/**
 * Detects whether a Pos item is a Bajem (Bakal Jemaat) or Pos Pelkes.
 * MUST be called on the RAW `nama_pos` before PosName normalization.
 */
export function detectPosType(namaPosRaw: string | null | undefined): PosType {
  return namaPosRaw && BAJEM_PATTERN.test(namaPosRaw) ? 'bajem' : 'pos_pelkes';
}
