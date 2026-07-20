'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LogPastoralListPage() {
  const [filter, setFilter] = useState({
    id_pos: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
  });

  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const supabase = createClient();
      let query = supabase
        .from('t_log_pastoral')
        .select(`
          id_log,
          tgl,
          kegiatan,
          jml_jiwa,
          catatan,
          pos:m_pos_pelkes(nama_pos),
          pendeta:m_pendeta(nama_lengkap)
        `)
        .order('tgl', { ascending: false })
        .limit(50);

      if (filter.id_pos) {
        query = query.eq('id_pos', filter.id_pos);
      }
      if (filter.tanggal_mulai) {
        query = query.gte('tgl', filter.tanggal_mulai);
      }
      if (filter.tanggal_selesai) {
        query = query.lte('tgl', filter.tanggal_selesai);
      }

      const { data, error } = await query;
      if (!error && data) {
        setLogs(data);
      }
      setIsLoading(false);
    };

    fetchLogs();
  }, [filter]);

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-text-high">
              Log Pastoral
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Riwayat kegiatan pelayanan
            </p>
          </div>
          <Link
            href="/dashboard/pastoral/baru"
            className="min-h-[44px] min-w-[44px] bg-brand-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-primary/90 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-surface-elevated rounded-md p-4 shadow-sm border border-border-subtle space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-text-high">
            <Filter className="w-4 h-4" />
            Filter
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filter.id_pos}
              onChange={(e) => setFilter({ ...filter, id_pos: e.target.value })}
              className="min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base text-base focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50"
            >
              <option value="">Semua Pos</option>
              <option value="POS-01">Pos Pelkes Getsemani</option>
              <option value="POS-02">Pos Pelkes Anugerah</option>
            </select>
            <input
              type="date"
              value={filter.tanggal_mulai}
              onChange={(e) =>
                setFilter({ ...filter, tanggal_mulai: e.target.value })
              }
              className="min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base text-base focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50"
            />
            <input
              type="date"
              value={filter.tanggal_selesai}
              onChange={(e) =>
                setFilter({ ...filter, tanggal_selesai: e.target.value })
              }
              className="min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base text-base focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-surface-elevated border border-border-subtle rounded-md p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log: any) => (
              <div
                key={log.id_log}
                className="bg-surface-elevated rounded-md p-4 shadow-sm border border-border-subtle"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-text-high text-base">
                    {log.kegiatan}
                  </h3>
                  <span className="text-xs text-text-muted whitespace-nowrap ml-2">
                    {format(new Date(log.tgl), 'dd MMM yyyy', { locale: id })}
                  </span>
                </div>
                <div className="text-sm text-text-muted space-y-1">
                  <p>📍 {log.pos?.nama_pos || 'Pos tidak diketahui'}</p>
                  <p>👤 {log.pendeta?.nama_lengkap || 'Pendeta tidak diketahui'}</p>
                  {log.jml_jiwa && <p>👥 {log.jml_jiwa} jiwa</p>}
                </div>
                {log.catatan && (
                  <p className="text-sm text-text-muted mt-2 italic bg-surface-base p-2 rounded border border-border-subtle">
                    "{log.catatan}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-muted">Belum ada log pastoral</p>
          </div>
        )}
      </div>
    </div>
  );
}
