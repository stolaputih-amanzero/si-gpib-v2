-- Migration: Analytics Dashboard RPC Function
-- Returns aggregated stats, monthly growth trends, Mupel distributions, and Pos Pelkes geo-locations.

CREATE OR REPLACE FUNCTION get_analytics_dashboard_data(
  p_id_mupel TEXT DEFAULT NULL,
  p_id_induk TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_pos INT;
  v_pos_growth_month INT;
  v_total_pendeta INT;
  v_pendeta_growth_month INT;
  v_total_jemaat INT;
  v_jemaat_growth_month INT;
  v_total_log_pastoral_month INT;
  v_log_growth_month INT;
  
  v_growth_trends JSONB;
  v_mupel_distribution JSONB;
  v_pos_locations JSONB;
BEGIN
  -- 1. Total Pos Pelkes
  SELECT COUNT(*), COUNT(*) FILTER (WHERE p.created_at >= date_trunc('month', CURRENT_DATE))
  INTO v_total_pos, v_pos_growth_month
  FROM m_pos_pelkes p
  JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR p.id_induk = p_id_induk);

  -- 2. Total Pendeta
  SELECT COUNT(*), COUNT(*) FILTER (WHERE p.created_at >= date_trunc('month', CURRENT_DATE))
  INTO v_total_pendeta, v_pendeta_growth_month
  FROM m_pendeta p
  LEFT JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR p.id_induk = p_id_induk);

  -- 3. Total Jemaat Induk
  SELECT COUNT(*), COUNT(*) FILTER (WHERE j.created_at >= date_trunc('month', CURRENT_DATE))
  INTO v_total_jemaat, v_jemaat_growth_month
  FROM m_jemaat_induk j
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR j.id_induk = p_id_induk);

  -- 4. Total Log Pastoral Bulan Ini
  SELECT COUNT(*), COUNT(*) FILTER (WHERE l.created_at >= date_trunc('month', CURRENT_DATE))
  INTO v_total_log_pastoral_month, v_log_growth_month
  FROM t_log_pastoral l
  JOIN m_pos_pelkes p ON l.id_pos = p.id_pos
  JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR p.id_induk = p_id_induk);

  -- 5. Monthly Growth Trends (Last 6 Months)
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
      date_trunc('month', CURRENT_DATE),
      INTERVAL '1 month'
    )::date AS m
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', to_char(m.m, 'Mon YYYY'),
      'pos_count', (
        SELECT COUNT(*) FROM m_pos_pelkes p
        JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE p.created_at <= (m.m + INTERVAL '1 month' - INTERVAL '1 day')
          AND (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
          AND (p_id_induk IS NULL OR p.id_induk = p_id_induk)
      ),
      'pastoral_count', (
        SELECT COUNT(*) FROM t_log_pastoral l
        JOIN m_pos_pelkes p ON l.id_pos = p.id_pos
        JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE l.tgl >= m.m AND l.tgl < (m.m + INTERVAL '1 month')
          AND (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
          AND (p_id_induk IS NULL OR p.id_induk = p_id_induk)
      )
    )
  ) INTO v_growth_trends
  FROM months m;

  -- 6. Mupel Distribution
  WITH mupel_stats AS (
    SELECT
      m.nama_mupel,
      COUNT(DISTINCT p.id_pos) AS pos_count,
      COUNT(DISTINCT pdt.id_pendeta) AS pendeta_count
    FROM m_mupel m
    LEFT JOIN m_jemaat_induk j ON m.id_mupel = j.id_mupel
    LEFT JOIN m_pos_pelkes p ON j.id_induk = p.id_induk
    LEFT JOIN m_pendeta pdt ON j.id_induk = pdt.id_induk
    WHERE (p_id_mupel IS NULL OR m.id_mupel = p_id_mupel)
      AND (p_id_induk IS NULL OR j.id_induk = p_id_induk)
    GROUP BY m.id_mupel, m.nama_mupel
    ORDER BY m.nama_mupel
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'nama_mupel', nama_mupel,
      'pos_count', pos_count,
      'pendeta_count', pendeta_count
    )
  ) INTO v_mupel_distribution
  FROM mupel_stats;

  -- 7. Pos Pelkes Locations (with GPS lat/lng)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id_pos', p.id_pos,
      'nama_pos', p.nama_pos,
      'latitude', COALESCE(p.latitude, -6.2088),
      'longitude', COALESCE(p.longitude, 106.8456),
      'nama_jemaat', j.nama_induk,
      'nama_mupel', m.nama_mupel
    )
  ) INTO v_pos_locations
  FROM m_pos_pelkes p
  JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
  JOIN m_mupel m ON j.id_mupel = m.id_mupel
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR p.id_induk = p_id_induk);

  RETURN jsonb_build_object(
    'stats', jsonb_build_object(
      'total_pos', COALESCE(v_total_pos, 0),
      'pos_growth_month', COALESCE(v_pos_growth_month, 0),
      'total_pendeta', COALESCE(v_total_pendeta, 0),
      'pendeta_growth_month', COALESCE(v_pendeta_growth_month, 0),
      'total_jemaat', COALESCE(v_total_jemaat, 0),
      'jemaat_growth_month', COALESCE(v_jemaat_growth_month, 0),
      'total_log_pastoral_month', COALESCE(v_total_log_pastoral_month, 0),
      'log_growth_month', COALESCE(v_log_growth_month, 0)
    ),
    'growth_trends', COALESCE(v_growth_trends, '[]'::jsonb),
    'mupel_distribution', COALESCE(v_mupel_distribution, '[]'::jsonb),
    'pos_locations', COALESCE(v_pos_locations, '[]'::jsonb)
  );
END;
$$;
