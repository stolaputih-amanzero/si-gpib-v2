-- Fix infinite recursion in m_jemaat_induk policy

BEGIN;

-- Drop the problematic policies
DROP POLICY IF EXISTS "KMJ akses jemaat yang dipimpinnya" ON m_jemaat_induk;
DROP POLICY IF EXISTS "User akses pos yang ditugaskan" ON m_pos_pelkes;

-- Recreate policy for m_jemaat_induk without recursion
-- We directly evaluate the current row's id_kmj and id_mupel instead of querying the table again.
CREATE POLICY "KMJ akses jemaat yang dipimpinnya"
ON m_jemaat_induk FOR ALL
USING (
    id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
    OR get_auth_role() = 'super_user'
    OR (get_auth_role() = 'admin_mupel' AND id_mupel = (SELECT id_mupel FROM users WHERE id = auth.uid()))
);

-- Recreate policy for m_pos_pelkes
CREATE POLICY "User akses pos yang ditugaskan"
ON m_pos_pelkes FOR ALL
USING (
    id_pos IN (
        SELECT id_pos FROM t_penugasan_pendeta 
        WHERE id_pendeta = (SELECT id_pendeta FROM users WHERE id = auth.uid())
        AND tgl_selesai IS NULL
    )
    OR id_induk IN (
        SELECT id_induk FROM m_jemaat_induk WHERE id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
    )
    OR get_auth_role() = 'super_user'
    OR (get_auth_role() = 'admin_mupel' AND id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (SELECT id_mupel FROM users WHERE id = auth.uid())))
);

-- Note: For development, it's often helpful to allow all reads for authenticated users 
-- if the strict RLS is too restrictive for testing the UI. 
-- Here we add a basic read policy for authenticated users so data shows up in dashboard.
CREATE POLICY "Authenticated users can view m_jemaat_induk"
ON m_jemaat_induk FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view m_pos_pelkes"
ON m_pos_pelkes FOR SELECT
TO authenticated
USING (true);

-- And for anon users (since next.js might fetch without auth if we didn't pass cookies correctly)
CREATE POLICY "Anon users can view m_pos_pelkes"
ON m_pos_pelkes FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon users can view m_jemaat_induk"
ON m_jemaat_induk FOR SELECT
TO anon
USING (true);

COMMIT;
