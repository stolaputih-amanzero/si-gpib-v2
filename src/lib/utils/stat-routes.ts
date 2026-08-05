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

  // 1. Mupel: Go directly to user's assigned Mupel detail, or to Hierarki Mupel list
  const mupelHref = mupelId
    ? `/mupel/${encodeURIComponent(mupelId)}`
    : '/hierarki';

  // 2. Jemaat Induk: Go directly to user's assigned Jemaat detail, or Mupel jemaat tab, or Hierarki Jemaat list
  const jemaatHref = indukId
    ? `/jemaat/${encodeURIComponent(indukId)}`
    : mupelId
      ? `/mupel/${encodeURIComponent(mupelId)}?tab=jemaat`
      : '/hierarki?view=jemaat';

  // 3. Bajem: Filter strictly by Bajem in Pos Pelkes list
  // Role scoping is handled natively by /dashboard/pos-pelkes page server code
  const bajemHref = '/dashboard/pos-pelkes?filter=bajem';

  // 4. Pos Pelkes: Go directly to user's Pos detail, or filter strictly by Pos Pelkes in Pos Pelkes list
  // Role scoping is handled natively by /dashboard/pos-pelkes page server code
  const posHref = posId
    ? `/dashboard/pos-pelkes/${encodeURIComponent(posId)}`
    : '/dashboard/pos-pelkes?filter=pos_pelkes';

  // 5. Total Jiwa: Demografi dashboard
  const jiwaHref = '/demografi';

  // 6. Giat Pastoral: Laporan Pastoral
  const giatHref = '/laporan/pastoral';

  return {
    mupel: mupelHref,
    jemaat: jemaatHref,
    bajem: bajemHref,
    pos: posHref,
    jiwa: jiwaHref,
    giat: giatHref,
  };
}
