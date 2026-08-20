/**
 * Poka-Yoke Name & Title Utility for SI GPIB
 * Handles standard GPIB ecclesiastical titles, academic degrees, and canonical formatting.
 */

export const STANDARD_PREFIX_TITLES = [
  'Pdt.',
  'Pnt.',
  'Dkn.',
  'Vic.',
  'Dr.',
  'Prof. Dr.',
  '- (Tanpa Gelar)',
] as const;

export interface DetailedParsedName {
  gelarDepan: string;
  namaDepan: string;
  namaTengah: string;
  namaBelakang: string;
  namaPanggilan: string;
  gelarBelakang: string;
  canonicalFullName: string;
}

/**
 * Calculates age in years from a birth date string (YYYY-MM-DD or ISO).
 */
export function calculateAge(birthDateStr?: string | null): number | null {
  if (!birthDateStr) return null;
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

/**
 * Normalizes any variation of "pendeta", "Pdt", "Pdt. Em." into clean standard "Pdt."
 */
export function normalizePrefixTitle(text: string): { prefix: string; remaining: string } {
  let cleaned = text.trim();

  // Strip Emeritus prefix if typed in name, as Emeritus is managed via Status Keaktifan
  cleaned = cleaned.replace(/^pdt\.?\s*em\.?\s*/i, 'Pdt. ');
  cleaned = cleaned.replace(/^pendeta\s+em\.?\s*/i, 'Pdt. ');

  // Standardize general pendeta variations: "Pendeta X", "Pdt X", "PDT. X" -> "Pdt. X"
  if (/^pendeta\s+/i.test(cleaned)) {
    return { prefix: 'Pdt.', remaining: cleaned.replace(/^pendeta\s+/i, '').trim() };
  }
  if (/^pdt\.?\s+/i.test(cleaned)) {
    return { prefix: 'Pdt.', remaining: cleaned.replace(/^pdt\.?\s+/i, '').trim() };
  }
  if (/^pnt\.?\s+/i.test(cleaned)) {
    return { prefix: 'Pnt.', remaining: cleaned.replace(/^pnt\.?\s+/i, '').trim() };
  }
  if (/^dkn\.?\s+/i.test(cleaned)) {
    return { prefix: 'Dkn.', remaining: cleaned.replace(/^dkn\.?\s+/i, '').trim() };
  }
  if (/^vic\.?\s+/i.test(cleaned)) {
    return { prefix: 'Vic.', remaining: cleaned.replace(/^vic\.?\s+/i, '').trim() };
  }
  if (/^prof\.?\s*dr\.?\s+/i.test(cleaned)) {
    return { prefix: 'Prof. Dr.', remaining: cleaned.replace(/^prof\.?\s*dr\.?\s+/i, '').trim() };
  }
  if (/^dr\.?\s+/i.test(cleaned)) {
    return { prefix: 'Dr.', remaining: cleaned.replace(/^dr\.?\s+/i, '').trim() };
  }

  return { prefix: '', remaining: cleaned };
}

/**
 * Parses any incoming full name into separated components:
 * Prefix Title + First Name + Middle Name + Family Name/Marga + Nickname + Degree Suffix.
 */
export function parsePersonName(fullName: string = ''): DetailedParsedName {
  if (!fullName) {
    return {
      gelarDepan: 'Pdt.',
      namaDepan: '',
      namaTengah: '',
      namaBelakang: '',
      namaPanggilan: '',
      gelarBelakang: '',
      canonicalFullName: '',
    };
  }

  let text = fullName.trim();

  // 1. Check & Extract Prefix Title with normalization
  const { prefix, remaining } = normalizePrefixTitle(text);
  const gelarDepan = prefix || '- (Tanpa Gelar)';
  text = remaining;

  // 2. Check & Extract Suffix / Academic Degree
  let gelarBelakang = '';
  if (text.includes(',')) {
    const parts = text.split(',');
    const mainPart = parts[0].trim();
    const suffixPart = parts.slice(1).join(',').trim();
    text = mainPart;
    gelarBelakang = suffixPart;
  }

  // 3. Clean up core name from any leftover accidental duplicated prefixes
  let cleanCore = text
    .replace(/^pdt\.?\s*/i, '')
    .replace(/^pendeta\s*/i, '')
    .replace(/^pnt\.?\s*/i, '')
    .replace(/^dkn\.?\s*/i, '')
    .trim();

  // 4. Split Core Name into First, Middle, and Family Name (Marga)
  const words = cleanCore.split(/\s+/).filter(Boolean);
  let namaDepan = '';
  let namaTengah = '';
  let namaBelakang = '';

  if (words.length === 1) {
    namaDepan = words[0];
  } else if (words.length === 2) {
    namaDepan = words[0];
    namaBelakang = words[1];
  } else if (words.length >= 3) {
    namaDepan = words[0];
    namaBelakang = words[words.length - 1];
    namaTengah = words.slice(1, -1).join(' ');
  }

  const namaPanggilan = namaDepan;
  const canonicalFullName = formatSplitName(gelarDepan, namaDepan, namaTengah, namaBelakang, gelarBelakang);

  return {
    gelarDepan,
    namaDepan,
    namaTengah,
    namaBelakang,
    namaPanggilan,
    gelarBelakang,
    canonicalFullName,
  };
}

/**
 * Compiles cleanly from split name parts into canonical full name.
 */
export function formatSplitName(
  gelarDepan?: string,
  namaDepan: string = '',
  namaTengah: string = '',
  namaBelakang: string = '',
  gelarBelakang?: string
): string {
  const cleanPrefix = (gelarDepan && gelarDepan !== '- (Tanpa Gelar)') ? gelarDepan.trim() : '';
  const coreParts = [namaDepan.trim(), namaTengah.trim(), namaBelakang.trim()].filter(Boolean).join(' ');
  const cleanSuffix = (gelarBelakang || '').trim();

  let result = coreParts;
  if (cleanPrefix) {
    result = `${cleanPrefix} ${result}`;
  }
  if (cleanSuffix) {
    result = `${result}, ${cleanSuffix}`;
  }

  return result.trim();
}

/**
 * Legacy compatibility alias
 */
export function formatCanonicalName(
  gelarDepan?: string,
  namaInti: string = '',
  gelarBelakang?: string
): string {
  const cleanPrefix = (gelarDepan && gelarDepan !== '- (Tanpa Gelar)') ? gelarDepan.trim() : '';
  let cleanCore = (namaInti || '').trim();
  const cleanSuffix = (gelarBelakang || '').trim();

  if (cleanPrefix) {
    cleanCore = cleanCore.replace(/^pdt\.?\s*/i, '').replace(/^pendeta\s*/i, '').replace(/^pnt\.?\s*/i, '').replace(/^dkn\.?\s*/i, '').trim();
  }

  if (cleanSuffix && cleanCore.toLowerCase().endsWith(cleanSuffix.toLowerCase())) {
    cleanCore = cleanCore.slice(0, -cleanSuffix.length).replace(/,\s*$/, '').trim();
  }

  let result = cleanCore;
  if (cleanPrefix) {
    result = `${cleanPrefix} ${result}`;
  }
  if (cleanSuffix) {
    result = `${result}, ${cleanSuffix}`;
  }

  return result.trim();
}

/**
 * Generates standard vCard (.vcf) formatted string for single-click smartphone contact export.
 */
export function generateVCard(person: {
  nama_lengkap: string;
  jabatan?: string | null;
  organisasi?: string | null;
  no_wa?: string | null;
  email?: string | null;
}): string {
  const cleanPhone = (person.no_wa || '').replace(/[^0-9+]/g, '');
  
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${person.nama_lengkap}`,
    `N:;${person.nama_lengkap};;;`,
    person.jabatan ? `TITLE:${person.jabatan}` : '',
    person.organisasi ? `ORG:GPIB;${person.organisasi}` : 'ORG:GPIB',
    cleanPhone ? `TEL;TYPE=CELL,VOICE:${cleanPhone}` : '',
    person.email ? `EMAIL;TYPE=INTERNET,PREF:${person.email}` : '',
    'NOTE:Identitas Resmi Pelayan Gereja Protestan di Indonesia bagian Barat (GPIB)',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
}
