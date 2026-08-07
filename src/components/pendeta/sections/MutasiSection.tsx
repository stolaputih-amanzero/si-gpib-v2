'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { RiwayatMutasi } from '@/lib/domains/pendeta/pendeta.types';
import { MapPin } from 'lucide-react';

interface MutasiSectionProps {
  data: RiwayatMutasi[];
}

export function MutasiSection({ data }: MutasiSectionProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Belum ada riwayat mutasi tercatat.
      </p>
    );
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
      {data.map((item) => (
        <div key={item.id_mutasi} className="relative pl-4">
          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-purple-500 border-4 border-white" />
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-sm leading-tight text-gray-900">
              Mutasi ke {item.id_induk_tujuan}
            </h4>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <span>{format(new Date(item.tanggal_mutasi), 'd MMMM yyyy', { locale: id })}</span>
            </div>
            
            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100 text-xs">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin className="w-3 h-3" />
                <span>Dari: {item.id_induk_asal}</span>
              </div>
              <p className="text-gray-700 italic mt-1">"{item.alasan}"</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
