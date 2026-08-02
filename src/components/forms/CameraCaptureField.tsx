'use client';

import { useState, useRef } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CameraCaptureFieldProps {
  value?: string | null;
  onChange: (base64: string | null) => void;
  maxSizeKB?: number;
  className?: string;
}

export function CameraCaptureField({
  value,
  onChange,
  maxSizeKB = 1024,
  className,
}: CameraCaptureFieldProps) {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failed'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.8;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          while (dataUrl.length / 1024 > maxSizeKB && quality > 0.2) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      try {
        const compressedBase64 = await compressAndConvertToBase64(files[0]);
        onChange(compressedBase64);
        setPermissionDenied(false);
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  const handleTriggerPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn('space-y-3 w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative inline-block group">
          <img
            src={value}
            alt="Foto Kegiatan"
            className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-2xl border-2 border-border-subtle shadow-xs"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            title="Hapus Foto"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleTriggerPicker}
            className="w-full h-14 rounded-2xl bg-surface-1 border-2 border-dashed border-border-subtle hover:border-brand-primary text-text-muted hover:text-brand-primary flex items-center justify-center gap-2.5 font-extrabold text-xs transition-all active:scale-98 min-h-[44px] cursor-pointer"
          >
            <Camera size={18} className="text-brand-primary" />
            <span>Ambil / Upload Foto Kegiatan (Opsional)</span>
          </button>

          {permissionDenied && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>Izin kamera ditolak. Silakan upload foto dari galeri perangkat.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CameraCaptureField;
