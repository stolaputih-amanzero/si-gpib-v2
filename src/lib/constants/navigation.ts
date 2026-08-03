import { 
  Home, Map, FileText, User,
  Camera, MapPin, Users, 
  ClipboardList, Package, HandHelping, Church, LucideIcon,
  Settings, HelpCircle, Activity, Building2
} from 'lucide-react';

export interface NavItemConfig {
  icon: LucideIcon;
  label: string;
  href: string;
  order: number;
}

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  description?: string;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface SuperMenuItemConfig {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string; // Hex color untuk icon chip
}

export interface SuperMenuGroupConfig {
  title: string;
  items: SuperMenuItemConfig[];
}

// ===== NAV LANGSUNG (1 tap = pindah halaman) =====
export const DIRECT_NAV_ITEMS: NavItemConfig[] = [
  { icon: Home,     label: 'Beranda',    href: '/dashboard',        order: 1 },
  { icon: Map,      label: 'Peta',       href: '/dashboard/peta',   order: 2 },
  // Order 3 adalah Super Button
  { icon: FileText, label: 'Laporan',    href: '/laporan',          order: 4 },
  { icon: User,     label: 'Profil',     href: '/settings/profile', order: 5 },
];

// ===== SUPER BUTTON MENU (muncul di Bottom Sheet) =====
export const SUPER_MENU_GROUPS: SuperMenuGroupConfig[] = [
  {
    title: 'Input Cepat',
    items: [
      { icon: ClipboardList, label: 'Log Pastoral',      href: '/pastoral/new',              color: '#3B82F6' }, // blue-500
      { icon: Camera,        label: 'Foto Aset',         href: '/aset/new',                  color: '#10B981' }, // emerald-500
      { icon: HandHelping,   label: 'Pengajuan Bantuan', href: '/bantuan/new',               color: '#F59E0B' }, // amber-500
    ],
  },
  {
    title: 'Data Pelayanan',
    items: [
      { icon: Users,         label: 'Data Pelayan',      href: '/pelayan',                   color: '#8B5CF6' }, // violet-500
      { icon: MapPin,        label: 'Pos Pelkes Baru',   href: '/dashboard/pos-pelkes/baru', color: '#EF4444' }, // red-500
      { icon: Package,       label: 'Demografi',         href: '/demografi',                 color: '#06B6D4' }, // cyan-500
      { icon: Church,        label: 'Jadwal Ibadah',     href: '/jadwal',                    color: '#EC4899' }, // pink-500
    ],
  },
];

// ===== NAVIGATION GROUPS FOR LEGACY/DRAWER COMPATIBILITY =====
export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    title: 'Pelayanan Utama',
    items: [
      { icon: Home, label: 'Dashboard', href: '/dashboard', description: 'Ringkasan & statistik pelayanan' },
      { icon: Map, label: 'Pos Pelkes', href: '/dashboard/pos-pelkes', description: 'Daftar & peta pos pelkes' },
      { icon: Building2, label: 'Hierarki GPIB', href: '/hierarki', description: 'Mupel & Jemaat Induk' },
    ],
  },
  {
    title: 'SDM & Pastoral',
    items: [
      { icon: Users, label: 'Pelayan & Presbiter', href: '/pelayan', description: 'Daftar pelayan pelayanan' },
      { icon: Activity, label: 'Log Pastoral', href: '/pastoral/new', description: 'Pencatatan kegiatan pastoral' },
    ],
  },
  {
    title: 'Pengaturan & Bantuan',
    items: [
      { icon: Settings, label: 'Pengaturan', href: '/settings/profile', description: 'Profil & akun pengguna' },
      { icon: HelpCircle, label: 'Bantuan', href: '/bantuan', description: 'Pusat bantuan & tiket' },
    ],
  },
];
