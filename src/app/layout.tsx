import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/toast';
import { NetworkBanner } from '@/components/mobile/NetworkBanner';
import { MobileSplashScreen } from '@/components/mobile/MobileSplashScreen';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SuppressConsoleWarning } from '@/components/utils/SuppressConsoleWarning';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { ActiveContextProvider } from '@/stores/active-context';
import { getServerContext } from '@/lib/utils/context';

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
  description: 'Platform Digital Terpadu GPIB di Seluruh Wilayah Pelayanan GPIB.',
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SI GPIB',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'SI GPIB v2.2 - Sistem Informasi GPIB',
    description: 'Platform Digital Terpadu GPIB di Seluruh Wilayah Pelayanan GPIB.',
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
    description: 'Platform Digital Terpadu GPIB di Seluruh Wilayah Pelayanan GPIB.',
    images: ['https://sigpib.amanzero.space/og-image-si-gpib.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1220',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextData = await getServerContext();
  const activeContextId = contextData.context_id;

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0B1220" />
      </head>
      <body className={`${inter.variable} ${fraunces.variable} font-sans bg-surface-base text-ink-primary`} suppressHydrationWarning>
        <SuppressConsoleWarning />
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <ServiceWorkerRegister />
              <MobileSplashScreen />
              <NetworkBanner />
              <ActiveContextProvider initialContextId={activeContextId}>
                <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
                  {contextData.status === 'VALID' && (
                    <DesktopSidebar />
                  )}
                  
                  <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
                    <main className="flex-1 pb-28 md:pb-6 relative z-0">
                      {children}
                    </main>
                    
                    {contextData.status === 'VALID' && (
                      <BottomNavigation />
                    )}
                  </div>
                </div>
              </ActiveContextProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
