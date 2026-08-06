import { MapPin, FileText, Car, Calendar } from 'lucide-react';
import type { JenisAset } from '@/lib/domains/aset/aset.types';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface AsetCardProps {
  aset?: any;
  jenis?: JenisAset;
  // Legacy props
  item?: any;
  onSelect?: any;
}

export function AsetCard({ aset, jenis, item, onSelect }: AsetCardProps) {
  const actualAset = aset || item;
  const actualJenis = jenis || (item?.kategori?.toLowerCase() as JenisAset) || 'tanah';

  const isTanah = actualJenis === 'tanah';
  const isBangunan = actualJenis === 'bangunan';
  const isBergerak = actualJenis === 'bergerak';

  const judul = item?.judul || (
    isTanah ? `Tanah ${actualAset.luas_m2} m²` :
    isBangunan ? actualAset.nama_bangunan :
    isBergerak ? actualAset.jenis_aset : 'Aset Tak Dikenal'
  );

  const subjudul = item?.subjudul || (
    isTanah ? actualAset.status_hukum :
    isBangunan ? actualAset.fungsi :
    isBergerak ? actualAset.merk_tipe : ''
  );

  const Icon = isTanah ? MapPin : isBangunan ? FileText : Car;

  return (
    <div 
      className={`bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-start gap-4 ${onSelect ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={() => onSelect && onSelect(item)}
    >
      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden">
        {/* Placeholder for Photo thumbnail */}
        <Icon className="w-8 h-8 text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{judul}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
            {item?.kondisi || actualAset.kondisi || 'Tidak diketahui'}
          </span>
        </div>
        
        {subjudul && (
          <p className="text-sm text-gray-500 mt-1 truncate">{subjudul}</p>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          {(actualAset.latitude && actualAset.longitude) ? (
            <div className="flex items-center gap-1 text-green-600">
              <MapPin className="w-3 h-3" />
              <span>GPS Tersimpan</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-600">
              <MapPin className="w-3 h-3" />
              <span>GPS Belum Diset</span>
            </div>
          )}

          {(actualAset.created_at || item?.tahun) && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{actualAset.created_at ? formatDistanceToNow(new Date(actualAset.created_at), { addSuffix: true, locale: id }) : `Thn ${item.tahun}`}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
