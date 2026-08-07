'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { BiometricDevice } from '@/lib/domains/pendeta/pendeta.types';
import { ShieldCheck, MonitorSmartphone } from 'lucide-react';

interface BiometricSectionProps {
  data: BiometricDevice[];
}

export function BiometricSection({ data }: BiometricSectionProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Belum ada perangkat biometrik yang didaftarkan.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((device) => (
        <div key={device.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              {device.device_type.toLowerCase().includes('phone') ? (
                <MonitorSmartphone className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-green-900">{device.display_name}</p>
              <p className="text-xs text-green-700">
                Ditambahkan: {format(new Date(device.created_at), 'd MMM yyyy', { locale: id })}
              </p>
              {device.last_used_at && (
                <p className="text-xs text-green-600 mt-0.5">
                  Terakhir dipakai: {format(new Date(device.last_used_at), 'd MMM yyyy HH:mm', { locale: id })}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
