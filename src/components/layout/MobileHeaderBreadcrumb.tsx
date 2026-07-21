'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Home, Layers, Menu } from 'lucide-react';

interface CrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface MobileHeaderBreadcrumbProps {
  onOpenDrawer?: () => void;
}

function getBreadcrumbCrumbs(pathname: string): CrumbItem[] {
  // Always start with Home
  const crumbs: CrumbItem[] = [
    { label: 'Beranda', href: '/dashboard' },
  ];

  if (pathname === '/dashboard' || pathname === '/') {
    crumbs[0].isCurrent = true;
    return crumbs;
  }

  const segments = pathname.split('/').filter(Boolean);

  // Special handling for /hierarki
  if (segments[0] === 'hierarki') {
    crumbs.push({ label: 'Hierarki', href: '/hierarki' });
    if (segments.length >= 2) {
      const mupelId = decodeURIComponent(segments[1]);
      crumbs.push({ label: mupelId, href: `/hierarki/${encodeURIComponent(mupelId)}` });
    }
    if (segments.length >= 3) {
      const jemaatId = decodeURIComponent(segments[2]);
      crumbs.push({ label: jemaatId, href: `/hierarki/${encodeURIComponent(segments[1])}/${encodeURIComponent(jemaatId)}` });
    }
    if (segments.length >= 4) {
      const posId = decodeURIComponent(segments[3]);
      crumbs.push({ label: posId, href: `/hierarki/${encodeURIComponent(segments[1])}/${encodeURIComponent(segments[2])}/${encodeURIComponent(posId)}` });
    }
  } else if (segments[0] === 'dashboard' && segments[1] === 'pos-pelkes') {
    crumbs.push({ label: 'Pos Pelkes', href: '/dashboard/pos-pelkes' });
    if (segments.length >= 3) {
      const posId = decodeURIComponent(segments[2]);
      crumbs.push({ label: posId, href: `/dashboard/pos-pelkes/${encodeURIComponent(posId)}` });
    }
  } else if (segments[0] === 'pendeta') {
    crumbs.push({ label: 'Pendeta', href: '/pendeta' });
    if (segments.length >= 2) {
      const pendetaId = decodeURIComponent(segments[1]);
      crumbs.push({ label: pendetaId, href: `/pendeta/${encodeURIComponent(pendetaId)}` });
    }
  } else {
    // Generic mapper
    let currentPath = '';
    segments.forEach((segment) => {
      if (segment === 'dashboard') return;
      currentPath += `/${segment}`;

      let formattedLabel = segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      if (segment === 'analitik') formattedLabel = 'Analitik & KPI';
      if (segment === 'pastoral') formattedLabel = 'Log Pastoral';
      if (segment === 'wilayah') formattedLabel = 'Kerawanan & Potensi';
      if (segment === 'demografi') formattedLabel = 'Demografi Pelkat';
      if (segment === 'jadwal') formattedLabel = 'Jadwal Ibadah';
      if (segment === 'bantuan') formattedLabel = 'Pengajuan Bantuan';
      if (segment === 'aset') formattedLabel = 'Inventaris Aset';
      if (segment === 'pelayan') formattedLabel = 'Pelayan Pos';
      if (segment === 'relawan') formattedLabel = 'Relawan';

      crumbs.push({
        label: formattedLabel,
        href: currentPath,
      });
    });
  }

  // Mark last crumb as current
  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1].isCurrent = true;
  }

  return crumbs;
}

export function MobileHeaderBreadcrumb({ onOpenDrawer }: MobileHeaderBreadcrumbProps) {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = getBreadcrumbCrumbs(pathname);
  const isRoot = pathname === '/dashboard' || pathname === '/';

  return (
    <header className="md:hidden sticky top-0 z-40 w-full backdrop-blur-md bg-surface-elevated/95 border-b border-border-subtle shadow-soft select-none shrink-0">
      <div className="flex items-center justify-between h-14 px-3 gap-2">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          {/* Back Button for non-root pages */}
          {!isRoot && (
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 -ml-1 rounded-xl text-text-high hover:bg-surface-sunken active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0 border border-border-subtle/50"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5px] text-brand-primary" />
            </button>
          )}

          {/* SI GPIB Mobile Brand Tag if on Root */}
          {isRoot && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-brand-primary/10 text-brand-primary shrink-0">
              <Layers size={14} className="stroke-[2.5px]" />
              <span className="text-xs font-black tracking-tight uppercase">SI GPIB</span>
            </div>
          )}

          {/* Scrollable Breadcrumb Trail */}
          <nav
            aria-label="Breadcrumb Mobile"
            className="flex items-center gap-1 text-xs text-text-muted overflow-x-auto scrollbar-none py-1 min-w-0"
          >
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;

              return (
                <div key={`${crumb.href}-${index}`} className="flex items-center gap-1 shrink-0">
                  {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-border-subtle shrink-0" />}

                  {isLast ? (
                    <span className="font-extrabold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-lg text-xs tracking-tight truncate max-w-[140px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="flex items-center gap-1 font-semibold text-text-muted hover:text-brand-primary px-1.5 py-1 rounded-md transition-colors text-xs shrink-0"
                    >
                      {index === 0 && <Home className="w-3.5 h-3.5 text-text-muted shrink-0" />}
                      <span className="truncate max-w-[100px]">{crumb.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Hamburger Drawer Menu Button */}
        {onOpenDrawer && (
          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-2 rounded-xl text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0 border border-brand-primary/20"
            aria-label="Buka Menu Utama"
            title="Menu Navigasi Mobile"
          >
            <Menu className="w-5 h-5 stroke-[2.5px]" />
          </button>
        )}
      </div>
    </header>
  );
}

export default MobileHeaderBreadcrumb;
