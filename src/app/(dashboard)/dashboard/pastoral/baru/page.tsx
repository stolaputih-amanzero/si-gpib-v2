import PastoralForm from '@/components/pastoral/PastoralForm';

export default function NewPastoralPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catat Log Pastoral</h1>
        <p className="text-muted-foreground mt-2">
          Catat aktivitas pelayanan dan kunjungan pastoral Anda. Data akan tersimpan sebagai <i>draft</i> lokal jika Anda kehilangan koneksi internet.
        </p>
      </div>

      <PastoralForm />
    </div>
  );
}
