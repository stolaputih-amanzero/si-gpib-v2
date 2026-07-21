import {
  Home,
  Map,
  FileText,
  User,
  Database,
  Activity,
  Users,
  Box,
  HandHeart,
  UserCheck,
  HeartHandshake,
  Calendar,
  UserPlus,
  ShieldAlert,
  GitFork,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    title: 'Utama',
    items: [
      { label: 'Beranda', href: '/dashboard', icon: Home, description: 'Ringkasan & statistik utama' },
      { label: 'Analitik & KPI', href: '/analitik', icon: BarChart3, badge: 'Baru', description: 'Metrik & performa pos' },
      { label: 'Peta Sebaran', href: '/dashboard/peta', icon: Map, description: 'Peta lokasi pos pelkes' },
      { label: 'Hierarki GPIB', href: '/hierarki', icon: GitFork, description: 'Struktur MUPEL & Jemaat' },
    ],
  },
  {
    title: 'Pelayanan Pos',
    items: [
      { label: 'Pos Pelkes & Bajem', href: '/dashboard/pos-pelkes', icon: Database, description: 'Daftar pos pelayanan' },
      { label: 'Log Pastoral', href: '/dashboard/pastoral', icon: FileText, description: 'Catatan kunjungan pastoral' },
      { label: 'Kerawanan & Potensi', href: '/wilayah', icon: ShieldAlert, description: 'Analisis risiko & wilayah' },
      { label: 'Demografi Pelkat', href: '/demografi', icon: Users, description: 'Data jemaat & kategorial' },
      { label: 'Jadwal Ibadah', href: '/jadwal', icon: Calendar, description: 'Agenda & kegiatan ibadah' },
      { label: 'Laporan Pos', href: '/dashboard/laporan', icon: FileText, description: 'Rekapitulasi & berkas laporan' },
    ],
  },
  {
    title: 'Sumber Daya & Aset',
    items: [
      { label: 'Pengajuan Bantuan', href: '/bantuan', icon: HandHeart, description: 'Permohonan dana & logistik' },
      { label: 'Inventaris Aset', href: '/aset', icon: Box, description: 'Fasilitas & barang pos' },
      { label: 'Manajemen Pendeta', href: '/pendeta', icon: UserPlus, description: 'Data & penugasan pendeta' },
      { label: 'Pelayan Pos', href: '/pelayan', icon: UserCheck, description: 'Pengurus & presbiter' },
      { label: 'Relawan', href: '/relawan', icon: HeartHandshake, description: 'Mitra & sukarelawan pos' },
    ],
  },
  {
    title: 'Sistem & Akun',
    items: [
      { label: 'Aktivitas Log', href: '/dashboard/aktivitas', icon: Activity, description: 'Riwayat aktivitas pengguna' },
      { label: 'Profil Saya', href: '/dashboard/profil', icon: User, description: 'Pengaturan akun & sandi' },
    ],
  },
];
