import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/toast';
import { NetworkBanner } from '@/components/mobile/NetworkBanner';
import { MobileSplashScreen } from '@/components/mobile/MobileSplashScreen';

export const metadata: Metadata = {
  title: 'SI GPIB v2.2 - Sistem Informasi GPIB',
  description: 'Platform Digital Terpadu GPIB di Seluruh Indonesia.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://sigpib.amanzero.space'),
  alternates: {
    canonical: 'https://sigpib.amanzero.space',
  },
  icons: {
    icon: '/logo-si-gpib.png',
    shortcut: '/logo-si-gpib.png',
    apple: '/logo-si-gpib.png',
  },
  openGraph: {
    title: 'SI GPIB v2.2 - Sistem Informasi GPIB',
    description: 'Platform Digital Terpadu GPIB di Seluruh Indonesia.',
    url: 'https://sigpib.amanzero.space',
    siteName: 'SI GPIB',
    images: [
      {
        url: 'https://sigpib.amanzero.space/og-image-si-gpib.png',
        width: 1200,
        height: 630,
        alt: 'SI GPIB v2.2 - Sistem Informasi GPIB',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SI GPIB v2.2 - Sistem Informasi GPIB',
    description: 'Platform Digital Terpadu GPIB di Seluruh Indonesia.',
    images: ['https://sigpib.amanzero.space/og-image-si-gpib.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-surface-base text-text-high" suppressHydrationWarning>
        <QueryProvider>
          <ToastProvider>
            <MobileSplashScreen />
            <NetworkBanner />
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
