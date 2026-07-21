import { createClient } from "@/lib/supabase/server"
import { PosPelkesList } from "./pos-pelkes-list"
import { HierarkiNavTabs } from "@/components/hierarki/HierarkiNavTabs"

export default async function PosPelkesPage() {
  const supabase = await createClient()
  const { data: posPelkes } = await supabase
    .from('m_pos_pelkes')
    .select('id_pos, nama_pos, alamat, tgl_berdiri')
    // No limit for now so client-side search works correctly on all data

  return (
    <div className="p-4 space-y-6">
      {/* Unified Hierarki Navigation Tabs for Mobile */}
      <HierarkiNavTabs />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-primary">Pos Pelkes & Bajem</h1>
      </div>
      
      <PosPelkesList initialData={posPelkes || []} />
    </div>
  )
}
