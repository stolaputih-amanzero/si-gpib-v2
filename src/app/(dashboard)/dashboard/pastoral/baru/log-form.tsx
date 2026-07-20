'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Loader2 } from 'lucide-react';
import { submitPastoralLog } from './actions';
import { createClient } from '@/lib/supabase/client';

const formSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  id_pendeta: z.string().min(1, 'Pendeta wajib dipilih'),
  tgl: z.string().min(1, 'Tanggal wajib diisi'),
  kegiatan: z.string().min(3, 'Kegiatan minimal 3 karakter'),
  jml_jiwa: z.number().nullable().optional(),
  catatan: z.string().optional(),
  keterangan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LogForm({ posList, pendetaList }: { posList: any[], pendetaList: any[] }) {
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tgl: new Date().toISOString().split('T')[0], // Default hari ini
    }
  });

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side compression (< 1MB)
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setPhotoBlob(blob);
              setPhotoPreview(URL.createObjectURL(blob));
            }
          },
          'image/jpeg',
          0.7
        );
      };
    };
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const formData = new FormData();
    
    // 1. Jika ada foto, upload dulu ke Supabase Storage (Client-side upload)
    let foto_url = null;
    if (photoBlob) {
      const fileExt = 'jpg';
      const fileName = `log_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('log-pastoral-images')
        .upload(filePath, photoBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });
        
      if (uploadError) {
        setServerError('Gagal mengunggah foto: ' + uploadError.message);
        return;
      }
      foto_url = filePath;
    }

    // 2. Kirim data form ke Server Action
    formData.append('id_pos', data.id_pos);
    formData.append('id_pendeta', data.id_pendeta);
    formData.append('tgl', data.tgl);
    formData.append('kegiatan', data.kegiatan);
    if (data.jml_jiwa) formData.append('jml_jiwa', data.jml_jiwa.toString());
    if (data.catatan) formData.append('catatan', data.catatan);
    if (data.keterangan) formData.append('keterangan', data.keterangan);
    if (foto_url) formData.append('foto_url', foto_url);

    const result = await submitPastoralLog(null, formData);
    
    if (result?.error) {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
      {serverError && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {serverError}
        </div>
      )}

      {/* Foto Kegiatan (Bagian Atas) */}
      <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle shadow-soft space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2 text-text-high">Foto Kegiatan (Opsional)</h2>
        
        <div className="space-y-4">
          {photoPreview ? (
            <div className="relative rounded-lg overflow-hidden border border-border-subtle bg-gray-100 h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setPhotoBlob(null); setPhotoPreview(null); }}
                className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-full shadow-md"
              >
                <span className="sr-only">Hapus</span>
                &times;
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-strong rounded-xl p-8 flex flex-col items-center justify-center text-text-muted hover:bg-surface-sunken hover:border-brand-primary cursor-pointer transition-colors h-64"
            >
              <Camera size={40} className="mb-3 text-brand-primary/80" />
              <p className="text-sm font-medium text-text-high mb-1">Ambil Foto / Pilih dari Galeri</p>
              <p className="text-xs text-text-muted">Langsung dari kamera HP (Otomatis Kompresi)</p>
            </div>
          )}
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle shadow-soft space-y-5">
        <h2 className="text-lg font-semibold border-b pb-2 text-text-high">Data Pelayanan</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-high">Tanggal Kegiatan *</label>
            <input 
              {...register('tgl')}
              type="date"
              className="mt-1.5 block w-full px-4 py-3 border border-border-strong rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-surface-base"
            />
            {errors.tgl && <p className="mt-1 text-xs text-red-500">{errors.tgl.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">Jenis Kegiatan *</label>
            <input 
              {...register('kegiatan')}
              type="text"
              placeholder="Cth: Ibadah Minggu, Kunjungan Sakit"
              className="mt-1.5 block w-full px-4 py-3 border border-border-strong rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-surface-base"
            />
            {errors.kegiatan && <p className="mt-1 text-xs text-red-500">{errors.kegiatan.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">Pos Pelkes *</label>
            <select 
              {...register('id_pos')}
              className="mt-1.5 block w-full px-4 py-3 border border-border-strong bg-surface-base rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            >
              <option value="">Pilih Pos Pelkes...</option>
              {posList.map(pos => (
                <option key={pos.id_pos} value={pos.id_pos}>{pos.nama_pos}</option>
              ))}
            </select>
            {errors.id_pos && <p className="mt-1 text-xs text-red-500">{errors.id_pos.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">Pendeta / Pelayan *</label>
            <select 
              {...register('id_pendeta')}
              className="mt-1.5 block w-full px-4 py-3 border border-border-strong bg-surface-base rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            >
              <option value="">Pilih Pendeta...</option>
              {pendetaList.map(pendeta => (
                <option key={pendeta.id_pendeta} value={pendeta.id_pendeta}>{pendeta.nama_lengkap}</option>
              ))}
            </select>
            {errors.id_pendeta && <p className="mt-1 text-xs text-red-500">{errors.id_pendeta.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">Estimasi Jumlah Hadir</label>
            <input 
              {...register('jml_jiwa', { valueAsNumber: true })}
              type="number"
              placeholder="Opsional (cth: 45)"
              className="mt-1.5 block w-full px-4 py-3 border border-border-strong rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-surface-base"
            />
          </div>
        </div>

        <div className="space-y-5 pt-3">
          <div>
            <label className="block text-sm font-medium text-text-high">Catatan Pastoral</label>
            <textarea 
              {...register('catatan')}
              rows={3}
              placeholder="Catatan dari kegiatan pelayanan (hambatan, pokok doa, dsb)"
              className="mt-1.5 block w-full px-4 py-3 border border-border-strong rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-surface-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-high">Keterangan Lainnya</label>
            <textarea 
              {...register('keterangan')}
              rows={2}
              placeholder="Opsional"
              className="mt-1.5 block w-full px-4 py-3 border border-border-strong rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-surface-base"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          <><Loader2 className="animate-spin mr-2" size={20} /> Mengirim Data...</>
        ) : (
          'Simpan Log Pastoral'
        )}
      </button>
    </form>
  );
}
