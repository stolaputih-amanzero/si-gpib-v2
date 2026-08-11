'use client';

import React from 'react';
import { AssetLocationViewModel } from '@/types/assetViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { MapPin, Navigation } from 'lucide-react';

interface AssetLocationSectionProps {
  location: AssetLocationViewModel;
}

export const AssetLocationSection: React.FC<AssetLocationSectionProps> = ({ location }) => {
  return (
    <section id="location" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Lokasi & Koordinat Geografis
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {/* Alamat Resmi */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat Lokasi Aset</div>
          {location.alamat.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={location.alamat.reason} label={location.alamat.label} />
          ) : location.alamat.type === 'EMPTY' ? (
            <p className="text-sm text-slate-400 italic">{location.alamat.label}</p>
          ) : (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {location.alamat.value}
            </p>
          )}
        </div>

        {/* Geolocation */}
        {location.geolocation.type === 'DATA' && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Navigation className="w-4 h-4 text-blue-500" />
              <span>Lat: {location.geolocation.value.latitude.toFixed(6)}, Long: {location.geolocation.value.longitude.toFixed(6)}</span>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${location.geolocation.value.latitude},${location.geolocation.value.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-sans font-semibold"
            >
              Buka Google Maps ↗
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
