'use client';

import { Badge } from '@/components/ui/badge';
import type { KompetensiPendeta } from '@/lib/domains/pendeta/pendeta.types';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface KompetensiSectionProps {
  data: KompetensiPendeta[];
}

export function KompetensiSection({ data }: KompetensiSectionProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Belum ada kompetensi tercatat.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.id_kompetensi} className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{item.nama}</p>
              <p className="text-xs text-gray-600">{item.kategori}</p>
            </div>
            <Badge variant="outline" className="text-xs whitespace-nowrap bg-white">
              {item.tingkat}
            </Badge>
          </div>
          {item.dokumen_url && (
            <Link 
              href={item.dokumen_url} 
              target="_blank"
              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Lihat Sertifikat
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
