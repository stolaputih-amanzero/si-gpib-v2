import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

interface LogData {
  id_log: string;
  tgl: string;
  kegiatan: string;
  pos_pelkes: { nama_pos: string } | null;
  pendeta: { nama_lengkap: string } | null;
}

export function RecentActivity({ logs }: { logs: LogData[] }) {
  return (
    <Card className="border-border-subtle shadow-soft bg-surface-elevated flex flex-col h-full">
      <CardHeader className="pb-2 border-b border-border-subtle/50 mb-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg text-text-high">
          <Activity className="w-5 h-5 text-brand-primary" />
          Aktivitas Terbaru
        </CardTitle>
        <Link href="/dashboard/pastoral" className="text-xs text-brand-primary hover:underline flex items-center font-medium">
          Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-sm italic py-8">
            Belum ada aktivitas pelayanan
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id_log} className="flex gap-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                  <div className="w-px h-full bg-border-strong mt-1"></div>
                </div>
                <div className="pb-2">
                  <p className="text-sm font-semibold text-text-high leading-tight">{log.kegiatan}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {log.pos_pelkes?.nama_pos || 'Pos tidak diketahui'}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-text-muted bg-surface-sunken px-2 py-0.5 rounded-sm inline-flex">
                    <User className="w-3 h-3" />
                    {log.pendeta?.nama_lengkap || 'Pendeta'} • {new Date(log.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
