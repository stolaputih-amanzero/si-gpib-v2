import { PengajuanBantuanItem } from '@/hooks/use-bantuan';
import { UrgencyBadge } from './UrgencyBadge';
import Link from 'next/link';
import { Calendar, ChevronRight, DollarSign, MapPin } from 'lucide-react';

interface BantuanCardProps {
  item: PengajuanBantuanItem;
}

export function BantuanCard({ item }: BantuanCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'Pending_KMJ':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
      case 'Pending_Mupel':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200';
      case 'Pending_Sinode':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending_KMJ':
        return 'Review KMJ';
      case 'Pending_Mupel':
        return 'Review Mupel';
      case 'Pending_Sinode':
        return 'Review Sinode';
      case 'Approved':
        return 'Disetujui';
      case 'Rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  return (
    <Link
      href={`/bantuan/${item.id_ajuan}`}
      className="block bg-surface-elevated rounded-xl p-4 border border-border-subtle shadow-soft hover:border-brand-primary/40 active:scale-[0.99] transition-all group min-h-[44px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <UrgencyBadge urgensi={item.urgensi} size="sm" />
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                item.status
              )}`}
            >
              {getStatusLabel(item.status)}
            </span>
          </div>

          <h3 className="font-bold text-text-high text-base truncate pt-1 group-hover:text-brand-primary transition-colors">
            {item.jenis_bantuan}
          </h3>

          <p className="text-xs text-text-muted flex items-center gap-1 truncate">
            <MapPin size={13} className="shrink-0 text-brand-primary" />
            <span className="truncate">{item.pos?.nama_pos || item.id_pos}</span>
            {item.pos?.jemaat_induk?.nama_induk && (
              <span className="text-text-muted/60">({item.pos.jemaat_induk.nama_induk})</span>
            )}
          </p>
        </div>

        <ChevronRight size={18} className="text-text-muted shrink-0 mt-2 group-hover:translate-x-1 transition-transform" />
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-serif font-bold text-brand-primary text-sm">
          <DollarSign size={15} className="shrink-0 text-emerald-600" />
          <span>{formatCurrency(item.biaya)}</span>
        </div>

        {item.created_at && (
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <Calendar size={13} />
            <span>{formatDate(item.created_at)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
