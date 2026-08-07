'use client';

import dynamic from 'next/dynamic';
import type { PosLocation } from '@/lib/domains/analytics/analytics.types';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsMapContent = dynamic(
  () => import('./AnalyticsMapContent'),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[350px] md:h-[400px] rounded-xl" />,
  }
);

interface AnalyticsMapProps {
  locations: PosLocation[];
}

export function AnalyticsMap({ locations }: AnalyticsMapProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          🗺️ Peta Sebaran Pos Pelkes ({locations.length} Lokasi)
        </h3>
      </div>
      <AnalyticsMapContent locations={locations} />
    </div>
  );
}
