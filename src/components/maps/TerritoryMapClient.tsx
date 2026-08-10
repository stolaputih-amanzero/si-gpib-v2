'use client';

import dynamic from 'next/dynamic';
import { TerritoryMapClientProps } from './TerritoryMapClientInner';

const TerritoryMapClientInner = dynamic(
  () => import('./TerritoryMapClientInner').then((mod) => mod.TerritoryMapClientInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-200px)] min-h-[500px] flex items-center justify-center bg-bg-surface animate-pulse rounded-2xl border border-border-subtle">
        <p className="text-sm text-text-muted font-medium">Memuat Peta Teritori...</p>
      </div>
    ),
  }
);

export function TerritoryMapClient(props: TerritoryMapClientProps) {
  return <TerritoryMapClientInner {...props} />;
}

export default TerritoryMapClient;
