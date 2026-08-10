'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SUPER_MENU_GROUPS } from '@/lib/constants/navigation';
import { MenuGroup } from './MenuGroup';
import { useState } from 'react';
import { PastoralActionSheet } from '@/components/pastoral/PastoralActionSheet';
import { BantuanActionSheet } from '@/components/bantuan/BantuanActionSheet';
import { AsetActionSheet } from '@/components/asset/AsetActionSheet';

interface MasterMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MasterMenuSheet({ isOpen, onClose }: MasterMenuSheetProps) {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* 
        We only render the MasterMenuSheet if there's no active child sheet,
        so the active child sheet can take focus completely.
      */}
      {isOpen && !activeSheet && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              'fixed inset-0 z-40 transition-opacity duration-300',
              'bg-black/40 backdrop-blur-sm',
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={onClose}
            aria-hidden="true"
          />

      {/* Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
          'rounded-t-3xl shadow-2xl',
          'border-t border-gray-200/50 dark:border-gray-700/50',
          'pb-[env(safe-area-inset-bottom)]',
          'transition-transform duration-300 ease-out',
          'max-h-[85vh] overflow-y-auto',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu utama"
      >
        {/* Handle bar */}
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-center pt-3 pb-2 z-10">
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="px-6 pt-2 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu Utama</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Akses cepat ke semua fitur pelayanan</p>
        </div>

        {/* Menu Groups */}
        <div className="px-4 pb-8 space-y-6">
          {SUPER_MENU_GROUPS.map((group) => (
            <MenuGroup
              key={group.title}
              group={group}
              onClose={onClose}
              onOpenSheet={setActiveSheet}
            />
          ))}
        </div>
      </div>
        </>
      )}

      {/* Embedded Action Sheets */}
      <PastoralActionSheet 
        isOpen={activeSheet === 'pastoral'} 
        onClose={() => { setActiveSheet(null); onClose(); }} 
      />
      <BantuanActionSheet 
        isOpen={activeSheet === 'bantuan'} 
        onClose={() => { setActiveSheet(null); onClose(); }} 
      />
      <AsetActionSheet 
        isOpen={activeSheet === 'aset'} 
        onClose={() => { setActiveSheet(null); onClose(); }} 
      />
    </>
  );
}
