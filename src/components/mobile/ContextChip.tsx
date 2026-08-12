'use client';
import { useState } from 'react';
import { useActiveContext } from '@/stores/active-context';
import { Church, ChevronDown } from 'lucide-react';
import { ContextSwitcherSheet } from './ContextSwitcherSheet';
import { haptic } from '@/lib/haptic/vibrate';

export function ContextChip() {
  const { activeContextId } = useActiveContext();
  const [isOpen, setIsOpen] = useState(false);

  const displayLabel = activeContextId || 'Pilih Konteks';

  return (
    <>
      <button 
        type="button"
        onClick={() => {
          haptic.selection();
          setIsOpen(true);
        }}
        className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-slate-100 text-xs font-semibold border border-slate-700/60 transition-all cursor-pointer shadow-xs max-w-[200px]"
        aria-label="Pilih Konteks Pelayanan"
        title="Ubah Konteks Pelayanan Aktif"
      >
        <Church className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="truncate max-w-[130px] font-bold tracking-tight">{displayLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      <ContextSwitcherSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
