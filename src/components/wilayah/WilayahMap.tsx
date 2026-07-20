'use client';

import dynamic from 'next/dynamic';
import { MapPosPelkesItem } from '@/hooks/use-wilayah';
import { MapPin } from 'lucide-react';

interface WilayahMapProps {
  data: MapPosPelkesItem[];
  selectedPosId?: string;
  onSelectPos?: (id_pos: string) => void;
}

const WilayahMapInner = dynamic(
  () => import('./WilayahMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl bg-surface-sunken animate-pulse flex flex-col items-center justify-center border border-border-subtle text-text-muted gap-2">
        <MapPin className="w-8 h-8 animate-bounce text-brand-primary" />
        <span className="text-sm font-medium">Memuat Peta Geospatial Wilayah...</span>
      </div>
    ),
  }
);

export function WilayahMap(props: WilayahMapProps) {
  return <WilayahMapInner {...props} />;
}

export default WilayahMap;
