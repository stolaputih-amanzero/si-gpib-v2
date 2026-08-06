'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, FileText, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAsetList } from '@/lib/domains/aset/aset.queries';
import { AsetCard } from './AsetCard';
import type { JenisAset } from '@/lib/domains/aset/aset.types';

interface AsetTabsProps {
  idPos?: string;
  // Legacy props
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  counts?: {
    ALL?: number;
    TANAH?: number;
    BANGUNAN?: number;
    BERGERAK?: number;
  };
}

const JENIS_CONFIG: { value: JenisAset; label: string; icon: any }[] = [
  { value: 'tanah', label: 'Tanah', icon: MapPin },
  { value: 'bangunan', label: 'Bangunan', icon: FileText },
  { value: 'bergerak', label: 'Bergerak', icon: Car },
];

export function AsetTabs({ idPos, activeTab, onTabChange }: AsetTabsProps) {
  const actualIdPos = idPos || '';
  const router = useRouter();
  const [jenis, setJenis] = useState<JenisAset>((activeTab?.toLowerCase() as JenisAset) || 'tanah');
  const { data: asetList, isLoading } = useAsetList(actualIdPos, jenis);

  // If used in legacy mode, we might not want to show the whole page content, just the tabs
  const isLegacy = !!onTabChange;

  const handleAdd = () => {
    router.push(`/aset/new?jenis=${jenis}&pos=${actualIdPos}`);
  };

  const handleTabChange = (value: JenisAset) => {
    setJenis(value);
    if (onTabChange) {
      onTabChange(value.toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      {/* Chip Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {JENIS_CONFIG.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={jenis === value ? 'default' : 'outline'}
            size="sm"
            className="h-10 px-4 rounded-full whitespace-nowrap"
            onClick={() => handleTabChange(value)}
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
            {asetList && (
              <span className="ml-2 bg-white/20 rounded-full px-2 text-xs">
                {asetList.length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* List (Only render if not legacy mode) */}
      {!isLegacy && (
        <>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : asetList && asetList.length > 0 ? (
        <div className="space-y-3">
          {asetList.map((aset) => (
            <AsetCard key={aset.id_aset} aset={aset} jenis={jenis} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">
            Belum ada aset {JENIS_CONFIG.find((j) => j.value === jenis)?.label.toLowerCase()}
          </p>
          <Button onClick={handleAdd} size="lg" className="min-h-[44px]">
            <Plus className="w-4 h-4 mr-2" />
            Dokumentasikan Sekarang
          </Button>
        </div>
      )}

          {/* Floating Add Button (hanya jika ada data) */}
          {asetList && asetList.length > 0 && (
            <button
              onClick={handleAdd}
              className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-30"
              aria-label="Tambah aset baru"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
