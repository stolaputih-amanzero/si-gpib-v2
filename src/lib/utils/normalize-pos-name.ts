/**
 * Menormalisasi nama Pos Pelkes dengan menghilangkan prefix redundan.
 * Prinsip Poka-Yoke: status entitas (Pos Pelkes/Bajem) sudah tersirat
 * dari konteks, sehingga prefix-nya adalah noise.
 *
 * @example
 * normalizePosName('Pos Pelkes Eben Haezer Tripariq Makmur')
 * // → 'Eben Haezer Tripariq Makmur'
 *
 * normalizePosName('Bajem "Maranatha" Batu Keling')
 * // → 'Maranatha Batu Keling'
 *
 * normalizePosName('GPIB Pos Pelkes Gideon Sebuduh')
 * // → 'Gideon Sebuduh'
 */

// Urutan PENTING: pola yang lebih spesifik/panjang harus di-match lebih dulu
const REDUNDANT_PREFIXES: RegExp[] = [
  /^gpiib?\s+pos\s*pelkese?\s*(gpib)?\s*/i,        // "GPIB Pos Pelkes" / "GPIB Pos Pelkese"
  /^pos\s*pelkese?\s*gpib\s*/i,                   // "Pos Pelkes GPIB" / "Pos Pelkes GPIB "
  /^pos\s*pelkese?\s*\/\s*bajem\s*(gpib)?\s*/i,   // "Pos Pelkes / Bajem" / "Pos Pelkes/Bajem"
  /^pos\s*pelkese?\s*/i,                          // "Pos Pelkes" / "Pos Pelkese"
  /^pospelkes\s*(gpib)?\s*/i,                     // "Pospelkes" / "Pospelkes GPIB"
  /^pos\s*pelayanan\s*kesaksian\s*(gpib)?\s*/i,   // "Pos Pelayanan Kesaksian"
  /^pos\s*pel\s*(gpib)?\s*/i,                     // "Pos Pel"
  /^bakal\s*jemaat\s*(gpib)?\s*/i,                // "Bakal Jemaat"
  /^bajem\s*(gpib)?\s*/i,                         // "Bajem" / "Bajem GPIB"
  /^gpib\s+/i,                                    // "GPIB " (prefix saja)
];

// Kata-kata kecil yang tetap lowercase di tengah nama (kecuali kata pertama)
const SMALL_WORDS = new Set([
  'di', 'ke', 'dari', 'dan', 'atau', 'yang', 'untuk',
  'dengan', 'pada', 'dalam', 'secara', 'bagi',
]);

// Singkatan baku yang dipertahankan sebagai uppercase
const KNOWN_ABBREVIATIONS = new Set([
  'PT', 'DK', 'DU', 'KM', 'RT', 'RW', 'GPIB', 'BUMN', 'PGI', 'KMJ', 'MUPEL', 'PELKES', 'SD', 'SMP', 'SMA', 'SP'
]);

/**
 * Title-case cerdas: capitalize setiap kata, tapi pertahankan
 * singkatan (PT, DK, DU, Km, dll) dan angka.
 */
function smartTitleCase(str: string): string {
  return str
    .split(/\s+/)
    .map((word, index) => {
      // Pertahankan kata yang mengandung angka (Km12, DK3, DU, VI)
      if (/\d/.test(word)) return word;

      // Pertahankan singkatan baku pendek
      const cleanUpper = word.toUpperCase().replace(/\.$/, '');
      if (KNOWN_ABBREVIATIONS.has(cleanUpper)) {
        return word.toUpperCase();
      }

      // Kata kecil di tengah → lowercase
      if (index > 0 && SMALL_WORDS.has(word.toLowerCase())) {
        return word.toLowerCase();
      }

      // Title case biasa
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function normalizePosName(raw: string | null | undefined): string {
  if (!raw) return '';

  const originalTrimmed = raw.trim();
  if (!originalTrimmed) return '';

  let name = originalTrimmed;

  // 1. Hapus prefix redundan (loop karena bisa ada kombinasi)
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of REDUNDANT_PREFIXES) {
      const cleaned = name.replace(prefix, '');
      if (cleaned !== name) {
        name = cleaned;
        changed = true;
      }
    }
  }

  // 2. Hapus tanda kutip (straight & curly)
  name = name.replace(/["""''«»]/g, '');

  // 3. Normalisasi spasi berlebih
  name = name.replace(/\s+/g, ' ').trim();

  // Guard: Jika hasil pembersihan membuat nama menjadi kosong (misal: input "Pos Pelkes"),
  // fallback ke originalTrimmed agar tidak mengembalikan string kosong untuk input non-kosong.
  if (!name) {
    return originalTrimmed;
  }

  // 4. Smart title case HANYA jika full uppercase atau full lowercase
  //    (hindari merusak nama yang sudah mixed-case dengan benar)
  const isAllUpper = name === name.toUpperCase() && /[A-Z]/.test(name);
  const isAllLower = name === name.toLowerCase() && /[a-z]/.test(name);
  if (isAllUpper || isAllLower) {
    name = smartTitleCase(name);
  }

  return name;
}
