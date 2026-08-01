import { createClient } from "@/lib/supabase/server"
import { PosPelkesList } from "./pos-pelkes-list"

export default async function PosPelkesPage() {
  let posPelkes: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('m_pos_pelkes')
      .select(`
        id_pos,
        nama_pos,
        kategori,
        alamat,
        tgl_berdiri,
        id_induk,
        jemaat_induk:m_jemaat_induk (
          id_induk,
          nama_induk,
          id_mupel,
          mupel:m_mupel (
            id_mupel,
            nama_mupel
          )
        )
      `);
    if (data) posPelkes = data;
  } catch (err) {
    console.error('Offline / network error in PosPelkesPage:', err);
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <PosPelkesList initialData={(posPelkes as any) || []} />
    </div>
  );
}
