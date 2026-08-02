export type ViewerContextRole = 'super_user' | 'superadmin' | 'admin_mupel' | 'admin_jemaat' | 'kmj' | 'pj_pos' | 'pendeta' | 'pelayan' | 'relawan' | 'guest';

export interface ViewerContext {
  viewerId?: string | null;
  profileId: string;
  isSelf: boolean;
  role?: string | null;
  canViewPrivate: boolean;
  canViewSupervision: boolean;
}

export function calculateViewerContext(
  viewerId: string | null | undefined,
  profileId: string,
  viewerRole: string | null | undefined,
  viewerMupelId?: string | null,
  targetMupelId?: string | null
): ViewerContext {
  const isSelf = Boolean(viewerId && viewerId === profileId);
  const normalizedRole = (viewerRole || '').toLowerCase().trim();

  const isSuperUser =
    ['superuser', 'superadmin', 'sinode', 'admin'].includes(normalizedRole) ||
    normalizedRole.includes('super');

  const isSameMupel = Boolean(viewerMupelId && targetMupelId && viewerMupelId === targetMupelId);

  const canViewPrivate = isSelf || isSuperUser;
  const canViewSupervision = isSelf || isSuperUser || (normalizedRole === 'admin_mupel' && isSameMupel);

  return {
    viewerId,
    profileId,
    isSelf,
    role: viewerRole,
    canViewPrivate,
    canViewSupervision,
  };
}
