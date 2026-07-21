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
  created_at: string;
  updated_at: string;
  pos?: PosPelkesWilayah | null;
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
  created_at: string;
  updated_at: string;
  pos?: PosPelkesWilayah | null;
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
function generateId(prefix: 'RIS' | 'POT'): string {
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
          jemaat:m_jemaat_induk(nama_induk, id_mupel)
        `)
        .order('nama_pos', { ascending: true });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        id_pos: p.id_pos,
        nama_pos: p.nama_pos,
        latitude: p.latitude,
        longitude: p.longitude,
        id_induk: p.id_induk,
        jemaat_induk: p.jemaat?.nama_induk || null,
        mupel: p.jemaat?.id_mupel || null,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour memory cache for instant dropdowns
    gcTime: 1000 * 60 * 120, // 2 hours retention
  });
}

/**
 * Hook untuk mengambil daftar data Kerawanan Wilayah (US-13.1)
 */
export function useKerawananList(id_pos?: string) {
  const supabase = createClient();

  return useQuery<KerawananItem[]>({
    queryKey: ['kerawanan-list', id_pos || 'all'],
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
            jemaat:m_jemaat_induk(id_mupel)
          )
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
          mupel: k.pos.jemaat?.id_mupel || null,
        } : null,
      })) as KerawananItem[];
    },
  });
}

/**
 * Hook untuk mengambil daftar data Potensi Wilayah (US-13.2)
 */
export function usePotensiList(id_pos?: string) {
  const supabase = createClient();

  return useQuery<PotensiItem[]>({
    queryKey: ['potensi-list', id_pos || 'all'],
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
            jemaat:m_jemaat_induk(id_mupel)
          )
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
          mupel: p.pos.jemaat?.id_mupel || null,
        } : null,
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
          jemaat:m_jemaat_induk(id_mupel)
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
            mupel: pos.jemaat?.id_mupel || null,
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
 * Mutation Hook: Tambah Kerawanan Wilayah baru
 */
export function useCreateKerawanan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: KerawananInput) => {
      const id_risiko = generateId('RIS');
      const payload = {
        id_risiko,
        id_pos: input.id_pos,
        kategori: input.kategori,
        jenis_risiko: input.jenis_risiko,
        frekuensi: input.frekuensi,
        keterangan: input.keterangan || null,
      };

      const { data, error } = await supabase
        .from('t_kerawanan_wilayah')
        .insert(payload)
        .select(`
          *, 
          pos:m_pos_pelkes(
            id_pos, 
            nama_pos, 
            latitude, 
            longitude,
            jemaat:m_jemaat_induk(id_mupel)
          )
        `)
        .single();

      if (error) throw error;
      return data as KerawananItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kerawanan-list'] });
      queryClient.invalidateQueries({ queryKey: ['wilayah-map-data'] });
    },
  });
}

/**
 * Mutation Hook: Tambah Potensi Wilayah baru
 */
export function useCreatePotensi() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PotensiInput) => {
      const id_potensi = generateId('POT');
      const payload = {
        id_potensi,
        id_pos: input.id_pos,
        nama_potensi: input.nama_potensi,
        kategori: input.kategori,
        deskripsi: input.deskripsi,
        keterangan: input.keterangan || null,
      };

      const { data, error } = await supabase
        .from('t_potensi_wilayah')
        .insert(payload)
        .select(`
          *, 
          pos:m_pos_pelkes(
            id_pos, 
            nama_pos, 
            latitude, 
            longitude,
            jemaat:m_jemaat_induk(id_mupel)
          )
        `)
        .single();

      if (error) throw error;
      return data as PotensiItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potensi-list'] });
      queryClient.invalidateQueries({ queryKey: ['wilayah-map-data'] });
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

