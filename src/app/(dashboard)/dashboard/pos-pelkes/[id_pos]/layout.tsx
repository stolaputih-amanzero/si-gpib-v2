import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }: { params: Promise<{ id_pos: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const id_pos = resolvedParams.id_pos;
  const supabase = await createClient();

  const { data: pos } = await supabase
    .from('m_pos_pelkes')
    .select(`
      id_pos, nama_pos, kategori, alamat, foto_url,
      jemaat_induk:m_jemaat_induk(nama_induk, mupel:m_mupel(nama_mupel))
    `)
    .eq('id_pos', id_pos)
    .maybeSingle();

  if (!pos) {
    return {
      title: 'Pos Pelkes GPIB',
      description: 'Detail Profil Pos Pelkes / Bajem GPIB',
    };
  }

  const isBajem = pos.kategori === 'Bajem' || pos.nama_pos.toLowerCase().includes('bajem');
  const catLabel = isBajem ? 'Bakal Jemaat (Bajem)' : 'Pos Pelkes';
  const jemaatNama = (pos as any).jemaat_induk?.nama_induk || 'GPIB';
  const mupelNama = (pos as any).jemaat_induk?.mupel?.nama_mupel || 'GPIB';

  const title = `${pos.nama_pos} (${catLabel})`;
  const description = `${catLabel} GPIB di bawah bimbingan ${jemaatNama} - ${mupelNama}. Alamat: ${pos.alamat || '-'}`;

  const images = pos.foto_url
    ? [
        {
          url: pos.foto_url,
          width: 1200,
          height: 630,
          alt: `Foto Profil ${pos.nama_pos}`,
        },
      ]
    : [];

  return {
    title,
    description,
    openGraph: {
      title: `*${pos.nama_pos.toUpperCase()}* (${catLabel})`,
      description,
      type: 'article',
      images,
      siteName: 'Sistem Informasi GPIB',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: pos.foto_url ? [pos.foto_url] : [],
    },
  };
}

export default function PosDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
