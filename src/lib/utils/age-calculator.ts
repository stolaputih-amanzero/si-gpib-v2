import { differenceInYears, parseISO } from 'date-fns';

export function calculateAge(tglLahir: string | Date | null | undefined): number | null {
  if (!tglLahir) return null;
  try {
    const birthDate = typeof tglLahir === 'string' ? parseISO(tglLahir) : tglLahir;
    if (isNaN(birthDate.getTime())) return null;
    return differenceInYears(new Date(), birthDate);
  } catch {
    return null;
  }
}
