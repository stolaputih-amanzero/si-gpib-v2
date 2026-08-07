'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Building2, FileCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PelayananSectionProps {
  pendeta: {
    id_induk: string;
    tgl_tugas: string;
    is_kmj: boolean;
    is_pj: boolean;
  };
  jabatan: any[];
}

export function PelayananSection({ pendeta }: PelayananSectionProps) {
  // Ambil jabatan yang relevan dengan gereja (contoh: KMJ, PJ)
  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
        <Building2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Jemaat Induk Saat Ini</p>
          <Link href={`/jemaat/${pendeta.id_induk}`} className="text-blue-700 font-medium hover:underline inline-block mt-0.5">
            {pendeta.id_induk}
          </Link>
          <p className="text-xs text-blue-600 mt-1">
            Sejak: {format(new Date(pendeta.tgl_tugas), 'MMMM yyyy', { locale: id })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pendeta.is_kmj && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border rounded-full text-xs font-medium text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Ketua Majelis Jemaat
          </div>
        )}
        {pendeta.is_pj && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border rounded-full text-xs font-medium text-gray-700">
            <FileCheck className="w-4 h-4 text-blue-500" />
            Penanggung Jawab Pos
          </div>
        )}
      </div>
    </div>
  );
}
