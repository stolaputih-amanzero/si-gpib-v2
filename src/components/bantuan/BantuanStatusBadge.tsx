'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { StatusBantuan } from '@/lib/domains/bantuan/bantuan.types';

interface BantuanStatusBadgeProps {
  status: StatusBantuan;
  className?: string;
}

const statusConfig: Record<StatusBantuan, { label: string; className: string }> = {
  Draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  Pending_KMJ: {
    label: 'Menunggu KMJ',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  Pending_Mupel: {
    label: 'Menunggu Mupel',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  Pending_Sinode: {
    label: 'Menunggu Sinode',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  Approved: {
    label: 'Disetujui',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  Rejected: {
    label: 'Ditolak',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function BantuanStatusBadge({ status, className }: BantuanStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
