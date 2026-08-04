import Image from 'next/image';
import Link from 'next/link';
import { Church, MapPin, Phone, Mail } from 'lucide-react';

export const metadata = {
  title: {
    default: 'GPIB — Gereja Protestan Indonesia di Barat',
    template: '%s | GPIB',
  },
  description:
    'Portal publik GPIB. Temukan Pos Pelkes, Jemaat, dan informasi pelayanan GPIB di seluruh Indonesia — dari Sabang sampai Merauke.',
  openGraph: {
    title: 'GPIB — Gereja Protestan Indonesia di Barat',
    description:
      'Temukan Pos Pelkes GPIB di seluruh Indonesia. 25 Mupel, 350+ Jemaat, 500+ Pos Pelkes.',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/50 to-white">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo + Nama */}
            <Link
              href="/"
              className="flex items-center gap-3 min-h-[44px] active:opacity-80 transition-opacity"
              aria-label="GPIB — Beranda"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src="/logo%20GPIB.png"
                  alt="Logo resmi GPIB"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 40px, 48px"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[#1E40AF] leading-tight font-serif">
                  GPIB
                </h1>
                <p className="text-xs text-gray-500 leading-tight">
                  Gereja Protestan Indonesia di Barat
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav
              className="flex items-center gap-2 sm:gap-4"
              aria-label="Navigasi utama"
            >
              <Link
                href="/peta"
                className="px-3.5 py-2 text-sm font-medium text-[#1E40AF] bg-blue-50 rounded-xl hover:bg-blue-100 active:scale-95 transition-all min-h-[44px] flex items-center"
                aria-current="page"
              >
                <MapPin className="w-4 h-4 mr-1.5 hidden sm:block" />
                Peta Sebaran
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1E40AF] rounded-xl hover:bg-[#1E3A8A] active:scale-95 transition-all min-h-[44px] flex items-center shadow-md shadow-blue-600/20"
              >
                Login Pelayanan
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1">{children}</main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/logo%20GPIB.png"
                    alt="Logo GPIB"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-serif">GPIB</h3>
                  <p className="text-sm text-gray-400">
                    Gereja Protestan Indonesia di Barat
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed max-w-xl mb-6">
                GPIB adalah gereja yang hadir dan melayani di seluruh Indonesia,
                dari Sabang sampai Merauke. Dengan 25 Mupel, 350+ Jemaat Induk,
                dan 500+ Pos Pelkes, kami berkomitmen untuk menjadi terang dan
                garam di tengah masyarakat — terutama di daerah 3T (Terdepan,
                Terluar, Tertinggal) seperti pedalaman Kalimantan, Papua, dan
                Sulawesi Barat.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Church className="w-4 h-4 text-[#F59E0B]" />
                  500+ Pos Pelkes
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  25 Mupel
                </span>
                <span className="flex items-center gap-1.5">
                  <Church className="w-4 h-4 text-[#F59E0B]" />
                  350+ Jemaat
                </span>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">
                Kantor Sinode GPIB
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#F59E0B]" />
                  <span>
                    Jl. Kramat Raya No. 62
                    <br />
                    Jakarta Pusat 10450
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 flex-shrink-0 text-[#F59E0B]" />
                  <span>(021) 3902024</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 flex-shrink-0 text-[#F59E0B]" />
                  <span>sinode@gpib.or.id</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} GPIB. Semua hak dilindungi.
            </p>
            <p className="text-xs text-gray-600 italic font-serif">
              &ldquo;Menjadi Gereja yang Menjawab Panggilan dan Pengutusan&rdquo;
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
