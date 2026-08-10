'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ success: boolean; error?: string }>;
  onDelete?: () => Promise<void>;
  currentFile?: { name: string; url: string };
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onUpload,
  onDelete,
  currentFile,
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentFile?.url || null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    setError(null);
    setUploading(true);
    
    try {
      const result = await onUpload(file);
      if (result.success) {
        setPreview(URL.createObjectURL(file));
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      setPreview(null);
    }
  };
  
  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative border rounded-lg p-4 bg-surface-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="max-h-48 mx-auto object-contain rounded-md" />
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-line-subtle rounded-xl cursor-pointer hover:bg-surface-2 transition-colors">
          <Upload className="w-8 h-8 text-ink-tertiary mb-2" />
          <span className="text-sm font-medium text-ink-secondary">Click to upload</span>
          <span className="text-xs text-ink-tertiary mt-1">Max {maxSizeMB}MB ({accept})</span>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
      
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      {uploading && (
        <p className="text-sm font-medium text-brand-600 flex items-center gap-2">
          <span className="animate-spin w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full" />
          Uploading...
        </p>
      )}
    </div>
  );
}
