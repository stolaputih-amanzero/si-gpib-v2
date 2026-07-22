import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditPosPelkesForm from './edit-form';

async function getPosDetail(id_pos: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('m_pos_pelkes')
    .select('id_pos, id_induk, nama_pos, kategori, alamat, latitude, longitude, keterangan, foto_url')
    .eq('id_pos', id_pos)
    .single();

  return data;
}

export default async function EditPosPelkesPage({ params }: { params: Promise<{ id_pos: string }> }) {
  const { id_pos } = await params;
  const pos = await getPosDetail(id_pos);

  if (!pos) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <EditPosPelkesForm pos={pos} />
    </div>
  );
}
