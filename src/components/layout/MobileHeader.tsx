'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';
import { NetworkStatusBadge } from '@/components/ui/NetworkStatusBadge';
import { ContextChip } from '@/components/mobile/ContextChip';
import { SyncManagerSheet } from '@/components/offline/SyncManagerSheet';
import { GlobalSearchSheet } from '@/components/search/GlobalSearchSheet';

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const isRootTabDestination = 
    pathname === '/' || 
    pathname === '/dashboard' || 
    pathname === '/org' || 
    pathname === '/people' || 
    pathname === '/settings';

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-elevated/95 backdrop-blur-md border-b border-border-subtle md:hidden shadow-xs select-none pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between min-h-[56px] px-4 py-1.5">
        {/* Left Side: ContextChip on Root Tab, [←] History Back + ContextChip on Pushed Views */}
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          {!isRootTabDestination ? (
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                // ROUTING (PR-06): Pushed views back button MUST use history-based navigation
                router.back();
              }}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-text-high hover:bg-surface-sunken active:scale-95 transition-all shrink-0 border border-border-subtle"
              aria-label="Kembali ke halaman sebelumnya"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5 text-blue-400" />
            </button>
          ) : null}

          {/* Context Chip (Active unit context indicator) */}
          <ContextChip />
        </div>

        {/* Right Side: Global Search + SyncManager + NetworkStatus */}
        <div className="flex items-center shrink-0 gap-2">
          <GlobalSearchSheet />
          <SyncManagerSheet />
          <NetworkStatusBadge showText={false} />
        </div>
      </div>
    </header>
  );
}

export default MobileHeader;
