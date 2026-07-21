export interface WatermarkOptions {
  lat?: number | null;
  lng?: number | null;
  label?: string;
}

/**
 * Promise helper to get fresh real-time GPS coordinates directly from device
 */
async function getCurrentGpsLocation(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      resolve({ lat: null, lng: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('GPS location fetch warning:', err);
        resolve({ lat: null, lng: null });
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  });
}

/**
 * Stamps photo image with high-contrast GPS Geolocation coordinates & Date-Time Watermark
 */
export async function addWatermarkToImage(
  file: File,
  options?: WatermarkOptions
): Promise<File> {
  // Fetch real-time GPS if options lat/lng is missing
  let latitude = options?.lat;
  let longitude = options?.lng;

  if (latitude == null || longitude == null) {
    const gps = await getCurrentGpsLocation();
    latitude = gps.lat;
    longitude = gps.lng;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // 1. Draw original photo
        ctx.drawImage(img, 0, 0);

        // 2. Calculate dynamic dimensions for watermark banner
        const bannerHeight = Math.max(90, canvas.height * 0.15);
        const fontSize = Math.max(18, canvas.height * 0.032);
        const subFontSize = Math.max(14, canvas.height * 0.025);

        // 3. Draw dark translucent banner background at bottom
        ctx.fillStyle = 'rgba(10, 15, 30, 0.88)'; // Deep Slate Navy
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

        // 4. Gold Accent Line at top of banner
        ctx.fillStyle = '#c5a855';
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, Math.max(5, canvas.height * 0.008));

        // 5. Format Timestamp string
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');

        const timeStampText = `🕒 TANGGAL & WAKTU: ${year}-${month}-${day} ${hours}:${mins}:${secs} WIB`;

        // 6. Format GPS Text
        let gpsText = '📌 GPS LOKASI: Sinyal Geolocation Tidak Terdeteksi';
        if (latitude != null && longitude != null) {
          gpsText = `📌 GPS LOKASI: Lat ${latitude.toFixed(5)}, Long ${longitude.toFixed(5)}`;
        }

        const tagText = options?.label || 'SI GPIB PASTORAL LOG';

        // 7. Render Text onto Canvas with High Contrast
        const paddingX = Math.max(20, canvas.width * 0.035);
        const startY = canvas.height - bannerHeight + fontSize * 1.3;

        // GPS Text Line (Bold White)
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(gpsText, paddingX, startY);

        // Timestamp Line (Cyan Light)
        ctx.fillStyle = '#67e8f9';
        ctx.font = `bold ${subFontSize}px Arial, sans-serif`;
        ctx.fillText(timeStampText, paddingX, startY + fontSize * 1.35);

        // Render SI GPIB tag at top right of banner
        ctx.fillStyle = '#f59e0b'; // Warm Amber Gold
        ctx.font = `bold ${subFontSize}px Arial, sans-serif`;
        const tagWidth = ctx.measureText(tagText).width;
        ctx.fillText(tagText, canvas.width - paddingX - tagWidth, startY);

        // Reset shadow
        ctx.shadowBlur = 0;

        // 8. Convert to compressed JPEG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const stampedFile = new File([blob], file.name || 'pastoral-photo-stamped.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(stampedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.88
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
