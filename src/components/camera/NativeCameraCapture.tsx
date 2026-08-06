'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Check, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/camera/compress';
import { getCurrentPosition } from '@/lib/geolocation/getCurrentPosition';
import { haptic } from '@/lib/haptic/vibrate';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';

interface NativeCameraCaptureProps {
  onCapture: (blob: Blob, gps: { lat: number; lng: number; accuracy: number }) => void;
  existingPreview?: string | null; // URL preview jika ada dari draft
}

export function NativeCameraCapture({ onCapture, existingPreview }: NativeCameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingPreview ?? null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setError(null);
    haptic('medium');

    try {
      // 1. Ambil GPS live (bukan dari EXIF — D-CJ5-2)
      const position = await getCurrentPosition();
      if (!position) {
        setError('Gagal mengambil koordinat GPS. Silakan coba lagi atau input manual.');
      } else {
        setGps({ lat: position.latitude, lng: position.longitude, accuracy: position.accuracy });
      }

      // 2. Kompres ke ≤ 200KB (NFR-08)
      const compressed = await compressImage(file, {
        maxDim: 1920,
        targetKB: 200,
      });

      // 3. Buat preview URL
      const url = URL.createObjectURL(compressed);
      setPreview(url);
      setBlob(compressed);
    } catch (err) {
      logger.error('Camera capture failed', err as Error);
      setError('Gagal memproses foto. Silakan coba lagi.');
    } finally {
      setProcessing(false);
      // Reset input agar bisa pilih file yang sama lagi
      if (inputRef.current) inputRef.current.value = '';
    }
  }, []);

  const handleConfirm = () => {
    if (blob && gps) {
      haptic('success');
      onCapture(blob, gps);
    }
  };

  const handleRetry = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setBlob(null);
    setGps(null);
    setError(null);
    inputRef.current?.click();
  };

  // Mode preview — setelah capture
  if (preview) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {gps && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              📍 {gps.accuracy.toFixed(0)}m akurasi
            </div>
          )}
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            {(blob!.size / 1024).toFixed(0)} KB ✓
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={handleRetry} variant="outline" size="lg" className="flex-1 min-h-[44px]">
            <RefreshCw className="w-4 h-4 mr-2" /> Ulangi
          </Button>
          <Button type="button" onClick={handleConfirm} size="lg" className="flex-1 min-h-[44px]">
            <Check className="w-4 h-4 mr-2" /> Gunakan
          </Button>
        </div>
      </div>
    );
  }

  // Mode capture — tampilkan tombol besar
  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={processing}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-600 bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
        aria-label="Ambil foto aset"
      >
        {processing ? (
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        ) : (
          <>
            <Camera className="w-10 h-10" />
            <span className="font-medium text-base">Ambil Foto Aset</span>
            <span className="text-xs text-gray-500">Kamera belakang akan terbuka</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
