'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BantuanForm } from '@/components/bantuan/BantuanForm';

interface AidRequestFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'ajukan-ulang';
  initialIdPos?: string;
  initialData?: any;
}

export function AidRequestFormSheet({ isOpen, onClose, mode, initialIdPos, initialData }: AidRequestFormSheetProps) {
  const titles = {
    create: 'Pengajuan Bantuan Baru',
    edit: 'Edit Draft Pengajuan',
    'ajukan-ulang': 'Ajukan Ulang Bantuan',
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] p-0 flex flex-col rounded-t-2xl overflow-hidden bg-surface-base">
        <SheetHeader className="p-4 border-b border-border-subtle bg-surface-elevated shrink-0">
          <SheetTitle className="text-lg font-bold text-brand-primary">{titles[mode]}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 bg-surface-base">
          <BantuanForm 
            mode={mode} 
            initialIdPos={initialIdPos} 
            initialData={initialData}
            successRedirect="/aid-requests" 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
