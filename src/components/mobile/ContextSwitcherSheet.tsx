'use client';

import { useState } from 'react';
import { useActiveContext } from '@/stores/active-context';
import { useAssignedPosList } from '@/lib/domains/pos-pelkes/pos-pelkes.queries';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Check, Church, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';
import { setWorkingContext } from '@/app/actions/context';

interface ContextSwitcherSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContextSwitcherSheet({ open, onOpenChange }: ContextSwitcherSheetProps) {
  const { activeContextId, setActiveContextId } = useActiveContext();
  const { data: posList, isLoading, error, refetch } = useAssignedPosList();
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const handleSelect = async (id: string) => {
    setIsSwitching(true);
    setSwitchError(null);
    try {
      // SECURITY (VC-03): Server Action validation of Assignment before client session update
      const res = await setWorkingContext(id);
      if (res?.success) {
        setActiveContextId(id);
        haptic.selection();
        onOpenChange(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memverifikasi penugasan konteks di server.';
      setSwitchError(errorMessage);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Modal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      title="Pilih Konteks Pelayanan"
      maxWidth="sm"
    >
      <div className="relative min-h-[200px] space-y-4">
        {switchError && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{switchError}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p className="text-xs font-medium">Memuat daftar penugasan konteks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-center px-4">
            <p className="mb-4 text-xs text-red-400">Gagal memuat daftar konteks pelayanan</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} aria-label="Coba lagi memuat konteks">
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        ) : !posList || posList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-center px-4">
            <Church className="w-12 h-12 mb-3 text-slate-600" />
            <p className="text-xs">Tidak ada penugasan unit organisasi aktif.</p>
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {posList.map((pos) => (
              <button
                key={pos.id_pos}
                type="button"
                disabled={isSwitching}
                onClick={() => handleSelect(pos.id_pos)}
                className={`w-full flex items-center justify-between min-h-[48px] p-3 rounded-xl border text-xs font-semibold transition-all ${
                  activeContextId === pos.id_pos
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                } disabled:opacity-50`}
                aria-label={`Pilih konteks ${pos.nama_pos}`}
              >
                <div className="flex items-center text-left truncate gap-3">
                  <Church className={`w-4 h-4 shrink-0 ${activeContextId === pos.id_pos ? 'text-white' : 'text-blue-400'}`} />
                  <span className="truncate">{pos.nama_pos}</span>
                </div>
                {activeContextId === pos.id_pos && <Check className="w-4 h-4 ml-2 shrink-0 text-white" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
