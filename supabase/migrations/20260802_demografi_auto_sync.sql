-- Migration: Auto-Sync Demografi Pelkat Statistics to m_pos_pelkes and m_jemaat_induk
-- Description: Automatically updates jumlah_kk and jumlah_jiwa aggregates on Pos Pelkes and Jemaat Induk levels upon any demografi changes.

CREATE OR REPLACE FUNCTION fn_sync_demografi_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_id_induk VARCHAR(20);
    v_id_pos VARCHAR(20);
BEGIN
    -- Determine which id_pos we are updating
    IF (TG_OP = 'DELETE') THEN
        v_id_pos := OLD.id_pos;
    ELSE
        v_id_pos := NEW.id_pos;
    END IF;

    -- 1. Get parent id_induk for this id_pos from m_pos_pelkes
    SELECT id_induk INTO v_id_induk FROM m_pos_pelkes WHERE id_pos = v_id_pos;

    -- 2. Update m_pos_pelkes stats
    UPDATE m_pos_pelkes
    SET 
        jumlah_kk = COALESCE((SELECT SUM(jml_kk) FROM t_demografi_pelkat WHERE id_pos = v_id_pos), 0),
        jumlah_jiwa = COALESCE((SELECT SUM(laki + perempuan) FROM t_demografi_pelkat WHERE id_pos = v_id_pos), 0),
        updated_at = NOW()
    WHERE id_pos = v_id_pos;

    -- 3. Update m_jemaat_induk stats (sum of all its pos pelkes)
    IF v_id_induk IS NOT NULL THEN
        UPDATE m_jemaat_induk
        SET
            jumlah_kk = COALESCE((SELECT SUM(jumlah_kk) FROM m_pos_pelkes WHERE id_induk = v_id_induk), 0),
            jumlah_jiwa = COALESCE((SELECT SUM(jumlah_jiwa) FROM m_pos_pelkes WHERE id_induk = v_id_induk), 0),
            updated_at = NOW()
        WHERE id_induk = v_id_induk;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS trg_sync_demografi ON t_demografi_pelkat;
CREATE TRIGGER trg_sync_demografi
AFTER INSERT OR UPDATE OR DELETE ON t_demografi_pelkat
FOR EACH ROW
EXECUTE FUNCTION fn_sync_demografi_stats();
