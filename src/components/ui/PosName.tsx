import { normalizePosName } from '@/lib/utils/normalize-pos-name';
import { cn } from '@/lib/utils';

interface PosNameProps {
  name: string | null | undefined;
  className?: string;
  /** Tampilkan fallback jika nama kosong */
  fallback?: string;
}

/**
 * Render nama Pos Pelkes yang sudah dinormalisasi (tanpa prefix redundan).
 * Gunakan di SEMUA tempat yang menampilkan nama Pos Pelkes.
 */
export function PosName({ name, className, fallback = 'Tanpa Nama' }: PosNameProps) {
  const clean = normalizePosName(name);
  return (
    <span className={cn('text-ink-primary', className)}>
      {clean || fallback}
    </span>
  );
}
