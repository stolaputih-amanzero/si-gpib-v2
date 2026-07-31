'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jemaatIndukSchema, JemaatIndukInput } from '@/lib/validations/hierarki.schema';
import { useCreateJemaat, useUpdateJemaat, JemaatIndukItem } from '@/hooks/use-hierarki';
import { X, Church, Loader2, Save, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface JemaatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  id_mupel: string;
  editData?: JemaatIndukItem | null;
}

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

  let data = await fetchNominatim(text);
  if (data && data.length > 0) return data[0];

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

  const parts = text.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const fallbackQuery = `${parts[0]}, ${parts[1]}`;
    data = await fetchNominatim(fallbackQuery);
    if (data && data.length > 0) return data[0];
  }

  return null;
};

export function JemaatFormModal({ isOpen, onClose, id_mupel, editData }: JemaatFormModalProps) {
  const isEdit = Boolean(editData);
  const { toast } = useToast();
  const createMutation = useCreateJemaat();
  const updateMutation = useUpdateJemaat();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [gmapsInput, setGmapsInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(jemaatIndukSchema),
    defaultValues: {
      id_induk: editData?.id_induk || '',
      id_mupel: editData?.id_mupel || id_mupel,
      nama_induk: editData?.nama_induk || '',
      alamat: editData?.alamat || '',
      latitude: editData?.latitude ?? null,
      longitude: editData?.longitude ?? null,
      id_kmj: editData?.id_kmj || null,
      keterangan: editData?.keterangan || '',
      jumlah_sektor: editData?.jumlah_sektor ?? 0,
      jumlah_kk: editData?.jumlah_kk ?? 0,
      jumlah_jiwa: editData?.jumlah_jiwa ?? 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        id_induk: editData?.id_induk || '',
        id_mupel: editData?.id_mupel || id_mupel,
        nama_induk: editData?.nama_induk || '',
        alamat: editData?.alamat || '',
        latitude: editData?.latitude ?? null,
        longitude: editData?.longitude ?? null,
        id_kmj: editData?.id_kmj || null,
        keterangan: editData?.keterangan || '',
        jumlah_sektor: editData?.jumlah_sektor ?? 0,
        jumlah_kk: editData?.jumlah_kk ?? 0,
        jumlah_jiwa: editData?.jumlah_jiwa ?? 0,
      });
      setErrorMsg(null);
      setGmapsInput('');
    }
  }, [isOpen, editData, id_mupel, reset]);

  const getLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          setIsGettingLocation(false);
          toast.success('Lokasi Ditemukan', `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
        },
        () => {
          toast.error('Gagal Lokasi', 'Pastikan GPS aktif dan izin lokasi diberikan.');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error('Tidak Didukung', 'Browser Anda tidak mendukung geolokasi.');
      setIsGettingLocation(false);
    }
  };

  const handleExtractCoordinates = async () => {
    if (!gmapsInput.trim()) {
      toast.error('Input Kosong', 'Silakan tempel link Google Maps atau alamat terlebih dahulu.');
      return;
    }

    setIsExtracting(true);

    if (gmapsInput.includes('maps.app.goo.gl')) {
      toast.info('Tautan Dipersingkat', 'Untuk link maps.app.goo.gl, silakan gunakan koordinat angka langsung atau salin link panjang dari browser desktop.');
    }

    const regexCoords = parseCoordinates(gmapsInput);
    if (regexCoords) {
      setValue('latitude', regexCoords.latitude);
      setValue('longitude', regexCoords.longitude);
      toast.success('Koordinat Diekstrak', `Berhasil mendeteksi Latitude: ${regexCoords.latitude}, Longitude: ${regexCoords.longitude}`);
      setIsExtracting(false);
      return;
    }

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

  if (!isOpen) return null;

  const onSubmit = async (data: JemaatIndukInput) => {
    setErrorMsg(null);
    try {
      if (isEdit && editData) {
        await updateMutation.mutateAsync({
          id_induk: editData.id_induk,
          payload: {
            nama_induk: data.nama_induk,
            alamat: data.alamat,
            latitude: data.latitude,
            longitude: data.longitude,
            id_kmj: data.id_kmj,
            keterangan: data.keterangan,
            jumlah_sektor: data.jumlah_sektor,
            jumlah_kk: data.jumlah_kk,
            jumlah_jiwa: data.jumlah_jiwa,
          },
        });
        toast.success('Berhasil Diperbarui', `Jemaat Induk "${data.nama_induk}" telah diperbarui.`);
      } else {
        await createMutation.mutateAsync({
          id_induk: data.id_induk,
          id_mupel: data.id_mupel,
          nama_induk: data.nama_induk,
          alamat: data.alamat,
          latitude: data.latitude,
          longitude: data.longitude,
          id_kmj: data.id_kmj,
          keterangan: data.keterangan,
          jumlah_sektor: data.jumlah_sektor,
          jumlah_kk: data.jumlah_kk,
          jumlah_jiwa: data.jumlah_jiwa,
        });
        toast.success('Berhasil Dibuat', `Jemaat Induk "${data.nama_induk}" telah ditambahkan.`);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan data Jemaat Induk.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-2xl md:max-w-3xl bg-surface-elevated rounded-t-3xl sm:rounded-2xl border border-border-subtle shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Church size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-high leading-snug">
                {isEdit ? 'Edit Jemaat Induk' : 'Tambah Jemaat Induk Baru'}
              </h2>
              <p className="text-xs text-text-muted">Mupel: {id_mupel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:bg-surface-elevated transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ID Induk */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-high">ID Jemaat Induk *</label>
              <input
                type="text"
                disabled={isEdit}
                placeholder="Contoh: 02-01-BM"
                {...register('id_induk')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-60"
              />
              {errors.id_induk && <p className="text-[10px] text-red-600 font-medium">{errors.id_induk.message}</p>}
            </div>

            {/* Nama Induk */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-high">Nama Jemaat Induk *</label>
              <input
                type="text"
                placeholder="Contoh: GPIB Maranatha"
                {...register('nama_induk')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {errors.nama_induk && <p className="text-[10px] text-red-600 font-medium">{errors.nama_induk.message}</p>}
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high">Alamat Gereja</label>
            <textarea
              rows={2}
              placeholder="Alamat lengkap gereja induk..."
              {...register('alamat')}
              className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          {/* Lokasi (GPS) */}
          <div className="bg-surface-sunken p-4 rounded-xl border border-border-subtle space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2.5">
              <h3 className="text-xs font-black text-text-high uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={16} className="text-emerald-600" />
                Lokasi (GPS)
              </h3>
              <button
                type="button"
                onClick={getLocation}
                disabled={isGettingLocation}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-xl shadow-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isGettingLocation ? <Loader2 size={14} className="animate-spin mr-1" /> : <MapPin size={14} className="mr-1" />}
                Ambil Lokasi
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black text-text-high uppercase tracking-wider">
                Ekstrak dari Link Google Maps / Koordinat / Alamat
              </label>
              <div className="flex items-center gap-2 w-full min-w-0">
                <input
                  type="text"
                  placeholder="Tempel link Google Maps, koordinat, atau alamat..."
                  value={gmapsInput}
                  onChange={(e) => setGmapsInput(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2.5 border border-border-subtle bg-surface-base text-text-high rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button
                  type="button"
                  onClick={handleExtractCoordinates}
                  disabled={isExtracting}
                  className="px-3.5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer min-h-[40px]"
                >
                  {isExtracting ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Ekstrak</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-text-high uppercase tracking-wider">
                  Latitude
                </label>
                <input
                  {...register('latitude', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className="block w-full px-3 py-2.5 border border-border-subtle bg-surface-base text-text-high rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="-6.123456"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-text-high uppercase tracking-wider">
                  Longitude
                </label>
                <input
                  {...register('longitude', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className="block w-full px-3 py-2.5 border border-border-subtle bg-surface-base text-text-high rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="106.123456"
                />
              </div>
            </div>
            <p className="text-[11px] text-text-muted">Gunakan tombol &quot;Ambil Lokasi&quot; untuk presisi terbaik, atau isi manual jika gagal.</p>
          </div>

          {/* Statistik Master Data */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-high">Sektor</label>
              <input
                type="number"
                {...register('jumlah_sektor', { valueAsNumber: true })}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-bold text-text-high"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-high">KK</label>
              <input
                type="number"
                {...register('jumlah_kk', { valueAsNumber: true })}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-bold text-text-high"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-high">Jiwa</label>
              <input
                type="number"
                {...register('jumlah_jiwa', { valueAsNumber: true })}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-bold text-text-high"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high">Keterangan / Catatan</label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan mengenai jemaat induk..."
              {...register('keterangan')}
              className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="min-h-[44px] px-5 rounded-xl bg-brand-primary text-white text-xs font-extrabold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              {(isSubmitting || createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Jemaat'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
