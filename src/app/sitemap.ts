import { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { getPublicPosPelkes } from '@/lib/domains/portal/portal.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://sigpib.amanzero.space';
  const isPublicPortalEnabled = env.NEXT_PUBLIC_ENABLE_PUBLIC_PORTAL;

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Add other public routes here if needed (e.g. login/auth)
  ];

  if (isPublicPortalEnabled) {
    routes.push({
      url: `${baseUrl}/peta-sebaran`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });
  }

  return routes;
}
