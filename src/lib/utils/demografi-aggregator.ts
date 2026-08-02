export interface DemografiAggregatedSummary {
  totalKK: number;
  totalJiwa: number;
  totalLaki: number;
  totalPerempuan: number;
  kategoriCount: number;
}

export interface ProfesiFrequency {
  name: string;
  count: number;
  percentage: number;
}

export function aggregateDemografi(data: any[]): DemografiAggregatedSummary {
  if (!data || data.length === 0) {
    return { totalKK: 0, totalJiwa: 0, totalLaki: 0, totalPerempuan: 0, kategoriCount: 0 };
  }

  return data.reduce(
    (acc, row) => {
      const laki = Number(row.laki || 0);
      const perempuan = Number(row.perempuan || 0);
      const kk = Number(row.jml_kk || 0);

      acc.totalKK += kk;
      acc.totalLaki += laki;
      acc.totalPerempuan += perempuan;
      acc.totalJiwa += laki + perempuan;
      acc.kategoriCount += 1;
      return acc;
    },
    { totalKK: 0, totalJiwa: 0, totalLaki: 0, totalPerempuan: 0, kategoriCount: 0 }
  );
}

export function parseProfesiList(profesiStr?: string | null): string[] {
  if (!profesiStr || typeof profesiStr !== 'string') return [];
  const trimmed = profesiStr.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((p) => String(p).trim()).filter(Boolean);
    } catch {
      // Fallback if JSON parse fails
    }
  }

  return trimmed
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

export function extractTopProfesi(data: any[], topN = 5): ProfesiFrequency[] {
  if (!data || data.length === 0) return [];

  const freqMap = new Map<string, number>();
  let totalCount = 0;

  data.forEach((row) => {
    const list = parseProfesiList(row.profesi);
    list.forEach((item) => {
      freqMap.set(item, (freqMap.get(item) || 0) + 1);
      totalCount += 1;
    });
  });

  if (totalCount === 0) return [];

  const sorted = Array.from(freqMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalCount) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  if (sorted.length <= topN) {
    return sorted;
  }

  const topItems = sorted.slice(0, topN);
  const remainingCount = sorted.slice(topN).reduce((sum, item) => sum + item.count, 0);

  if (remainingCount > 0) {
    topItems.push({
      name: 'Lainnya',
      count: remainingCount,
      percentage: Math.round((remainingCount / totalCount) * 100),
    });
  }

  return topItems;
}
