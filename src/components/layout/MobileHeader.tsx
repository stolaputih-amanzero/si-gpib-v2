'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Layers, RotateCw, Sun, Moon } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useSmoothTheme } from '@/hooks/useSmoothTheme';
import { haptic } from '@/lib/haptic/vibrate';

// Route path to human-readable title mapping
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard Pos Pelkes',
  '/hierarki': 'Struktur Organisasi',
  '/dashboard/pos-pelkes': 'Data Pos Pelkes & Bajem',
  '/dashboard/peta': 'Peta Sebaran Pelayanan',
  '/bantuan': 'Permohonan Bantuan',
  '/bantuan/ajukan': 'Form Pengajuan Bantuan',
  '/settings': 'Pengaturan Sistem',
  '/laporan/pastoral': 'Log Pastoral & Kunjungan',
  '/laporan/demografi': 'Demografi Pelkat',
  '/inventaris': 'Aset & Inventaris',
  '/relawan': 'Data Relawan Pos',
  '/pelayan': 'Data Pelayan Pos',
  '/pendeta': 'Pendeta Pos Pelkes',
  '/wilayah': 'Kondisi & Risiko Wilayah',
  '/kemitraan': 'Kemitraan Jemaat',
};

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { resolvedTheme, setTheme } = useSmoothTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      router.refresh();
      haptic.light();
      toast.success('Data Diperbarui', 'Data aplikasi berhasil disegarkan secara real-time.');
    } catch {
      toast.error('Gagal Memperbarui', 'Terjadi kesalahan saat menyegarkan data.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-1/95 backdrop-blur-md hairline-b md:hidden shadow-xs select-none">
      <div className="flex items-center justify-between h-14 px-3 pt-safe">
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          {!isRoot && (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-ink-primary hover:bg-surface-sunken active:scale-95 transition-all -ml-1 border border-line-subtle/40"
              aria-label="Kembali"
              title="Kembali"
            >
              <ChevronLeft className="w-6 h-6 text-brand-600" />
            </button>
          )}

          {isRoot && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-brand text-brand-600 shrink-0">
              <Layers size={16} className="stroke-[2.5px]" />
              <span className="text-xs font-black tracking-wider uppercase">SI GPIB</span>
            </div>
          )}

          <h1 data-testid="mobile-header-title" className="font-display font-semibold text-base sm:text-lg text-ink-primary truncate leading-snug min-w-0">
            {title}
          </h1>
        </div>

        {/* Quick Header Actions: Theme Toggle + Refresh */}
        <div className="flex items-center shrink-0 gap-1">
          <button
            type="button"
            onClick={() => {
              haptic.selection();
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
            }}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-ink-secondary hover:bg-surface-sunken active:scale-95 transition-all border border-line-subtle/40"
            aria-label="Ganti tema tampilan"
            title="Ganti Tema (Terang / Gelap)"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun size={18} className="text-accent-600" />
            ) : (
              <Moon size={18} className="text-brand-600" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-brand-600 hover:bg-surface-brand active:scale-95 transition-all border border-line-subtle/40 disabled:opacity-50"
            aria-label="Segarkan Data"
            title="Segarkan Data Real-Time"
          >
            <RotateCw size={18} className={isRefreshing ? 'animate-spin text-brand-600' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default MobileHeader;
