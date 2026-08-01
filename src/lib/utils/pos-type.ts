export type PosType = 'pos_pelkes' | 'bajem';

const BAJEM_PATTERN = /bajem|bakal jemaat/i;

/**
 * Detects whether a Pos item is a Bajem (Bakal Jemaat) or Pos Pelkes.
 * Checks both `kategori` field (e.g. 'Bajem', 'BAJEM', 'Bakal Jemaat') and raw `nama_pos`.
 */
export function detectPosType(
  item: { nama_pos?: string | null; kategori?: string | null } | string | null | undefined
): PosType {
  if (!item) return 'pos_pelkes';

  if (typeof item === 'object') {
    const kat = (item.kategori || '').trim();
    if (BAJEM_PATTERN.test(kat)) return 'bajem';
    const name = item.nama_pos || '';
    return BAJEM_PATTERN.test(name) ? 'bajem' : 'pos_pelkes';
  }

  return BAJEM_PATTERN.test(item) ? 'bajem' : 'pos_pelkes';
}
