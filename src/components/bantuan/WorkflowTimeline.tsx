import { CheckCircle2, Clock, XCircle, RotateCcw, UserCheck, ShieldCheck } from 'lucide-react';

interface ApprovalItem {
  id: number;
  role_approver: string;
  aksi: 'approve' | 'reject' | 'revision';
  catatan?: string | null;
  created_at?: string;
  approver_id?: string | null;
}

interface WorkflowTimelineProps {
  status: 'Draft' | 'Pending_KMJ' | 'Pending_Mupel' | 'Pending_Sinode' | 'Approved' | 'Rejected';
  approvalHistory?: ApprovalItem[];
  createdAt?: string;
}

export function WorkflowTimeline({
  status,
  approvalHistory = [],
  createdAt,
}: WorkflowTimelineProps) {
  const isRejected = status === 'Rejected';
  const isApproved = status === 'Approved';

  const steps = [
    {
      key: 'SUBMITTED',
      title: 'Pengajuan Dibuat',
      role: 'PJ Pos Pelkes',
      statusCheck: true,
      log: null,
    },
    {
      key: 'KMJ',
      title: 'Review KMJ Jemaat Induk',
      role: 'Pendeta KMJ',
      statusCheck: status !== 'Draft' && status !== 'Pending_KMJ',
      isActive: status === 'Pending_KMJ',
      log: approvalHistory.find((a) => a.role_approver === 'kmj' || a.role_approver === 'kmj_jemaat'),
    },
    {
      key: 'MUPEL',
      title: 'Review Mupel Wilayah',
      role: 'Admin / Pengurus Mupel',
      statusCheck: status === 'Pending_Sinode' || isApproved,
      isActive: status === 'Pending_Mupel',
      log: approvalHistory.find((a) => a.role_approver === 'admin_mupel' || a.role_approver === 'mupel'),
    },
    {
      key: 'SINODE',
      title: 'Persetujuan Sinode',
      role: 'Super User Sinode / Depelkes',
      statusCheck: isApproved,
      isActive: status === 'Pending_Sinode',
      log: approvalHistory.find((a) => a.role_approver === 'super_user' || a.role_approver === 'sinode'),
    },
  ];

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-surface-elevated p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-high flex items-center gap-2">
          <ShieldCheck size={18} className="text-brand-primary" />
          <span>Timeline Workflow Approval</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-sunken border border-border-subtle text-text-muted">
          Status: {status}
        </span>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
        {steps.map((step, idx) => {
          const isPassed = step.statusCheck;
          const isCurrent = step.isActive;
          const log = step.log;

          return (
            <div key={step.key} className="relative group">
              {/* Icon Marker */}
              <div className="absolute -left-6 top-0 flex items-center justify-center">
                {isPassed ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-emerald-100 dark:ring-emerald-950">
                    <CheckCircle2 size={13} />
                  </span>
                ) : isCurrent ? (
                  <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse">
                    <Clock size={13} />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-surface-sunken border-2 border-border-subtle flex items-center justify-center text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted/40" />
                  </span>
                )}
              </div>

              {/* Step Detail Card */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold ${isPassed || isCurrent ? 'text-text-high' : 'text-text-muted'}`}>
                    {step.title}
                  </h4>
                  {idx === 0 && createdAt && (
                    <span className="text-[10px] text-text-muted">{formatDate(createdAt)}</span>
                  )}
                  {log && log.created_at && (
                    <span className="text-[10px] text-text-muted">{formatDate(log.created_at)}</span>
                  )}
                </div>

                <p className="text-[11px] text-text-muted">{step.role}</p>

                {/* Log Catatan Approval */}
                {log && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-xs space-y-1 ${
                      log.aksi === 'approve'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300'
                        : log.aksi === 'revision'
                        ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300'
                        : 'bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                      {log.aksi === 'approve' ? (
                        <UserCheck size={14} className="text-emerald-600" />
                      ) : log.aksi === 'revision' ? (
                        <RotateCcw size={14} className="text-amber-600" />
                      ) : (
                        <XCircle size={14} className="text-red-600" />
                      )}
                      <span>
                        {log.aksi === 'approve'
                          ? 'Disetujui'
                          : log.aksi === 'revision'
                          ? 'Minta Revisi'
                          : 'Ditolak'}
                      </span>
                    </div>
                    {log.catatan && <p className="italic text-[11px]">"{log.catatan}"</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Final Status Step */}
        {(isApproved || isRejected) && (
          <div className="relative">
            <div className="absolute -left-6 top-0 flex items-center justify-center">
              {isApproved ? (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-emerald-100">
                  <CheckCircle2 size={13} />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center ring-4 ring-red-100">
                  <XCircle size={13} />
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-high">
                {isApproved ? 'Pengajuan Bantuan Disetujui' : 'Pengajuan Ditolak'}
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                {isApproved
                  ? 'Permohonan bantuan telah disetujui penuh oleh Sinode GPIB.'
                  : 'Permohonan ditolak pada proses verifikasi.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
