import { env } from '@/lib/env';
import { MaintenancePage } from '@/components/portal/MaintenancePage';
import { PublicMap } from '@/components/portal/PublicMap';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { getPublicPosPelkes } from '@/lib/domains/portal/portal.service';

export const dynamic = 'force-dynamic';

const getCachedPosData = unstable_cache(
  async () => getPublicPosPelkes(),
  ['public-pos-pelkes-page'],
  { revalidate: 3600 }
);

export async function generateMetadata(): Promise<Metadata> {
  const isEnabled = env.NEXT_PUBLIC_ENABLE_PUBLIC_PORTAL;
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://sigpib.amanzero.space';

  if (!isEnabled) {
    return {
      title: 'Peta Sebaran - Segera Hadir',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: 'Peta Sebaran Pos Pelkes GPIB',
    description: 'Temukan lokasi Pos Pelayanan dan Kesaksian (Pelkes) GPIB di seluruh Indonesia.',
    metadataBase: new URL(baseUrl),
    openGraph: {
      url: `${baseUrl}/peta-sebaran`,
      images: ['/og-image-portal.png'],
      title: 'Peta Sebaran Pos Pelkes GPIB',
      description: 'Peta sebaran interaktif Pos Pelkes GPIB',
      siteName: 'SI GPIB v2',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function PetaSebaranPage() {
  if (!env.NEXT_PUBLIC_ENABLE_PUBLIC_PORTAL) {
    return <MaintenancePage />;
  }

  const locations = await getCachedPosData();
  
  return <PublicMap locations={locations} />;
}
