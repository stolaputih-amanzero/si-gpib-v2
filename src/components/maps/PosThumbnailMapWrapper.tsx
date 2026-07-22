'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PosThumbnailMap = dynamic(() => import('./PosThumbnailMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-surface-sunken rounded-xl border border-border-subtle min-h-[180px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
    </div>
  )
});

interface WrapperProps {
  latitude: number;
  longitude: number;
  nama_pos: string;
  alamat: string | null;
}

export default function PosThumbnailMapWrapper({ latitude, longitude, nama_pos, alamat }: WrapperProps) {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center bg-surface-sunken rounded-xl border border-border-subtle min-h-[180px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    }>
      <PosThumbnailMap latitude={latitude} longitude={longitude} nama_pos={nama_pos} alamat={alamat} />
    </Suspense>
  );
}
