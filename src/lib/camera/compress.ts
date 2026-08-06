export async function compressImage(
  file: File,
  opts: { maxDim?: number; targetKB?: number } = {}
): Promise<File> {
  const maxDim = opts.maxDim ?? 1920;
  const targetBytes = (opts.targetKB ?? 200) * 1024; // NFR-08: 200KB max
  const MAX_ITERATIONS = 10;

  // Guard: createImageBitmap support check
  if (typeof createImageBitmap !== 'function') {
    // Fallback: return original file (caller should validate size)
    return file;
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  
  let canvasWidth = Math.round(bitmap.width * scale);
  let canvasHeight = Math.round(bitmap.height * scale);
  
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  
  ctx.drawImage(bitmap, 0, 0, canvasWidth, canvasHeight);

  let quality = 0.8;
  let iterations = 0;
  let blob: Blob | null = null;

  while (iterations < MAX_ITERATIONS) {
    blob = await new Promise<Blob | null>(resolve => 
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    if (blob.size <= targetBytes) {
      break; // ✅ Target achieved
    }

    // Strategy 1: reduce quality (down to 0.3)
    if (quality > 0.3) {
      quality -= 0.1;
    } 
    // Strategy 2: further reduce dimensions if quality floor reached
    else if (canvasWidth > 800) {
      canvasWidth = Math.round(canvasWidth * 0.75);
      canvasHeight = Math.round(canvasHeight * 0.75);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.drawImage(bitmap, 0, 0, canvasWidth, canvasHeight);
      quality = 0.5; // Reset quality for smaller canvas
    } 
    else {
      // ✅ Cannot compress further — accept current size
      break;
    }

    iterations++;
  }

  if (!blob) {
    throw new Error('Compression produced no output');
  }

  return new File([blob], file.name || 'image.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

/**
 * Kompres khusus foto profil pengguna & foto keluarga pendeta (HD up to 2MB).
 * Resize ke max 1000px dan output JPG quality 0.85 (tampilan tajam jernih hingga 2MB).
 */
export async function compressAvatarImage(file: File): Promise<File> {
  return compressCustom(file, 1000, 0.85);
}

function compressCustom(file: File, maxDimension: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses gambar.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error('Gagal mengompres gambar.'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
