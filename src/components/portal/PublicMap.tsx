'use client';

import dynamic from 'next/dynamic';
import type { PublicPosPelkes } from '@/lib/domains/portal/portal.types';
import { Skeleton } from '@/components/ui/skeleton';

const PublicMapInner = dynamic(
  () => import('./PublicMapInner'),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-2xl" />,
  }
);

interface PublicMapProps {
  locations: PublicPosPelkes[];
}

export function PublicMap({ locations }: PublicMapProps) {
  return (
    <div className="w-full h-[calc(100vh-64px)] relative bg-gray-50">
      <PublicMapInner locations={locations} />
      
      {/* Search Bar Overlay / Header for Portal */}
      <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-[1000]">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-4 border border-white/20 flex flex-col items-center">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight text-center">
            Peta Sebaran Pos Pelkes GPIB
          </h1>
          <p className="text-xs text-gray-500 mt-1 text-center font-medium">
            Temukan Pos Pelayanan dan Kesaksian terdekat dari lokasi Anda
          </p>
        </div>
      </div>
    </div>
  );
}
