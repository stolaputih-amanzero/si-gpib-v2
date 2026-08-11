import { LegacyUnifiedPersonData as UnifiedPersonData } from '../legacyTypes';
import { Mail, Phone, MapPin, Calendar, CreditCard, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';

export function PersonProfileSection({ personData }: { personData: UnifiedPersonData }) {
  const { bio } = personData;

  const DetailRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-surface-1 border border-border-subtle rounded-xl shadow-2xs">
      <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-text-strong mt-0.5">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-tab-fade pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DetailRow icon={CreditCard} label="NIK" value={bio.nik} />
        <DetailRow icon={CreditCard} label="NIP" value={personData.nip} />
        <DetailRow 
          icon={Calendar} 
          label="Tempat, Tanggal Lahir" 
          value={`${bio.tempat_lahir || '-'}, ${bio.tgl_lahir ? format(new Date(bio.tgl_lahir), 'dd MMMM yyyy', { locale: dateFnsId }) : '-'}`} 
        />
        <DetailRow 
          icon={Activity} 
          label="Golongan Darah" 
          value={bio.gol_darah} 
        />
        <DetailRow icon={Phone} label="Nomor Telepon" value={bio.no_hp} />
        <DetailRow icon={Mail} label="Email" value={bio.email} />
        <div className="md:col-span-2">
          <DetailRow icon={MapPin} label="Alamat Tinggal" value={bio.alamat} />
        </div>
      </div>
      
      {personData.stats && (
        <div className="mt-6 bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text-strong mb-4">Statistik Pelayanan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-surface-sunken rounded-xl">
              <p className="text-2xl font-black text-brand-primary">{personData.stats.total_log || 0}</p>
              <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-wide">Log Pastoral</p>
            </div>
            <div className="text-center p-3 bg-surface-sunken rounded-xl">
              <p className="text-2xl font-black text-brand-primary">{personData.stats.total_jiwa || 0}</p>
              <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-wide">Jiwa Dilayani</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
