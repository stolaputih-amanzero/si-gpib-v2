'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, Search } from 'lucide-react';
import type { PastoralFilter as PastoralFilterType } from '@/lib/domains/pastoral/pastoral.types';

interface PastoralFilterProps {
  filter: PastoralFilterType;
  onFilterChange: (filter: PastoralFilterType) => void;
  pendetaList: Array<{ id_pendeta: string; nama_lengkap: string }>;
  posList: Array<{ id_pos: string; nama_pos: string }>;
}

export function PastoralFilter({ filter, onFilterChange, pendetaList, posList }: PastoralFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilter, setLocalFilter] = useState(filter);

  const handleApply = () => {
    onFilterChange(localFilter);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilter = { idJemaat: filter.idJemaat, page: 1, limit: 20 };
    setLocalFilter(resetFilter);
    onFilterChange(resetFilter);
    setIsOpen(false);
  };

  const activeFilterCount = [
    localFilter.startDate,
    localFilter.endDate,
    localFilter.idPendeta,
    localFilter.idPos,
    localFilter.search,
  ].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="relative inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
        <Filter className="w-4 h-4 mr-2" />
        Filter
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Log Pastoral</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari kegiatan atau catatan..."
              value={localFilter.search || ''}
              onChange={(e) => setLocalFilter({ ...localFilter, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Dari Tanggal</label>
              <Input
                type="date"
                value={localFilter.startDate || ''}
                onChange={(e) => setLocalFilter({ ...localFilter, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sampai Tanggal</label>
              <Input
                type="date"
                value={localFilter.endDate || ''}
                onChange={(e) => setLocalFilter({ ...localFilter, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Pendeta Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Pendeta</label>
            <Select
              value={(localFilter.idPendeta as string) || 'all'}
              onValueChange={(value) => setLocalFilter({ ...localFilter, idPendeta: value === 'all' ? undefined : value } as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Pendeta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pendeta</SelectItem>
                {pendetaList.map((p) => (
                  <SelectItem key={p.id_pendeta} value={p.id_pendeta}>
                    {p.nama_lengkap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pos Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Pos Pelkes</label>
            <Select
              value={(localFilter.idPos as string) || 'all'}
              onValueChange={(value) => setLocalFilter({ ...localFilter, idPos: value === 'all' ? undefined : value } as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Pos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pos</SelectItem>
                {posList.map((p) => (
                  <SelectItem key={p.id_pos} value={p.id_pos}>
                    {p.nama_pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Terapkan Filter
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
