import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { JabatanStrukturalInput } from '@/lib/validations/jabatan-struktural.schema';

export interface JabatanStrukturalItem {
  id_jabatan: string;
  id_pendeta: string;
  kategori: string;
  nama_jabatan: string;
  tingkat: string;
  tgl_mulai: string;
  tgl_selesai?: string | null;
  no_sk?: string | null;
  tgl_sk?: string | null;
  status: string;
  keterangan?: string | null;
  created_at: string;
  pendeta?: {
    nama_lengkap: string;
    id_induk: string;
    jemaat_induk?: {
      nama_induk: string;
    };
  };
}

export function useJabatanByPendeta(id_pendeta: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['jabatan-struktural', id_pendeta],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('t_jabatan_struktural')
        .select('*')
        .eq('id_pendeta', id_pendeta)
        .order('tgl_mulai', { ascending: false });
      
      if (error) throw error;
      return (data || []) as JabatanStrukturalItem[];
    },
    enabled: !!id_pendeta
  });
}

export function useJabatanAktifByKategori(kategori: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['jabatan-aktif', kategori],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('t_jabatan_struktural')
        .select(`
          *,
          pendeta:m_pendeta(nama_lengkap, id_induk, jemaat_induk:m_jemaat_induk(nama_induk))
        `)
        .eq('kategori', kategori)
        .eq('status', 'Aktif')
        .order('nama_jabatan');
      
      if (error) throw error;
      return (data || []) as JabatanStrukturalItem[];
    }
  });
}

export function useCreateJabatan() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: JabatanStrukturalInput) => {
      const id_jabatan = `JBT-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const { data: result, error } = await supabase
        .from('t_jabatan_struktural')
        .insert({
          id_jabatan,
          ...data,
          tgl_mulai: data.tgl_mulai ? new Date(data.tgl_mulai).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          tgl_selesai: data.tgl_selesai ? new Date(data.tgl_selesai).toISOString().split('T')[0] : null,
          tgl_sk: data.tgl_sk ? new Date(data.tgl_sk).toISOString().split('T')[0] : null
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-struktural', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['jabatan-aktif'] });
      
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
    onError: () => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    }
  });
}

export function useUpdateJabatan() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: JabatanStrukturalInput & { id_jabatan: string }) => {
      const { id_jabatan, ...updateData } = data;
      
      const { error } = await supabase
        .from('t_jabatan_struktural')
        .update({
          ...updateData,
          tgl_mulai: updateData.tgl_mulai ? new Date(updateData.tgl_mulai).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          tgl_selesai: updateData.tgl_selesai ? new Date(updateData.tgl_selesai).toISOString().split('T')[0] : null,
          tgl_sk: updateData.tgl_sk ? new Date(updateData.tgl_sk).toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString()
        })
        .eq('id_jabatan', id_jabatan);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-struktural', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['jabatan-aktif'] });
      
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    }
  });
}

export function useDeleteJabatan() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id_jabatan }: { id_jabatan: string, id_pendeta: string }) => {
      const { error } = await supabase
        .from('t_jabatan_struktural')
        .delete()
        .eq('id_jabatan', id_jabatan);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-struktural', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['jabatan-aktif'] });
      
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    }
  });
}
