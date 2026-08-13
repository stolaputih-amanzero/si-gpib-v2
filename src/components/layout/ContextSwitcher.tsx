'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronDown, Check, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useContextUIStore } from '@/stores/useContextUIStore';
import { switchActiveContextAction } from '@/app/actions/context';

interface ContextOption {
  id_pos: string;
  nama_pos: string;
}

interface ContextSwitcherProps {
  activeContextId: string | null;
  validContexts: ContextOption[];
}

export function ContextChip({ activeContextId, validContexts }: ContextSwitcherProps) {
  const { setSwitcherOpen, optimisticContextId } = useContextUIStore();
  
  const displayId = optimisticContextId || activeContextId;
  const activeContext = validContexts.find(c => c.id_pos === displayId);
  const displayName = activeContext ? activeContext.nama_pos : 'Pilih Konteks Kerja';

  return (
    <Button
      variant={activeContext ? 'outline' : 'default'}
      className="flex items-center gap-2 h-9 px-3 rounded-full shadow-sm max-w-[200px]"
      onClick={() => setSwitcherOpen(true)}
    >
      <MapPin className="w-4 h-4 shrink-0" />
      <span className="truncate font-medium text-sm">{displayName}</span>
      <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
    </Button>
  );
}

export function ContextSwitcherSheet({ activeContextId, validContexts }: ContextSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isSwitcherOpen, setSwitcherOpen, optimisticContextId, setOptimisticContextId, isSwitching, setSwitching } = useContextUIStore();

  const currentId = activeContextId;

  const handleSelect = async (id: string) => {
    if (id === currentId) {
      setSwitcherOpen(false);
      return;
    }
    
    setOptimisticContextId(id);
    setSwitching(true);
    setSwitcherOpen(false);

    try {
      const formData = new FormData();
      formData.append('contextId', id);
      await switchActiveContextAction(formData);
      
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Failed to switch context', error);
      // Revert optimistic update
      setOptimisticContextId(null);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Sheet open={isSwitcherOpen} onOpenChange={setSwitcherOpen}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
        <SheetHeader className="text-left pb-4 border-b">
          <SheetTitle>Pilih Konteks Kerja</SheetTitle>
          <SheetDescription>
            Pilih lokasi tugas untuk menyesuaikan akses dan data.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          {validContexts.map((ctx) => {
            const isActive = (optimisticContextId || currentId) === ctx.id_pos;
            return (
              <Button
                key={ctx.id_pos}
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => handleSelect(ctx.id_pos)}
                disabled={isPending || isSwitching}
              >
                <Building2 className="w-5 h-5 mr-3 text-muted-foreground shrink-0" />
                <div className="flex flex-col items-start overflow-hidden w-full text-left">
                  <span className="truncate font-medium text-sm">{ctx.nama_pos}</span>
                  <span className="text-xs text-muted-foreground">{ctx.id_pos}</span>
                </div>
                {isActive && (
                  <Check className="w-5 h-5 ml-auto text-primary shrink-0" />
                )}
              </Button>
            );
          })}
          
          {validContexts.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Tidak ada lokasi tugas yang tersedia.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
