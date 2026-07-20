'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Camera, Loader2 } from 'lucide-react';
import { savePosPelkes } from './actions';

const formSchema = z.object({
  id_induk: z.string().min(1, 'Jemaat Induk wajib dipilih'),
  nama_pos: z.string().min(3, 'Nama Pos minimal 3 karakter'),
  alamat: z.string().min(5, 'Alamat wajib diisi'),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TambahPosPelkesPage() {
  const router = useRouter();
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: null,
      longitude: null,
    }
  });


  const getLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          setIsGettingLocation(false);
        },
        () => {
          alert('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Browser Anda tidak mendukung geolokasi.');
      setIsGettingLocation(false);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side compression using Canvas (< 1MB)
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
          0.7 // 70% quality usually results in < 1MB for 1200px
        );
      };
    };
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('id_induk', data.id_induk);
    formData.append('nama_pos', data.nama_pos);
    formData.append('alamat', data.alamat);
    if (data.latitude) formData.append('latitude', data.latitude.toString());
    if (data.longitude) formData.append('longitude', data.longitude.toString());
    
    if (photoBlob) {
      formData.append('photo', photoBlob, 'photo.jpg');
    }

    const result = await savePosPelkes(formData);
    
    if (result?.error) {
      setServerError(result.error);
    } else {
      router.push('/dashboard/pos-pelkes');
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-primary">Tambah Pos Pelkes</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {serverError}
          </div>
        )}

        <div className="bg-surface-elevated p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold border-b pb-2">Informasi Dasar</h2>
          
          <div>
            <label className="block text-sm font-medium text-text-high">Jemaat Induk</label>
            <select 
              {...register('id_induk')}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            >
              <option value="">Pilih Jemaat Induk...</option>
              {/* Dummy data for prototype, in real app fetch from m_jemaat_induk */}
              <option value="01-01-AP">ANUGERAH - Pangkalan Brandan</option>
              <option value="04-10-IP">IMMANUEL - Pekanbaru</option>
              <option value="03-01-BB">BAHTERA HAYAT - Batam</option>
            </select>
            {errors.id_induk && <p className="mt-1 text-xs text-red-500">{errors.id_induk.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">Nama Pos Pelkes</label>
            <input 
              {...register('nama_pos')}
              type="text"
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              placeholder="Cth: Pos Pelkes Getsemani"
            />
            {errors.nama_pos && <p className="mt-1 text-xs text-red-500">{errors.nama_pos.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">Alamat Lengkap</label>
            <textarea 
              {...register('alamat')}
              rows={3}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              placeholder="Jl. Contoh No. 123..."
            />
            {errors.alamat && <p className="mt-1 text-xs text-red-500">{errors.alamat.message}</p>}
          </div>
        </div>

        <div className="bg-surface-elevated p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">Lokasi (GPS)</h2>
            <button
              type="button"
              onClick={getLocation}
              disabled={isGettingLocation}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isGettingLocation ? <Loader2 size={14} className="animate-spin mr-1" /> : <MapPin size={14} className="mr-1" />}
              Ambil Lokasi
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-high">Latitude</label>
              <input 
                {...register('latitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm sm:text-sm"
                placeholder="-6.123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-high">Longitude</label>
              <input 
                {...register('longitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm sm:text-sm"
                placeholder="106.123456"
              />
            </div>
          </div>
          <p className="text-xs text-text-muted mt-1">Gunakan tombol "Ambil Lokasi" untuk presisi terbaik, atau isi manual jika gagal.</p>
        </div>

        <div className="bg-surface-elevated p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold border-b pb-2">Foto / Dokumentasi</h2>
          
          <div className="space-y-4">
            {photoPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPhotoBlob(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-md"
                >
                  <span className="sr-only">Hapus</span>
                  &times;
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Camera size={32} className="mb-2 text-brand-primary" />
                <p className="text-sm font-medium">Ambil Foto / Pilih dari Galeri</p>
                <p className="text-xs text-gray-400 mt-1">Otomatis dikompresi ({'<'}1MB)</p>
              </div>
            )}
            
            {/* Native Input: capture="environment" forces back camera on mobile */}
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

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary active:bg-blue-900 disabled:opacity-50"
        >
          {isSubmitting ? (
            <><Loader2 className="animate-spin mr-2" size={20} /> Menyimpan...</>
          ) : (
            'Simpan Data Pos Pelkes'
          )}
        </button>
      </form>
    </div>
  );
}
