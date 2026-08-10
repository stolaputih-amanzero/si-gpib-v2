'use client';

import { PublicMapPoint } from '@/lib/services/public-portal';
import dynamic from 'next/dynamic';

const Inner = dynamic(() => import('./PublicMapClientInner'), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-full bg-surface-2 animate-pulse flex items-center justify-center">
      <p className="text-text-subtle font-medium">Memuat Peta Sebaran GPIB...</p>
    </div>
  )
});

export interface PublicMapClientProps {
  initialData: PublicMapPoint[];
}

export function PublicMapClient({ initialData }: PublicMapClientProps) {
  return <Inner initialData={initialData} />;
}
