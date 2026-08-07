'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Loader2, Camera, UploadCloud, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import { mutasiPendetaAction } from '@/app/(dashboard)/sdm/pendeta/actions-mutasi';
import { useJemaatSearch } from '@/hooks/use-jemaat-search';
import { NativeCameraCapture } from '@/components/camera/NativeCameraCapture';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MutasiPendetaFormProps {
  idPendeta: string;
  namaPendeta: string;
  onSuccess?: () => void;
}

export function MutasiPendetaForm({ idPendeta, namaPendeta, onSuccess }: MutasiPendetaFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [idIndukBaru, setIdIndukBaru] = useState('');
  const [jemaatSearchText, setJemaatSearchText] = useState('');
  const [debouncedSearch] = useDebounce(jemaatSearchText, 300);
  const { data: searchResults, isLoading: isSearching } = useJemaatSearch(debouncedSearch);

  const [jenisMutasi, setJenisMutasi] = useState('MUTASI');
  const [alasan, setAlasan] = useState('');
  
  const [uploadMode, setUploadMode] = useState<'camera' | 'file' | null>(null);
  const [skBlob, setSkBlob] = useState<Blob | null>(null);
  const [skFile, setSkFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (blob: Blob) => {
    setSkBlob(blob);
    setSkFile(null); // Clear file if camera used
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSkFile(e.target.files[0]);
      setSkBlob(null); // Clear blob if file used
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!idIndukBaru) throw new Error('Jemaat tujuan wajib dipilih');
      if (alasan.length < 10) throw new Error('Alasan mutasi wajib diisi (min. 10 karakter)');
      
      let file_sk_url = '';

      // Upload SK jika ada
      const fileToUpload = skFile || skBlob;
      if (fileToUpload) {
        const requestId = crypto.randomUUID();
        const ext = skFile ? skFile.name.split('.').pop() : 'jpg';
        const path = `sk-mutasi/${idPendeta}/${requestId}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, fileToUpload, { upsert: true });
          
        if (uploadError) throw new Error('Gagal mengunggah dokumen SK: ' + uploadError.message);
        
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(path);
        file_sk_url = publicUrlData.publicUrl;
      }

      // Call Server Action
      const formData = new FormData();
      formData.append('id_pendeta', idPendeta);
      formData.append('id_induk_baru', idIndukBaru);
      formData.append('jenis_mutasi', jenisMutasi);
      formData.append('alasan', alasan);
      if (file_sk_url) formData.append('file_sk_url', file_sk_url);

      const result = await mutasiPendetaAction(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Mutasi pendeta berhasil diproses!');
      if (onSuccess) onSuccess();
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan mutasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-500">Pendeta yang Dimutasi</h4>
        <p className="text-base font-semibold">{namaPendeta}</p>
      </div>

      <div className="space-y-3">
        <Label>Jemaat Tujuan <span className="text-red-500">*</span></Label>
        {!idIndukBaru ? (
          <div className="space-y-2">
            <Input 
              placeholder="Ketik nama jemaat untuk mencari..." 
              value={jemaatSearchText}
              onChange={(e) => setJemaatSearchText(e.target.value)}
            />
            {isSearching && <p className="text-xs text-gray-500 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Mencari...</p>}
            {searchResults && searchResults.length > 0 && (
              <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                {searchResults.map((j) => (
                  <button
                    key={j.id_induk}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-blue-50"
                    onClick={() => {
                      setIdIndukBaru(j.id_induk);
                      setJemaatSearchText(j.nama_jemaat);
                    }}
                  >
                    <div className="font-medium">{j.nama_jemaat}</div>
                    <div className="text-xs text-gray-500">Mupel {(j as any).m_mupel?.nama_mupel || (j as any).id_mupel}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-md">
            <div>
              <div className="text-sm font-medium text-blue-900">{jemaatSearchText}</div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setIdIndukBaru(''); setJemaatSearchText(''); }}>Ganti</Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Jenis Mutasi <span className="text-red-500">*</span></Label>
        <Select value={jenisMutasi} onValueChange={setJenisMutasi}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MUTASI">Mutasi Reguler</SelectItem>
            <SelectItem value="PROMOSI">Promosi</SelectItem>
            <SelectItem value="TUGAS_KHUSUS">Penugasan Khusus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Alasan Mutasi / Catatan SK <span className="text-red-500">*</span></Label>
        <Textarea 
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          placeholder="Tuliskan nomor SK atau alasan perpindahan..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Lampiran Surat Keputusan (SK) <span className="text-gray-400 text-xs font-normal">(Opsional)</span></Label>
        
        {skBlob || skFile ? (
          <div className="p-3 border rounded-md bg-green-50 flex items-center justify-between">
            <div className="flex items-center text-green-700 text-sm font-medium">
              <FileText className="w-5 h-5 mr-2" />
              {skFile ? skFile.name : 'Foto SK Tersimpan (Siap Diunggah)'}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setSkBlob(null); setSkFile(null); }}>Hapus</Button>
          </div>
        ) : !uploadMode ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setUploadMode('camera')}>
              <Camera className="w-4 h-4 mr-2"/> Foto SK
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setUploadMode('file')}>
              <UploadCloud className="w-4 h-4 mr-2"/> Upload File
            </Button>
          </div>
        ) : uploadMode === 'camera' ? (
          <div className="space-y-2">
            <NativeCameraCapture 
              onCapture={handleCapture} 
              label="Ambil Foto SK (Otomatis dikompres)"
              requireGps={false} 
            />
            <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setUploadMode(null)}>Batal Kamera</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input type="file" accept=".pdf,image/*" onChange={handleFileChange} />
            <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setUploadMode(null)}>Batal Upload</Button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses Mutasi...</>
        ) : (
          'Eksekusi Mutasi'
        )}
      </Button>
    </form>
  );
}
