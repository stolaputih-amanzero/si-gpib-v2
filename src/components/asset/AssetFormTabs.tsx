'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAssetUpload } from '@/hooks/use-asset-upload';
import { AssetCameraInput } from './AssetCameraInput';
import { GpsInput } from './GpsInput';
import { 
  asetTanahSchema, asetBangunanSchema, asetBergerakSchema,
} from '@/lib/validations/asset.schema';

interface AssetFormTabsProps {
  idPos: string;
}

export function AssetFormTabs({ idPos }: AssetFormTabsProps) {
  const [activeTab, setActiveTab] = useState<'TANAH' | 'BANGUNAN' | 'BERGERAK'>('TANAH');
  const router = useRouter();
  
  const { uploadAsset, isUploading, uploadError } = useAssetUpload();
  
  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex bg-surface-sunken p-1 rounded-lg border border-border-subtle">
        <button
          onClick={() => setActiveTab('TANAH')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'TANAH' ? 'bg-surface-elevated text-brand-primary shadow-soft' : 'text-text-muted hover:text-text-high'}`}
        >
          Tanah
        </button>
        <button
          onClick={() => setActiveTab('BANGUNAN')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'BANGUNAN' ? 'bg-surface-elevated text-brand-primary shadow-soft' : 'text-text-muted hover:text-text-high'}`}
        >
          Bangunan
        </button>
        <button
          onClick={() => setActiveTab('BERGERAK')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'BERGERAK' ? 'bg-surface-elevated text-brand-primary shadow-soft' : 'text-text-muted hover:text-text-high'}`}
        >
          Bergerak
        </button>
      </div>

      {uploadError && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-sm flex items-start gap-2 font-medium">
           <AlertCircle className="w-5 h-5 flex-shrink-0" />
           <p>{uploadError}</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-surface-elevated rounded-md p-4 sm:p-6 shadow-soft border border-border-subtle">
        {activeTab === 'TANAH' && (
          <FormTanah idPos={idPos} uploadAsset={uploadAsset} isUploading={isUploading} router={router} />
        )}
        {activeTab === 'BANGUNAN' && (
          <FormBangunan idPos={idPos} uploadAsset={uploadAsset} isUploading={isUploading} router={router} />
        )}
        {activeTab === 'BERGERAK' && (
          <FormBergerak idPos={idPos} uploadAsset={uploadAsset} isUploading={isUploading} router={router} />
        )}
      </div>
    </div>
  );
}

// ==============================
// FORM TANAH
// ==============================
function FormTanah({ idPos, uploadAsset, isUploading, router }: any) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(asetTanahSchema),
    defaultValues: { id_pos: idPos, luas_m2: '', thn_perolehan: new Date().getFullYear(), status_hukum: '', kondisi: 'Baik', lokasi_lat: null, lokasi_lng: null, foto: null }
  });

  const onSubmit = async (data: any) => {
    try {
      const supabase = createClient();
      let filePath = null;
      if (data.foto) {
        filePath = await uploadAsset(data.foto, idPos);
        if (!filePath) return;
      }
      const idAset = `AST-T-${Date.now()}`;
      const { error: dbError } = await supabase.from('t_aset_tanah').insert({
        id_aset: idAset, id_pos: data.id_pos, luas_m2: data.luas_m2, thn_perolehan: data.thn_perolehan, 
        status_hukum: data.status_hukum, kondisi: data.kondisi, lokasi_lat: data.lokasi_lat, lokasi_lng: data.lokasi_lng,
      });
      if (dbError) throw dbError;
      if (filePath) {
         await supabase.from('t_lampiran_aset').insert({
            id_entitas: idAset, kategori_entitas: 'TANAH', jenis_dokumen: 'FOTO_ASET', file_path: filePath
         });
      }
      if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]);
      router.push(`/dashboard/pos-pelkes/${idPos}`);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan data: ' + err.message);
      if ('vibrate' in navigator) navigator.vibrate([50, 100, 50]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Luas Tanah (m2)</label>
        <input type="number" {...register('luas_m2')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
        {errors.luas_m2 && <p className="text-xs text-error mt-1">{errors.luas_m2.message as string}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Tahun Perolehan</label>
        <input type="number" {...register('thn_perolehan')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Status Hukum</label>
        <input type="text" placeholder="SHM, HGB, Hibah, dll." {...register('status_hukum')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Kondisi</label>
        <select {...register('kondisi')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50">
          <option value="Baik">Baik</option>
          <option value="Rusak Ringan">Rusak Ringan</option>
          <option value="Rusak Berat">Rusak Berat</option>
        </select>
      </div>

      <GpsInput 
        lat={watch('lokasi_lat') as number | null}
        lng={watch('lokasi_lng') as number | null}
        onLatChange={(v) => setValue('lokasi_lat', v)}
        onLngChange={(v) => setValue('lokasi_lng', v)}
      />

      <Controller
        name="foto"
        control={control}
        render={({ field }) => (
          <AssetCameraInput onFileSelect={field.onChange} error={errors.foto?.message as string} />
        )}
      />

      <button type="submit" disabled={isSubmitting || isUploading} className="w-full min-h-[44px] bg-brand-primary text-white rounded-md font-medium text-base hover:bg-brand-primary/90 active:scale-95 transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        {isSubmitting || isUploading ? 'Menyimpan...' : 'Simpan Aset Tanah'}
      </button>
    </form>
  );
}

// ==============================
// FORM BANGUNAN
// ==============================
function FormBangunan({ idPos, uploadAsset, isUploading, router }: any) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(asetBangunanSchema),
    defaultValues: { id_pos: idPos, luas_m2: '', thn_dibangun: new Date().getFullYear(), kondisi: 'Baik', lokasi_lat: null, lokasi_lng: null, foto: null }
  });

  const onSubmit = async (data: any) => {
    try {
      const supabase = createClient();
      let filePath = null;
      if (data.foto) {
        filePath = await uploadAsset(data.foto, idPos);
        if (!filePath) return;
      }
      const idAset = `AST-B-${Date.now()}`;
      const { error: dbError } = await supabase.from('t_aset_bangunan').insert({
        id_aset: idAset, id_pos: data.id_pos, luas_m2: data.luas_m2, thn_dibangun: data.thn_dibangun, 
        kondisi: data.kondisi, lokasi_lat: data.lokasi_lat, lokasi_lng: data.lokasi_lng,
      });
      if (dbError) throw dbError;
      if (filePath) {
         await supabase.from('t_lampiran_aset').insert({
            id_entitas: idAset, kategori_entitas: 'BANGUNAN', jenis_dokumen: 'FOTO_ASET', file_path: filePath
         });
      }
      if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]);
      router.push(`/dashboard/pos-pelkes/${idPos}`);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan data: ' + err.message);
      if ('vibrate' in navigator) navigator.vibrate([50, 100, 50]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Luas Bangunan (m2)</label>
        <input type="number" {...register('luas_m2')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
        {errors.luas_m2 && <p className="text-xs text-error mt-1">{errors.luas_m2.message as string}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Tahun Dibangun</label>
        <input type="number" {...register('thn_dibangun')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Kondisi</label>
        <select {...register('kondisi')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50">
          <option value="Baik">Baik</option>
          <option value="Rusak Ringan">Rusak Ringan</option>
          <option value="Rusak Berat">Rusak Berat</option>
        </select>
      </div>

      <GpsInput 
        lat={watch('lokasi_lat') as number | null}
        lng={watch('lokasi_lng') as number | null}
        onLatChange={(v) => setValue('lokasi_lat', v)}
        onLngChange={(v) => setValue('lokasi_lng', v)}
      />

      <Controller
        name="foto"
        control={control}
        render={({ field }) => (
          <AssetCameraInput onFileSelect={field.onChange} error={errors.foto?.message as string} />
        )}
      />

      <button type="submit" disabled={isSubmitting || isUploading} className="w-full min-h-[44px] bg-brand-primary text-white rounded-md font-medium text-base hover:bg-brand-primary/90 active:scale-95 transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        {isSubmitting || isUploading ? 'Menyimpan...' : 'Simpan Aset Bangunan'}
      </button>
    </form>
  );
}

// ==============================
// FORM BERGERAK
// ==============================
function FormBergerak({ idPos, uploadAsset, isUploading, router }: any) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(asetBergerakSchema),
    defaultValues: { id_pos: idPos, nama_barang: '', merk_tipe: '', thn_perolehan: new Date().getFullYear(), jumlah: 1, kondisi: 'Baik', foto: null }
  });

  const onSubmit = async (data: any) => {
    try {
      const supabase = createClient();
      let filePath = null;
      if (data.foto) {
        filePath = await uploadAsset(data.foto, idPos);
        if (!filePath) return;
      }
      const idAset = `AST-M-${Date.now()}`;
      const { error: dbError } = await supabase.from('t_aset_bergerak').insert({
        id_aset: idAset, id_pos: data.id_pos, nama_barang: data.nama_barang, merk_tipe: data.merk_tipe,
        thn_perolehan: data.thn_perolehan, jumlah: data.jumlah, kondisi: data.kondisi,
      });
      if (dbError) throw dbError;
      if (filePath) {
         await supabase.from('t_lampiran_aset').insert({
            id_entitas: idAset, kategori_entitas: 'BERGERAK', jenis_dokumen: 'FOTO_ASET', file_path: filePath
         });
      }
      if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]);
      router.push(`/dashboard/pos-pelkes/${idPos}`);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan data: ' + err.message);
      if ('vibrate' in navigator) navigator.vibrate([50, 100, 50]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Nama Barang</label>
        <input type="text" placeholder="Gitar, Kursi, Meja, dll" {...register('nama_barang')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
        {errors.nama_barang && <p className="text-xs text-error mt-1">{errors.nama_barang.message as string}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Merk / Tipe</label>
        <input type="text" {...register('merk_tipe')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div>
        <label className="text-sm font-medium text-text-high mb-1.5 block">Tahun Perolehan</label>
        <input type="number" {...register('thn_perolehan')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-text-high mb-1.5 block">Jumlah</label>
          <input type="number" {...register('jumlah')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50" />
          {errors.jumlah && <p className="text-xs text-error mt-1">{errors.jumlah.message as string}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-text-high mb-1.5 block">Kondisi</label>
          <select {...register('kondisi')} className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base focus:ring-2 focus:ring-brand-primary/50">
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select>
        </div>
      </div>

      <Controller
        name="foto"
        control={control}
        render={({ field }) => (
          <AssetCameraInput onFileSelect={field.onChange} error={errors.foto?.message as string} />
        )}
      />

      <button type="submit" disabled={isSubmitting || isUploading} className="w-full min-h-[44px] bg-brand-primary text-white rounded-md font-medium text-base hover:bg-brand-primary/90 active:scale-95 transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        {isSubmitting || isUploading ? 'Menyimpan...' : 'Simpan Aset Bergerak'}
      </button>
    </form>
  );
}
