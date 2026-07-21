import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { 
  AsetTanahInput, 
  AsetBangunanInput, 
  AsetBergerakInput,
  AsetFilter 
} from '@/lib/validations/aset.schema';

// Helper to generate unique ID with prefix (e.g., AST-TNH-xxx)
function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}

// Fetch all combined assets list across categories
export function useAsetList(filter?: AsetFilter) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['aset-list', filter],
    queryFn: async () => {
      let tanahQuery = supabase.from('t_aset_tanah').select('*, pos:m_pos_pelkes(nama_pos, jemaat_induk:m_jemaat_induk(nama_induk, mupel:m_mupel(nama_mupel))), lampiran:t_lampiran_aset(*)');
      let bangunanQuery = supabase.from('t_aset_bangunan').select('*, pos:m_pos_pelkes(nama_pos, jemaat_induk:m_jemaat_induk(nama_induk, mupel:m_mupel(nama_mupel))), lampiran:t_lampiran_aset(*)');
      let bergerakQuery = supabase.from('t_aset_bergerak').select('*, pos:m_pos_pelkes(nama_pos, jemaat_induk:m_jemaat_induk(nama_induk, mupel:m_mupel(nama_mupel))), lampiran:t_lampiran_aset(*)');

      if (filter?.id_pos) {
        tanahQuery = tanahQuery.eq('id_pos', filter.id_pos);
        bangunanQuery = bangunanQuery.eq('id_pos', filter.id_pos);
        bergerakQuery = bergerakQuery.eq('id_pos', filter.id_pos);
      }

      const [
        { data: tanahData, error: e1 },
        { data: bangunanData, error: e2 },
        { data: bergerakData, error: e3 },
      ] = await Promise.all([tanahQuery, bangunanQuery, bergerakQuery]);

      if (e1) throw e1;
      if (e2) throw e2;
      if (e3) throw e3;

      const findThumbnail = (lampiran: any[]) => {
        const img = (lampiran || []).find((f: any) =>
          f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i)
        );
        return img?.file_path || null;
      };

      // Map to generic items
      const tanahItems = (tanahData || []).map((t: any) => ({
        id: t.id_tanah,
        id_pos: t.id_pos,
        kategori: 'TANAH' as const,
        judul: `Aset Tanah Lahan (${t.luas_m2} m²)`,
        subjudul: `Status: ${t.status_hukum || '-'} • Kondisi: ${t.kondisi || '-'}`,
        kondisi: t.kondisi,
        tahun: t.thn_perolehan,
        keterangan: t.keterangan,
        latitude: t.latitude || t.pos?.latitude || null,
        longitude: t.longitude || t.pos?.longitude || null,
        pos_nama: t.pos?.nama_pos || t.id_pos,
        jemaat_induk: t.pos?.jemaat_induk?.nama_induk,
        mupel_nama: t.pos?.jemaat_induk?.mupel?.nama_mupel,
        updated_at: t.updated_at || t.created_at || null,
        updated_by: t.updated_by || null,
        lampiran_count: t.lampiran?.length || 0,
        thumbnail_url: findThumbnail(t.lampiran),
        lampiran: t.lampiran || [],
        raw: t,
      }));

      const bangunanItems = (bangunanData || []).map((b: any) => ({
        id: b.id_bangunan,
        id_pos: b.id_pos,
        kategori: 'BANGUNAN' as const,
        judul: b.nama_bangunan ? b.nama_bangunan : `Gedung / Bangunan ${b.fungsi}`,
        subjudul: `Fungsi: ${b.fungsi} • Kondisi: ${b.kondisi || '-'}`,
        kondisi: b.kondisi,
        tahun: b.thn_berdiri,
        keterangan: b.keterangan,
        latitude: b.latitude || b.pos?.latitude || null,
        longitude: b.longitude || b.pos?.longitude || null,
        pos_nama: b.pos?.nama_pos || b.id_pos,
        jemaat_induk: b.pos?.jemaat_induk?.nama_induk,
        mupel_nama: b.pos?.jemaat_induk?.mupel?.nama_mupel,
        updated_at: b.updated_at || b.created_at || null,
        updated_by: b.updated_by || null,
        lampiran_count: b.lampiran?.length || 0,
        thumbnail_url: findThumbnail(b.lampiran),
        lampiran: b.lampiran || [],
        raw: b,
      }));

      const bergerakItems = (bergerakData || []).map((bg: any) => ({
        id: bg.id_aset_b,
        id_pos: bg.id_pos,
        kategori: 'BERGERAK' as const,
        judul: `${bg.jenis} - ${bg.merk_tipe}`,
        subjudul: bg.no_polisi ? `No. Polisi: ${bg.no_polisi}` : `Merk/Tipe: ${bg.merk_tipe}`,
        kondisi: bg.kondisi || 'Baik',
        tahun: bg.thn_perolehan,
        keterangan: bg.keterangan,
        latitude: bg.latitude || bg.pos?.latitude || null,
        longitude: bg.longitude || bg.pos?.longitude || null,
        pos_nama: bg.pos?.nama_pos || bg.id_pos,
        jemaat_induk: bg.pos?.jemaat_induk?.nama_induk,
        mupel_nama: bg.pos?.jemaat_induk?.mupel?.nama_mupel,
        updated_at: bg.updated_at || bg.created_at || null,
        updated_by: bg.updated_by || null,
        lampiran_count: bg.lampiran?.length || 0,
        thumbnail_url: findThumbnail(bg.lampiran),
        lampiran: bg.lampiran || [],
        raw: bg,
      }));

      let allItems = [...tanahItems, ...bangunanItems, ...bergerakItems];

      if (filter?.kategori) {
        allItems = allItems.filter(i => i.kategori.toUpperCase() === filter.kategori?.toUpperCase());
      }

      if (filter?.search) {
        const query = filter.search.toLowerCase();
        allItems = allItems.filter(i => 
          i.judul.toLowerCase().includes(query) ||
          i.pos_nama.toLowerCase().includes(query) ||
          i.subjudul.toLowerCase().includes(query) ||
          (i.jemaat_induk && i.jemaat_induk.toLowerCase().includes(query))
        );
      }

      return allItems;
    },
  });
}

// Fetch assets by Pos ID
export function useAsetByPos(id_pos: string) {
  return useAsetList({ id_pos });
}

// Helper to upload attachment file to Supabase Storage & insert record into t_lampiran_aset
async function uploadAttachment(
  supabase: any,
  file: File,
  assetKey: { id_tanah?: string; id_bangunan?: string; id_aset_b?: string }
) {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `assets/${fileName}`;

  // 1. Upload to Supabase Storage (assets-images)
  const { error: uploadError } = await supabase.storage
    .from('assets-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('assets-images')
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl || filePath;

  // 2. Insert record into t_lampiran_aset
  const lampiranId = generateId('LMP');
  const photoKeterangan = (file as any).keterangan || null;
  const { error: insertError } = await supabase.from('t_lampiran_aset').insert({
    id_lampiran: lampiranId,
    id_tanah: assetKey.id_tanah || null,
    id_bangunan: assetKey.id_bangunan || null,
    id_aset_b: assetKey.id_aset_b || null,
    nama_file: file.name,
    file_path: publicUrl,
    tipe_file: file.type,
    ukuran_file: (file.size / (1024 * 1024)).toFixed(2),
    keterangan: photoKeterangan,
  });

  if (insertError) throw insertError;
}

// Atomic 2-Step Mutation: Create Aset Tanah + Upload Photos
export function useCreateAsetTanah() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, files }: { data: AsetTanahInput; files?: File[] }) => {
      const id_tanah = generateId('AST-TNH');

      const payload = {
        id_tanah,
        id_pos: data.id_pos,
        luas_m2: data.luas_m2,
        thn_perolehan: data.thn_perolehan,
        status_hukum: data.status_hukum,
        kondisi: data.kondisi,
        potensi_sda: data.potensi_sda || null,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      };

      const { data: result, error } = await supabase
        .from('t_aset_tanah')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Upload any attachments/photos
      if (files && files.length > 0) {
        for (const file of files) {
          await uploadAttachment(supabase, file, { id_tanah });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}

// Update Aset Tanah
export function useUpdateAsetTanah() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_tanah, data, files }: { id_tanah: string; data: AsetTanahInput; files?: File[] }) => {
      const payload = {
        id_pos: data.id_pos,
        luas_m2: data.luas_m2,
        thn_perolehan: data.thn_perolehan,
        status_hukum: data.status_hukum,
        kondisi: data.kondisi,
        potensi_sda: data.potensi_sda || null,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('t_aset_tanah')
        .update(payload)
        .eq('id_tanah', id_tanah)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadAttachment(supabase, file, { id_tanah });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}

// Atomic 2-Step Mutation: Create Aset Bangunan + Upload Photos
export function useCreateAsetBangunan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, files }: { data: AsetBangunanInput; files?: File[] }) => {
      const id_bangunan = generateId('AST-BGN');

      const payload = {
        id_bangunan,
        id_pos: data.id_pos,
        nama_bangunan: data.nama_bangunan,
        fungsi: data.fungsi,
        kondisi: data.kondisi,
        thn_berdiri: data.thn_berdiri,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      };

      const { data: result, error } = await supabase
        .from('t_aset_bangunan')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadAttachment(supabase, file, { id_bangunan });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}

// Update Aset Bangunan
export function useUpdateAsetBangunan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_bangunan, data, files }: { id_bangunan: string; data: AsetBangunanInput; files?: File[] }) => {
      const payload = {
        id_pos: data.id_pos,
        nama_bangunan: data.nama_bangunan,
        fungsi: data.fungsi,
        kondisi: data.kondisi,
        thn_berdiri: data.thn_berdiri,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('t_aset_bangunan')
        .update(payload)
        .eq('id_bangunan', id_bangunan)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadAttachment(supabase, file, { id_bangunan });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}

// Atomic 2-Step Mutation: Create Aset Bergerak + Upload Photos
export function useCreateAsetBergerak() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, files }: { data: AsetBergerakInput; files?: File[] }) => {
      const id_aset_b = generateId('AST-BGK');

      const payload = {
        id_aset_b,
        id_pos: data.id_pos,
        jenis: data.jenis,
        merk_tipe: data.merk_tipe,
        kondisi: data.kondisi,
        thn_perolehan: data.thn_perolehan,
        no_polisi: data.no_polisi || null,
        tgl_pajak: data.tgl_pajak || null,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      };

      const { data: result, error } = await supabase
        .from('t_aset_bergerak')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadAttachment(supabase, file, { id_aset_b });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}

// Update Aset Bergerak
export function useUpdateAsetBergerak() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_aset_b, data, files }: { id_aset_b: string; data: AsetBergerakInput; files?: File[] }) => {
      const payload = {
        id_pos: data.id_pos,
        jenis: data.jenis,
        merk_tipe: data.merk_tipe,
        kondisi: data.kondisi,
        thn_perolehan: data.thn_perolehan,
        no_polisi: data.no_polisi || null,
        tgl_pajak: data.tgl_pajak || null,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('t_aset_bergerak')
        .update(payload)
        .eq('id_aset_b', id_aset_b)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadAttachment(supabase, file, { id_aset_b });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}

// Delete Asset
export function useDeleteAset() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, kategori }: { id: string; kategori: 'TANAH' | 'BANGUNAN' | 'BERGERAK' }) => {
      let error;
      if (kategori === 'TANAH') {
        const res = await supabase.from('t_aset_tanah').delete().eq('id_tanah', id);
        error = res.error;
      } else if (kategori === 'BANGUNAN') {
        const res = await supabase.from('t_aset_bangunan').delete().eq('id_bangunan', id);
        error = res.error;
      } else {
        const res = await supabase.from('t_aset_bergerak').delete().eq('id_aset_b', id);
        error = res.error;
      }

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}

// Delete Attachment File from t_lampiran_aset
export function useDeleteLampiranAset() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_lampiran: string) => {
      const { error } = await supabase.from('t_lampiran_aset').delete().eq('id_lampiran', id_lampiran);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}

// Update Attachment Caption in t_lampiran_aset
export function useUpdateLampiranKeterangan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_lampiran, keterangan }: { id_lampiran: string; keterangan: string | null }) => {
      const { error } = await supabase
        .from('t_lampiran_aset')
        .update({ keterangan })
        .eq('id_lampiran', id_lampiran);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aset-list'] });
    },
  });
}
