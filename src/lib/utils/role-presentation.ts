/**
 * Surface Normalization Gate V1 — Role Presentation Policy (F2.1)
 * Transforms raw technical database enum roles (users.role Is Not Ontological Truth)
 * into human-centric presentation labels based on role & scope.
 */
export function getHumanReadableRoleLabel(role?: string | null): string {
  if (!role) return 'Pengguna SI GPIB';

  const roleLower = role.toLowerCase().trim();

  switch (roleLower) {
    case 'super_user':
    case 'superuser':
      return 'Super User';
    case 'admin':
      return 'Admin Sistem';
    case 'kmj':
      return 'Ketua Majelis Jemaat';
    case 'pj':
      return 'Pendeta Jemaat';
    case 'pendeta':
      return 'Pendeta Organik';
    case 'pelayan':
      return 'Pelayan Pelkes';
    case 'relawan':
      return 'Relawan Pelayanan';
    case 'read_only':
      return 'Akses Lihat Saja';
    default:
      return role.toUpperCase();
  }
}
