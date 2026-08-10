import { UnifiedOrganizationData } from '@/lib/services/organization';
import PosThumbnailMap from '@/components/maps/PosThumbnailMap';
import { MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function OrgProfileSection({ orgData }: { orgData: UnifiedOrganizationData }) {
  const latitude = orgData.profile.lat;
  const longitude = orgData.profile.lng;
  
  return (
    <div className="space-y-4 animate-tab-fade">
      {/* Peta Mini Interaktif */}
      <div className="bg-surface-1 rounded-2xl overflow-hidden shadow-2xs border border-border-subtle relative min-h-[200px]">
        {latitude && longitude ? (
          <PosThumbnailMap 
            latitude={latitude} 
            longitude={longitude} 
            nama_pos={orgData.name} 
            alamat={orgData.profile.address} 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted bg-surface-sunken">
            <MapPin size={32} className="opacity-20 mb-2" />
            <span className="text-sm font-medium">Koordinat tidak tersedia</span>
          </div>
        )}
      </div>

      {/* Informasi Kontak & Alamat */}
      <div className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 mb-3">
          Informasi Profil
        </h3>
        
        <div className="flex items-start gap-3">
          <MapPin size={16} className="text-brand-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-text-muted font-medium">Alamat</p>
            <p className="text-sm font-medium text-text-strong">{orgData.profile.address || 'Belum ada data alamat'}</p>
          </div>
        </div>

        {orgData.profile.created_at && (
          <div className="flex items-start gap-3">
            <Calendar size={16} className="text-brand-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-text-muted font-medium">Tanggal Berdiri / Diresmikan</p>
              <p className="text-sm font-medium text-text-strong">
                {format(new Date(orgData.profile.created_at), 'dd MMMM yyyy', { locale: id })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
