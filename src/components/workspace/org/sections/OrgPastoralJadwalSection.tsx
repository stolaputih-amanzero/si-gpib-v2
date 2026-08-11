import { LegacyUnifiedOrganizationData } from '../legacyTypes';
import { Calendar, Activity } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function OrgPastoralJadwalSection({ orgData }: { orgData: LegacyUnifiedOrganizationData }) {
  const [activeTab, setActiveTab] = useState<'log' | 'jadwal'>('log');
  
  const logs = orgData.pastoral_logs || [];
  const jadwal = orgData.jadwal_ibadah || [];

  return (
    <div className="space-y-4 animate-tab-fade pb-8">
      {/* Sub Tabs */}
      <div className="flex bg-surface-sunken p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            activeTab === 'log' ? 'bg-surface-1 shadow-sm text-text-strong' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Log Pastoral
        </button>
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            activeTab === 'jadwal' ? 'bg-surface-1 shadow-sm text-text-strong' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Jadwal Ibadah
        </button>
      </div>

      {activeTab === 'log' && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="p-8 text-center bg-surface-1 border border-border-subtle rounded-2xl">
              <Activity size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
              <h3 className="font-medium text-text-strong">Belum ada log pastoral</h3>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                    {log.activity}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar size={12} />
                    {format(new Date(log.date), 'dd MMM yyyy', { locale: id })}
                  </span>
                </div>
                {log.description && <p className="text-sm text-text-strong mb-3 line-clamp-2">{log.description}</p>}
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  {log.pastor_name && <span>Oleh: {log.pastor_name}</span>}
                  {log.attendance != null && <span>{log.attendance} Jiwa</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'jadwal' && (
        <div className="space-y-3">
          {jadwal.length === 0 ? (
            <div className="p-8 text-center bg-surface-1 border border-border-subtle rounded-2xl">
              <Calendar size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
              <h3 className="font-medium text-text-strong">Belum ada jadwal ibadah</h3>
            </div>
          ) : (
            jadwal.map(j => (
              <div key={j.id} className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs flex gap-4">
                <div className="bg-brand-primary/5 text-brand-primary p-3 rounded-xl flex flex-col items-center justify-center shrink-0 w-16 h-16">
                  <span className="font-bold text-sm uppercase">{j.day.substring(0, 3)}</span>
                  <span className="text-xs font-medium mt-1">{j.time.substring(0, 5)}</span>
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-bold text-text-strong">{j.type}</h4>
                  {j.description && <p className="text-sm text-text-muted mt-1">{j.description}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
