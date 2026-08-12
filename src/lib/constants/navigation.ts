import { 
  Home, Map,
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
  href?: string;
  actionId?: string; // used for Action Sheets
  color: string; // Hex color untuk icon chip
}

export interface SuperMenuGroupConfig {
  title: string;
  items: SuperMenuItemConfig[];
}

// ===== NAV LANGSUNG (1 tap = pindah halaman) =====
export const DIRECT_NAV_ITEMS: NavItemConfig[] = [
  { icon: Home,          label: 'Beranda',       href: '/dashboard',  order: 1 },
  { icon: Church,        label: 'Organisasi',    href: '/org',        order: 2 },
  { icon: ClipboardList, label: 'Quick Actions', href: '#',           order: 3 }, // Exact Center!
  { icon: Users,         label: 'SDM',           href: '/people',     order: 4 },
  { icon: Settings,      label: 'Akun',           href: '/settings',   order: 5 },
];

// ===== SUPER BUTTON MENU (muncul di Bottom Sheet) =====
export const SUPER_MENU_GROUPS: SuperMenuGroupConfig[] = [
  {
    title: 'Input Cepat',
    items: [
      { icon: ClipboardList, label: 'Log Pastoral',      actionId: 'pastoral',               color: '#3B82F6' }, // blue-500
      { icon: Camera,        label: 'Foto Aset',         actionId: 'aset',                   color: '#10B981' }, // emerald-500
      { icon: HandHelping,   label: 'Pengajuan Bantuan', actionId: 'bantuan',                color: '#F59E0B' }, // amber-500
    ],
  },
  {
    title: 'Proyeksi & Lensa Analitis',
    items: [
      { icon: HandHelping,   label: 'Antrean Bantuan',   href: '/projections/aid-queue',     color: '#F59E0B' }, // amber-500
      { icon: Map,           label: 'Peta Spasial',      href: '/projections/territory-map', color: '#3B82F6' }, // blue-500
      { icon: Building2,     label: 'Intelijen Aset',    href: '/projections/asset-intel',    color: '#8B5CF6' }, // violet-500
    ],
  },
  {
    title: 'Data Pelayanan',
    items: [
      { icon: Users,         label: 'Data Pelayan',      href: '/people',                    color: '#8B5CF6' }, // violet-500
      { icon: MapPin,        label: 'Pos Pelkes Baru',   actionId: 'pos_baru',               color: '#EF4444' }, // red-500
      { icon: Package,       label: 'Demografi',         href: '/analytics',                 color: '#06B6D4' }, // cyan-500
      { icon: Church,        label: 'Jadwal Ibadah',     href: '/org',                       color: '#EC4899' }, // pink-500
    ],
  },
];

// ===== NAVIGATION GROUPS FOR LEGACY/DRAWER COMPATIBILITY =====
export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    title: 'Pelayanan Utama',
    items: [
      { icon: Home, label: 'Dashboard', href: '/dashboard', description: 'Ringkasan & statistik pelayanan' },
      { icon: Map, label: 'Pos Pelkes', href: '/org', description: 'Daftar & peta pos pelkes' },
      { icon: Building2, label: 'Hierarki GPIB', href: '/org', description: 'Mupel & Jemaat Induk' },
    ],
  },
  {
    title: 'SDM & Pastoral',
    items: [
      { icon: Users, label: 'Pelayan & Presbiter', href: '/people', description: 'Daftar pelayan pelayanan' },
      { icon: Activity, label: 'Log Pastoral', href: '/dashboard/aktivitas', description: 'Pencatatan kegiatan pastoral' },
    ],
  },
  {
    title: 'Pengaturan & Bantuan',
    items: [
      { icon: Settings, label: 'Pengaturan', href: '/settings/profile', description: 'Profil & akun pengguna' },
      { icon: HelpCircle, label: 'Bantuan', href: '/settings', description: 'Pusat bantuan & sistem' },
    ],
  },
];
