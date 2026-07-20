'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { compressImage } from '@/lib/camera/compress';

interface AssetCameraInputProps {
  onFileSelect: (file: File | null) => void;
  label?: string;
  error?: string;
}

export function AssetCameraInput({ onFileSelect, label = 'Foto Aset', error }: AssetCameraInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setCompressionInfo(null);

    try {
      const originalSize = file.size;
      const compressedFile = await compressImage(file);
      const compressedSize = compressedFile.size;
      
      const newUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(newUrl);
      onFileSelect(compressedFile);

      setCompressionInfo(`Dikompresi dari ${formatSize(originalSize)} -> ${formatSize(compressedSize)}`);
    } catch (err) {
      console.error('Compression failed:', err);
      // Fallback to original
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
      onFileSelect(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setCompressionInfo(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-high flex items-center gap-2">
        <Camera className="w-4 h-4" />
        {label}
      </label>
      
      <div className="bg-surface-elevated rounded-md border border-border-subtle p-4 shadow-soft">
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-md overflow-hidden bg-surface-sunken">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {compressionInfo && (
              <p className="text-xs text-brand-primary/80 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                {compressionInfo}
              </p>
            )}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[44px] bg-surface-sunken text-text-high rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-surface-base active:scale-[0.98] transition-all border border-border-subtle"
            >
              <Camera className="w-4 h-4" />
              Ganti Foto
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="w-full h-32 bg-surface-sunken border-2 border-dashed border-border-subtle rounded-md flex flex-col items-center justify-center gap-2 text-text-muted hover:bg-surface-base hover:border-brand-primary/50 transition-all disabled:opacity-50"
          >
            {isCompressing ? (
              <p className="text-sm font-medium animate-pulse">Memproses gambar...</p>
            ) : (
              <>
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm font-medium">Buka Kamera / Galeri</span>
              </>
            )}
          </button>
        )}
        
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </div>
      
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
}
