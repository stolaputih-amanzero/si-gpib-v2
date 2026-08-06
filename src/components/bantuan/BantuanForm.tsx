'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createBantuanSchema,
  ajukanUlangSchema,
  type CreateBantuanInput,
} from '@/lib/domains/bantuan/bantuan.schema';
import {
  useCreateBantuan,
  useUpdateBantuan,
  useAjukanUlang,
} from '@/lib/domains/bantuan/bantuan.queries';
import { URGENSI_LEVEL, type UrgensiLevel } from '@/lib/domains/bantuan/bantuan.types';
import { db } from '@/lib/offline/dexie';
import { haptic } from '@/lib/haptic/vibrate';
import { logger } from '@/lib/utils/logger';

type FormMode = 'create' | 'edit' | 'ajukan-ulang';

interface BantuanFormProps {
  mode: FormMode;
  /** ID Pos Pelkes (wajib untuk mode create) */
  initialIdPos?: string;
  /** Data existing (wajib untuk mode edit & ajukan-ulang) */
  initialData?: Partial<CreateBantuanInput> & {
    id_ajuan?: string;
    id_ajuan_lama?: string;
  };
  /** Path untuk redirect setelah sukses */
  successRedirect?: string;
}

// Key unik draft per form instance
function getDraftKey(mode: FormMode, id?: string): string {
  if (mode === 'create') return 'bantuan:create';
  if (mode === 'edit' && id) return `bantuan:edit:${id}`;
  if (mode === 'ajukan-ulang' && id) return `bantuan:ajukan-ulang:${id}`;
  return 'bantuan:draft';
}

const MODE_CONFIG = {
  create: {
    title: 'Pengajuan Bantuan Baru',
    submitLabel: 'Simpan sebagai Draft',
    icon: '📝',
  },
  edit: {
    title: 'Edit Draft Pengajuan',
    submitLabel: 'Simpan Perubahan',
    icon: '✏️',
  },
  'ajukan-ulang': {
    title: 'Ajukan Ulang Bantuan',
    submitLabel: 'Buat Pengajuan Baru',
    icon: '🔄',
  },
};

const URGENSI_COLORS: Record<UrgensiLevel, string> = {
  Rendah: 'bg-gray-100 text-gray-700 border-gray-300',
  Sedang: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Tinggi: 'bg-orange-100 text-orange-800 border-orange-300',
  Darurat: 'bg-red-100 text-red-800 border-red-300',
};

export function BantuanForm({
  mode,
  initialIdPos,
  initialData,
  successRedirect = '/bantuan',
}: BantuanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);

  const createMutation = useCreateBantuan();
  const updateMutation = useUpdateBantuan();
  const ajukanUlangMutation = useAjukanUlang();

  const draftKey = getDraftKey(mode, initialData?.id_ajuan ?? initialData?.id_ajuan_lama);

  // ============================================================
  // FORM SETUP (React Hook Form + Zod)
  // ============================================================
  const form = useForm<any>({
    resolver: zodResolver(mode === 'ajukan-ulang' ? ajukanUlangSchema : createBantuanSchema) as any,
    defaultValues: {
      id_pos: initialIdPos ?? initialData?.id_pos ?? '',
      jenis_bantuan: initialData?.jenis_bantuan ?? '',
      deskripsi: initialData?.deskripsi ?? '',
      estimasi_biaya: initialData?.estimasi_biaya ?? 0,
      urgensi: initialData?.urgensi ?? 'Sedang',
      id_aset_tanah: initialData?.id_aset_tanah ?? null,
      id_aset_bangunan: initialData?.id_aset_bangunan ?? null,
      id_aset_bergerak: initialData?.id_aset_bergerak ?? null,
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = form;

  const watchedValues = watch();
  const selectedUrgensi = watchedValues.urgensi ?? 'Sedang';

  // ============================================================
  // DRAFT AUTO-SAVE KE DEXIE (setiap 30 detik saat form dirty)
  // ============================================================
  useEffect(() => {
    if (mode === 'create' || mode === 'edit') {
      const interval = setInterval(async () => {
        if (!isDirty) return;
        try {
          await db.drafts.put({
            formKey: draftKey,
            data: watchedValues,
            timestamp: Date.now(),
          });
          setDraftSavedAt(new Date());
        } catch (err) {
          logger.warn('Gagal auto-save draft ke Dexie', { draftKey });
        }
      }, 30_000); // setiap 30 detik

      return () => clearInterval(interval);
    }
  }, [isDirty, watchedValues, draftKey, mode]);

  // Load draft dari Dexie saat mount (mode create saja)
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      (async () => {
        try {
          const draft = await db.drafts.get(draftKey);
          if (draft?.data) {
            const data = draft.data as CreateBantuanInput;
            setValue('id_pos', data.id_pos ?? '');
            setValue('jenis_bantuan', data.jenis_bantuan ?? '');
            setValue('deskripsi', data.deskripsi ?? '');
            setValue('estimasi_biaya', data.estimasi_biaya ?? 0);
            setValue('urgensi', data.urgensi ?? 'Sedang');
            toast.info('Draft sebelumnya dipulihkan', {
              description: 'Form terisi otomatis dari draft tersimpan',
            });
          }
        } catch (err) {
          logger.warn('Gagal load draft dari Dexie', { draftKey });
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const clearDraft = async () => {
    try {
      await db.drafts.delete(draftKey);
    } catch {
      // Silent fail
    }
  };

  const onSubmitDraft = (data: CreateBantuanInput) => {
    startTransition(async () => {
      try {
        const result = await createMutation.mutateAsync(data);
        haptic('success');
        toast.success('Draft pengajuan tersimpan', {
          description: 'Anda dapat submit saat siap',
        });
        await clearDraft();
        router.push(`${successRedirect}/${result.id_ajuan}`);
      } catch (err) {
        haptic('error');
        logger.error('Gagal create pengajuan bantuan', err as Error);
        toast.error('Gagal menyimpan draft', {
          description: (err as Error).message,
        });
      }
    });
  };

  const onSubmitEdit = (data: CreateBantuanInput) => {
    if (!initialData?.id_ajuan) return;
    startTransition(async () => {
      try {
        await updateMutation.mutateAsync({
          id_ajuan: initialData.id_ajuan!,
          ...data,
        });
        haptic('success');
        toast.success('Draft diperbarui');
        await clearDraft();
        router.push(`${successRedirect}/${initialData.id_ajuan}`);
      } catch (err) {
        haptic('error');
        logger.error('Gagal update draft', err as Error);
        toast.error('Gagal memperbarui draft', {
          description: (err as Error).message,
        });
      }
    });
  };

  const onSubmitAjukanUlang = (data: CreateBantuanInput) => {
    if (!initialData?.id_ajuan_lama) return;
    startTransition(async () => {
      try {
        const result = await ajukanUlangMutation.mutateAsync({
          id_ajuan_lama: initialData.id_ajuan_lama!,
          ...data,
        });
        haptic('success');
        toast.success('Pengajuan ulang berhasil dibuat', {
          description: 'Status: Draft — siap untuk di-submit',
        });
        await clearDraft();
        router.push(`${successRedirect}/${result.id_ajuan}`);
      } catch (err) {
        haptic('error');
        logger.error('Gagal ajukan ulang bantuan', err as Error);
        toast.error('Gagal mengajukan ulang', {
          description: (err as Error).message,
        });
      }
    });
  };

  const handleFormSubmit = (data: any) => {
    if (mode === 'create') onSubmitDraft(data);
    else if (mode === 'edit') onSubmitEdit(data);
    else onSubmitAjukanUlang(data);
  };

  // ============================================================
  // RENDER
  // ============================================================
  const config = MODE_CONFIG[mode];
  const isSubmitting = isPending || createMutation.isPending || updateMutation.isPending || ajukanUlangMutation.isPending;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 flex-shrink-0"
              onClick={() => router.back()}
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-lg">
                <span className="mr-2">{config.icon}</span>
                {config.title}
              </CardTitle>
              {mode === 'ajukan-ulang' && (
                <p className="text-xs text-gray-500 mt-1">
                  Membuat pengajuan baru berdasarkan yang ditolak
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Jenis Bantuan */}
          <div className="space-y-2">
            <Label htmlFor="jenis_bantuan" className="text-base font-medium">
              Jenis Bantuan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jenis_bantuan"
              placeholder="Contoh: Renovasi atap gereja"
              {...register('jenis_bantuan')}
              className="text-base min-h-[44px]"
              disabled={isSubmitting}
              aria-invalid={!!errors.jenis_bantuan}
            />
            {errors.jenis_bantuan && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.jenis_bantuan.message as string}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi" className="text-base font-medium">
              Deskripsi Kebutuhan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="deskripsi"
              placeholder="Jelaskan latar belakang dan tujuan bantuan..."
              {...register('deskripsi')}
              className="text-base min-h-[100px] resize-none"
              disabled={isSubmitting}
              aria-invalid={!!errors.deskripsi}
            />
            {errors.deskripsi && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.deskripsi.message as string}
              </p>
            )}
          </div>

          {/* Grid: Estimasi Biaya + Urgensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimasi_biaya" className="text-base font-medium">
                Estimasi Biaya (Rp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="estimasi_biaya"
                type="number"
                inputMode="numeric"
                placeholder="0"
                {...register('estimasi_biaya', { valueAsNumber: true })}
                className="text-base min-h-[44px]"
                disabled={isSubmitting}
                aria-invalid={!!errors.estimasi_biaya}
              />
              {errors.estimasi_biaya && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.estimasi_biaya.message as string}
                </p>
              )}
              {watchedValues.estimasi_biaya > 0 && (
                <p className="text-xs text-gray-500">
                  Rp {Number(watchedValues.estimasi_biaya).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgensi" className="text-base font-medium">
                Tingkat Urgensi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedUrgensi}
                onValueChange={(val: any) => setValue('urgensi', val)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="urgensi"
                  className={`min-h-[44px] text-base ${URGENSI_COLORS[selectedUrgensi as UrgensiLevel]}`}
                >
                  <SelectValue placeholder="Pilih urgensi" />
                </SelectTrigger>
                <SelectContent>
                  {URGENSI_LEVEL.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === 'Darurat' && '🚨 '}
                      {level === 'Tinggi' && '⚠️ '}
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info Ajukan Ulang */}
          {mode === 'ajukan-ulang' && initialData?.id_ajuan_lama && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Mengacu pada pengajuan sebelumnya</p>
                <p className="text-xs text-blue-700 mt-1">
                  ID: {initialData.id_ajuan_lama} • Data akan diduplikasi, Anda bisa edit sebelum submit
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-3 pt-4 border-t">
          {/* Draft Status */}
          {draftSavedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 w-full justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Draft tersimpan otomatis{' '}
                {draftSavedAt.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 min-h-[48px]"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 min-h-[48px]"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  {mode === 'create' || mode === 'edit' ? (
                    <Save className="w-4 h-4 mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {config.submitLabel}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
