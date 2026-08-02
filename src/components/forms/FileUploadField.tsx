'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export interface FileUploadFieldProps {
  files: FileUploadItem[];
  onChange: (files: FileUploadItem[]) => void;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  className?: string;
}

export function FileUploadField({
  files = [],
  onChange,
  accept = 'application/pdf,image/jpeg,image/png',
  maxSizeMB = 10,
  maxFiles = 5,
  className,
}: FileUploadFieldProps) {
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const addedItems: FileUploadItem[] = [];

    if (files.length + newFiles.length > maxFiles) {
      setErrorMessage(`Maksimal ${maxFiles} file dokumen per aset.`);
      return;
    }

    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i];
      if (f.size / (1024 * 1024) > maxSizeMB) {
        setErrorMessage(`Ukuran file "${f.name}" melebihi batas ${maxSizeMB}MB.`);
        continue;
      }

      let previewUrl: string | undefined;
      if (f.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(f);
      }

      addedItems.push({
        id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        previewUrl,
      });
    }

    if (addedItems.length > 0) {
      onChange([...files, ...addedItems]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-3 w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Zone */}
      {files.length < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'p-5 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer min-h-[100px] flex flex-col items-center justify-center space-y-1.5',
            dragOver
              ? 'border-brand-primary bg-brand-primary/10'
              : 'border-border-subtle bg-surface-1 hover:border-brand-primary/60 hover:bg-surface-sunken'
          )}
        >
          <UploadCloud className="w-7 h-7 text-brand-primary mb-1" />
          <p className="text-xs font-bold text-text-high">
            Drag & drop atau <span className="text-brand-primary underline">Pilih File Dokumen</span>
          </p>
          <p className="text-[11px] text-text-tertiary">
            Format: PDF, JPG, PNG (Maks {maxSizeMB}MB per file, tersisa {maxFiles - files.length} file)
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2 font-semibold">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
          {files.map((item) => (
            <div key={item.id} className="p-3 flex items-center justify-between gap-3 min-h-[52px]">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {item.previewUrl ? (
                  <img src={item.previewUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-border-subtle shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-surface-sunken flex items-center justify-center text-brand-primary shrink-0 border border-border-subtle">
                    <FileText size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-extrabold text-text-high truncate">{item.name}</p>
                  <p className="text-[10px] font-mono text-text-tertiary">{formatSize(item.size)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="w-8 h-8 rounded-lg bg-surface-sunken hover:bg-red-500/10 hover:text-red-600 text-text-tertiary flex items-center justify-center transition-colors shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
                title="Hapus Dokumen"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUploadField;
