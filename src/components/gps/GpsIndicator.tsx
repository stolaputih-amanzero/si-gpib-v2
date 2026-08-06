'use client';

import { MapPin, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentPosition } from '@/lib/geolocation/getCurrentPosition';

interface GpsIndicatorProps {
  gps: { lat: number; lng: number; accuracy: number } | null;
  useManual: boolean;
  onToggleManual: (v: boolean) => void;
  manualValue: { lat: string; lng: string } | null;
  onManualChange: (v: { lat: string; lng: string } | null) => void;
  onGpsRefresh?: (gps: { lat: number; lng: number; accuracy: number }) => void;
}

export function GpsIndicator({
  gps,
  useManual,
  onToggleManual,
  manualValue,
  onManualChange,
  onGpsRefresh,
}: GpsIndicatorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const position = await getCurrentPosition();
      if (position && onGpsRefresh) {
        onGpsRefresh({ lat: position.latitude, lng: position.longitude, accuracy: position.accuracy });
      }
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {!useManual && gps ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                📍 {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
              </p>
              <p className="text-xs text-green-600">Akurasi: {gps.accuracy.toFixed(0)}m</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="min-h-[44px] min-w-[44px]"
            aria-label="Ambil ulang GPS"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      ) : !useManual ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            📍 Ambil foto terlebih dahulu untuk mendapatkan koordinat GPS
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onToggleManual(!useManual)}
        className="text-sm text-blue-600 underline"
      >
        {useManual ? '← Gunakan GPS otomatis' : 'Input manual koordinat'}
      </button>

      {useManual && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Latitude"
            value={manualValue?.lat ?? ''}
            onChange={(e) => onManualChange({ lat: e.target.value, lng: manualValue?.lng ?? '' })}
            className="h-12 text-base"
          />
          <Input
            placeholder="Longitude"
            value={manualValue?.lng ?? ''}
            onChange={(e) => onManualChange({ lat: manualValue?.lat ?? '', lng: e.target.value })}
            className="h-12 text-base"
          />
        </div>
      )}
    </div>
  );
}
