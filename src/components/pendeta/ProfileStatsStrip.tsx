'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, Users, MapPin, CalendarDays, Clock } from 'lucide-react';

interface ProfileStatsStripProps {
  stats: {
    total_log: number;
    total_jiwa: number;
    pos_aktif: number;
    log_bulan_ini: number;
    lama_melayani_bulan: number;
  };
}

export function ProfileStatsStrip({ stats }: ProfileStatsStripProps) {
  const statItems = [
    { label: 'Giat Pastoral', value: stats.total_log, icon: Activity, color: 'text-blue-500' },
    { label: 'Jiwa Dilayani', value: stats.total_jiwa, icon: Users, color: 'text-green-500' },
    { label: 'Pos Aktif', value: stats.pos_aktif, icon: MapPin, color: 'text-purple-500' },
    { label: 'Giat Bln Ini', value: stats.log_bulan_ini, icon: CalendarDays, color: 'text-orange-500' },
    { label: 'Bulan Melayani', value: stats.lama_melayani_bulan, icon: Clock, color: 'text-teal-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="border-none shadow-sm bg-white">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-full bg-gray-50 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
