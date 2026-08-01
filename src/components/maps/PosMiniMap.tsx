'use client';

import dynamic from 'next/dynamic';
import { PosMiniMapProps } from './PosMiniMapInner';

const PosMiniMapInner = dynamic(
  () => import('./PosMiniMapInner').then((mod) => mod.PosMiniMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[160px] flex items-center justify-center bg-surface-sunken/80 animate-pulse rounded-xl">
        <p className="text-xs text-text-muted font-medium">Memuat peta mini...</p>
      </div>
    ),
  }
);

export function PosMiniMap(props: PosMiniMapProps) {
  return <PosMiniMapInner {...props} />;
}

export default PosMiniMap;
