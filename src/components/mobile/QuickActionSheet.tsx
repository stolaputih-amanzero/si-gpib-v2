'use client';

import { Camera, MapPin, FileText, Users, HandHeart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
  description?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Foto Aset',
    icon: Camera,
    href: '/laporan/aset/baru',
    color: 'bg-blue-600 text-white',
    description: 'Upload & lokasi aset pos',
  },
  {
    label: 'Log Pastoral',
    icon: FileText,
    href: '/laporan/pastoral/baru',
    color: 'bg-emerald-600 text-white',
    description: 'Catat kunjungan pelayanan',
  },
  {
    label: 'Input Pos Pelkes',
    icon: MapPin,
    href: '/hierarki/pos/baru',
    color: 'bg-amber-500 text-white',
    description: 'Daftarkan titik pos baru',
  },
  {
    label: 'Tambah Pelayan',
    icon: Users,
    href: '/sdm/pelayan/baru',
    color: 'bg-purple-600 text-white',
    description: 'Registrasi pelayan/pengurus',
  },
  {
    label: 'Ajukan Bantuan',
    icon: HandHeart,
    href: '/bantuan/ajukan',
    color: 'bg-rose-600 text-white',
    description: 'Permohonan bantuan pos',
  },
];

export interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionSheet({ isOpen, onClose }: QuickActionSheetProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-surface-elevated rounded-t-3xl shadow-heavy border-t border-border-subtle animate-slide-up overflow-hidden">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-border-strong/40 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-border-subtle">
          <div>
            <h2 className="font-serif font-bold text-lg text-text-high">
              Aksi Cepat Pelayanan
            </h2>
            <p className="text-xs text-text-muted">
              Pilih tindakan langsung untuk menginput data
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-text-muted hover:text-text-high hover:bg-surface-sunken active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 pb-safe max-h-[70vh] overflow-y-auto">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.href}
                type="button"
                onClick={() => {
                  router.push(action.href);
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-surface-sunken hover:bg-border-subtle/40 active:scale-95 transition-all min-h-[110px] text-center border border-border-subtle/50 group"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft mb-2 group-hover:scale-105 transition-transform',
                    action.color
                  )}
                >
                  <Icon className="w-6 h-6 stroke-[2.2px]" />
                </div>
                <span className="text-xs font-bold text-text-high leading-tight line-clamp-1">
                  {action.label}
                </span>
                {action.description && (
                  <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                    {action.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default QuickActionSheet;
