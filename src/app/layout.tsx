import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SI GPIB v2.2 - Sistem Informasi Pos Pelkes GPIB',
  description: 'Platform Digital Terpadu Pelayanan & Kesaksian Pos Pelkes GPIB di Seluruh Indonesia.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-si-gpib.png',
    shortcut: '/logo-si-gpib.png',
    apple: '/logo-si-gpib.png',
  },
  openGraph: {
    title: 'SI GPIB v2.2 - Sistem Informasi Pos Pelkes GPIB',
    description: 'Platform Digital Terpadu Pelayanan & Kesaksian Pos Pelkes GPIB di Seluruh Indonesia.',
    url: 'https://si-gpib-v2.vercel.app',
    siteName: 'SI GPIB',
    images: [
      {
        url: 'https://si-gpib-v2.vercel.app/og-image-si-gpib.png',
        width: 1200,
        height: 630,
        alt: 'SI GPIB v2.2 - Sistem Informasi Pos Pelkes GPIB',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SI GPIB v2.2 - Sistem Informasi Pos Pelkes GPIB',
    description: 'Platform Digital Terpadu Pelayanan & Kesaksian Pos Pelkes GPIB di Seluruh Indonesia.',
    images: ['https://si-gpib-v2.vercel.app/og-image-si-gpib.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-surface-base text-text-high">
        {children}
      </body>
    </html>
  );
}

