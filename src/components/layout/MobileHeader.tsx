'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, Layers, MoreVertical } from 'lucide-react';

// Pathname mapping to human readable page titles
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Beranda',
  '/hierarki': 'Hierarki GPIB',
  '/sdm': 'SDM & Pelayanan',
  '/sdm/pendeta': 'Manajemen Pendeta',
  '/sdm/pelayan': 'Pelayan Pos',
  '/sdm/relawan': 'Relawan',
  '/sdm/jadwal': 'Jadwal Ibadah',
  '/laporan': 'Data & Laporan',
  '/laporan/pastoral': 'Log Pastoral',
  '/laporan/demografi': 'Demografi Pelkat',
  '/laporan/aset': 'Inventaris Aset',
  '/laporan/kerawanan': 'Kerawanan Wilayah',
  '/laporan/potensi': 'Potensi Wilayah',
  '/bantuan': 'Pengajuan Bantuan',
  '/bantuan/ajukan': 'Ajukan Bantuan Baru',
  '/settings': 'Pengaturan',
  '/dashboard/profil': 'Profil Saya',
  '/analitik': 'Analitik & KPI',
  '/wilayah': 'Kerawanan & Potensi',
};

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Find exact title match or fallback to closest matching prefix or generic label
  let title = PAGE_TITLES[pathname];
  if (!title) {
    const matchedKey = Object.keys(PAGE_TITLES).find(
      (key) => key !== '/dashboard' && pathname.startsWith(key)
    );
    if (matchedKey) {
      title = PAGE_TITLES[matchedKey];
    } else {
      const lastSegment = pathname.split('/').filter(Boolean).pop();
      title = lastSegment
        ? lastSegment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : 'SI GPIB';
    }
  }

  const isRoot = pathname === '/dashboard' || pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-elevated/95 backdrop-blur-md border-b border-border-subtle md:hidden shadow-soft">
      <div className="flex items-center justify-between h-14 px-3 pt-safe">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Back Button (shown on all sub-pages) */}
          {!isRoot && (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-text-high hover:bg-surface-sunken active:scale-95 transition-all -ml-1 border border-border-subtle/40"
              aria-label="Kembali"
              title="Kembali"
            >
              <ChevronLeft className="w-6 h-6 text-brand-primary" />
            </button>
          )}

          {/* Root Brand Tag */}
          {isRoot && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
              <Layers size={16} className="stroke-[2.5px]" />
              <span className="text-xs font-black tracking-wider uppercase">SI GPIB</span>
            </div>
          )}

          {/* Page Title */}
          <h1 className="font-serif font-bold text-base sm:text-lg text-text-high truncate leading-snug min-w-0">
            {title}
          </h1>
        </div>

        {/* Optional Action Menu / Context Button */}
        <div className="flex items-center shrink-0 ml-2">
          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-text-muted hover:text-text-high hover:bg-surface-sunken active:scale-95 transition-all"
            aria-label="Pengaturan"
            title="Pengaturan"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default MobileHeader;
