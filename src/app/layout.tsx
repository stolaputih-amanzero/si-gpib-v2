import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/toast';
import { NetworkBanner } from '@/components/mobile/NetworkBanner';
import { MobileSplashScreen } from '@/components/mobile/MobileSplashScreen';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeScript } from '@/components/theme/ThemeScript';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  style: ['normal'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

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
        <ThemeScript />
      </head>
      <body className={`${inter.variable} ${fraunces.variable} font-sans bg-surface-base text-ink-primary`} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <ServiceWorkerRegister />
              <MobileSplashScreen />
              <NetworkBanner />
              {children}
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
