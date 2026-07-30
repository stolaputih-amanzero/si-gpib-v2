'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { translateDbError, type DbErrorInfo } from '@/lib/utils/db-errors';

export function useDeletePendeta() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation<void, DbErrorInfo, string>({
    mutationFn: async (idPendeta: string) => {
      const { error } = await supabase
        .from('m_pendeta')
        .delete()
        .eq('id_pendeta', idPendeta);
      if (error) throw translateDbError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pendeta'] });
      qc.invalidateQueries({ queryKey: ['current-pendeta'] });
    },
  });
}
