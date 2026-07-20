'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';

function getPathLabel(pathname: string): string {
  if (pathname === '/dashboard' || pathname === '/') return 'Beranda';
  if (pathname === '/analitik') return 'Analitik & KPI';
  if (pathname === '/dashboard/peta') return 'Peta Sebaran Pos & Jemaat';
  if (pathname === '/dashboard/pos-pelkes') return 'Pos Pelkes & Bajem';
  if (pathname.startsWith('/dashboard/pos-pelkes/')) return 'Detail Pos Pelkes';
  if (pathname === '/dashboard/pastoral') return 'Log Pastoral';
  if (pathname === '/wilayah') return 'Kerawanan & Potensi';
  if (pathname === '/demografi') return 'Demografi Pelkat';
  if (pathname === '/jadwal') return 'Jadwal Ibadah';
  if (pathname === '/bantuan') return 'Pengajuan Bantuan';
  if (pathname === '/aset') return 'Inventaris Aset';
  if (pathname === '/pendeta') return 'Manajemen Pendeta';
  if (pathname.startsWith('/pendeta/')) return 'Detail Pendeta';
  if (pathname === '/pelayan') return 'Pelayan Pos';
  if (pathname === '/relawan') return 'Relawan';
  if (pathname === '/dashboard/aktivitas') return 'Aktivitas Log';
  if (pathname === '/dashboard/profil') return 'Profil Saya';

  // Handling dynamic routes in /hierarki
  if (pathname.includes('/hierarki')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1) return 'Hierarki GPIB';
    if (segments.length === 2) return `Mupel: ${decodeURIComponent(segments[1])}`;
    if (segments.length === 3) return `Jemaat: ${decodeURIComponent(segments[2])}`;
    if (segments.length === 4) return `Pos: ${decodeURIComponent(segments[3])}`;
    return 'Hierarki GPIB';
  }

  // Fallback: format last segment
  const lastSegment = pathname.split('/').filter(Boolean).pop();
  return lastSegment
    ? lastSegment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Halaman';
}

export function MobileHeaderBreadcrumb() {
  const pathname = usePathname();
  const router = useRouter();
  const label = getPathLabel(pathname);
  const isRoot = pathname === '/dashboard' || pathname === '/';

  return (
    <header className="md:hidden sticky top-0 z-40 w-full backdrop-blur-md bg-surface-elevated/90 border-b border-border-subtle select-none">
      <div className="flex items-center h-14 px-4 gap-2.5">
        {/* Back Button for Sub-pages */}
        {!isRoot && (
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl text-text-high hover:bg-surface-sunken active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2px]" />
          </button>
        )}

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted overflow-hidden min-w-0">
          <Link
            href="/dashboard"
            className="p-1 rounded-md text-text-muted hover:text-brand-primary transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Beranda"
          >
            <Home className="w-4 h-4" />
          </Link>

          {!isRoot && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-border-subtle shrink-0" />
              <span className="font-extrabold text-text-high truncate text-xs tracking-tight">
                {label}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default MobileHeaderBreadcrumb;
