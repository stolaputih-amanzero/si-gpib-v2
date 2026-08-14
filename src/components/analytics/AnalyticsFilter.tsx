'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import type { AnalyticsFilter as AnalyticsFilterType } from '@/lib/domains/analytics/analytics.types';

interface AnalyticsFilterProps {
  filter: AnalyticsFilterType;
  onFilterChange: (filter: AnalyticsFilterType) => void;
  mupelList: Array<{ id_mupel: string; nama_mupel: string }>;
  jemaatList: Array<{ id_induk: string; nama_jemaat: string }>;
}

export function AnalyticsFilter({
  filter,
  onFilterChange,
  mupelList,
  jemaatList,
}: AnalyticsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilter, setLocalFilter] = useState(filter);

  const handleApply = () => {
    onFilterChange(localFilter);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilter = {};
    setLocalFilter(resetFilter);
    onFilterChange(resetFilter);
    setIsOpen(false);
  };

  const activeCount = [localFilter.idMupel, localFilter.idInduk].filter(Boolean).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-surface-1 border-border-subtle text-text-high hover:bg-surface-sunken"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filter Analytics
        {activeCount > 0 && (
          <span className="ml-2 bg-brand-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 bg-surface-elevated rounded-2xl border border-border-subtle shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <h4 className="font-semibold text-sm text-text-high">Filter Wilayah & Jemaat</h4>
            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-high">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Mupel</label>
            <Select
              value={localFilter.idMupel || 'all'}
              onValueChange={(val) =>
                setLocalFilter({ ...localFilter, idMupel: !val || val === 'all' ? undefined : val })
              }
            >
              <SelectTrigger className="h-10 bg-surface-1 border-border-subtle text-text-high">
                <SelectValue placeholder="Semua Mupel" />
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-border-subtle">
                <SelectItem value="all">Semua Mupel</SelectItem>
                {mupelList.map((m) => (
                  <SelectItem key={m.id_mupel} value={m.id_mupel}>
                    {m.nama_mupel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Jemaat Induk</label>
            <Select
              value={localFilter.idInduk || 'all'}
              onValueChange={(val) =>
                setLocalFilter({ ...localFilter, idInduk: !val || val === 'all' ? undefined : val })
              }
            >
              <SelectTrigger className="h-10 bg-surface-1 border-border-subtle text-text-high">
                <SelectValue placeholder="Semua Jemaat" />
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-border-subtle">
                <SelectItem value="all">Semua Jemaat</SelectItem>
                {jemaatList.map((j) => (
                  <SelectItem key={j.id_induk} value={j.id_induk}>
                    {j.nama_jemaat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="flex-1 bg-surface-1 border-border-subtle text-text-high hover:bg-surface-sunken">
              Reset
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1 bg-brand-primary text-white">
              Terapkan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
