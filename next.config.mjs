import withSerwist from '@serwist/next';

const isProd = process.env.NODE_ENV === 'production';

const withSerwistConfig = withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: !isProd,
  // Jangan cache halaman Next.js secara default — biarkan sw.ts yang atur
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Next.js 16: cacheComponents (formerly PPR) removed due to conflicts

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Headers keamanan
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default withSerwistConfig(nextConfig);
