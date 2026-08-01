'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Edit3, Calendar, Activity, Box, Users, ShieldAlert } from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';

export interface ContextualFabProps {
  id_pos: string;
  activeTab: string;
  canWrite?: boolean;
}

export function ContextualFab({ id_pos, activeTab, canWrite = true }: ContextualFabProps) {
  if (!canWrite) return null;

  let config: { label: string; href: string; icon: React.ReactNode } | null = null;

  switch (activeTab) {
    case 'profil':
      config = {
        label: 'Edit Pos',
        href: `/dashboard/pos-pelkes/${encodeURIComponent(id_pos)}/edit`,
        icon: <Edit3 size={18} />,
      };
      break;
    case 'jadwal':
      config = {
        label: 'Tambah Jadwal',
        href: `/sdm/jadwal?pos=${encodeURIComponent(id_pos)}&action=new`,
        icon: <Calendar size={18} />,
      };
      break;
    case 'log':
    case 'pastoral':
      config = {
        label: 'Tambah Log',
        href: `/laporan/pastoral/baru?pos=${encodeURIComponent(id_pos)}`,
        icon: <Activity size={18} />,
      };
      break;
    case 'aset':
      config = {
        label: 'Tambah Aset',
        href: `/laporan/aset/baru?pos=${encodeURIComponent(id_pos)}`,
        icon: <Box size={18} />,
      };
      break;
    case 'demografi':
      config = {
        label: 'Update Demografi',
        href: `/laporan/demografi`,
        icon: <Users size={18} />,
      };
      break;
    case 'pendeta':
      config = {
        label: 'Tambah Pelayan',
        href: `/sdm/pelayan/baru?pos=${encodeURIComponent(id_pos)}`,
        icon: <Plus size={18} />,
      };
      break;
    case 'wilayah':
      config = {
        label: 'Input Wilayah',
        href: `/laporan/kerawanan`,
        icon: <ShieldAlert size={18} />,
      };
      break;
    default:
      config = {
        label: 'Edit Pos',
        href: `/dashboard/pos-pelkes/${encodeURIComponent(id_pos)}/edit`,
        icon: <Edit3 size={18} />,
      };
  }

  if (!config) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
      <Link
        key={`${activeTab}-${config.label}`}
        href={config.href}
        onClick={() => haptic.medium()}
        className="flex items-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary-dark transition-all active:scale-95 animate-pop motion-reduce:animate-none font-extrabold text-xs tracking-tight border border-white/20 min-h-[48px]"
      >
        {config.icon}
        <span>{config.label}</span>
      </Link>
    </div>
  );
}

export default ContextualFab;
