'use client';

import { usePosContext } from '@/stores/pos-context';
import { useAssignedPosList } from '@/lib/domains/pos-pelkes/pos-pelkes.queries';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Check, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';

interface QuickPosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickPosSheet({ open, onOpenChange }: QuickPosSheetProps) {
  const { activePosId, setActivePosId } = usePosContext();
  const { data: posList, isLoading, error, refetch } = useAssignedPosList();

  const handleSelect = (id_pos: string) => {
    setActivePosId(id_pos);
    haptic('selection');
    onOpenChange(false);
  };

  return (
    <Modal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      title="Pilih Pos Pelkes"
      maxWidth="sm"
    >
      <div className="relative min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Memuat daftar Pos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center px-4">
            <p className="mb-4 text-destructive">Gagal memuat Pos Pelkes</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        ) : !posList || posList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center px-4">
            <MapPin className="w-12 h-12 mb-4 opacity-20" />
            <p>Tidak ada Pos Pelkes aktif yang ditugaskan kepada Anda.</p>
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {posList.map((pos) => (
              <Button
                key={pos.id_pos}
                variant={activePosId === pos.id_pos ? 'default' : 'outline'}
                className="w-full justify-between h-14"
                onClick={() => handleSelect(pos.id_pos)}
              >
                <div className="flex items-center text-left truncate">
                  <MapPin className={`w-5 h-5 mr-3 shrink-0 ${activePosId === pos.id_pos ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span className="truncate">{pos.nama_pos}</span>
                </div>
                {activePosId === pos.id_pos && <Check className="w-5 h-5 ml-2 shrink-0" />}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
