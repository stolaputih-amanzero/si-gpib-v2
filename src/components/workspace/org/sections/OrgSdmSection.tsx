import { LegacyUnifiedOrganizationData } from '../legacyTypes';
import { User, Shield } from 'lucide-react';
import Link from 'next/link';

export function OrgSdmSection({ orgData }: { orgData: LegacyUnifiedOrganizationData }) {
  const sdmList = orgData.sdm_list || [];
  
  if (sdmList.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-subtle rounded-2xl">
        <User size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-medium text-text-strong">Belum ada data SDM</h3>
        <p className="text-sm text-text-muted mt-1">Daftar pelayan, pendeta, dan relawan akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-tab-fade">
      <div className="bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs divide-y divide-border-subtle">
        {sdmList.map((person) => {
          const isPendeta = person.role.toLowerCase().includes('pendeta') || person.role.toLowerCase().includes('kmj');
          
          const Content = (
            <div className="flex items-center p-4 hover:bg-surface-sunken transition-colors">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                {person.avatar_url ? (
                  <img src={person.avatar_url} alt={person.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="font-bold text-sm text-text-strong flex items-center gap-1.5">
                  {person.name}
                  {(person.is_kmj || person.is_pj) && (
                    <Shield size={14} className="text-amber-500" />
                  )}
                </p>
                <p className="text-xs text-text-muted">{person.role}</p>
              </div>
            </div>
          );

          if (isPendeta) {
            return (
              <Link key={person.id} href={`/dashboard/people/${encodeURIComponent(person.id)}`} className="block">
                {Content}
              </Link>
            );
          }

          return <div key={person.id}>{Content}</div>;
        })}
      </div>
    </div>
  );
}
