import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import { JadwalClient } from '@/components/jadwal/JadwalClient';

export const metadata = {
  title: 'Jadwal Ibadah & Pelayanan | SI GPIB',
  description: 'Manajemen Jadwal Ibadah Hari Minggu, Pelkat, dan Sektor / Rumah Tangga',
};

export const instant = false;

export default async function JadwalPage() {
  const context = await getServerContext();

  if (!context || context.status === 'UNAUTHORIZED') {
    redirect('/login');
  }

  return <JadwalClient />;
}
