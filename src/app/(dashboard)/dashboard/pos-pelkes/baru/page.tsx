'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Camera, Loader2 } from 'lucide-react';
import { savePosPelkes } from './actions';
import { JemaatCascadingSelector } from '@/components/hierarki/HierarkiSelector/JemaatCascadingSelector';
import { useToast } from '@/components/ui/toast';

const formSchema = z.object({
  id_induk: z.string().min(1, 'Jemaat Induk wajib dipilih'),
  nama_pos: z.string().min(3, 'Nama Pos minimal 3 karakter'),
  kategori: z.enum(['Pos Pelkes', 'Bajem']),
  alamat: z.string().optional(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const parseCoordinates = (text: string): { latitude: number; longitude: number } | null => {
  if (!text) return null;

  // 1. Cek pola URL Google Maps biasa (contoh: .../@-6.123456,106.123456,17z...)
  const urlPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const urlMatch = text.match(urlPattern);
  if (urlMatch) {
    const lat = parseFloat(urlMatch[1]);
    const lng = parseFloat(urlMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 2. Cek pola parameter query (contoh: ?q=-6.123456,106.123456 atau &query=-6.123456,106.123456)
  const queryPattern = /[?&](query|q)=(-?\d+\.\d+),(-?\d+\.\d+)/;
  const queryMatch = text.match(queryPattern);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[2]);
    const lng = parseFloat(queryMatch[3]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 3. Cek pola koordinat mentah (contoh: -6.123456, 106.123456)
  const rawPattern = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
  const rawMatch = text.match(rawPattern);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  return null;
};

const geocodeAddress = async (rawText: string): Promise<{ lat: string; lon: string; display_name: string } | null> => {
  if (!rawText) return null;

  // Clean up plus code (e.g. "7Q4J+832, ")
  const text = rawText.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{2,3},\s*/i, '');

  const fetchNominatim = async (query: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'SI-GPIB-PWA' }
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  // Try 1: Cleaned text
  let data = await fetchNominatim(text);
  if (data && data.length > 0) return data[0];

  // Try 2: Simplified (remove zip, Kec, Kab)
  const simplified = text
    .replace(/\b\d{5}\b/g, '')
    .replace(/Kec(amatan|\.)?/gi, '')
    .replace(/Kab(upaten|\.)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (simplified !== text) {
    data = await fetchNominatim(simplified);
    if (data && data.length > 0) return data[0];
  }

  // Try 3: First 2 parts split by comma
  const parts = text.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const fallbackQuery = `${parts[0]}, ${parts[1]}`;
    data = await fetchNominatim(fallbackQuery);
    if (data && data.length > 0) return data[0];
  }

  return null;
};

export default function TambahPosPelkesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gmapsInput, setGmapsInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractCoordinates = async () => {
    if (!gmapsInput.trim()) {
      toast.error('Input Kosong', 'Silakan tempel link Google Maps atau alamat terlebih dahulu.');
      return;
    }

    setIsExtracting(true);

    if (gmapsInput.includes('maps.app.goo.gl')) {
      toast.info('Tautan Dipersingkat', 'Untuk link maps.app.goo.gl, silakan gunakan koordinat angka langsung atau salin link panjang dari browser desktop.');
    }

    // Try regex coordinates parse first (instant client-side check)
    const regexCoords = parseCoordinates(gmapsInput);
    if (regexCoords) {
      setValue('latitude', regexCoords.latitude);
      setValue('longitude', regexCoords.longitude);
      toast.success('Koordinat Diekstrak', `Berhasil mendeteksi Latitude: ${regexCoords.latitude}, Longitude: ${regexCoords.longitude}`);
      setIsExtracting(false);
      return;
    }

    // Fallback: Geocode text address using Nominatim
    try {
      const result = await geocodeAddress(gmapsInput);
      if (result) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setValue('latitude', lat);
        setValue('longitude', lon);
        toast.success('Geocoding Berhasil', `Berhasil memetakan lokasi pada Latitude: ${lat}, Longitude: ${lon}`);
      } else {
        toast.error('Lokasi Tidak Ditemukan', 'Gagal mengenali alamat/koordinat tersebut. Silakan salin koordinat angka langsung dari Google Maps.');
      }
    } catch (error) {
      toast.error('Gagal Menghubungkan', 'Terjadi kesalahan saat memproses geocoding alamat.');
    } finally {
      setIsExtracting(false);
    }
  };
  
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kategori: 'Pos Pelkes',
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
    formData.append('id_induk', data.id_induk);
    formData.append('nama_pos', data.nama_pos);
    formData.append('kategori', data.kategori);
    if (data.alamat) formData.append('alamat', data.alamat);
    if (data.latitude) formData.append('latitude', data.latitude.toString());
    if (data.longitude) formData.append('longitude', data.longitude.toString());
    
    if (photoBlob) {
      formData.append('photo', photoBlob, 'photo.jpg');
    }

    const result = await savePosPelkes(formData);
    
    if (result?.error) {
      setServerError(result.error);
    } else {
      toast.success('Penyimpanan Berhasil', 'Unit pelayanan baru berhasil ditambahkan.');
      router.push(`/dashboard/pos-pelkes/${result.id_pos}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-primary">Tambah Unit Pelayanan</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-xs text-text-muted">
          Kolom bertanda <span className="text-red-500 font-bold">*</span> wajib diisi (compulsory).
        </p>

        {serverError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {serverError}
          </div>
        )}

        <div className="bg-surface-elevated p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold border-b pb-2">Informasi Dasar</h2>
          
          <div className="space-y-1.5 w-full">
            <Controller
              name="id_induk"
              control={control}
              render={({ field }) => (
                <JemaatCascadingSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.id_induk?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">
              Kategori Status Unit <span className="text-red-500">*</span>
            </label>
            <select 
              {...register('kategori')}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            >
              <option value="Pos Pelkes">Pos Pelkes (Pos Pelayanan Kesaksian)</option>
              <option value="Bajem">Bajem (Bakal Jemaat)</option>
            </select>
            {errors.kategori && <p className="mt-1 text-xs text-red-500">{errors.kategori.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">
              Nama Unit (Pos Pelkes / Bajem) <span className="text-red-500">*</span>
            </label>
            <input 
              {...register('nama_pos')}
              type="text"
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              placeholder="Cth: Bajem Wonobakti / Pos Pelkes Getsemani"
            />
            {errors.nama_pos && <p className="mt-1 text-xs text-red-500">{errors.nama_pos.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-high">
              Alamat Lengkap <span className="text-text-muted">(Opsional)</span>
            </label>
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

          <div>
            <label className="block text-sm font-medium text-text-high">
              Ekstrak dari Link Google Maps / Koordinat / Alamat <span className="text-text-muted">(Opsional)</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Tempel link Google Maps, koordinat, atau alamat (Cth: Miau Merah, Silat Hilir)..."
                value={gmapsInput}
                onChange={(e) => setGmapsInput(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={handleExtractCoordinates}
                disabled={isExtracting}
                className="px-4 py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {isExtracting ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Ekstrak</span>
              </button>
            </div>
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
