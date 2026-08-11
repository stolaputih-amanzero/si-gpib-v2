import { LegacyUnifiedOrganizationData } from '../legacyTypes';
import { AnalyticsStatCard } from '@/components/analytics/AnalyticsStatCard';
import { Users, User, Building2, LifeBuoy, MapPin, Activity, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function OrgOverviewSection({ orgData }: { orgData: LegacyUnifiedOrganizationData }) {
  return (
    <div className="space-y-4 animate-tab-fade">
      <div className="grid grid-cols-2 gap-3">
        <AnalyticsStatCard
          title="Total Jiwa"
          value={orgData.kpis.total_jiwa || 0}
          icon={Users}
          trend={2}
          colorBg="bg-blue-50 dark:bg-blue-900/20"
          colorIcon="text-blue-500 dark:text-blue-400"
        />
        <AnalyticsStatCard
          title="Total Aset"
          value={orgData.kpis.total_aset || 0}
          icon={Building2}
          trend={0}
          colorBg="bg-emerald-50 dark:bg-emerald-900/20"
          colorIcon="text-emerald-500 dark:text-emerald-400"
        />
        <AnalyticsStatCard
          title="Bantuan Tertunda"
          value={orgData.kpis.pending_aid_requests || 0}
          icon={LifeBuoy}
          trend={0}
          colorBg="bg-amber-50 dark:bg-amber-900/20"
          colorIcon="text-amber-500 dark:text-amber-400"
        />
        <AnalyticsStatCard
          title="Pos & Bajem"
          value={orgData.kpis.total_pos || 0}
          icon={MapPin}
          trend={0}
          colorBg="bg-purple-50 dark:bg-purple-900/20"
          colorIcon="text-purple-500 dark:text-purple-400"
        />
      </div>

      {orgData.level !== 'POS' && orgData.child_organizations && orgData.child_organizations.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Wilayah Pelayanan</h3>
            <span className="text-xs text-text-muted font-medium">{orgData.child_organizations.length} entitas</span>
          </div>
          <div className="bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden divide-y divide-border-subtle">
            {orgData.child_organizations.map((child) => (
              <a key={child.id} href={`/org/${encodeURIComponent(child.id)}`} className="flex items-center justify-between p-4 hover:bg-surface-sunken transition-colors group">
                <div>
                  <p className="font-bold text-sm text-text-strong group-hover:text-brand-primary transition-colors">{child.name}</p>
                  <p className="text-xs text-text-muted">{child.type}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-brand-primary">Buka Workspace &rarr;</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity: Pastoral Logs */}
      {orgData.pastoral_logs && orgData.pastoral_logs.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Aktivitas Terbaru</h3>
          </div>
          <div className="bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden divide-y divide-border-subtle">
            {orgData.pastoral_logs.slice(0, 3).map((log) => (
              <div key={log.id} className="p-4 flex gap-3 items-start">
                <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Activity size={14} />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-strong">{log.activity}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {format(new Date(log.date), 'dd MMM yyyy', { locale: id })}
                    </span>
                    {log.pastor_name && <span>• {log.pastor_name}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SDM Summary */}
      {orgData.sdm_list && orgData.sdm_list.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Ringkasan SDM</h3>
          </div>
          <div className="bg-surface-1 border border-border-subtle rounded-2xl p-4 flex gap-4 overflow-x-auto scrollbar-none">
            {orgData.sdm_list.slice(0, 5).map((sdm) => (
              <div key={sdm.id} className="flex flex-col items-center text-center w-16 shrink-0">
                <div className="h-12 w-12 rounded-full bg-surface-2 border border-border-subtle mb-2 overflow-hidden flex items-center justify-center">
                  {sdm.avatar_url ? (
                    <img src={sdm.avatar_url} alt={sdm.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-text-tertiary" />
                  )}
                </div>
                <p className="text-xs font-semibold text-text-strong truncate w-full">{sdm.name.split(' ')[0]}</p>
                <p className="text-[10px] text-text-muted truncate w-full">{sdm.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
