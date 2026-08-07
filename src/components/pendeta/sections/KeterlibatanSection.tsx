'use client';

import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { KeterlibatanPendeta } from '@/lib/domains/pendeta/pendeta.types';

interface KeterlibatanSectionProps {
  data: KeterlibatanPendeta[];
}

export function KeterlibatanSection({ data }: KeterlibatanSectionProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Belum ada rekam jejak keterlibatan.
      </p>
    );
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
      {data.map((item) => (
        <div key={item.id_keterlibatan} className="relative pl-4">
          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white" />
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-sm leading-tight">{item.nama}</h4>
            <p className="text-xs text-gray-600">{item.jenis} • {item.tingkat}</p>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
              <span>{format(new Date(item.tgl_mulai), 'MMM yyyy', { locale: id })}</span>
              <span>-</span>
              <span>
                {item.tgl_selesai 
                  ? format(new Date(item.tgl_selesai), 'MMM yyyy', { locale: id }) 
                  : 'Sekarang'}
              </span>
            </div>
            <div className="mt-1">
              <Badge variant={item.status.toLowerCase() === 'aktif' ? 'default' : 'secondary'} className="text-[10px]">
                {item.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
