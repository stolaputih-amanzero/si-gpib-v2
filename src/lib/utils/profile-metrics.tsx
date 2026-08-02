import { Calendar, MapPin, FileText, Users, Briefcase, Award, Clock, Activity, FileEdit } from 'lucide-react';
import { SummaryMetric } from '@/components/list/SummaryStrip';

export interface ProfileStatsData {
  tahunMelayani?: number;
  posAktif?: number;
  logBulanIni?: number;
  jiwaDilayani?: number;
  keterlibatan?: number;
  kompetensi?: number;
  hariBergabung?: number;
  aktivitasBulanIni?: number;
  draftAktif?: number;
}

export function getProfileMetrics(
  isPendeta: boolean,
  stats: ProfileStatsData = {}
): SummaryMetric[] {
  if (isPendeta) {
    return [
      {
        label: 'Tahun Melayani',
        value: stats.tahunMelayani || 0,
        icon: <Calendar size={16} className="text-brand-primary" />,
      },
      {
        label: 'Pos Aktif',
        value: stats.posAktif || 0,
        icon: <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />,
      },
      {
        label: 'Log Bulan Ini',
        value: stats.logBulanIni || 0,
        icon: <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />,
      },
      {
        label: 'Jiwa Dilayani',
        value: stats.jiwaDilayani || 0,
        icon: <Users size={16} className="text-purple-600 dark:text-purple-400" />,
      },
      {
        label: 'Keterlibatan',
        value: stats.keterlibatan || 0,
        icon: <Briefcase size={16} className="text-amber-600 dark:text-amber-400" />,
      },
      {
        label: 'Kompetensi',
        value: stats.kompetensi || 0,
        icon: <Award size={16} className="text-blue-600 dark:text-blue-400" />,
      },
    ];
  }

  return [
    {
      label: 'Hari Bergabung',
      value: stats.hariBergabung || 0,
      icon: <Clock size={16} className="text-brand-primary" />,
    },
    {
      label: 'Aktivitas Bulan Ini',
      value: stats.aktivitasBulanIni || 0,
      icon: <Activity size={16} className="text-emerald-600 dark:text-emerald-400" />,
    },
    {
      label: 'Draft Aktif',
      value: stats.draftAktif || 0,
      icon: <FileEdit size={16} className="text-blue-600 dark:text-blue-400" />,
    },
  ];
}
