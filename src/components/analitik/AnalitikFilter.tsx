'use client';

import { MupelSelect } from '@/components/hierarki/HierarkiSelector/MupelSelect';
import { JemaatSelect } from '@/components/hierarki/HierarkiSelector/JemaatSelect';
import { Filter, X } from 'lucide-react';

interface AnalitikFilterProps {
  selectedMupel: string;
  selectedJemaat: string;
  onMupelChange: (val: string) => void;
  onJemaatChange: (val: string) => void;
  onReset: () => void;
  isSuperUser?: boolean;
}

export function AnalitikFilterComponent({
  selectedMupel,
  selectedJemaat,
  onMupelChange,
  onJemaatChange,
  onReset,
  isSuperUser = true,
}: AnalitikFilterProps) {
  const hasActiveFilter = Boolean(selectedMupel || selectedJemaat);

  return (
    <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-high">
          <Filter size={16} className="text-brand-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Filter Analitik Wilayah</h3>
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-medium"
          >
            <X size={14} />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MupelSelect
          value={selectedMupel}
          onChange={(val) => {
            onMupelChange(val);
            onJemaatChange('');
          }}
          disabled={!isSuperUser}
        />
        <JemaatSelect
          id_mupel={selectedMupel}
          value={selectedJemaat}
          onChange={onJemaatChange}
          disabled={!selectedMupel}
        />
      </div>
    </div>
  );
}
