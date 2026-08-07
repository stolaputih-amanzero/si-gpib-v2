'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { KeluargaPendeta } from '@/lib/domains/pendeta/pendeta.types';

interface KeluargaSectionProps {
  data: KeluargaPendeta[];
}

export function KeluargaSection({ data }: KeluargaSectionProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Belum ada data keluarga tercatat.
      </p>
    );
  }

  const calculateAge = (tglLahir: string) => {
    const birth = new Date(tglLahir);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-3">
      {data.map((keluarga) => (
        <div key={keluarga.id_keluarga} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <Avatar className="w-12 h-12">
            <AvatarImage src={keluarga.foto_url || undefined} />
            <AvatarFallback>{keluarga.nama.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{keluarga.nama}</p>
            <p className="text-sm text-gray-600">
              {keluarga.hubungan} • {calculateAge(keluarga.tgl_lahir)} tahun
            </p>
            <p className="text-xs text-gray-500">
              Lahir: {format(new Date(keluarga.tgl_lahir), 'd MMM yyyy', { locale: id })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
