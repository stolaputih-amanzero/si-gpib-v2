'use client';

import Link from 'next/link';
import { UserPlus, UserCheck, HeartHandshake, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SDM_MODULES = [
  {
    title: 'Manajemen Pendeta',
    description: 'Data pendeta organik, non-organik, KMJ, dan penanggung jawab Pos Pelkes.',
    href: '/sdm/pendeta',
    icon: UserPlus,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Pelayan Pos Pelkes',
    description: 'Pengurus pos, penatua, diaken, dan presbiter pelayan di lapangan.',
    href: '/sdm/pelayan',
    icon: UserCheck,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Relawan Pelayanan',
    description: 'Pendataan relawan medis, pemuda, dan sukarelawan pos pelayanan.',
    href: '/sdm/relawan',
    icon: HeartHandshake,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Jadwal Ibadah',
    description: 'Penjadwalan ibadah rutin pos, kategorial (pelkat), dan sektor.',
    href: '/sdm/jadwal',
    icon: Calendar,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
];

export default function SDMHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
          SDM & Pelayanan GPIB
        </h1>
        <p className="text-xs md:text-sm text-text-muted mt-1">
          Kelola sumber daya manusia, pendeta, pelayan pos, relawan, dan agenda ibadah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SDM_MODULES.map((module) => {
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
