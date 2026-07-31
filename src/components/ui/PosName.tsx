import { normalizePosName } from '@/lib/utils/normalize-pos-name';
import { cn } from '@/lib/utils';

interface PosNameProps {
  name: string | null | undefined;
  className?: string;
  /** Tampilkan fallback jika nama kosong */
  fallback?: string;
  uppercase?: boolean;
}

/**
 * Render nama Pos Pelkes yang sudah dinormalisasi (tanpa prefix redundan).
 * Gunakan di SEMUA tempat yang menampilkan nama Pos Pelkes.
 */
export function PosName({ name, className, fallback = 'Tanpa Nama', uppercase = false }: PosNameProps) {
  let clean = normalizePosName(name);
  if (uppercase && clean) {
    clean = clean.toUpperCase();
  }
  return (
    <span className={cn('text-ink-primary', className)}>
      {clean || fallback}
    </span>
  );
}
