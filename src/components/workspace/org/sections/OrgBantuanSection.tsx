import { LegacyUnifiedOrganizationData } from '../legacyTypes';
import { LifeBuoy, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function OrgBantuanSection({ orgData }: { orgData: LegacyUnifiedOrganizationData }) {
  const requests = orgData.aid_requests || [];

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-subtle rounded-2xl animate-tab-fade">
        <LifeBuoy size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-medium text-text-strong">Belum ada pengajuan bantuan</h3>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disetujui': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'ditolak': return <XCircle size={16} className="text-red-500" />;
      case 'revisi': return <AlertCircle size={16} className="text-amber-500" />;
      default: return <Clock size={16} className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disetujui': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ditolak': return 'bg-red-50 text-red-700 border-red-200';
      case 'revisi': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-3 animate-tab-fade pb-8">
      {requests.map((req: any) => (
        <Link 
          key={req.id} 
          href={`/dashboard/aid-requests/${encodeURIComponent(req.id)}`}
          className="block bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs hover:bg-surface-sunken transition-colors"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-sm text-text-strong line-clamp-2 pr-4">{req.title}</h4>
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(req.status)} whitespace-nowrap`}>
              {getStatusIcon(req.status)}
              {req.status.toUpperCase()}
            </span>
          </div>
          
          <div className="flex justify-between items-end mt-4">
            <div className="text-xs text-text-muted">
              {format(new Date(req.date), 'dd MMMM yyyy', { locale: id })}
            </div>
            {req.amount_requested != null && (
              <div className="font-bold text-brand-primary text-sm">
                {formatCurrency(req.amount_requested)}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
