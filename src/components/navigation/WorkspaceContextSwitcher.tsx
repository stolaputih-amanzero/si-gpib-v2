'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Church, ChevronDown, Check, Building2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';
import { useUserMupelAuth } from '@/hooks/use-hierarki-selector';
import { useCurrentUser } from '@/hooks/use-current-user';

export const WorkspaceContextSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: authData } = useUserMupelAuth();
  const { data: currentUser } = useCurrentUser();

  // Active label derived from current route or resolved auth assignment
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentOrgId = pathSegments[0] === 'org' && pathSegments[1] && pathSegments[1] !== 'me'
    ? decodeURIComponent(pathSegments[1])
    : null;

  let activeLabel = 'Direktori Organisasi';
  if (currentOrgId) {
    activeLabel = currentOrgId;
  } else if (authData?.id_pos) {
    activeLabel = authData.id_pos;
  } else if (authData?.id_induk) {
    activeLabel = authData.id_induk;
  } else if (authData?.id_mupel) {
    activeLabel = `Mupel ${authData.id_mupel}`;
  } else if (currentUser?.isSuperUser) {
    activeLabel = 'Sinode GPIB';
  }

  const handleSelectWorkspace = (url: string) => {
    haptic('light');
    setIsOpen(false);
    router.push(url);
  };

  return (
    <div className="relative select-none">
      <button
        type="button"
        onClick={() => {
          haptic('selection');
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border text-xs font-bold shrink-0 min-h-[40px]',
          'bg-surface-elevated hover:bg-surface-sunken border-border-subtle text-text-high',
          'active:scale-95 shadow-xs'
        )}
        aria-label="Tukar Konteks Workspace"
        aria-expanded={isOpen}
      >
        <div className="w-5 h-5 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
          <Church size={13} />
        </div>
        <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeLabel}</span>
        <ChevronDown size={14} className={cn('text-text-muted transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay for closing dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-24px)] bg-surface-elevated border border-border-subtle rounded-2xl shadow-heavy p-2 z-50 space-y-1 text-xs origin-top-left">
            <div className="px-3 py-2 border-b border-border-subtle mb-1">
              <p className="font-bold text-text-high text-xs">Konteks Workspace Aktif</p>
              <p className="text-[10px] text-text-muted">UI Context Switching (Otorisasi oleh F12 RLS)</p>
            </div>

            {/* Smart Entry Option: Workspace Saya */}
            <button
              type="button"
              onClick={() => handleSelectWorkspace('/org/me')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-sunken text-left transition-colors font-medium min-h-[44px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Building2 size={16} className="text-brand-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-text-high truncate">Workspace Saya</p>
                  <p className="text-[10px] text-text-muted truncate">Ke Unit Penugasan Utama</p>
                </div>
              </div>
              {pathname === '/org/me' && <Check size={14} className="text-brand-primary shrink-0" />}
            </button>

            {/* Option: Direktori Utama */}
            <button
              type="button"
              onClick={() => handleSelectWorkspace('/org')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-sunken text-left transition-colors font-medium min-h-[44px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin size={16} className="text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-text-high truncate">Direktori Hierarki</p>
                  <p className="text-[10px] text-text-muted truncate">Semua Mupel & Jemaat</p>
                </div>
              </div>
              {pathname === '/org' && <Check size={14} className="text-indigo-500 shrink-0" />}
            </button>

            {/* Optional Assigned Pos / Jemaat Shortcuts */}
            {authData?.id_pos && (
              <button
                type="button"
                onClick={() => handleSelectWorkspace(`/org/${encodeURIComponent(authData.id_pos!)}`)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-sunken text-left transition-colors font-medium min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Church size={16} className="text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-text-high truncate">{authData.id_pos}</p>
                    <p className="text-[10px] text-text-muted truncate">Pos Pelkes Penugasan</p>
                  </div>
                </div>
                {currentOrgId === authData.id_pos && <Check size={14} className="text-emerald-500 shrink-0" />}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceContextSwitcher;
