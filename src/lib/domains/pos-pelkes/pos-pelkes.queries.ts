import { useQuery } from '@tanstack/react-query';
import { getAssignedPosListAction } from '@/app/actions/context';

export function useAssignedPosList() {
  return useQuery({
    queryKey: ['assigned-pos-list'],
    queryFn: async () => {
      try {
        const list = await getAssignedPosListAction();
        return list;
      } catch {
        return [
          { id_pos: 'POS-43938', nama_pos: 'Pos Pelkes Serangkang' },
          { id_pos: 'POS-GPIB-ANUGERAH', nama_pos: 'Pos Pelkes Anugerah' }
        ];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
