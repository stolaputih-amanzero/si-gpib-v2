'use client';

import { useState, useRef } from 'react';
import { Camera, X, MapPin, Target, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { compressImage } from '@/lib/camera/compress';
import { useGeolocation } from '@/hooks/use-geolocation';

interface CameraCaptureProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  lat?: number | null;
  lng?: number | null;
  onLatChange: (lat: number | null) => void;
  onLngChange: (lng: number | null) => void;
  label?: string;
  maxFiles?: number;
}

export function CameraCapture({
  files,
  onFilesChange,
  lat,
  lng,
  onLatChange,
  onLngChange,
  label = 'Foto & Lampiran Sertifikat',
  maxFiles = 5,
}: CameraCaptureProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLogs, setCompressionLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const { lat: geoLat, lng: geoLng, accuracy, loading: geoLoading, error: geoError, getLocation } = useGeolocation();

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(0) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleGpsFetch = async () => {
    getLocation();
  };

  // Sync GPS results if available
  if (geoLat !== null && geoLng !== null && (lat === undefined || lat === null)) {
    onLatChange(geoLat);
    onLngChange(geoLng);
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    setIsCompressing(true);

    try {
      const processedFiles: File[] = [];
      const newLogs: string[] = [];

      for (const file of selectedFiles) {
        if (file.type.startsWith('image/')) {
          const originalSize = file.size;
          const compressed = await compressImage(file);
          processedFiles.push(compressed);
          newLogs.push(`${file.name}: ${formatSize(originalSize)} → ${formatSize(compressed.size)}`);
        } else {
          // Document files (PDFs) stay uncompressed if < 5MB
          if (file.size > 5 * 1024 * 1024) {
            alert(`File ${file.name} melebihi batas 5MB.`);
            continue;
          }
          processedFiles.push(file);
          newLogs.push(`${file.name}: ${formatSize(file.size)}`);
        }
      }

      setCompressionLogs(prev => [...prev, ...newLogs]);
      onFilesChange([...files, ...processedFiles].slice(0, maxFiles));
    } catch (err) {
      console.error('File processing error:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const nextFiles = files.filter((_, i) => i !== index);
    onFilesChange(nextFiles);
  };

  return (
    <div className="space-y-4 bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
      {/* 1. Camera & File Upload Controls */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-high uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Camera size={16} className="text-brand-primary" />
            {label}
          </span>
          <span className="text-[11px] text-text-muted font-normal">
            Max {maxFiles} Berkas (Foto & PDF)
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {/* Native HTML5 Camera Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing || files.length >= maxFiles}
            className="min-h-[48px] px-3 bg-brand-primary text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
          >
            <Camera size={18} />
            <span>{isCompressing ? 'Kompresi...' : 'Ambil Foto'}</span>
          </button>

          {/* Document Upload Button */}
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            disabled={isCompressing || files.length >= maxFiles}
            className="min-h-[48px] px-3 bg-surface-sunken text-text-high rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 border border-border-subtle active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <FileText size={18} className="text-brand-primary" />
            <span>Upload PDF / Dokumen</span>
          </button>
        </div>

        {/* Hidden HTML5 File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          className="hidden"
          multiple
        />
        <input
          ref={docInputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={handlePhotoSelect}
          className="hidden"
          multiple
        />

        {/* Compression Info Logs */}
        {compressionLogs.length > 0 && (
          <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-1">
            {compressionLogs.slice(-2).map((log, i) => (
              <p key={i} className="text-[11px] text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} className="shrink-0 text-blue-500" />
                <span>{log}</span>
              </p>
            ))}
          </div>
        )}

        {/* Uploaded Files Previews Grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
            {files.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              const url = isImage ? URL.createObjectURL(file) : null;

              return (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-surface-sunken border border-border-subtle flex flex-col items-center justify-center p-1">
                  {isImage && url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={url} alt={file.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center p-2">
                      <FileText size={24} className="mx-auto text-brand-primary" />
                      <p className="text-[9px] font-medium text-text-high truncate max-w-[60px] mt-1">{file.name}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-border-subtle" />

      {/* 2. GPS Location Auto-Fill with Manual Override Inputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-high uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={16} className="text-brand-primary" />
            <span>Koordinat GPS Lokasi</span>
          </label>
          <button
            type="button"
            onClick={handleGpsFetch}
            disabled={geoLoading}
            className="min-h-[36px] px-3 bg-brand-primary text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-800 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            <Target size={14} className={geoLoading ? 'animate-spin' : ''} />
            <span>{geoLoading ? 'Mencari GPS...' : 'Ambil Lokasi Saya'}</span>
          </button>
        </div>

        {geoError && (
          <div className="flex items-center gap-1.5 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-lg text-amber-800 dark:text-amber-300 text-xs">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>GPS tidak terdeteksi. Silakan isikan koordinat Latitude & Longitude secara manual di bawah.</span>
          </div>
        )}

        {accuracy !== null && !geoLoading && !geoError && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Akurasi Sinyal GPS: {Math.round(accuracy)} meter
          </p>
        )}

        {/* Fully Editable Manual Override Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-text-muted mb-1 block">Latitude (Manual/GPS)</label>
            <input
              type="number"
              step="any"
              value={lat !== undefined && lat !== null ? lat : ''}
              onChange={(e) => onLatChange(e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="-6.200000"
              className="w-full min-h-[44px] px-3 rounded-xl border border-border-subtle bg-surface-base text-sm font-mono text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-text-muted mb-1 block">Longitude (Manual/GPS)</label>
            <input
              type="number"
              step="any"
              value={lng !== undefined && lng !== null ? lng : ''}
              onChange={(e) => onLngChange(e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="106.816666"
              className="w-full min-h-[44px] px-3 rounded-xl border border-border-subtle bg-surface-base text-sm font-mono text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
