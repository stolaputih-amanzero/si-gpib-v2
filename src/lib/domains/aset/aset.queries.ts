// src/lib/domains/aset/aset.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { submitAset } from './aset.service';
import type { JenisAset } from './aset.types';
import type { CreateAsetSchema } from './aset.schema';

export function useAsetList(idPos: string, jenis: JenisAset) {
  return useQuery({
    queryKey: ['aset', idPos, jenis],
    queryFn: async () => {
      const supabase = createClient();
      let table = '';
      if (jenis === 'tanah') table = 't_aset_tanah';
      else if (jenis === 'bangunan') table = 't_aset_bangunan';
      else if (jenis === 'bergerak') table = 't_aset_bergerak';

      const { data, error } = await supabase
        .from(table as any)
        .select('*')
        .eq('id_pos', idPos)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!idPos && !!jenis,
  });
}

export function useCreateAset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, fotoBlob }: { data: CreateAsetSchema, fotoBlob?: Blob }) => {
      const result = await submitAset(data, fotoBlob);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries for the specific Pos and Jenis Aset
      queryClient.invalidateQueries({ queryKey: ['aset', variables.data.id_pos, variables.data.jenis] });
    },
  });
}
