import type { Metadata } from 'next';
import '../styles/globals.css';
export const metadata: Metadata = {
  title: 'SI GPIB v2.0',
  description: 'Sistem Informasi Pos Pelayanan Kesaksian GPIB',
  manifest: '/manifest.json',
  themeColor: '#1E40AF',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
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
