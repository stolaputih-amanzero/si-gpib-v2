import { createClient } from '@/lib/supabase/server'
import MapWrapper from '@/components/maps/MapWrapper'

export const metadata = {
  title: 'Peta Sebaran | SI GPIB',
}

export default async function PetaPage() {
  const supabase = await createClient()
  
  const { data: posPelkes, error } = await supabase
    .from('m_pos_pelkes')
    .select('id_pos, nama_pos, alamat, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  return (
    <div className="w-full h-[calc(100vh-130px)] rounded-xl overflow-hidden shadow-sm border border-gray-200 z-0">
      <MapWrapper posPelkesData={posPelkes || []} />
    </div>
  )
}
