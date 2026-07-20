'use client';

import { useEffect } from 'react';
import { MapPin, Target, AlertCircle } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';

interface GpsInputProps {
  lat?: number | null;
  lng?: number | null;
  onLatChange: (val: number | null) => void;
  onLngChange: (val: number | null) => void;
}

export function GpsInput({ lat, lng, onLatChange, onLngChange }: GpsInputProps) {
  const { lat: geoLat, lng: geoLng, accuracy, loading, error, getLocation } = useGeolocation();

  // Update parent form if GPS fetch is successful
  useEffect(() => {
    if (geoLat !== null && geoLng !== null) {
      onLatChange(geoLat);
      onLngChange(geoLng);
    }
  }, [geoLat, geoLng, onLatChange, onLngChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-high flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Lokasi GPS
        </label>
        <button
          type="button"
          onClick={getLocation}
          disabled={loading}
          className="min-h-[44px] px-3 bg-brand-primary text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-brand-primary/90 active:scale-95 transition-all shadow-float disabled:opacity-70"
        >
          <Target className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Mencari...' : 'Ambil Lokasi Saya'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-md">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
          <p className="text-xs text-error font-medium">{error}</p>
        </div>
      )}

      {accuracy !== null && !loading && !error && (
        <p className="text-xs text-brand-primary flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
          Akurasi: {Math.round(accuracy)} meter
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted mb-1 block">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat || ''}
            onChange={(e) => onLatChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="-6.200000"
            className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base text-text-high text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng || ''}
            onChange={(e) => onLngChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="106.816666"
            className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base text-text-high text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>
      </div>
    </div>
  );
}
