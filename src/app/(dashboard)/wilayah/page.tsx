import { GeospatialWorkspaceShell } from '@/components/geospatial/GeospatialWorkspaceShell';

export async function generateMetadata() {
  return {
    title: `Pemetaan Wilayah & Batas Spasial | SI GPIB`,
  };
}

export default function GeospatialWilayahPage() {
  return <GeospatialWorkspaceShell />;
}
