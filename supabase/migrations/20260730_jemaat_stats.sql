-- Migration: Add statistics columns to m_jemaat_induk
ALTER TABLE m_jemaat_induk 
ADD COLUMN IF NOT EXISTS jumlah_sektor INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS jumlah_kk INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS jumlah_jiwa INT DEFAULT 0;

-- Update sample data from GPIB.xlsx
UPDATE m_jemaat_induk SET 
  jumlah_sektor = 1, 
  jumlah_kk = 50, 
  jumlah_jiwa = 178 
WHERE id_induk = '02-01-BM';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_jemaat_stats ON m_jemaat_induk(jumlah_jiwa DESC);
