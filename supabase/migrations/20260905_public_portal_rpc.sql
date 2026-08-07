-- Migration: 20260905_public_portal_rpc.sql
-- Description: RPC for Public Portal and Geo Index

-- 1. Index for geospatial optimization
CREATE INDEX IF NOT EXISTS idx_pos_pelkes_geo ON m_pos_pelkes(latitude, longitude);

-- 2. Drop existing function if exists
DROP FUNCTION IF EXISTS get_public_pos_pelkes();

-- 3. Create function
CREATE OR REPLACE FUNCTION get_public_pos_pelkes()
RETURNS TABLE (
  id_pos VARCHAR,
  nama_pos VARCHAR,
  alamat TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  kategori VARCHAR,
  jumlah_kk INT,
  jumlah_jiwa INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hard-check: hanya return Pos dengan koordinat valid
  -- (mencegah return data draft/legacy tanpa lokasi)
  RETURN QUERY
  SELECT 
    p.id_pos,
    p.nama_pos,
    p.alamat,
    p.latitude,
    p.longitude,
    p.kategori,
    COALESCE(p.jumlah_kk, 0),
    COALESCE(p.jumlah_jiwa, 0)
  FROM m_pos_pelkes p
  WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    -- NOTE: p.status = 'Aktif' di-skip karena kolom status tidak ada di m_pos_pelkes.
  ORDER BY p.nama_pos;
END;
$$;

-- 4. Grants
GRANT EXECUTE ON FUNCTION get_public_pos_pelkes() TO anon, authenticated;
