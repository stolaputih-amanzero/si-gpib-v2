export interface JemaatStats {
  totalPos: number;
  totalKK: number;
  totalJiwa: number;
  totalLaki: number;
  totalPerempuan: number;
}

export function calculateJemaatStats(
  posList: Array<{
    id_pos: string;
    jumlah_kk?: number | null;
    jumlah_jiwa?: number | null;
    demografi?: Array<{
      jml_kk?: number | null;
      laki?: number | null;
      perempuan?: number | null;
    }> | null;
  }> = [],
  jemaatIndukExtra?: {
    jumlah_kk?: number | null;
    jumlah_jiwa?: number | null;
  }
): JemaatStats {
  let totalPos = posList.length;
  let totalKK = jemaatIndukExtra?.jumlah_kk || 0;
  let totalLaki = 0;
  let totalPerempuan = 0;
  let totalJiwaFromDemo = 0;

  for (const pos of posList) {
    let posKK = pos.jumlah_kk || 0;
    let posLaki = 0;
    let posPerempuan = 0;

    if (pos.demografi && pos.demografi.length > 0) {
      const demoKK = pos.demografi.reduce((sum, d) => sum + (d.jml_kk || 0), 0);
      const demoL = pos.demografi.reduce((sum, d) => sum + (d.laki || 0), 0);
      const demoP = pos.demografi.reduce((sum, d) => sum + (d.perempuan || 0), 0);

      if (demoKK > 0) posKK = demoKK;
      posLaki = demoL;
      posPerempuan = demoP;
    }

    totalKK += posKK;
    totalLaki += posLaki;
    totalPerempuan += posPerempuan;
    totalJiwaFromDemo += posLaki + posPerempuan;
  }

  const totalJiwa = totalJiwaFromDemo || (jemaatIndukExtra?.jumlah_jiwa || 0) + posList.reduce((sum, p) => sum + (p.jumlah_jiwa || 0), 0);

  return {
    totalPos,
    totalKK,
    totalJiwa,
    totalLaki,
    totalPerempuan,
  };
}
