'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, MapPin, Target, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { compressImage } from '@/lib/camera/compress';
import { addWatermarkToImage } from '@/lib/camera/watermark';
import { useGeolocation } from '@/hooks/use-geolocation';
import { LampiranAset } from '@/types/aset.types';

export interface HierarchyWatermarkMeta {
  mupelName?: string;
  jemaatName?: string;
  posName?: string;
}

interface CameraCaptureProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  existingAttachments?: LampiranAset[];
  onDeleteExistingAttachment?: (id_lampiran: string) => void;
  onUpdateExistingAttachmentCaption?: (id_lampiran: string, keterangan: string) => void;
  lat?: number | null;
  lng?: number | null;
  onLatChange: (lat: number | null) => void;
  onLngChange: (lng: number | null) => void;
  hierarchyMeta?: HierarchyWatermarkMeta | null;
  label?: string;
  maxFiles?: number;
}

export function CameraCapture({
  files,
  onFilesChange,
  existingAttachments,
  onDeleteExistingAttachment,
  onUpdateExistingAttachmentCaption,
  lat,
  lng,
  onLatChange,
  onLngChange,
  hierarchyMeta,
  label = 'Foto & Lampiran Sertifikat',
  maxFiles = 5,
}: CameraCaptureProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLogs, setCompressionLogs] = useState<string[]>([]);
  const [showManualGps, setShowManualGps] = useState(false);
  const [isLocalUpload, setIsLocalUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const { lat: geoLat, lng: geoLng, accuracy, loading: geoLoading, error: geoError, getLocation } = useGeolocation();

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(0) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleGpsFetch = () => {
    getLocation();
  };

  // Sync GPS results safely after render
  useEffect(() => {
    if (geoLat !== null && geoLng !== null && (lat === undefined || lat === null)) {
      onLatChange(geoLat);
      onLngChange(geoLng);
    }
  }, [geoLat, geoLng, lat, lng, onLatChange, onLngChange]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>, isLocal: boolean = false) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (isLocal) {
      setIsLocalUpload(true);
    }

    setIsCompressing(true);

    try {
      const processedFiles: File[] = [];
      const newLogs: string[] = [];

      for (const file of selectedFiles) {
        if (file.type.startsWith('image/')) {
          const originalSize = file.size;
          const compressed = await compressImage(file);
          const stampedFile = await addWatermarkToImage(compressed, {
            lat: geoLat || lat || null,
            lng: geoLng || lng || null,
            mupelName: hierarchyMeta?.mupelName,
            jemaatName: hierarchyMeta?.jemaatName,
            posName: hierarchyMeta?.posName,
            label: 'INVENTARIS ASET GPIB',
          });

          processedFiles.push(stampedFile);
          newLogs.push(`${file.name}: ${formatSize(originalSize)} → ${formatSize(stampedFile.size)} (GPS & Hierarki Watermarked)`);
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

  const hasCoordinates = lat !== undefined && lat !== null && lng !== undefined && lng !== null;

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-surface-sunken/40 border border-border-subtle">
      {/* 1. Camera & Upload Inputs */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-text-high uppercase tracking-wider flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[11px] font-normal text-text-muted">
            {files.length} / {maxFiles} Berkas Terpilih
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing || files.length >= maxFiles}
            className="min-h-[44px] px-3.5 bg-brand-primary/10 dark:bg-brand-primary/20 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Camera size={18} />
            <span>Kamera Foto (Live)</span>
          </button>

          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            disabled={isCompressing || files.length >= maxFiles}
            className="min-h-[44px] px-3.5 bg-surface-elevated hover:bg-surface-sunken border border-border-subtle text-text-high rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <FileText size={18} className="text-text-muted" />
            <span>Galeri / Dokumen</span>
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handlePhotoSelect(e, false)}
          className="hidden"
          multiple
        />
        <input
          ref={docInputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => handlePhotoSelect(e, true)}
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

        {/* Existing Attachments Previews Grid (Edit Mode) */}
        {existingAttachments && existingAttachments.length > 0 && (
          <div className="space-y-1.5 pt-2 border-b border-border-subtle pb-3">
            <span className="text-[11px] font-semibold text-text-high uppercase tracking-wider block">
              Foto & Berkas Tersimpan ({existingAttachments.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {existingAttachments.map((att) => {
                const isImage = att.tipe_file?.startsWith('image/') || att.file_path?.match(/\.(jpg|jpeg|png|webp)$/i);

                return (
                  <div key={att.id_lampiran} className="relative group rounded-xl p-2 bg-surface-sunken border border-border-subtle flex flex-col space-y-1.5">
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
                      {isImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={att.file_path} alt={att.nama_file} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2">
                          <FileText size={24} className="mx-auto text-brand-primary" />
                          <p className="text-[10px] font-medium text-text-high truncate max-w-[100px] mt-1">{att.nama_file}</p>
                        </div>
                      )}

                      {onDeleteExistingAttachment && (
                        <button
                          type="button"
                          onClick={() => onDeleteExistingAttachment(att.id_lampiran)}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                          title="Hapus Berkas Tersimpan"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Keterangan Foto Input (Edit Berkas Tersimpan) */}
                    <input
                      type="text"
                      placeholder="Keterangan foto (SHM, Tampak Depan, dll)..."
                      value={att.keterangan || ''}
                      onChange={(e) => onUpdateExistingAttachmentCaption?.(att.id_lampiran, e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-high focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-[11px]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Uploaded Files Previews Grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {files.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              const url = isImage ? URL.createObjectURL(file) : null;

              return (
                <div key={idx} className="relative group rounded-xl p-2 bg-surface-sunken border border-border-subtle flex flex-col space-y-1.5">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
                    {isImage && url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <FileText size={24} className="mx-auto text-brand-primary" />
                        <p className="text-[10px] font-medium text-text-high truncate max-w-[100px] mt-1">{file.name}</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                      title="Hapus Berkas"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Keterangan Foto Input */}
                  <input
                    type="text"
                    placeholder="Keterangan foto (SHM, Tampak Depan, dll)..."
                    value={(file as any).keterangan || ''}
                    onChange={(e) => {
                      (file as any).keterangan = e.target.value;
                      onFilesChange([...files]);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-high focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-[11px]"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-border-subtle" />

      {/* 2. SMART CONTEXTUAL GPS LOCATION SECTION */}
      <div className="space-y-3">
        {/* A. If Coordinates successfully recorded via Camera Live & No Error */}
        {hasCoordinates && !geoError && !showManualGps && !isLocalUpload && (
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>📍 Lokasi GPS Terekam Otomatis: <strong className="font-mono">{lat?.toFixed(6)}, {lng?.toFixed(6)}</strong></span>
              {accuracy !== null && <span className="text-[11px] opacity-80">(±{Math.round(accuracy)}m)</span>}
            </div>
            <button
              type="button"
              onClick={() => setShowManualGps(true)}
              className="text-xs text-brand-primary font-semibold hover:underline shrink-0"
            >
              Ubah
            </button>
          </div>
        )}

        {/* B. If GPS Error occurs during camera capture */}
        {geoError && (
          <div className="space-y-3 p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl">
            <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Sinyal GPS Tidak Terdeteksi Otomatis</p>
                <p className="text-[11px] leading-relaxed">
                  Sinyal GPS tidak dapat merekam koordinat secara otomatis saat foto diambil. Silakan tekan tombol di bawah ini atau isikan koordinat secara manual.
                </p>
              </div>
            </div>
            <div className="pt-1 flex items-center gap-2">
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
          </div>
        )}

        {/* C. If Uploaded from Local Storage / Documents */}
        {isLocalUpload && !hasCoordinates && (
          <div className="space-y-3 p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 rounded-xl">
            <div className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
              <FileText size={16} className="text-brand-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Berkas Diunggah dari Dokumen / Galeri Lokal</p>
                <p className="text-[11px] leading-relaxed">
                  Jika Anda saat ini berada di lokasi fisik aset, tekan tombol untuk merekam koordinat GPS secara otomatis.
                </p>
              </div>
            </div>
            <div className="pt-1 flex items-center gap-2">
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
          </div>
        )}

        {/* D. Full Manual GPS Inputs & Buttons (Shown when toggled, when GPS error, or during local upload) */}
        {(showManualGps || geoError || (isLocalUpload && !hasCoordinates)) && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-high uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={16} className="text-brand-primary" />
                <span>Koordinat GPS Lokasi Aset</span>
              </label>

              {!geoError && !isLocalUpload && (
                <button
                  type="button"
                  onClick={handleGpsFetch}
                  disabled={geoLoading}
                  className="min-h-[34px] px-3 bg-brand-primary text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-800 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                >
                  <Target size={14} className={geoLoading ? 'animate-spin' : ''} />
                  <span>{geoLoading ? 'Mencari GPS...' : 'Ambil Lokasi Saya'}</span>
                </button>
              )}
            </div>

            {accuracy !== null && !geoLoading && !geoError && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Akurasi Sinyal GPS: {Math.round(accuracy)} meter
              </p>
            )}

            {/* Fully Editable Manual Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-text-muted mb-1 block">Latitude</label>
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
                <label className="text-[11px] font-medium text-text-muted mb-1 block">Longitude</label>
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
        )}

        {/* E. Optional manual trigger on clean initial state */}
        {!hasCoordinates && !showManualGps && !geoError && !isLocalUpload && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowManualGps(true)}
              className="text-xs text-text-muted hover:text-brand-primary inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <MapPin size={13} className="text-brand-primary" />
              <span>+ Isi Koordinat GPS Lokasi Secara Manual (Opsional)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
