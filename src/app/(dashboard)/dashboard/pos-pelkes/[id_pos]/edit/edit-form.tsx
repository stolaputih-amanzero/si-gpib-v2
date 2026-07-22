'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { updatePosPelkes } from '../../baru/actions';
import { JemaatCascadingSelector } from '@/components/hierarki/HierarkiSelector/JemaatCascadingSelector';

const formSchema = z.object({
  id_induk: z.string().min(1, 'Jemaat Induk wajib dipilih'),
  nama_pos: z.string().min(3, 'Nama Pos minimal 3 karakter'),
  kategori: z.enum(['Pos Pelkes', 'Bajem']),
  alamat: z.string().min(5, 'Alamat wajib diisi'),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  keterangan: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditPosPelkesForm({ pos }: { pos: any }) {
  const router = useRouter();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_induk: pos.id_induk,
      nama_pos: pos.nama_pos,
      kategori: (pos.kategori === 'Bajem' || pos.nama_pos.toLowerCase().includes('bajem')) ? 'Bajem' : 'Pos Pelkes',
      alamat: pos.alamat || '',
      latitude: pos.latitude || null,
      longitude: pos.longitude || null,
      keterangan: pos.keterangan || '',
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

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('id_induk', data.id_induk);
    formData.append('nama_pos', data.nama_pos);
    formData.append('kategori', data.kategori);
    formData.append('alamat', data.alamat);
    if (data.latitude !== null && data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
    if (data.longitude !== null && data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
    if (data.keterangan) formData.append('keterangan', data.keterangan);

    const result = await updatePosPelkes(pos.id_pos, formData);
    
    if (result?.error) {
      setServerError(result.error);
    } else {
      router.push(`/dashboard/pos-pelkes/${pos.id_pos}`);
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center gap-3">
        <Link 
          href={`/dashboard/pos-pelkes/${pos.id_pos}`}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-text-high transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-text-high tracking-tight">Edit Data Pos / Bajem</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-3.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {serverError}
          </div>
        )}

        <div className="bg-surface-elevated p-6 rounded-2xl border border-border-subtle shadow-soft space-y-5">
          <h2 className="text-base font-black border-b border-border-subtle pb-3 text-text-high">Informasi Dasar</h2>
          
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
                  defaultIndukId={pos.id_induk}
                />
              )}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-text-high uppercase tracking-wider">Kategori Status Unit</label>
            <select 
              {...register('kategori')}
              className="mt-1 block w-full px-3 py-3 border border-border-strong bg-surface-sunken text-text-high rounded-xl shadow-xs focus:ring-brand-primary focus:border-brand-primary text-sm focus:outline-none"
            >
              <option value="Pos Pelkes">Pos Pelkes (Pos Pelayanan Kesaksian)</option>
              <option value="Bajem">Bajem (Bakal Jemaat)</option>
            </select>
            {errors.kategori && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.kategori.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-text-high uppercase tracking-wider">Nama Unit (Pos Pelkes / Bajem)</label>
            <input 
              {...register('nama_pos')}
              type="text"
              className="mt-1 block w-full px-3 py-3 border border-border-strong bg-surface-sunken text-text-high rounded-xl shadow-xs focus:ring-brand-primary focus:border-brand-primary text-sm focus:outline-none"
              placeholder="Cth: Bajem Wonobakti / Pos Pelkes Getsemani"
            />
            {errors.nama_pos && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.nama_pos.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-text-high uppercase tracking-wider">Alamat Lengkap</label>
            <textarea 
              {...register('alamat')}
              rows={3}
              className="mt-1 block w-full px-3 py-3 border border-border-strong bg-surface-sunken text-text-high rounded-xl shadow-xs focus:ring-brand-primary focus:border-brand-primary text-sm focus:outline-none"
              placeholder="Jl. Contoh No. 123..."
            />
            {errors.alamat && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.alamat.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-text-high uppercase tracking-wider">Keterangan Tambahan</label>
            <textarea 
              {...register('keterangan')}
              rows={2}
              className="mt-1 block w-full px-3 py-3 border border-border-strong bg-surface-sunken text-text-high rounded-xl shadow-xs focus:ring-brand-primary focus:border-brand-primary text-sm focus:outline-none"
              placeholder="Keterangan tambahan pos..."
            />
            {errors.keterangan && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.keterangan.message}</p>}
          </div>
        </div>

        <div className="bg-surface-elevated p-6 rounded-2xl border border-border-subtle shadow-soft space-y-5">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <h2 className="text-base font-black text-text-high">Lokasi (GPS)</h2>
            <button
              type="button"
              onClick={getLocation}
              disabled={isGettingLocation}
              className="inline-flex items-center px-3.5 py-2 border border-transparent text-xs font-bold rounded-xl shadow-xs text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isGettingLocation ? <Loader2 size={14} className="animate-spin mr-1" /> : <MapPin size={14} className="mr-1" />}
              Ambil Lokasi
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-black text-text-high uppercase tracking-wider">Latitude</label>
              <input 
                {...register('latitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="mt-1 block w-full px-3 py-3 border border-border-strong bg-surface-sunken text-text-high rounded-xl shadow-xs text-sm focus:outline-none"
                placeholder="-6.123456"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-black text-text-high uppercase tracking-wider">Longitude</label>
              <input 
                {...register('longitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="mt-1 block w-full px-3 py-3 border border-border-strong bg-surface-sunken text-text-high rounded-xl shadow-xs text-sm focus:outline-none"
                placeholder="106.123456"
              />
            </div>
          </div>
          <p className="text-xs text-text-muted mt-1">Gunakan tombol "Ambil Lokasi" untuk presisi terbaik, atau isi manual jika gagal.</p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-brand-primary hover:bg-blue-800 focus:outline-none disabled:opacity-50 transition-all active:scale-98"
        >
          {isSubmitting ? (
            <><Loader2 className="animate-spin mr-2" size={18} /> Menyimpan...</>
          ) : (
            'Perbarui Data Unit'
          )}
        </button>
      </form>
    </div>
  );
}
