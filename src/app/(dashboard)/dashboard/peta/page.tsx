'use client';

import { useWilayahMapData, useJemaatMapData } from '@/hooks/use-wilayah';
import { WilayahMap } from '@/components/wilayah/WilayahMap';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, MapPin, RefreshCw } from 'lucide-react';

export default function PetaPage() {
  const { data: posData, isLoading: isLoadingPos, refetch: refetchPos } = useWilayahMapData();
  const { data: jemaatData, isLoading: isLoadingJemaat, refetch: refetchJemaat } = useJemaatMapData();

  const handleRefresh = () => {
    refetchPos();
    refetchJemaat();
  };

  return (
    <div className="w-full min-h-full bg-surface-base pb-24 md:pb-12 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
            <Map size={20} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-brand-primary">
              Peta Sebaran Terpadu
            </h1>
            <p className="text-xs text-text-muted flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="inline-flex items-center gap-1 font-medium">
                <span className="w-4 h-4 rounded-full bg-[#1E40AF] text-white flex items-center justify-center text-[10px] shadow-sm">⛪</span>
                <span>Gereja Jemaat Induk</span>
              </span>
              <span>&</span>
              <span className="inline-flex items-center gap-1 font-medium">
                <MapPin size={15} className="text-blue-600 fill-blue-600/30 shrink-0" />
                <span>Pos Pelkes/Bajem</span>
              </span>
              <span>GPIB</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle hover:bg-surface-hover text-text-high transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Refresh Data Peta"
        >
          <RefreshCw size={16} className={isLoadingPos || isLoadingJemaat ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Map Container */}
      <div className="w-full h-[calc(100vh-180px)] min-h-[500px] rounded-2xl overflow-hidden shadow-soft border border-border-subtle z-0">
        {isLoadingPos || isLoadingJemaat ? (
          <Skeleton className="w-full h-full rounded-2xl" />
        ) : (
          <WilayahMap data={posData || []} jemaatData={jemaatData || []} />
        )}
      </div>
    </div>
  );
}
