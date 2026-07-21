-- Migration: Add kondisi column to t_aset_bergerak table
ALTER TABLE t_aset_bergerak ADD COLUMN IF NOT EXISTS kondisi VARCHAR(50) DEFAULT 'Baik';
