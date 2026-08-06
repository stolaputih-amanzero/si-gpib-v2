'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Users, UserCheck } from 'lucide-react';

import { SummaryStrip } from '@/components/list/SummaryStrip';
import { DraftIndicator } from '@/components/forms/DraftIndicator';
import { SubmitFab } from '@/components/forms/SubmitFab';
import { DemografiTabs } from '@/components/forms/DemografiTabs';
import { DemografiKategoriSection } from '@/components/forms/DemografiKategoriSection';
import { PosName } from '@/components/ui/PosName';

import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { DemografiKategoriInput } from '@/lib/validations/demografi.schema';
import { useDemografiAggregator } from '@/hooks/use-demografi-aggregator';
import { useFormDraft } from '@/hooks/use-form-draft';
import { usePendingSubmissions } from '@/hooks/use-pending-submissions';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useToast } from '@/components/ui/toast';
import { useDemografiByPos } from '@/hooks/use-demografi';
import { upsertDemografiBatchAction } from '@/app/actions/demografi';
import Link from 'next/link';

export function DemografiEditFormClient({ id_pos }: { id_pos: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();

  const { data: dbDemografi, isLoading: isFetchingDB } = useDemografiByPos(id_pos);
  const [activeTab, setActiveTab] = useState<string>('PA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  const initialRecordState: Record<string, DemografiKategoriInput> = {
    PA: { jml_kk: 0, laki: 0, perempuan: 0, profesi: '', pendidikan: '', keterangan: '' },
    PT: { jml_kk: 0, laki: 0, perempuan: 0, profesi: '', pendidikan: '', keterangan: '' },
    GP: { jml_kk: 0, laki: 0, perempuan: 0, profesi: '', pendidikan: '', keterangan: '' },
    PKP: { jml_kk: 0, laki: 0, perempuan: 0, profesi: '', pendidikan: '', keterangan: '' },
    PKB: { jml_kk: 0, laki: 0, perempuan: 0, profesi: '', pendidikan: '', keterangan: '' },
    PKLU: { jml_kk: 0, laki: 0, perempuan: 0, profesi: '', pendidikan: '', keterangan: '' },
  };

  const { draft, saveDraft, clearDraft, status: draftStatus } = useFormDraft(
    `draft:demografi:${id_pos}`,
    initialRecordState
  );

  const [formDataRecord, setFormDataRecord] = useState<Record<string, DemografiKategoriInput>>(
    draft || initialRecordState
  );

  const { pendingCount, addPendingSubmission } = usePendingSubmissions();
  const liveSummary = useDemografiAggregator(formDataRecord);

  // Load existing DB data on mount
  useEffect(() => {
    if (dbDemografi && dbDemografi.length > 0 && !draft) {
      const updatedState = { ...initialRecordState };
      dbDemografi.forEach((row: any) => {
        const kode = row.kategori_pelkat;
        if (updatedState[kode]) {
          updatedState[kode] = {
            jml_kk: Number(row.jml_kk || 0),
            laki: kode === 'PKP' ? 0 : Number(row.laki || 0),
            perempuan: kode === 'PKB' ? 0 : Number(row.perempuan || 0),
            profesi: row.profesi || '',
            pendidikan: row.pendidikan || '',
            keterangan: row.keterangan || '',
          };
        }
      });
      setFormDataRecord(updatedState);
    }
  }, [dbDemografi, draft]);

  const handleFieldChange = (kategori: string, field: keyof DemografiKategoriInput, value: any) => {
    setFormDataRecord((prev) => {
      const currentCategory = prev[kategori] || {
        jml_kk: 0,
        laki: 0,
        perempuan: 0,
        profesi: '',
        pendidikan: '',
        keterangan: '',
      };

      const updated = {
        ...prev,
        [kategori]: {
          ...currentCategory,
          [field]: value,
        },
      };

      saveDraft(updated);
      return updated;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasSubmitError(false);
    setIsSubmitting(true);

    try {
      const payload = {
        id_pos,
        data: formDataRecord,
      };

      if (!isOnline) {
        addPendingSubmission('rpc', 'upsert_demografi_batch', payload as Record<string, unknown>);
        clearDraft();
        toast.info('Tersimpan di Antrean Offline', 'Data akan di-upsert otomatis saat koneksi pulih.');
        router.push(`/demografi/${id_pos}`);
        return;
      }

      await upsertDemografiBatchAction(payload);

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      clearDraft();
      toast.success('Demografi Disimpan', `Batch 6 kategori Pelkat pos ${id_pos} berhasil disimpan.`);
      router.push(`/demografi/${id_pos}`);
    } catch (err: any) {
      console.error('Failed to submit demografi batch:', err);
      setHasSubmitError(true);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      toast.error('Gagal Menyimpan Demografi', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pelkatTabList = KATEGORI_PELKAT.map((p) => ({
    id: p.kode,
    label: p.nama,
    icon: p.icon,
  }));

  return (
    <div className="min-h-screen bg-surface-base pb-36 select-none">
      {/* 1. Context Header */}
      <div className="sticky top-0 z-40 bg-surface-1/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/demografi/${id_pos}`}
              className="p-2 rounded-xl text-text-high hover:bg-surface-sunken transition-all border border-border-subtle/50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              aria-label="Kembali"
            >
              <ArrowLeft size={20} className="text-text-muted" />
            </Link>
            <div>
              <h1 className="text-lg font-display font-semibold text-text-high leading-tight flex items-center gap-1.5">
                <span>Edit Demografi</span>
                <PosName name={id_pos} />
              </h1>
              <DraftIndicator status={draftStatus} pendingCount={pendingCount} className="mt-0.5" />
            </div>
          </div>
        </div>

        {/* 2. DemografiTabs Horizontal Scroll */}
        <div className="max-w-4xl mx-auto px-4">
          <DemografiTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            kategoriList={pelkatTabList}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 3. SummaryStrip Live Real-time Aggregation */}
        <div aria-live="polite" aria-atomic="true">
          <SummaryStrip
            metrics={[
              { label: 'Total KK', value: liveSummary.totalKK, icon: <Home size={16} /> },
              { label: 'Total Jiwa', value: liveSummary.totalJiwa, icon: <Users size={16} /> },
              { label: 'Laki-Laki', value: liveSummary.totalLaki, icon: <UserCheck size={16} /> },
              { label: 'Perempuan', value: liveSummary.totalPerempuan, icon: <UserCheck size={16} /> },
            ]}
            className="hairline-b bg-surface-1/40 rounded-2xl py-3 px-4 border border-border-subtle"
          />
        </div>

        {/* 4. 6 Kategori Pelkat Form Sections */}
        {isFetchingDB ? (
          <div className="p-8 text-center text-xs text-text-tertiary animate-pulse font-medium">
            Memuat data demografi dari database...
          </div>
        ) : (
          <div className="space-y-6">
            {KATEGORI_PELKAT.map((pelkat) => {
              const data = formDataRecord[pelkat.kode] || {
                jml_kk: 0,
                laki: 0,
                perempuan: 0,
                profesi: '',
                pendidikan: '',
                keterangan: '',
              };

              return (
                <DemografiKategoriSection
                  key={pelkat.kode}
                  kategori={pelkat.kode}
                  label={pelkat.nama}
                  icon={pelkat.icon}
                  deskripsi={pelkat.deskripsi}
                  data={data}
                  onChange={(field, val) => handleFieldChange(pelkat.kode, field, val)}
                />
              );
            })}
          </div>
        )}

        {/* Sticky Submit FAB with 3 States */}
        <SubmitFab
          label="Simpan Demografi 6 Pelkat"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isOffline={!isOnline}
          hasError={hasSubmitError}
        />
      </main>
    </div>
  );
}

export default DemografiEditFormClient;
