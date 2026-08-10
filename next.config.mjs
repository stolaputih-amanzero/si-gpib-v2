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
        source: '/peta-sebaran/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://unpkg.com",
              "img-src 'self' data: https://*.tile.openstreetmap.org",
              "connect-src 'self' https://*.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/maps/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://unpkg.com",
              "img-src 'self' data: https://*.tile.openstreetmap.org",
              "connect-src 'self' https://*.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
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

  async redirects() {
    return [
      // Organization
      { source: '/mupel/:id', destination: '/org/:id', permanent: true },
      { source: '/jemaat/:id', destination: '/org/:id', permanent: true },
      { source: '/dashboard/pos-pelkes/:id', destination: '/org/:id', permanent: true },
      { source: '/hierarki/:path*', destination: '/org/:path*', permanent: true },
      
      // People
      { source: '/pendeta/:id', destination: '/people/:id', permanent: true },
      { source: '/sdm/pendeta', destination: '/people', permanent: true },
      { source: '/sdm/pelayan', destination: '/org', permanent: true }, // Pelayan masuk ke SDM Section di Org
      { source: '/sdm/relawan', destination: '/org', permanent: true },
      
      // Assets
      { source: '/aset/:id', destination: '/assets/:id', permanent: true },
      
      // Aid Requests
      { source: '/bantuan/:id', destination: '/aid-requests/:id', permanent: true },
      
      // Maps & Reports
      { source: '/peta-sebaran', destination: '/maps', permanent: true },
      { source: '/dashboard/peta', destination: '/maps', permanent: true },
      { source: '/wilayah/:path*', destination: '/maps', permanent: true },
      { source: '/laporan/aset/:path*', destination: '/laporan', permanent: true },
      { source: '/laporan/pastoral/:path*', destination: '/laporan', permanent: true },
      { source: '/laporan/demografi/:path*', destination: '/laporan', permanent: true },
      { source: '/laporan/kerawanan/:path*', destination: '/laporan', permanent: true },
      { source: '/laporan/potensi/:path*', destination: '/laporan', permanent: true },
    ];
  },
};

export default withSerwistConfig(nextConfig);
