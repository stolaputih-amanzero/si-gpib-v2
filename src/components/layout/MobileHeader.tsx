'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sun, Moon, Home } from 'lucide-react';
import { useSmoothTheme } from '@/hooks/useSmoothTheme';
import { haptic } from '@/lib/haptic/vibrate';
import { NetworkStatusBadge } from '@/components/ui/NetworkStatusBadge';
import { NAV_GROUPS, NavGroup, NavItem } from '@/components/layout/Sidebar';

// Helper function to resolve breadcrumb crumbs from Desktop Sidebar NAV_GROUPS
function getSidebarCrumbs(pathname: string) {
  const crumbs: Array<{
    label: string;
    href: string;
    icon?: React.ElementType;
    isGroup?: boolean;
    isCurrent?: boolean;
  }> = [
    { label: 'Beranda', href: '/dashboard', icon: Home },
  ];

  if (pathname === '/' || pathname === '/dashboard') {
    crumbs[0].isCurrent = true;
    return crumbs;
  }

  // Find matching group & item from NAV_GROUPS
  let foundGroup: NavGroup | null = null;
  let foundItem: NavItem | null = null;

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (
        item.href === pathname ||
        (item.href !== '/dashboard' &&
          item.href !== '/hierarki' &&
          item.href !== '/bantuan' &&
          item.href !== '/settings' &&
          item.href !== '/laporan' &&
          pathname.startsWith(item.href + '/'))
      ) {
        foundGroup = group;
        foundItem = item;
        break;
      }
    }
    if (foundItem) break;
  }

  if (!foundItem && pathname.startsWith('/hierarki')) {
    foundGroup = NAV_GROUPS.find((g) => g.label === 'Hierarki') || null;
    foundItem = { label: 'Struktur Hierarki', href: '/hierarki', icon: Home };
  }

  if (foundGroup) {
    crumbs.push({
      label: foundGroup.label,
      href: foundGroup.items[0]?.href || '/dashboard',
      icon: foundGroup.icon,
      isGroup: true,
    });
  }

  if (foundItem) {
    crumbs.push({
      label: foundItem.label,
      href: foundItem.href,
      icon: foundItem.icon,
      isCurrent: pathname === foundItem.href,
    });
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'hierarki' && segments.length >= 2) {
    const mupelId = decodeURIComponent(segments[1]);
    crumbs.push({
      label: mupelId,
      href: `/hierarki/${encodeURIComponent(mupelId)}`,
      isCurrent: segments.length === 2,
    });
    if (segments.length >= 3) {
      const jemaatId = decodeURIComponent(segments[2]);
      crumbs.push({
        label: jemaatId,
        href: `/hierarki/${encodeURIComponent(segments[1])}/${encodeURIComponent(jemaatId)}`,
        isCurrent: segments.length === 3,
      });
    }
  } else if (segments[0] === 'dashboard' && segments[1] === 'pos-pelkes' && segments.length >= 3) {
    const posId = decodeURIComponent(segments[2]);
    crumbs.push({
      label: posId,
      href: `/dashboard/pos-pelkes/${encodeURIComponent(posId)}`,
      isCurrent: true,
    });
  } else if (segments[0] === 'sdm' && segments[1] === 'pendeta' && segments.length >= 3) {
    const pendetaId = decodeURIComponent(segments[2]);
    crumbs.push({
      label: pendetaId,
      href: `/sdm/pendeta/${encodeURIComponent(pendetaId)}`,
      isCurrent: true,
    });
  }

  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1].isCurrent = true;
  }

  return crumbs;
}

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useSmoothTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const crumbs = getSidebarCrumbs(pathname);
  const isRoot = pathname === '/dashboard' || pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-1/95 backdrop-blur-md hairline-b md:hidden shadow-xs select-none pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between min-h-[56px] px-3 py-1">
        {/* Kiri Atas: Back button + Breadcrumbs */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
          {!isRoot && (
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                router.back();
              }}
              className="flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-ink-primary hover:bg-surface-sunken active:scale-95 transition-all shrink-0 border border-line-subtle/40"
              aria-label="Kembali"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5 text-brand-600" />
            </button>
          )}

          {/* Breadcrumb Trail */}
          <nav
            aria-label="Breadcrumb Navigasi"
            className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-none py-1 min-w-0"
          >
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              const IconComponent = crumb.icon;

              return (
                <div key={`${crumb.href}-${index}`} className="flex items-center gap-1 shrink-0">
                  {index > 0 && (
                    <ChevronRight size={12} className="text-text-tertiary shrink-0" />
                  )}

                  {isLast ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs tracking-tight truncate max-w-[160px]">
                      {IconComponent && <IconComponent size={13} className="shrink-0" />}
                      <span className="truncate">{crumb.label}</span>
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      onClick={() => haptic.selection()}
                      className="inline-flex items-center gap-1 px-1 py-0.5 rounded-md text-text-muted hover:text-brand-primary font-medium text-xs transition-colors shrink-0"
                    >
                      {IconComponent && <IconComponent size={13} className="shrink-0 text-text-tertiary" />}
                      <span className="truncate max-w-[100px]">{crumb.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Kanan Atas: NetworkStatus + Theme Toggle */}
        <div className="flex items-center shrink-0 gap-1.5">
          <NetworkStatusBadge />

          <button
            type="button"
            onClick={() => {
              haptic.selection();
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
            }}
            className="flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-ink-secondary hover:bg-surface-sunken active:scale-95 transition-all border border-line-subtle/40"
            aria-label="Ganti tema tampilan"
            title="Ganti Tema (Terang / Gelap)"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun size={17} className="text-accent-600" />
            ) : (
              <Moon size={17} className="text-brand-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default MobileHeader;
