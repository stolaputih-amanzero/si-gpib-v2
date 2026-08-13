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
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ContextChip, ContextSwitcherSheet } from '@/components/layout/ContextSwitcher';
import { getAssignedPosListAction } from '@/app/actions/context';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextData = await getServerContext();
  const validContexts = await getAssignedPosListAction();
  const activeContextId = contextData.context_id;

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0B1220" />
        <ThemeScript />
      </head>
      <body className={`${inter.variable} ${fraunces.variable} font-sans bg-surface-base text-ink-primary`} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <ServiceWorkerRegister />
              <MobileSplashScreen />
              <NetworkBanner />
              <div className="flex flex-col min-h-[100dvh]">
                {contextData.status === 'VALID' && (
                  <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="container flex h-14 items-center justify-between px-4">
                      <div className="font-display font-bold text-lg tracking-tight">SI GPIB</div>
                      <ContextChip activeContextId={activeContextId} validContexts={validContexts} />
                    </div>
                  </header>
                )}
                
                <main className="flex-1 pb-16">
                  {children}
                </main>
                
                {contextData.status === 'VALID' && (
                  <>
                    <BottomNavigation />
                    <ContextSwitcherSheet activeContextId={activeContextId} validContexts={validContexts} />
                  </>
                )}
              </div>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
