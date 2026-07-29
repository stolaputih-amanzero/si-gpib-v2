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
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-primary">Pos Pelkes & Bajem</h1>
      </div>
      
      <PosPelkesList initialData={(posPelkes as any) || []} />
    </div>
  )
}
