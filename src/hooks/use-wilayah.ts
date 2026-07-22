import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { KerawananInput, PotensiInput } from '@/lib/validations/wilayah.schema';

/**
 * Interface Data Pos Pelkes
 */
export interface PosPelkesWilayah {
  id_pos: string;
  nama_pos: string;
  latitude: number | null;
  longitude: number | null;
  id_induk?: string | null;
  mupel?: string | null;
  jemaat_induk?: string | null;
}

export interface KerawananLampiran {
  id_lampiran: string;
  id_risiko: string;
  nama_file: string;
  file_path: string;
  tipe_file?: string;
  ukuran_file?: number;
  keterangan?: string | null;
  created_at?: string;
}

/**
 * Interface Data Kerawanan Wilayah
 */
export interface KerawananItem {
  id_risiko: string;
  id_pos: string;
  kategori: string;
  jenis_risiko: string;
  frekuensi: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  keterangan: string | null;
  latitude?: number | null;
  longitude?: number | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  pos?: PosPelkesWilayah | null;
  lampiran?: KerawananLampiran[];
}

/**
 * Helper to upload attachment file to Supabase Storage & insert record into t_lampiran_kerawanan
 */
async function uploadKerawananAttachment(
  supabase: any,
  file: File,
  id_risiko: string
) {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `kerawanan/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('assets-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('assets-images')
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl || filePath;

  const lampiranId = generateId('LMP');
  const photoKeterangan = (file as any).keterangan || null;
  const { error: insertError } = await supabase.from('t_lampiran_kerawanan').insert({
    id_lampiran: lampiranId,
    id_risiko,
    nama_file: file.name,
    file_path: publicUrl,
    tipe_file: file.type,
    ukuran_file: (file.size / (1024 * 1024)).toFixed(2),
    keterangan: photoKeterangan,
  });

  if (insertError) throw insertError;
}

/**
 * Helper to upload attachment file to Supabase Storage & insert record into t_lampiran_potensi
 */
async function uploadPotensiAttachment(
  supabase: any,
  file: File,
  id_potensi: string
) {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `potensi/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('assets-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('assets-images')
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl || filePath;

  const lampiranId = generateId('LMP');
  const photoKeterangan = (file as any).keterangan || null;
  const { error: insertError } = await supabase.from('t_lampiran_potensi').insert({
    id_lampiran: lampiranId,
    id_potensi,
    nama_file: file.name,
    file_path: publicUrl,
    tipe_file: file.type,
    ukuran_file: (file.size / (1024 * 1024)).toFixed(2),
    keterangan: photoKeterangan,
  });

  if (insertError) throw insertError;
}

/**
 * Hook untuk mengambil daftar data Kerawanan Wilayah (US-13.1)
 */
export function useKerawananList(id_pos?: string) {
  const supabase = createClient();

  return useQuery<KerawananItem[]>({
    queryKey: ['kerawanan-list', id_pos || 'all'],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    queryFn: async () => {
      let query = supabase
        .from('t_kerawanan_wilayah')
        .select(`
          *, 
          pos:m_pos_pelkes(
            id_pos, 
            nama_pos, 
            latitude, 
            longitude,
            jemaat_induk:m_jemaat_induk(
              nama_induk, 
              id_mupel,
              mupel:m_mupel(nama_mupel)
            )
          ),
          lampiran:t_lampiran_kerawanan(*)
        `)
        .order('created_at', { ascending: false });

      if (id_pos && id_pos !== 'all') {
        query = query.eq('id_pos', id_pos);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((k: any) => ({
        ...k,
        pos: k.pos ? {
          id_pos: k.pos.id_pos,
          nama_pos: k.pos.nama_pos,
          latitude: k.pos.latitude,
          longitude: k.pos.longitude,
          jemaat_induk: k.pos.jemaat_induk?.nama_induk || null,
          mupel: k.pos.jemaat_induk?.mupel?.nama_mupel || k.pos.jemaat_induk?.id_mupel || null,
        } : null,
        lampiran: k.lampiran || [],
      })) as KerawananItem[];
    },
  });
}

export interface PotensiLampiran {
  id_lampiran: string;
  id_potensi: string;
  nama_file: string;
  file_path: string;
  tipe_file?: string;
  ukuran_file?: number;
  keterangan?: string | null;
  created_at?: string;
}

/**
 * Interface Data Potensi Wilayah
 */
export interface PotensiItem {
  id_potensi: string;
  id_pos: string;
  nama_potensi: string;
  kategori: string;
  deskripsi: string;
  keterangan: string | null;
  latitude?: number | null;
  longitude?: number | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  pos?: PosPelkesWilayah | null;
  lampiran?: PotensiLampiran[];
}

/**
 * Interface Agregat Data Wilayah untuk Map Marker Popup
 */
export interface MapPosPelkesItem {
  id_pos: string;
  nama_pos: string;
  latitude: number;
  longitude: number;
  mupel: string | null;
  jumlah_kerawanan: number;
  jumlah_potensi: number;
  kerawanan_list: KerawananItem[];
  potensi_list: PotensiItem[];
}

/**
 * Helper untuk generate ID unik di Client-Side
 */
function generateId(prefix: 'RIS' | 'POT' | 'LMP' | string): string {
  const timestamp = Date.now();
  const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Hook untuk mengambil daftar Pos Pelkes (digunakan pada Dropdown / Selector)
 */
export function usePosPelkesList() {
  const supabase = createClient();

  return useQuery<PosPelkesWilayah[]>({
    queryKey: ['pos-pelkes-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('m_pos_pelkes')
        .select(`
          id_pos, 
          nama_pos, 
          latitude, 
          longitude, 
          id_induk,
          jemaat_induk:m_jemaat_induk(
            nama_induk, 
            id_mupel,
            mupel:m_mupel(nama_mupel)
          )
        `)
        .order('nama_pos', { ascending: true });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        id_pos: p.id_pos,
        nama_pos: p.nama_pos,
        latitude: p.latitude,
        longitude: p.longitude,
        id_induk: p.id_induk,
        jemaat_induk: p.jemaat_induk?.nama_induk || null,
        mupel: p.jemaat_induk?.mupel?.nama_mupel || p.jemaat_induk?.id_mupel || null,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour memory cache for instant dropdowns
    gcTime: 1000 * 60 * 120, // 2 hours retention
  });
}

export function usePotensiList(id_pos?: string) {
  const supabase = createClient();

  return useQuery<PotensiItem[]>({
    queryKey: ['potensi-list', id_pos || 'all'],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    queryFn: async () => {
      let query = supabase
        .from('t_potensi_wilayah')
        .select(`
          *, 
          pos:m_pos_pelkes(
            id_pos, 
            nama_pos, 
            latitude, 
            longitude,
            jemaat_induk:m_jemaat_induk(
              nama_induk, 
              id_mupel,
              mupel:m_mupel(nama_mupel)
            )
          ),
          lampiran:t_lampiran_potensi(*)
        `)
        .order('created_at', { ascending: false });

      if (id_pos && id_pos !== 'all') {
        query = query.eq('id_pos', id_pos);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        pos: p.pos ? {
          id_pos: p.pos.id_pos,
          nama_pos: p.pos.nama_pos,
          latitude: p.pos.latitude,
          longitude: p.pos.longitude,
          jemaat_induk: p.pos.jemaat_induk?.nama_induk || null,
          mupel: p.pos.jemaat_induk?.mupel?.nama_mupel || p.pos.jemaat_induk?.id_mupel || null,
        } : null,
        lampiran: p.lampiran || [],
      })) as PotensiItem[];
    },
  });
}

/**
 * Hook Agregat Peta Wilayah (US-13.3)
 * Menggabungkan Pos Pelkes dengan data Kerawanan & Potensi untuk plotting marker Leaflet
 */
export function useWilayahMapData() {
  const supabase = createClient();

  return useQuery<MapPosPelkesItem[]>({
    queryKey: ['wilayah-map-data'],
    queryFn: async () => {
      // 1. Fetch Pos Pelkes dengan koordinat valid
      const { data: posData, error: posErr } = await supabase
        .from('m_pos_pelkes')
        .select(`
          id_pos, 
          nama_pos, 
          latitude, 
          longitude,
          jemaat_induk:m_jemaat_induk(nama_induk, id_mupel)
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (posErr) throw posErr;
      if (!posData || posData.length === 0) return [];

      // 2. Fetch Kerawanan & Potensi sekaligus
      const [{ data: kerawananData, error: kErr }, { data: potensiData, error: pErr }] = await Promise.all([
        supabase.from('t_kerawanan_wilayah').select('*'),
        supabase.from('t_potensi_wilayah').select('*'),
      ]);

      if (kErr) throw kErr;
      if (pErr) throw pErr;

      const kerawananList = (kerawananData || []) as KerawananItem[];
      const potensiList = (potensiData || []) as PotensiItem[];

      // 3. Mapping data ke per Pos Pelkes
      const mapItems: MapPosPelkesItem[] = posData
        .filter((pos: any) => typeof pos.latitude === 'number' && typeof pos.longitude === 'number')
        .map((pos: any) => {
          const kItems = kerawananList.filter((k) => k.id_pos === pos.id_pos);
          const pItems = potensiList.filter((p) => p.id_pos === pos.id_pos);

          return {
            id_pos: pos.id_pos,
            nama_pos: pos.nama_pos,
            latitude: Number(pos.latitude),
            longitude: Number(pos.longitude),
            mupel: pos.jemaat_induk?.id_mupel || null,
            jumlah_kerawanan: kItems.length,
            jumlah_potensi: pItems.length,
            kerawanan_list: kItems,
            potensi_list: pItems,
          };
        });

      return mapItems;
    },
  });
}

/**
 * Mutation Hook: Tambah Kerawanan Wilayah baru + Upload Foto
 */
export function useCreateKerawanan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, files }: { data: KerawananInput; files?: File[] }) => {
      const id_risiko = generateId('RIS');
      const payload = {
        id_risiko,
        id_pos: data.id_pos || null,
        kategori: data.kategori,
        jenis_risiko: data.jenis_risiko,
        frekuensi: data.frekuensi,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        updated_by: data.updated_by || null,
      };

      const { data: result, error } = await supabase
        .from('t_kerawanan_wilayah')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadKerawananAttachment(supabase, file, id_risiko);
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kerawanan-list'] });
      queryClient.invalidateQueries({ queryKey: ['wilayah-map-data'] });
    },
  });
}

/**
 * Mutation Hook: Update Kerawanan Wilayah + Upload Foto Baru
 */
export function useUpdateKerawanan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_risiko, data, files }: { id_risiko: string; data: KerawananInput; files?: File[] }) => {
      const payload = {
        id_pos: data.id_pos || null,
        kategori: data.kategori,
        jenis_risiko: data.jenis_risiko,
        frekuensi: data.frekuensi,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        updated_by: data.updated_by || null,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('t_kerawanan_wilayah')
        .update(payload)
        .eq('id_risiko', id_risiko)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadKerawananAttachment(supabase, file, id_risiko);
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kerawanan-list'] });
      queryClient.invalidateQueries({ queryKey: ['wilayah-map-data'] });
    },
  });
}

/**
 * Delete Attachment File from t_lampiran_kerawanan
 */
export function useDeleteLampiranKerawanan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_lampiran: string) => {
      const { error } = await supabase.from('t_lampiran_kerawanan').delete().eq('id_lampiran', id_lampiran);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kerawanan-list'] });
    },
  });
}

/**
 * Update Attachment Caption in t_lampiran_kerawanan
 */
export function useUpdateLampiranKerawananKeterangan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_lampiran, keterangan }: { id_lampiran: string; keterangan: string | null }) => {
      const { error } = await supabase
        .from('t_lampiran_kerawanan')
        .update({ keterangan })
        .eq('id_lampiran', id_lampiran);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kerawanan-list'] });
    },
  });
}

/**
 * Mutation Hook: Tambah Potensi Wilayah baru + Upload Foto
 */
export function useCreatePotensi() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, files }: { data: PotensiInput; files?: File[] }) => {
      const id_potensi = generateId('POT');
      const payload = {
        id_potensi,
        id_pos: data.id_pos || null,
        nama_potensi: data.nama_potensi,
        kategori: data.kategori,
        deskripsi: data.deskripsi,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        updated_by: data.updated_by || null,
      };

      const { data: result, error } = await supabase
        .from('t_potensi_wilayah')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadPotensiAttachment(supabase, file, id_potensi);
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potensi-list'] });
      queryClient.invalidateQueries({ queryKey: ['wilayah-map-data'] });
    },
  });
}

/**
 * Mutation Hook: Edit Data Potensi Wilayah
 */
export function useUpdatePotensi() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_potensi, data, files }: { id_potensi: string; data: PotensiInput; files?: File[] }) => {
      const payload = {
        id_pos: data.id_pos || null,
        nama_potensi: data.nama_potensi,
        kategori: data.kategori,
        deskripsi: data.deskripsi,
        keterangan: data.keterangan || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        updated_by: data.updated_by || null,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('t_potensi_wilayah')
        .update(payload)
        .eq('id_potensi', id_potensi)
        .select()
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        for (const file of files) {
          await uploadPotensiAttachment(supabase, file, id_potensi);
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potensi-list'] });
      queryClient.invalidateQueries({ queryKey: ['wilayah-map-data'] });
    },
  });
}

/**
 * Delete Attachment File from t_lampiran_potensi
 */
export function useDeleteLampiranPotensi() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_lampiran: string) => {
      const { error } = await supabase.from('t_lampiran_potensi').delete().eq('id_lampiran', id_lampiran);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potensi-list'] });
    },
  });
}

/**
 * Update Attachment Caption in t_lampiran_potensi
 */
export function useUpdateLampiranPotensiKeterangan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_lampiran, keterangan }: { id_lampiran: string; keterangan: string | null }) => {
      const { error } = await supabase
        .from('t_lampiran_potensi')
        .update({ keterangan })
        .eq('id_lampiran', id_lampiran);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potensi-list'] });
    },
  });
}

/**
 * Mutation Hook: Hapus Kerawanan Wilayah
 */
export function useDeleteKerawanan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_risiko: string) => {
      const { error } = await supabase
        .from('t_kerawanan_wilayah')
        .delete()
        .eq('id_risiko', id_risiko);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kerawanan-list'] });
      queryClient.invalidateQueries({ queryKey: ['wilayah-map-data'] });
    },
  });
}

/**
 * Mutation Hook: Hapus Potensi Wilayah
 */
export function useDeletePotensi() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_potensi: string) => {
      const { error } = await supabase
        .from('t_potensi_wilayah')
        .delete()
        .eq('id_potensi', id_potensi);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potensi-list'] });
      queryClient.invalidateQueries({ queryKey: ['wilayah-map-data'] });
    },
  });
}

/**
 * Interface Agregat Jemaat Induk untuk Marker Map
 */
export interface MapJemaatItem {
  id_induk: string;
  id_mupel: string;
  nama_induk: string;
  latitude: number;
  longitude: number;
  mupel_nama?: string | null;
  jumlah_sektor: number;
  jumlah_kk: number;
  jumlah_jiwa: number;
  kmj_nama?: string | null;
}

/**
 * Hook Agregat Peta Jemaat Induk
 */
export function useJemaatMapData() {
  const supabase = createClient();

  return useQuery<MapJemaatItem[]>({
    queryKey: ['jemaat-map-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('m_jemaat_induk')
        .select(`
          id_induk,
          id_mupel,
          nama_induk,
          latitude,
          longitude,
          jumlah_sektor,
          jumlah_kk,
          jumlah_jiwa,
          mupel:m_mupel(nama_mupel),
          kmj:m_pendeta!id_kmj(nama_lengkap)
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      return (data || []).map((j: any) => ({
        id_induk: j.id_induk,
        id_mupel: j.id_mupel,
        nama_induk: j.nama_induk,
        latitude: Number(j.latitude),
        longitude: Number(j.longitude),
        mupel_nama: j.mupel?.nama_mupel || j.id_mupel,
        jumlah_sektor: j.jumlah_sektor || 0,
        jumlah_kk: j.jumlah_kk || 0,
        jumlah_jiwa: j.jumlah_jiwa || 0,
        kmj_nama: j.kmj?.nama_lengkap || null,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

