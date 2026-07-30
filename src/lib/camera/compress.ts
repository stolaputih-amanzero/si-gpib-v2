/**
 * Kompres gambar umum (laporan/aset/WhatsApp preview).
 * Resize ke max 900px dan output JPG quality 0.8.
 */
export async function compressImage(file: File): Promise<File> {
  return compressCustom(file, 900, 0.8);
}

/**
 * Kompres khusus foto profil / avatar.
 * Resize ke max 300px dan output JPG quality 0.7 (ukuran berkas kecil ~15KB).
 */
export async function compressAvatarImage(file: File): Promise<File> {
  return compressCustom(file, 300, 0.7);
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
