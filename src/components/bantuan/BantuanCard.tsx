'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BantuanStatusBadge } from './BantuanStatusBadge';
import type { PengajuanBantuan } from '@/lib/domains/bantuan/bantuan.types';

interface BantuanCardProps {
  bantuan: PengajuanBantuan & { nama_pos?: string };
  className?: string;
}

const urgensiConfig = {
  Rendah: { color: 'text-gray-500', icon: null },
  Sedang: { color: 'text-yellow-600', icon: null },
  Tinggi: { color: 'text-orange-600', icon: AlertCircle },
  Darurat: { color: 'text-red-600', icon: AlertCircle },
};

export function BantuanCard({ bantuan, className }: BantuanCardProps) {
  const formattedDate = format(new Date(bantuan.created_at), 'd MMM yyyy', { locale: id });
  const urgensi = urgensiConfig[bantuan.urgensi];
  const UrgensiIcon = urgensi.icon;

  return (
    <Card className={cn('overflow-hidden border-l-4 shadow-sm', 
      bantuan.status === 'Approved' ? 'border-l-green-500' :
      bantuan.status === 'Rejected' ? 'border-l-red-500' :
      bantuan.status === 'Draft' ? 'border-l-gray-300' : 'border-l-blue-500',
      className
    )}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1 flex-1">
            {bantuan.jenis_bantuan}
          </CardTitle>
          <BantuanStatusBadge status={bantuan.status} />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-2">
        <p className="text-sm text-gray-600 line-clamp-2">
          {bantuan.deskripsi}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{bantuan.nama_pos || bantuan.id_pos}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
          <div className="flex items-center gap-1.5">
            {UrgensiIcon && <UrgensiIcon className={cn('w-3.5 h-3.5', urgensi.color)} />}
            <span className={cn('text-xs font-medium', urgensi.color)}>
              Urgensi {bantuan.urgensi}
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            Rp {bantuan.estimasi_biaya.toLocaleString('id-ID')}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-0">
        <Link href={`/bantuan/${bantuan.id_ajuan}`} className="w-full">
          <Button 
            variant="ghost" 
            className="w-full justify-between rounded-none border-t border-gray-100 h-11 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Lihat Detail & Tracking
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
