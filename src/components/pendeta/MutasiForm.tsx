'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mutasiSchema, MutasiInput } from '@/lib/validations/pendeta.schema';
import { useMutasiPendeta } from '@/hooks/use-pendeta';
import {
  useMupelOptions,
  useJemaatOptions,
  usePosOptions,
} from '@/hooks/use-hierarki-selector';
import {
  Loader2,
  ArrowRightLeft,
  AlertCircle,
  Building2,
  CheckCircle2,
  Layers,
  MapPin,
  Calendar,
  FileText,
  Upload,
  X,
  FileCheck,
  Crown,
} from 'lucide-react';

interface MutasiFormProps {
  id_pendeta: string;
  nama_pendeta: string;
  currentIdInduk: string;
  currentNamaInduk: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MutasiForm({
  id_pendeta,
  nama_pendeta,
  currentIdInduk,
  currentNamaInduk,
  onSuccess,
  onCancel,
}: MutasiFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [pendingData, setPendingData] = useState<MutasiInput | null>(null);

  // Cascading Selection State
  const [selectedMupelId, setSelectedMupelId] = useState<string>('all');
  const [selectedIndukId, setSelectedIndukId] = useState<string>('');
  const [selectedPosId, setSelectedPosId] = useState<string>('');

  const { data: mupels = [], isLoading: isMupelLoading } = useMupelOptions();
  const { data: rawJemaatList = [], isLoading: isJemaatLoading } = useJemaatOptions(selectedMupelId);
  const { data: posList = [], isLoading: isPosLoading } = usePosOptions(selectedIndukId);

  // Filter out current origin Jemaat Induk
  const jemaatList = rawJemaatList.filter((j) => j.id !== currentIdInduk);

  // SK Mutasi File Attachment State
  const [skFileName, setSkFileName] = useState<string | null>(null);
  const [skFileType, setSkFileType] = useState<'pdf' | 'image' | null>(null);

  const mutasiMutation = useMutasiPendeta();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MutasiInput>({
    resolver: zodResolver(mutasiSchema),
    defaultValues: {
      id_pendeta: id_pendeta,
      id_induk_baru: '',
      peran_tugas: 'PJ',
      id_pos_baru: '',
      tgl_mutasi: new Date().toISOString().split('T')[0],
      file_sk: '',
      alasan: '',
    },
  });

  const watchPeran = watch('peran_tugas');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Ukuran file SK terlalu besar. Maksimal 8MB.');
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setErrorMsg('Format file tidak didukung. Harap unggah file PDF atau Gambar (JPG/PNG).');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result as string;
      const formattedData = `NAME:${file.name}|TYPE:${isPdf ? 'pdf' : 'image'}|DATA:${base64Str}`;
      setSkFileName(file.name);
      setSkFileType(isPdf ? 'pdf' : 'image');
      setValue('file_sk', formattedData, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSkFileName(null);
    setSkFileType(null);
    setValue('file_sk', '', { shouldValidate: true });
  };

  // Auto select first Jemaat Induk if list changes and none selected
  useEffect(() => {
    if (jemaatList.length > 0 && !selectedIndukId) {
      const firstId = jemaatList[0].id;
      setSelectedIndukId(firstId);
      setValue('id_induk_baru', firstId);
    }
  }, [jemaatList, selectedIndukId, setValue]);

  const handleMupelChange = (mupelId: string) => {
    setSelectedMupelId(mupelId);
    setSelectedIndukId('');
    setSelectedPosId('');
    setValue('id_induk_baru', '');
  };

  const handleJemaatChange = (indukId: string) => {
    setSelectedIndukId(indukId);
    setSelectedPosId('');
    setValue('id_induk_baru', indukId);
  };

  const handlePreSubmit = (data: MutasiInput) => {
    if (!data.id_induk_baru) {
      setErrorMsg('Silakan pilih Jemaat Induk Tujuan Mutasi.');
      return;
    }

    let finalAlasan = data.alasan;
    if (selectedPosId && selectedPosObj) {
      finalAlasan = `${data.alasan} [📍 POS:${selectedPosId}|${selectedPosObj.nama}]`;
    }

    setErrorMsg(null);
    setPendingData({
      ...data,
      alasan: finalAlasan,
    });
    setShowConfirm(true);
  };

  const handleExecuteMutasi = async () => {
    if (!pendingData) return;

    try {
      await mutasiMutation.mutateAsync(pendingData);
      setShowConfirm(false);
      onSuccess();
    } catch (err: any) {
      setShowConfirm(false);
      setErrorMsg(err.message || 'Gagal mengeksekusi mutasi pendeta via Database RPC.');
    }
  };

  const selectedMupelObj = mupels.find((m) => m.id === selectedMupelId);
  const selectedIndukObj = rawJemaatList.find((j) => j.id === selectedIndukId);
  const selectedPosObj = posList.find((p) => p.id === selectedPosId);

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Info Pendeta Asal */}
      <div className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle space-y-1 text-xs">
        <p className="text-text-muted font-medium">Pendeta yang Dimutasi:</p>
        <p className="font-bold text-sm text-text-high">{nama_pendeta}</p>
        <p className="text-text-muted flex items-center gap-1.5 pt-0.5">
          <Building2 size={13} className="text-brand-primary shrink-0" />
          <span>Asal Jemaat Induk: <strong className="text-text-high">{currentNamaInduk}</strong></span>
        </p>
      </div>

      <form onSubmit={handleSubmit(handlePreSubmit)} className="space-y-4">
        {/* Cascade 1: Select Mupel */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Layers size={14} className="text-purple-600" />
            <span>1. Pilih Mupel Tujuan</span>
          </label>
          <select
            value={selectedMupelId}
            onChange={(e) => handleMupelChange(e.target.value)}
            disabled={isMupelLoading}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">🌐 Semua Mupel (Tampilkan Seluruh Jemaat Induk)</option>
            {mupels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} ({m.id})
              </option>
            ))}
          </select>
        </div>

        {/* Cascade 2: Select Jemaat Induk */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Building2 size={14} className="text-blue-600" />
            <span>2. Pilih Jemaat Induk Tujuan Mutasi *</span>
          </label>
          {isJemaatLoading ? (
            <div className="min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-sunken text-xs text-text-muted flex items-center gap-2 animate-pulse">
              <Loader2 size={14} className="animate-spin" />
              <span>Memuat daftar Jemaat Induk...</span>
            </div>
          ) : jemaatList.length > 0 ? (
            <select
              value={selectedIndukId}
              onChange={(e) => handleJemaatChange(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="" disabled>-- Pilih Jemaat Induk Tujuan --</option>
              {jemaatList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama} ({j.id})
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
              Tidak ada Jemaat Induk lain di Mupel ini. Silakan pilih Mupel lain di atas.
            </div>
          )}
          {errors.id_induk_baru && (
            <p className="text-xs text-error">{errors.id_induk_baru.message}</p>
          )}
        </div>

        {/* Peran / Jabatan Penugasan Organik Baru */}
        <div className="space-y-2 bg-surface-sunken p-3.5 rounded-2xl border border-border-subtle">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Crown size={14} className="text-amber-500" />
            <span>3. Peran Penugasan Organik Baru *</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: KMJ */}
            <label
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                watchPeran === 'KMJ'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                  : 'bg-surface-base border-border-subtle text-text-muted hover:border-brand-primary'
              }`}
            >
              <input
                type="radio"
                value="KMJ"
                {...register('peran_tugas')}
                onChange={() => {
                  setValue('peran_tugas', 'KMJ', { shouldValidate: true });
                  setSelectedPosId('');
                  setValue('id_pos_baru', '');
                }}
                className="sr-only"
              />
              <Crown size={22} className="mb-1.5 text-amber-500" />
              <span className="text-sm font-extrabold">KMJ</span>
              <span className="text-[11px] text-text-muted font-normal mt-0.5">Ketua Majelis Jemaat</span>
            </label>

            {/* Option 2: PJ (Pendeta Jemaat) */}
            <label
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                watchPeran === 'PJ'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                  : 'bg-surface-base border-border-subtle text-text-muted hover:border-brand-primary'
              }`}
            >
              <input
                type="radio"
                value="PJ"
                {...register('peran_tugas')}
                onChange={() => {
                  setValue('peran_tugas', 'PJ', { shouldValidate: true });
                }}
                className="sr-only"
              />
              <Building2 size={22} className="mb-1.5 text-blue-600" />
              <span className="text-sm font-extrabold">PJ</span>
              <span className="text-[11px] text-text-muted font-normal mt-0.5">Pendeta Jemaat</span>
            </label>
          </div>

          {errors.peran_tugas && (
            <p className="text-xs text-error font-medium">{errors.peran_tugas.message}</p>
          )}
        </div>

        {/* Cascade 4: Pos Pelkes / Bajem Selection (Only shown for PJ when Pos Pelkes are available) */}
        {selectedIndukId && watchPeran === 'PJ' && posList.length > 0 && (
          <div className="space-y-1.5 bg-surface-sunken p-3.5 rounded-2xl border border-border-subtle animate-in fade-in">
            <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-600" />
              <span>4. Penugasan Spesifik di Pos Pelkes / Bajem (Pendeta Pos - Opsional)</span>
            </label>
            <select
              value={selectedPosId}
              onChange={(e) => {
                setSelectedPosId(e.target.value);
                setValue('id_pos_baru', e.target.value);
              }}
              disabled={isPosLoading}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">-- Penugasan Umum di Jemaat Induk --</option>
              {posList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.kategori || 'Pos Pelkes'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted">
              Pilih jika Pendeta Jemaat ditugaskan melayani di Pos Pelkes/Bajem tertentu. (Koordinator Pos dijabat oleh Pelayan/Penatua/Diaken).
            </p>
          </div>
        )}

        {/* Tanggal Efektif Mutasi */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Calendar size={14} className="text-brand-primary" />
            <span>Tanggal Efektif Mutasi / SK *</span>
          </label>
          <input
            type="date"
            {...register('tgl_mutasi')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            required
          />
        </div>

        {/* Lampiran SK Mutasi (Compulsory) */}
        <div className="space-y-1.5 bg-surface-sunken p-3.5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
              <FileText size={14} className="text-red-500" />
              <span>Lampiran Dokumen SK Mutasi (PDF / Gambar) *</span>
            </label>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20">
              Wajib / Compulsory
            </span>
          </div>

          {!skFileName ? (
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border-subtle rounded-xl bg-surface-base hover:border-brand-primary cursor-pointer transition-colors group/upload">
              <Upload size={24} className="text-text-muted group-hover/upload:text-brand-primary mb-1 transition-colors" />
              <span className="text-xs font-semibold text-text-high">Klik untuk Unggah Dokumen SK Mutasi</span>
              <span className="text-[11px] text-text-muted mt-0.5">Format yang diterima: PDF, JPG, PNG (Maks. 8MB)</span>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-base border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileCheck size={18} />
                </div>
                <div className="truncate">
                  <p className="font-bold text-text-high truncate">{skFileName}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    <span>Dokumen SK Mutasi Berhasil Diunggah ({skFileType?.toUpperCase()})</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                title="Hapus / Ganti Dokumen"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {errors.file_sk && (
            <p className="text-xs text-error font-medium">{errors.file_sk.message}</p>
          )}
        </div>

        {/* Alasan Mutasi */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">
            Alasan / Dasar Keputusan Mutasi (Min. 10 Karakter) *
          </label>
          <textarea
            rows={3}
            placeholder="Surat Keputusan Majelis Sinode No. XX, Keputusan Mutasi Struktural..."
            {...register('alasan')}
            className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.alasan && <p className="text-xs text-error">{errors.alasan.message}</p>}
        </div>

        {/* Preview Ringkasan Tujuan */}
        {selectedIndukObj && (
          <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-xs space-y-1">
            <span className="font-bold text-brand-primary block">📍 Ringkasan Tujuan Mutasi:</span>
            <p className="text-text-high font-medium">
              • Mupel: <strong>{selectedMupelObj?.nama || 'Seluruh Mupel'}</strong>
            </p>
            <p className="text-text-high font-medium">
              • Jemaat Induk: <strong>{selectedIndukObj.nama}</strong> ({selectedIndukObj.id})
            </p>
            {selectedPosObj && (
              <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                • Penugasan Pos: {selectedPosObj.nama} ({selectedPosObj.id})
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border-subtle text-text-muted hover:bg-surface-sunken text-xs font-semibold min-h-[44px]"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={!selectedIndukId}
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px] active:scale-[0.98] disabled:opacity-50"
          >
            <ArrowRightLeft size={16} />
            <span>Lanjutkan Mutasi</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && pendingData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-elevated w-full max-w-md rounded-2xl p-5 border border-border-subtle shadow-float space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200">
              <ArrowRightLeft size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-brand-primary">
                Konfirmasi Mutasi Pendeta
              </h3>
              <p className="text-xs text-text-muted">
                Tindakan ini akan memindahkan penugasan aktif Pendeta secara atomik di database.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-sunken text-xs space-y-1.5 border border-border-subtle">
              <p><strong className="text-text-muted">Pendeta:</strong> <span className="font-bold text-text-high">{nama_pendeta}</span></p>
              <p><strong className="text-text-muted">Asal:</strong> {currentNamaInduk}</p>
              <p><strong className="text-text-muted">Tujuan Baru:</strong> <span className="font-bold text-brand-primary">{selectedIndukObj?.nama || pendingData.id_induk_baru}</span></p>
              {selectedPosObj && (
                <p><strong className="text-text-muted">Pos Pelkes:</strong> <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPosObj.nama}</span></p>
              )}
              <p><strong className="text-text-muted">Alasan:</strong> "{pendingData.alasan}"</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 min-h-[44px] py-2 rounded-xl border border-border-subtle text-text-muted font-semibold text-xs hover:bg-surface-sunken"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteMutasi}
                disabled={mutasiMutation.isPending}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-blue-800 flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                {mutasiMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Proses RPC...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Ya, Eksekusi Mutasi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
