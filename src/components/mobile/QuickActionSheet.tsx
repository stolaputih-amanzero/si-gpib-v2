'use client';

import { Camera, MapPin, FileText, Users, HandHeart, X, BarChart3, Map } from 'lucide-react';
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
    id: 'analitik',
    label: 'Analitik & KPI',
    icon: BarChart3,
    href: '/analytics',
    color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    description: 'Statistik & pertumbuhan',
  },
  {
    id: 'peta',
    label: 'Peta Sebaran',
    icon: Map,
    href: '/maps',
    color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
    description: 'Sebaran wilayah & teritori',
  },
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
        className="relative w-full max-w-2xl bg-surface-1 text-ink-primary rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-stone-200/80 dark:border-stone-800 animate-slide-up overflow-hidden select-none"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700 opacity-80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200/60 dark:border-stone-800/80">
          <div>
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-ink-primary">
              Aksi Cepat Pelayanan
            </h2>
            <p className="micro-label text-ink-tertiary">
              Pilih tindakan langsung untuk input data
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-ink-secondary hover:text-ink-primary hover:bg-surface-sunken active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center border border-stone-200/50 dark:border-stone-800"
            aria-label="Tutup Menu"
          >
            <X className="size-4.5 text-ink-primary" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 p-5 pb-safe max-h-[70vh] overflow-y-auto">
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
                className="tap flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/50 hover:bg-surface-1 hover:border-amber-500/35 hover:shadow-md active:scale-[0.97] transition-all min-h-[115px] text-center border border-stone-200/70 dark:border-stone-800 group"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs mb-2.5 group-hover:scale-105 transition-transform border border-line-hairline',
                    action.color
                  )}
                >
                  <Icon className="size-5 stroke-[2.2px]" />
                </div>
                <span className="font-editorial text-xs sm:text-sm font-bold text-ink-primary leading-tight line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {action.label}
                </span>
                {action.description && (
                  <span className="text-[10px] text-ink-secondary mt-0.5 line-clamp-1">
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
