import { MapPin, Users, Church, Globe } from 'lucide-react';
import { getPublicPosPelkes, getMupelList } from '@/app/actions/public';
import { PetaClientShell } from './components/PetaClientShell';

export const metadata = {
  title: 'Peta Sebaran Pos Pelkes GPIB',
  description:
    'Temukan 500+ Pos Pelkes GPIB di seluruh Indonesia. Dari Sabang sampai Merauke, dari kota besar hingga pelosok Kalimantan dan Papua.',
};

export default async function PetaSebaranPage() {
  const [posPelkesList, mupelList] = await Promise.all([
    getPublicPosPelkes(),
    getMupelList(),
  ]);

  // Statistik
  const totalPos = posPelkesList.length;
  const posWithGps = posPelkesList.filter(
    (p) => p.latitude !== null && p.longitude !== null
  ).length;
  const totalJemaat = mupelList.reduce((s, m) => s + m.total_jemaat, 0);

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#172554] text-white py-14 sm:py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-[#F59E0B] blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
              <Globe className="w-4 h-4 text-[#F59E0B]" />
              Portal Publik GPIB
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-serif leading-tight">
              Peta Sebaran Pos Pelkes GPIB
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Menjangkau dari Sabang sampai Merauke — hadir di daerah 3T untuk
              menjadi terang dan garam bagi Indonesia.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F59E0B]">
                {totalPos}
              </div>
              <div className="text-xs sm:text-sm text-blue-200 mt-1">
                Pos Pelkes
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F59E0B]">
                {totalJemaat}
              </div>
              <div className="text-xs sm:text-sm text-blue-200 mt-1">
                Jemaat Induk
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F59E0B]">
                {mupelList.length}
              </div>
              <div className="text-xs sm:text-sm text-blue-200 mt-1">Mupel</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Filter bar & Map container di-render oleh PetaClientShell */}
          <PetaClientShell
            posPelkesList={posPelkesList}
            mupelList={mupelList}
          />
        </div>

        {/* GPS Coverage info */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <MapPin className="w-4 h-4 inline mr-1 text-[#1E40AF]" />
          {posWithGps} dari {totalPos} Pos Pelkes sudah memiliki koordinat GPS
        </p>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 sm:p-12 border border-blue-100 dark:border-gray-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 font-serif">
              Tentang Pelayanan GPIB di Pelosok Negeri
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              GPIB hadir menjawab panggilan dan pengutusan Tuhan di seluruh
              Indonesia. Dari gereja-gereja di kota besar Jakarta hingga Pos
              Pelkes di pedalaman Kalimantan Timur seperti{' '}
              <strong className="text-[#1E40AF]">Long Hubung</strong>, dari
              pesisir Bangka Belitung hingga pegunungan Papua — kami percaya
              bahwa setiap jiwa berharga di mata Tuhan.
            </p>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Setiap Pos Pelkes adalah bukti nyata bahwa Injil tidak mengenal
              batas geografis. Para pendeta kami melayani dengan penuh
              dedikasi, bahkan di daerah dengan akses terbatas dan sinyal yang
              minim.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-[#1E40AF]" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Jangkauan Luas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  25 Mupel mencakup seluruh Indonesia bagian barat dan tengah
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Pelayanan Holistik
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Melayani kebutuhan rohani, sosial, dan pendidikan masyarakat
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Church className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Daerah 3T
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hadir di Terdepan, Terluar, dan Tertinggal — Long Hubung,
                  Apau Kayan, dan banyak lagi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
