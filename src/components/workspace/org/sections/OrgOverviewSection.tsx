import { UnifiedOrganizationData } from '@/lib/services/organization';
import { AnalyticsStatCard } from '@/components/analytics/AnalyticsStatCard';
import { Users, Building2, LifeBuoy, MapPin } from 'lucide-react';

export function OrgOverviewSection({ orgData }: { orgData: UnifiedOrganizationData }) {
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Wilayah Pelayanan</h3>
          <div className="bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden divide-y divide-border-subtle">
            {orgData.child_organizations.map((child) => (
              <a key={child.id} href={`/org/${encodeURIComponent(child.id)}`} className="flex items-center justify-between p-4 hover:bg-surface-sunken transition-colors">
                <div>
                  <p className="font-bold text-sm text-text-strong">{child.name}</p>
                  <p className="text-xs text-text-muted">{child.type}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-brand-primary">Lihat Detail</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
