import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { DemografiInput, DemografiFilter } from '@/lib/validations/demografi.schema';

// Fetch demografi per Pos
export function useDemografiByPos(id_pos: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['demografi', id_pos],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('t_demografi_pelkat')
        .select('*')
        .eq('id_pos', id_pos)
        .order('kategori_pelkat');
      
      if (error) throw error;
      return data;
    },
    enabled: !!id_pos,
  });
}

// Fetch demografi dengan filter
export function useDemografiList(filter: DemografiFilter) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['demografi-list', filter],
    queryFn: async () => {
      let query = supabase
        .from('t_demografi_pelkat')
        .select(`
          *,
          pos:m_pos_pelkes(
            nama_pos,
            kategori,
            alamat,
            latitude,
            longitude,
            id_induk,
            jemaat_induk:m_jemaat_induk(
              nama_induk,
              alamat,
              latitude,
              longitude,
              id_mupel,
              mupel:m_mupel(nama_mupel)
            )
          )
        `);
      
      if (filter.id_pos) query = query.eq('id_pos', filter.id_pos);
      if (filter.kategori_pelkat) query = query.eq('kategori_pelkat', filter.kategori_pelkat);
      
      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data;
    },
  });
}

// Upsert demografi (karena composite PK id_pos, kategori_pelkat)
export function useUpsertDemografi() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DemografiInput) => {
      const payload = {
        id_pos: data.id_pos,
        kategori_pelkat: data.kategori_pelkat,
        jml_kk: data.jml_kk,
        laki: data.laki,
        perempuan: data.perempuan,
        profesi: data.profesi || null,
        pendidikan: data.pendidikan || null,
        keterangan: data.keterangan || null,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('t_demografi_pelkat')
        .upsert(payload, {
          onConflict: 'id_pos,kategori_pelkat',
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demografi', variables.id_pos] });
      queryClient.invalidateQueries({ queryKey: ['demografi-list'] });
    },
  });
}
export function useBatchUpsertDemografi() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payloads: DemografiInput[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      let updatedByStr = 'Admin Demografi';

      if (user) {
        const { data: userRow } = await supabase
          .from('users')
          .select('email, no_telepon, role')
          .eq('id', user.id)
          .single();

        updatedByStr = userRow?.email || userRow?.no_telepon || user.email || user.phone || 'Admin Demografi';
      }

      const formattedPayloads = payloads.map((data) => ({
        id_pos: data.id_pos,
        kategori_pelkat: data.kategori_pelkat,
        jml_kk: data.jml_kk,
        laki: data.laki,
        perempuan: data.perempuan,
        profesi: data.profesi || null,
        pendidikan: data.pendidikan || null,
        keterangan: data.keterangan || null,
        updated_by: data.updated_by || updatedByStr,
        updated_at: new Date().toISOString(),
      }));

      const { data: result, error } = await supabase
        .from('t_demografi_pelkat')
        .upsert(formattedPayloads, {
          onConflict: 'id_pos,kategori_pelkat',
        })
        .select();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      if (variables[0]?.id_pos) {
        queryClient.invalidateQueries({ queryKey: ['demografi', variables[0].id_pos] });
      }
      queryClient.invalidateQueries({ queryKey: ['demografi-list'] });
    },
  });
}

// Delete demografi record
export function useDeleteDemografi() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_pos, kategori_pelkat }: { id_pos: string; kategori_pelkat: string }) => {
      const { error } = await supabase
        .from('t_demografi_pelkat')
        .delete()
        .eq('id_pos', id_pos)
        .eq('kategori_pelkat', kategori_pelkat);

      if (error) throw error;
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demografi', variables.id_pos] });
      queryClient.invalidateQueries({ queryKey: ['demografi-list'] });
    },
  });
}
