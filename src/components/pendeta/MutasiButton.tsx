'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { MutasiPendetaForm } from './MutasiPendetaForm';
import { ArrowRightLeft } from 'lucide-react';

interface MutasiButtonProps {
  idPendeta: string;
  namaPendeta: string;
}

export function MutasiButton({ idPendeta, namaPendeta }: MutasiButtonProps) {
  const { data: user, isLoading } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return null;
  if (!user?.isSuperUser) return null; // Hanya super_user yang dapat mutasi

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild={true as any}>
        <Button variant="outline" size="sm" className="ml-auto w-full md:w-auto flex items-center justify-center border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800">
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Mutasi Pendeta
        </Button>
      </SheetTrigger>
      
      {/* Gunakan side="bottom" untuk mobile, tapi right untuk desktop jika perlu, default bottom untuk PWA */}
      <SheetContent side="bottom" className="h-[90vh] md:h-full md:w-[500px] md:max-w-[500px] md:side-right overflow-y-auto sm:max-w-none rounded-t-2xl md:rounded-none">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle>Form Mutasi Pendeta</SheetTitle>
          <SheetDescription>
            Pindahkan pendeta ke jemaat induk lain. Tindakan ini akan secara otomatis memperbarui struktur hierarki, akses data, dan mencatat riwayat mutasi.
          </SheetDescription>
        </SheetHeader>
        
        <MutasiPendetaForm 
          idPendeta={idPendeta} 
          namaPendeta={namaPendeta} 
          onSuccess={() => setIsOpen(false)} 
        />
      </SheetContent>
    </Sheet>
  );
}
