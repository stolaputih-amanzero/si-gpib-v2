import { FilterChip } from '@/components/list/FilterChips';

/**
 * Builds role-aware scope chips according to SI GPIB v2.2 specifications.
 * 
 * - Super Users / Sinode: "📍 Wilayah Saya" + "🌐 Semua Wilayah"
 * - Admin Mupel: "📍 Wilayah Saya" + "🌐 Mupel Saya"
 * - KMJ / PJ / User: "📍 Wilayah Saya" only
 */
export function buildScopeChips(
  role?: string | null,
  counts?: { hierarchyCount?: number; allCount?: number }
): FilterChip[] {
  const normalizedRole = (role || '').toLowerCase();

  const chips: FilterChip[] = [
    {
      key: 'hierarchy',
      label: '📍 Wilayah Saya',
      count: counts?.hierarchyCount,
    },
  ];

  if (
    normalizedRole === 'super_user' ||
    normalizedRole === 'superadmin' ||
    normalizedRole === 'sinode' ||
    normalizedRole === 'admin_sinode'
  ) {
    chips.push({
      key: 'all',
      label: '🌐 Semua Wilayah',
      count: counts?.allCount,
    });
  } else if (
    normalizedRole === 'admin_mupel' ||
    normalizedRole === 'mupel'
  ) {
    chips.push({
      key: 'mupel',
      label: '🌐 Mupel Saya',
      count: counts?.allCount,
    });
  }

  return chips;
}
