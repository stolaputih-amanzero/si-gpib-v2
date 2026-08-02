'use client';

import { MupelSelect } from '@/components/hierarki/HierarkiSelector/MupelSelect';
import { JemaatSelect } from '@/components/hierarki/HierarkiSelector/JemaatSelect';
import { Filter, X, ShieldCheck, Building } from 'lucide-react';
import { useUserMupelAuth } from '@/hooks/use-hierarki-selector';

interface AnalitikFilterProps {
  selectedMupel: string;
  selectedJemaat: string;
  onMupelChange: (val: string) => void;
  onJemaatChange: (val: string) => void;
  onReset: () => void;
}

export function AnalitikFilterComponent({
  selectedMupel,
  selectedJemaat,
  onMupelChange,
  onJemaatChange,
  onReset,
}: AnalitikFilterProps) {
  const { data: userAuth, isLoading } = useUserMupelAuth();
  const hasActiveFilter = Boolean(selectedMupel || selectedJemaat);

  const role = userAuth?.role || 'guest';
  const isSuperUser = role === 'super_user' || role === 'admin_sinode' || role === 'guest';
  const isAdminMupel = role === 'admin_mupel' && Boolean(userAuth?.id_mupel);
  const isKmj = role === 'kmj' && Boolean(userAuth?.id_induk);

  if (isLoading) {
    return <div className="h-20 bg-surface-sunken rounded-2xl animate-pulse" />;
  }

  if (isKmj) {
    return (
      <div className="card-flat p-4 flex items-center gap-3 text-xs text-ink-primary">
        <ShieldCheck size={18} className="text-brand-primary shrink-0" />
        <div>
          <p className="font-extrabold text-ink-primary">Lingkup Pelayanan KMJ</p>
          <p className="text-ink-secondary">Menampilkan metrik analitik khusus Jemaat Induk & Pos Pelkes yang Anda pimpin.</p>
        </div>
      </div>
    );
  }

  const effectiveMupel = isAdminMupel && userAuth?.id_mupel ? userAuth.id_mupel : selectedMupel;

  return (
    <div className="card-flat p-4 sm:p-5 space-y-3.5 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-primary">
          <Filter size={16} className="text-brand-primary" />
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink-tertiary">Filter Analitik Wilayah</h3>
          {isAdminMupel && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Building size={10} />
              <span>Admin Mupel</span>
            </span>
          )}
        </div>
        {hasActiveFilter && isSuperUser && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            <X size={14} />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MupelSelect
          value={effectiveMupel}
          onChange={(val) => {
            onMupelChange(val);
            onJemaatChange('');
          }}
          disabled={!isSuperUser}
        />
        <JemaatSelect
          id_mupel={effectiveMupel}
          value={selectedJemaat}
          onChange={onJemaatChange}
          disabled={!effectiveMupel}
        />
      </div>
    </div>
  );
}

export default AnalitikFilterComponent;
