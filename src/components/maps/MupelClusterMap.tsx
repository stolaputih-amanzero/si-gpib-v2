'use client';

import dynamic from 'next/dynamic';
import { MupelClusterMapProps } from './MupelClusterMapInner';

const MupelClusterMapInner = dynamic(
  () => import('./MupelClusterMapInner').then((mod) => mod.MupelClusterMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[160px] flex items-center justify-center bg-surface-sunken/80 animate-pulse rounded-xl">
        <p className="text-xs text-text-muted font-medium">Memuat peta wilayah Mupel...</p>
      </div>
    ),
  }
);

export function MupelClusterMap(props: MupelClusterMapProps) {
  return <MupelClusterMapInner {...props} />;
}

export default MupelClusterMap;
