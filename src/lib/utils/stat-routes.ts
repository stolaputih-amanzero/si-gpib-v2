export interface StatRouteScopeParams {
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
}

/**
 * Single source of truth for Stat Card click target routes.
 * Fully respects user role scope (PJ, KMJ, Admin Mupel, Super User).
 */
export function getStatRoutes(scope?: StatRouteScopeParams) {
  const mupelId = scope?.id_mupel || null;
  const indukId = scope?.id_induk || null;
  const posId = scope?.id_pos || null;

  // 1. Mupel: Go directly to Mupel tab in /org
  const mupelHref = mupelId
    ? `/org/${encodeURIComponent(mupelId)}`
    : '/org?tab=mupel';

  // 2. Jemaat Induk: Go directly to Jemaat tab in /org
  const jemaatHref = indukId
    ? `/org/${encodeURIComponent(indukId)}`
    : '/org?tab=jemaat';

  // 3. Bajem: Filter strictly by Bajem in /org
  const bajemHref = '/org?tab=pos';

  // 4. Pos Pelkes: Go directly to Pos detail in /org
  const posHref = posId
    ? `/org/${encodeURIComponent(posId)}`
    : '/org?tab=pos';

  // 5. Total Jiwa: Analytics dashboard
  const jiwaHref = '/analytics';

  // 6. Giat Pastoral: Dashboard aktivitas
  const giatHref = '/dashboard/aktivitas';

  return {
    mupel: mupelHref,
    jemaat: jemaatHref,
    bajem: bajemHref,
    pos: posHref,
    jiwa: jiwaHref,
    giat: giatHref,
  };
}
