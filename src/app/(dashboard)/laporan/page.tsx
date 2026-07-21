'use client';

import Link from 'next/link';
import { FileText, Users, Box, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const LAPORAN_MODULES = [
  {
    title: 'Log Pastoral',
    description: 'Catatan kunjungan pelayanan, konseling, dan perkunjungan jemaat Pos Pelkes.',
    href: '/laporan/pastoral',
    icon: FileText,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Demografi Pelkat',
    description: 'Rekapitulasi data jemaat, kategorial (Pelkat), dan kepala keluarga per pos.',
    href: '/laporan/demografi',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Inventaris Aset',
    description: 'Inventarisasi aset tanah, bangunan gereja/pastori, dan barang bergerak GPIB.',
    href: '/laporan/aset',
    icon: Box,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Kerawanan Wilayah',
    description: 'Pemetaan tingkat risiko sosial, alam, tantangan gerejawi, dan mitigasi.',
    href: '/laporan/kerawanan',
    icon: ShieldAlert,
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  {
    title: 'Potensi Wilayah',
    description: 'Pemetaan peluang pertumbuhan, kemitraan, ekonomi, dan keunggulan pos.',
    href: '/laporan/potensi',
    icon: Sparkles,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
];

export default function LaporanHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
          Data & Laporan Pelayanan
        </h1>
        <p className="text-xs md:text-sm text-text-muted mt-1">
          Rekapitulasi data pastoral, demografi jemaat, inventaris aset, dan analisis wilayah pos pelkes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LAPORAN_MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href} className="group">
              <Card className="h-full hover:border-brand-primary/40 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${module.color}`}>
                      <Icon className="w-6 h-6 stroke-[2.2px]" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
