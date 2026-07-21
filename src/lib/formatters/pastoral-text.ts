/**
 * Smart formatting engine for Pastoral Activity text input (Voice & Manual)
 * Applies proper sentence casing, church acronym capitalization, and clean punctuation spacing
 */
export function formatPastoralKegiatanText(text: string): string {
  if (!text) return '';

  let formatted = text;

  // 1. Collapse multiple spaces into single space
  formatted = formatted.replace(/\s+/g, ' ');

  // 2. Fix punctuation spacing (ensure space after period, comma, colon, semicolon)
  formatted = formatted.replace(/\s*([.,:;])\s*/g, '$1 ');

  // 3. Sentence case: Capitalize first letter of each sentence (after . or ! or ? or start of string)
  formatted = formatted.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

  // 4. Capitalize common Church / GPIB terms & titles
  const churchKeywordsMap: Record<string, string> = {
    gpib: 'GPIB',
    kmj: 'KMJ',
    phmj: 'PHMJ',
    mupel: 'Mupel',
    pelkes: 'Pelkes',
    bajem: 'Bajem',
    pdt: 'Pdt.',
    dkn: 'Dkn.',
    pnt: 'Pnt.',
    tuhan: 'Tuhan',
    allah: 'Allah',
    yesus: 'Yesus',
    kristus: 'Kristus',
    ibadah: 'Ibadah',
    kunjungan: 'Kunjungan',
    konseling: 'Konseling',
    sakramen: 'Sakramen',
    jamita: 'Jamita',
    pelayanan: 'Pelayanan',
    doakan: 'Doakan',
    pastoral: 'Pastoral',
  };

  Object.entries(churchKeywordsMap).forEach(([lower, capitalized]) => {
    const regex = new RegExp(`\\b${lower}\\b`, 'gi');
    formatted = formatted.replace(regex, capitalized);
  });

  return formatted.trim();
}
