export interface WatermarkOptions {
  lat?: number | null;
  lng?: number | null;
  mupelName?: string | null;
  jemaatName?: string | null;
  posName?: string | null;
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
 * Stamps photo image with high-contrast GPS Geolocation coordinates, Date-Time & Hierarchy Watermark
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

        // 2. Format Line 1: GPS (lat: xxx | long: xxx)
        let gpsText = 'lat: - | long: -';
        if (latitude != null && longitude != null) {
          gpsText = `lat: ${latitude.toFixed(5)} | long: ${longitude.toFixed(5)}`;
        }

        // 3. Format Line 2: Hierarchy ([nama Mupel] | [nama Jemaat] | [nama Pos Pelkes])
        const validPosName =
          options?.posName &&
          options.posName !== 'Pelayanan Jemaat Direct' &&
          options.posName !== '-' &&
          !options.posName.toLowerCase().startsWith('jemaat ')
            ? options.posName
            : null;

        const hierarchyParts = [
          options?.mupelName,
          options?.jemaatName,
          validPosName,
        ].filter(Boolean);

        const hierarchyText = hierarchyParts.length > 0 ? hierarchyParts.join(' | ') : '-';

        // 4. Format Line 3: Timestamp (timestamp YYYY-MM-DD HH:mm:ss)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');

        const timeStampText = `timestamp: ${year}-${month}-${day} ${hours}:${mins}:${secs}`;

        // 5. Calculate compact, clean dimensions (Small, non-intrusive text)
        const fontSize = Math.max(11, Math.round(canvas.height * 0.016));
        const lineGap = Math.round(fontSize * 1.35);
        const paddingY = Math.max(6, Math.round(canvas.height * 0.01));
        const paddingX = Math.max(10, Math.round(canvas.width * 0.015));
        const bannerHeight = paddingY * 2 + 3 * lineGap;

        // 6. Draw clean, subtle translucent dark overlay at bottom
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

        // Subtle thin top border line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, Math.max(1, Math.round(canvas.height * 0.0015)));

        // 7. Render Text lines (Simple, Clean, Small font)
        const startY = canvas.height - bannerHeight + paddingY + fontSize;

        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 3;
        ctx.fillStyle = '#ffffff';
        ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

        // Line 1: lat / long
        ctx.fillText(gpsText, paddingX, startY);

        // Line 2: Hierarchy
        ctx.fillText(hierarchyText, paddingX, startY + lineGap);

        // Line 3: Timestamp
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(timeStampText, paddingX, startY + lineGap * 2);

        // Reset shadow
        ctx.shadowBlur = 0;

        // 9. Convert to compressed JPEG blob
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
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
