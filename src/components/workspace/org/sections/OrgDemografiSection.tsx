import { UnifiedOrganizationData } from '@/lib/services/organization';
import { DemografiBarChart } from '@/components/charts/DemografiBarChart';
import { DemografiDonutChart } from '@/components/charts/DemografiDonutChart';
import { Users } from 'lucide-react';

export function OrgDemografiSection({ orgData }: { orgData: UnifiedOrganizationData }) {
  const demographics = orgData.demographics || [];
  
  if (demographics.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-subtle rounded-2xl">
        <Users size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-medium text-text-strong">Belum ada data demografi</h3>
        <p className="text-sm text-text-muted mt-1">Data demografi akan muncul di sini.</p>
      </div>
    );
  }

  const barData = demographics.map(d => ({
    kategori: d.kategori_pelkat,
    total: d.laki + d.perempuan,
    laki: d.laki,
    perempuan: d.perempuan
  }));

  const totalProfesiCount = demographics.slice(0, 5).reduce((acc, d) => acc + (d.laki + d.perempuan), 0);
  
  // Dummy profesi data mapping for donut chart since we don't have the exact aggregation yet
  const profesiData = demographics.slice(0, 5).map((d) => {
    const count = d.laki + d.perempuan;
    return {
      name: d.profesi || 'Lainnya',
      count: count,
      percentage: totalProfesiCount > 0 ? Math.round((count / totalProfesiCount) * 100) : 0
    };
  });

  return (
    <div className="space-y-4 animate-tab-fade pb-8">
      <div className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs">
        <h3 className="text-sm font-bold text-text-strong mb-4">Distribusi per Pelkat</h3>
        <DemografiBarChart data={barData} />
      </div>
      
      <div className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs">
        <h3 className="text-sm font-bold text-text-strong mb-4">Distribusi Profesi</h3>
        <DemografiDonutChart data={profesiData} />
      </div>
    </div>
  );
}
