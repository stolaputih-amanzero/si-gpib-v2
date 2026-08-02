'use client';

import { useMemo } from 'react';
import { DemografiKategoriInput } from '@/lib/validations/demografi.schema';

export interface DemografiAggregatedMetrics {
  totalKK: number;
  totalJiwa: number;
  totalLaki: number;
  totalPerempuan: number;
}

export function useDemografiAggregator(
  dataRecord: Record<string, DemografiKategoriInput>
): DemografiAggregatedMetrics {
  return useMemo(() => {
    if (!dataRecord) {
      return { totalKK: 0, totalJiwa: 0, totalLaki: 0, totalPerempuan: 0 };
    }

    const values = Object.values(dataRecord);
    return values.reduce(
      (acc, item) => {
        const kk = Number(item.jml_kk || 0);
        const laki = Number(item.laki || 0);
        const perempuan = Number(item.perempuan || 0);

        acc.totalKK += kk;
        acc.totalLaki += laki;
        acc.totalPerempuan += perempuan;
        acc.totalJiwa += laki + perempuan;
        return acc;
      },
      { totalKK: 0, totalJiwa: 0, totalLaki: 0, totalPerempuan: 0 }
    );
  }, [dataRecord]);
}
