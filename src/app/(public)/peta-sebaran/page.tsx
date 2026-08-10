import { fetchPublicMapData } from '@/lib/services/public-portal';
import { PublicMapClient } from '@/components/maps/PublicMapClient';

export const metadata = {
  title: 'Peta Sebaran | SI GPIB',
};

export default async function PublicMapPage() {
  const mapData = await fetchPublicMapData();

  return (
    <div className="flex flex-col h-screen bg-bg-base">
      {/* Header Publik */}
      <header className="bg-brand-primary text-white py-4 px-6 shadow-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
            <img src="/logo-gpib.png" alt="GPIB Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">SI GPIB v2.2</h1>
            <p className="text-xs text-brand-surface font-medium opacity-80">Peta Sebaran Pelayanan</p>
          </div>
        </div>
      </header>

      {/* Konten Peta */}
      <main className="flex-1 w-full relative z-0 p-2 md:p-6 pb-20 md:pb-6">
        <div className="w-full h-full bg-surface-1 rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
          <PublicMapClient initialData={mapData} />
        </div>
      </main>
    </div>
  );
}
