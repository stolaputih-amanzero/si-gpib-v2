'use client';

import { Camera, MapPin, FileText, Users, HandHeart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

import { PastoralActionSheet } from '@/components/pastoral/PastoralActionSheet';
import { BantuanActionSheet } from '@/components/bantuan/BantuanActionSheet';
import { AsetActionSheet } from '@/components/asset/AsetActionSheet';
import { useState } from 'react';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  color: string;
  description?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'aset',
    label: 'Foto Aset',
    icon: Camera,
    color: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400',
    description: 'Upload & lokasi aset pos',
  },
  {
    id: 'pastoral',
    label: 'Log Pastoral',
    icon: FileText,
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    description: 'Catat kunjungan pelayanan',
  },
  {
    id: 'pos_baru',
    label: 'Direktori Pos Pelkes',
    icon: MapPin,
    href: '/org',
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    description: 'Daftar & titik pos pelkes',
  },
  {
    id: 'pelayan_baru',
    label: 'Direktori Personil',
    icon: Users,
    href: '/people',
    color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
    description: 'Daftar pelayan & pengurus',
  },
  {
    id: 'bantuan',
    label: 'Ajukan Bantuan',
    icon: HandHeart,
    color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
    description: 'Permohonan bantuan pos',
  },
];

export interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionSheet({ isOpen, onClose }: QuickActionSheetProps) {
  const router = useRouter();
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  return (
    <>
      {/* 
        We only render the QuickActionSheet if there's no active child sheet,
        or we can render it underneath. We'll hide it when a child opens for cleaner UI. 
      */}
      {isOpen && !activeSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Dark Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container with Solid Theme Surface */}
      <div 
        className="relative w-full max-w-2xl bg-surface-1 text-ink-primary rounded-t-3xl shadow-2xl border-t border-line-subtle animate-slide-up overflow-hidden select-none"
        style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-primary)' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-line-subtle opacity-70" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3.5 border-b border-line-subtle">
          <div>
            <h2 className="font-display font-bold text-lg text-ink-primary">
              Aksi Cepat Pelayanan
            </h2>
            <p className="text-xs text-ink-secondary">
              Pilih tindakan langsung untuk menginput data
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-surface-sunken active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center border border-line-subtle/50"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5 text-ink-primary" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 pb-safe max-h-[70vh] overflow-y-auto">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  haptic.light();
                  if (action.id === 'pastoral' || action.id === 'bantuan' || action.id === 'aset') {
                    setActiveSheet(action.id);
                  } else if (action.href) {
                    router.push(action.href);
                    onClose();
                  }
                }}
                className="tap flex flex-col items-center justify-center p-3.5 rounded-2xl bg-surface-sunken hover:bg-surface-sunken/80 active:scale-[0.97] transition-all min-h-[110px] text-center border border-line-subtle/50 group"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs mb-2 group-hover:scale-105 transition-transform border border-line-hairline',
                    action.color
                  )}
                >
                  <Icon className="w-6 h-6 stroke-[2.2px]" />
                </div>
                <span className="font-display text-xs font-bold text-ink-primary leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {action.label}
                </span>
                {action.description && (
                  <span className="text-[10px] text-ink-secondary mt-0.5 line-clamp-1 font-medium">
                    {action.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
        </div>
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

export default QuickActionSheet;
