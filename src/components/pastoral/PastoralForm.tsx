'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLogPastoralSchema, type CreateLogPastoralSchema } from '@/lib/domains/pastoral/pastoral.schema';
import { useCreateLogPastoral } from '@/lib/domains/pastoral/pastoral.queries';
import { useFormDraft } from '@/hooks/use-form-draft';
import { FORM_KEYS } from '@/lib/constants/form-keys';
import { usePosContext } from '@/stores/pos-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Calendar as CalendarIcon, Users, FileText, Loader2, Mic } from 'lucide-react';
import { toast } from 'sonner';

export default function PastoralForm() {
  const { activePosId } = usePosContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createLog } = useCreateLogPastoral();
  
  const defaultValues = {
    requestId: '',
    id_pos: activePosId || '',
    tgl: new Date().toISOString().split('T')[0],
    kegiatan: '',
    catatan: '',
  } as any;

  const form = useForm({
    resolver: zodResolver(createLogPastoralSchema) as any,
    defaultValues
  });

  // Sinkronisasi form dengan Context (jika user ubah Pos via switcher saat isi form)
  // Tapi kita hanya reset id_pos agar input lain tidak hilang
  useState(() => {
    if (activePosId && form.getValues('id_pos') !== activePosId) {
      form.setValue('id_pos', activePosId);
    }
  });

  const { isRestored, clearDraft } = useFormDraft(
    FORM_KEYS.PASTORAL_NEW,
    form,
  );

  const onSubmit = async (data: CreateLogPastoralSchema) => {
    if (!activePosId) {
      toast.error('Pilih Pos Pelkes terlebih dahulu.');
      return;
    }

    // Generate Request ID jika belum ada, untuk jaminan idempotensi submit ini
    if (!data.requestId) {
      data.requestId = crypto.randomUUID();
    }
    
    // Pastikan id_pos selalu sesuai konteks terakhir
    data.id_pos = activePosId;

    setIsSubmitting(true);
    try {
      await createLog(data);
      // Jika berhasil enqueue/sync, bersihkan form dan draft
      await clearDraft();
      form.reset({
        ...defaultValues,
        requestId: '',
        id_pos: activePosId, // preserve active pos
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisabledFeature = (feature: string, version: string) => {
    toast.info(`${feature} hadir di ${version}`, {
      description: 'Fitur sedang dalam tahap pengembangan.',
    });
  };

  if (!isRestored) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0 space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* TANGGAL */}
          <div className="space-y-2">
            <Label htmlFor="tgl">Tanggal Kegiatan</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="tgl"
                type="date"
                className="pl-10 h-12"
                {...form.register('tgl')}
              />
            </div>
            {form.formState.errors.tgl && (
              <p className="text-sm text-destructive">{form.formState.errors.tgl.message as string}</p>
            )}
          </div>

          {/* KEGIATAN */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="kegiatan">Nama / Jenis Kegiatan <span className="text-destructive">*</span></Label>
              <button
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => handleDisabledFeature('Voice input 🎙️', 'Fase 2')}
                aria-disabled="true"
                title="Voice input (Fase 2)"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <Input
              id="kegiatan"
              placeholder="Contoh: Ibadah Rumah Tangga Kel. Soplanit"
              className="h-12"
              {...form.register('kegiatan')}
            />
            {form.formState.errors.kegiatan && (
              <p className="text-sm text-destructive">{form.formState.errors.kegiatan.message as string}</p>
            )}
          </div>

          {/* JUMLAH JIWA */}
          <div className="space-y-2">
            <Label htmlFor="jml_jiwa">Jumlah Jiwa Terlayani (Opsional)</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="jml_jiwa"
                type="number"
                inputMode="numeric"
                className="pl-10 h-12"
                placeholder="0"
                {...form.register('jml_jiwa')}
              />
            </div>
          </div>

          {/* CATATAN */}
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan Pastoral (Opsional)</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Textarea
                id="catatan"
                placeholder="Tuliskan catatan penting jika ada..."
                className="pl-10 min-h-[100px]"
                {...form.register('catatan')}
              />
            </div>
          </div>

          {/* FOTO (Placeholder CJ-1.1) */}
          <div className="space-y-2">
            <Label>Foto Kegiatan (Opsional)</Label>
            <button
              type="button"
              className="w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors"
              onClick={() => handleDisabledFeature('Foto kegiatan 📸', 'CJ-1.1')}
              aria-disabled="true"
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm">Tap untuk tambah foto</span>
            </button>
          </div>

          {/* SUBMIT */}
          <div className="pt-4 pb-10">
            <Button
              type="submit"
              className="w-full h-14 text-lg rounded-full shadow-lg"
              disabled={isSubmitting || !activePosId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Log Pastoral'
              )}
            </Button>
            {!activePosId && (
              <p className="text-center text-sm text-destructive mt-2">
                Pilih Pos Pelkes di atas terlebih dahulu
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
