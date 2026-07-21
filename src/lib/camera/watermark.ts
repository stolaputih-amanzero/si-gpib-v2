export interface WatermarkOptions {
  lat?: number | null;
  lng?: number | null;
  label?: string;
}

/**
 * Stamps image with GPS Geolocation coordinates and Date-Time Watermark
 */
export async function addWatermarkToImage(
  file: File,
  options?: WatermarkOptions
): Promise<File> {
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
        const bannerHeight = Math.max(70, canvas.height * 0.12);
        const fontSize = Math.max(16, canvas.height * 0.03);

        // 3. Draw dark translucent banner background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.80)'; // Navy Slate
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

        // 4. Gold Accent Line at top of banner
        ctx.fillStyle = '#c5a855';
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, Math.max(4, canvas.height * 0.006));

        // 5. Format Timestamp string
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');

        const timeStampText = `🕒 ${year}-${month}-${day} ${hours}:${mins}:${secs} WIB`;

        // 6. Format GPS Text
        let gpsText = '📌 GPS: Sinyal Tidak Terdeteksi';
        if (options?.lat != null && options?.lng != null) {
          gpsText = `📌 GPS: ${options.lat.toFixed(5)}, ${options.lng.toFixed(5)}`;
        }

        const tagText = options?.label || 'SI GPIB Pastoral Log';

        // 7. Render Text onto Canvas
        const paddingX = Math.max(16, canvas.width * 0.03);
        const startY = canvas.height - bannerHeight + fontSize * 1.2;

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(gpsText, paddingX, startY);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = `medium ${fontSize * 0.9}px sans-serif`;
        ctx.fillText(timeStampText, paddingX, startY + fontSize * 1.3);

        // Render SI GPIB tag at right
        ctx.fillStyle = '#c5a855';
        ctx.font = `bold ${fontSize * 0.85}px sans-serif`;
        const tagWidth = ctx.measureText(tagText).width;
        ctx.fillText(tagText, canvas.width - paddingX - tagWidth, startY + fontSize * 1.3);

        // 8. Convert to compressed JPEG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const stampedFile = new File([blob], file.name || 'pastoral-photo.jpg', {
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
