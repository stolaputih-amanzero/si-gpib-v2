-- Migration: Add zona_waktu column to t_jadwal_ibadah
ALTER TABLE t_jadwal_ibadah ADD COLUMN IF NOT EXISTS zona_waktu VARCHAR(10) DEFAULT 'WIB';
