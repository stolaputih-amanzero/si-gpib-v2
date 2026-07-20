'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the map component with ssr: false 
// This must be done inside a Client Component in Next.js 15+
const PosPelkesMap = dynamic(() => import('./PosPelkesMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  )
});

interface PosPelkes {
  id_pos: string;
  nama_pos: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function MapWrapper({ posPelkesData }: { posPelkesData: PosPelkes[] }) {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    }>
      <PosPelkesMap posPelkesData={posPelkesData} />
    </Suspense>
  );
}
