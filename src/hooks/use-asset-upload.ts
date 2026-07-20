'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAssetUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadAsset = async (file: File, idPos: string): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `assets/${idPos}/${timestamp}-${cleanFileName}`;

      const { error } = await supabase.storage
        .from('assets-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Ambil public URL
      const { data: publicUrlData } = supabase.storage
        .from('assets-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading asset:', error);
      setUploadError(error.message || 'Gagal mengupload file.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAsset, isUploading, uploadError };
}
