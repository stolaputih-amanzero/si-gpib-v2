'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { AuditLog } from '@/lib/domains/pendeta/pendeta.types';
import { Badge } from '@/components/ui/badge';

interface AuditSectionProps {
  data: AuditLog[];
}

export function AuditSection({ data }: AuditSectionProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Belum ada log aktivitas.
      </p>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
      {data.map((log) => (
        <div key={log.id} className="p-3 bg-gray-50 rounded-lg border text-sm">
          <div className="flex justify-between items-start gap-2 mb-1">
            <p className="font-medium text-gray-900">{log.aksi}</p>
            <span className="text-xs text-gray-500 shrink-0">
              {format(new Date(log.created_at), 'd MMM HH:mm', { locale: id })}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="text-[10px] uppercase text-gray-500">
              {log.target_table}
            </Badge>
            <span className="text-xs text-gray-500 font-mono">{log.target_id.slice(0, 8)}...</span>
          </div>
        </div>
      ))}
    </div>
  );
}
