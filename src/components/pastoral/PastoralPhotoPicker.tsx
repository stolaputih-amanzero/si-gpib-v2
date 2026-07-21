'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { addWatermarkToImage } from '@/lib/camera/watermark';
import { compressImage } from '@/lib/camera/compress';

export interface HierarchyWatermarkMeta {
  mupelName?: string;
  jemaatName?: string;
  posName?: string;
}

interface PastoralPhotoPickerProps {
  photo?: File | null;
  photoUrl?: string | null;
  hierarchyMeta?: HierarchyWatermarkMeta | null;
  onPhotoChange: (file: File | null, base64Url?: string | null) => void;
  disabled?: boolean;
}

export function PastoralPhotoPicker({
  photoUrl,
  hierarchyMeta,
  onPhotoChange,
  disabled,
}: PastoralPhotoPickerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoUrl || null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const { lat, lng, getLocation } = useGeolocation();

  // Trigger camera capture with GPS
  const handleOpenCamera = () => {
    getLocation(); // Fetch GPS coordinates
    cameraInputRef.current?.click();
  };

  // Handle Photo selection (Camera or Gallery)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const rawFile = files[0];
    setIsProcessing(true);

    try {
      // 1. Compress Image
      const compressed = await compressImage(rawFile);

      // 2. Add high-contrast GPS, Timestamp & Hierarchy watermark directly onto canvas photo image
      const finalFile = await addWatermarkToImage(compressed, {
        lat,
        lng,
        mupelName: hierarchyMeta?.mupelName,
        jemaatName: hierarchyMeta?.jemaatName,
        posName: hierarchyMeta?.posName,
        label: 'SI GPIB PASTORAL LOG',
      });

      // 3. Convert to Data URL for preview & inline submission
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewUrl(base64);
        onPhotoChange(finalFile, base64);
      };
      reader.readAsDataURL(finalFile);
    } catch (err) {
      console.error('Error processing photo watermark:', err);
    } finally {
      setIsProcessing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null, null);
  };

  return (
    <div className="space-y-3 bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-text-high uppercase tracking-wider flex items-center gap-1.5">
          <Camera size={16} className="text-brand-primary" />
          <span>Foto Dokumentasi Pastoral (GPS & Hierarki Stamped)</span>
        </label>
        <span className="text-[11px] text-text-muted">Opsional</span>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Photo Preview Card */}
      {previewUrl ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/90 border border-border-subtle shadow-medium group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Foto Pastoral" className="w-full h-full object-cover" />

          {/* Top Remove Button */}
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={disabled}
            className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors shadow-md min-h-[36px] min-w-[36px] flex items-center justify-center z-10"
            title="Hapus Foto"
          >
            <X size={16} />
          </button>

          {/* Watermark Status Tag */}
          <div className="absolute top-2.5 left-2.5 p-1.5 px-2.5 bg-black/75 backdrop-blur-sm rounded-lg text-[10px] text-amber-300 font-bold flex items-center gap-1 border border-amber-500/30">
            <CheckCircle2 size={12} /> Stempel GPS, Waktu & Hierarki Wilayah Aktif
          </div>
        </div>
      ) : (
        /* Action Options (Camera vs Upload) */
        <div className="grid grid-cols-2 gap-3">
          {/* Option 1: Open Camera (Auto GPS & Stamp) */}
          <button
            type="button"
            onClick={handleOpenCamera}
            disabled={disabled || isProcessing}
            className="min-h-[52px] px-3 bg-brand-primary text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 hover:bg-brand-primary-dark active:scale-[0.98] transition-all shadow-soft disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Camera size={18} />
            )}
            <span>Buka Kamera (GPS & Timestamp)</span>
          </button>

          {/* Option 2: Upload from Gallery */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={disabled || isProcessing}
            className="min-h-[52px] px-3 bg-surface-sunken text-text-high border border-border-subtle rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 hover:bg-surface-elevated active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <ImageIcon size={18} className="text-brand-primary" />
            <span>Upload dari Galeri</span>
          </button>
        </div>
      )}
    </div>
  );
}
