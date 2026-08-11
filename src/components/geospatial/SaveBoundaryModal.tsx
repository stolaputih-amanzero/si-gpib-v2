'use client';

import React, { useState } from 'react';
import { GeometrySemanticCategory } from '@/types/geospatial.types';
import { MapPin, X, Loader2 } from 'lucide-react';

interface SaveBoundaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSpatialBoundary: (
    semanticCategory: GeometrySemanticCategory,
    namaWilayah: string,
    keterangan: string,
    geojsonStr: string,
    reason: string
  ) => Promise<void>;
}

export const SaveBoundaryModal: React.FC<SaveBoundaryModalProps> = ({
  isOpen,
  onClose,
  onSubmitSpatialBoundary
}) => {
  const [semanticCategory, setSemanticCategory] = useState<GeometrySemanticCategory>('TERRITORY_BOUNDARY');
  const [namaWilayah, setNamaWilayah] = useState('Wilayah Sektor Paulus 2');
  const [keterangan, setKeterangan] = useState('Batas Wilayanan Sektor 2 GPIB Paulus Jakarta');
  const [geojsonStr, setGeojsonStr] = useState(
    JSON.stringify({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.82, -6.17],
            [106.84, -6.17],
            [106.84, -6.19],
            [106.82, -6.19],
            [106.82, -6.17]
          ]
        ]
      }
    }, null, 2)
  );
  const [reason, setReason] = useState('Pengkinian Pemetaan Batas Sektor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitSpatialBoundary(semanticCategory, namaWilayah, keterangan, geojsonStr, reason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Simpan / Mutasi Batas Spasial</h3>
              <p className="text-xs text-slate-500">Pendaftaran geometri GeoJSON RFC 7946 dengan SRID 4326</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Kategori Semantik Geospasial</label>
            <select
              value={semanticCategory}
              onChange={(e) => setSemanticCategory(e.target.value as GeometrySemanticCategory)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="TERRITORY_BOUNDARY">TERRITORY_BOUNDARY — Batas Wilayah (Polygon)</option>
              <option value="RISK_ZONE">RISK_ZONE — Zona Rawan Bencana (Polygon)</option>
              <option value="RESOURCE_ZONE">RESOURCE_ZONE — Zona Potensi Penjangkauan (Polygon)</option>
              <option value="POINT_LOCATION">POINT_LOCATION — Titik Lokasi Pos/Aset (Point)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Wilayah / Objek Spasial</label>
            <input
              type="text"
              value={namaWilayah}
              onChange={(e) => setNamaWilayah(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Keterangan Tambahan</label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">GeoJSON Feature (RFC 7946 WGS84)</label>
            <textarea
              value={geojsonStr}
              onChange={(e) => setGeojsonStr(e.target.value)}
              rows={4}
              required
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 text-emerald-400 font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Alasan Perubahan (Audit Log)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              <span>Eksekusi Mutasi Spasial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
