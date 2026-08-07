'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';

interface PastoralCardProps {
  log: {
    kegiatan: string;
    jml_jiwa: number | null;
    tgl: string;
    catatan: string | null;
    foto_url: string | null;
    m_pos_pelkes: { nama_pos: string };
    m_pendeta: { nama_lengkap: string };
  };
  onClick?: () => void;
}

export function PastoralCard({ log, onClick }: PastoralCardProps) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {log.foto_url && (
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={log.foto_url}
                alt={log.kegiatan}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base truncate">{log.kegiatan}</h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {log.jml_jiwa || 0} jiwa
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{format(new Date(log.tgl), 'd MMM yyyy', { locale: id })}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{log.m_pendeta?.nama_lengkap}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{log.m_pos_pelkes?.nama_pos}</span>
              </div>
            </div>

            {log.catatan && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {log.catatan}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
