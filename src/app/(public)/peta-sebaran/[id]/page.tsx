import { env } from '@/lib/env';
import { MaintenancePage } from '@/components/portal/MaintenancePage';
import { PosDetailCard } from '@/components/portal/PosDetailCard';
import { getPosDetail } from '@/lib/domains/portal/portal.service';
import { unstable_cache } from 'next/cache';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const getCachedPosDetailData = (id: string) => 
  unstable_cache(
    async () => getPosDetail(id),
    [`public-pos-detail-${id}`],
    { revalidate: 3600 }
  )();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isEnabled = env.NEXT_PUBLIC_ENABLE_PUBLIC_PORTAL;
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://sigpib.amanzero.space';

  if (!isEnabled) {
    return {
      title: 'Peta Sebaran - Segera Hadir',
      robots: { index: false, follow: false },
    };
  }

  try {
    const { id } = await params;
    const pos = await getCachedPosDetailData(id);
    
    return {
      title: `${pos.nama_pos} - Peta Sebaran Pos Pelkes GPIB`,
      description: `Profil dan informasi ${pos.nama_pos}, berlokasi di ${pos.alamat || 'Indonesia'}. Total ${pos.jumlah_kk} KK.`,
      metadataBase: new URL(baseUrl),
      openGraph: {
        url: `${baseUrl}/peta-sebaran/${id}`,
        title: `${pos.nama_pos} - Pos Pelkes GPIB`,
        description: `Profil dan informasi ${pos.nama_pos}. Total ${pos.jumlah_kk} KK.`,
        siteName: 'SI GPIB v2',
      },
      robots: { index: true, follow: true },
    };
  } catch (error) {
    return {
      title: 'Pos Pelkes Tidak Ditemukan',
      robots: { index: false, follow: false },
    };
  }
}

export default async function PosDetailPage({ params }: Props) {
  if (!env.NEXT_PUBLIC_ENABLE_PUBLIC_PORTAL) {
    return <MaintenancePage />;
  }

  const { id } = await params;
  
  try {
    const pos = await getCachedPosDetailData(id);
    
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <PosDetailCard pos={pos} />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
