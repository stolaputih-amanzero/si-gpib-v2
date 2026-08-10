'use client';

import { X, Building, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import Link from 'next/link';
import { TerritoryPoint } from '@/lib/services/territory';

interface MarkerBottomSheetProps {
  point: TerritoryPoint | null;
  onClose: () => void;
}

export function MarkerBottomSheet({ point, onClose }: MarkerBottomSheetProps) {
  if (!point) return null;

  const isPos = point.type === 'POS';
  const isRisk = point.type === 'RISK';
  const isPotential = point.type === 'POTENTIAL';

  return (
    <>
      <div 
        className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[1001] bg-bg-surface rounded-t-3xl shadow-xl border-t border-border-subtle animate-in slide-in-from-bottom-full pb-safe max-h-[85vh] overflow-y-auto">
        <div className="p-4">
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-border-strong rounded-full mx-auto mb-4" />
          
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPos ? 'bg-brand-primary/10 text-brand-primary' :
                isRisk ? 'bg-state-error/10 text-state-error' :
                'bg-state-success/10 text-state-success'
              }`}>
                {isPos && <Building size={24} />}
                {isRisk && <ShieldAlert size={24} />}
                {isPotential && <Sparkles size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-text-strong text-lg leading-tight line-clamp-2">
                  {point.title}
                </h3>
                <p className="text-sm font-semibold text-text-subtle mt-0.5">
                  {point.category}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-bg-base hover:bg-bg-subtle text-text-muted transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-bg-base rounded-xl border border-border-subtle flex items-center justify-between">
              <span className="text-sm font-medium text-text-subtle">Kategori Titik</span>
              <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                isPos ? 'bg-brand-primary/10 text-brand-primary' :
                isRisk ? 'bg-state-error/10 text-state-error' :
                'bg-state-success/10 text-state-success'
              }`}>
                {isPos ? 'Organisasi' : isRisk ? 'Kerawanan' : 'Potensi'}
              </span>
            </div>

            {/* View Workspace Action */}
            <Link
              href={`/org/${point.id_pos}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 mt-4"
            >
              <Navigation size={18} />
              View Organization Workspace
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
