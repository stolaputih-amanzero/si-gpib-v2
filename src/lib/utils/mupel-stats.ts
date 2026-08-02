export interface MupelStats {
  totalJemaat: number;
  totalPos: number;
  totalPendeta: number;
  totalKK: number;
  totalJiwa: number;
}

export function calculateMupelStats(
  jemaatList: Array<{
    id_induk: string;
    pos_count?: number | null;
    bajem_count?: number | null;
    jumlah_kk?: number | null;
    jumlah_jiwa?: number | null;
    demografi?: Array<{
      jml_kk?: number | null;
      laki?: number | null;
      perempuan?: number | null;
    }> | null;
  }> = [],
  pendetaList: Array<{ id_pendeta: string }> = []
): MupelStats {
  const totalJemaat = jemaatList.length;
  const totalPendeta = pendetaList.length;

  let totalPos = 0;
  let totalKK = 0;
  let totalJiwa = 0;

  for (const jemaat of jemaatList) {
    const posCount = (jemaat.pos_count || 0) + (jemaat.bajem_count || 0);
    totalPos += posCount;

    let jemaatKK = jemaat.jumlah_kk || 0;
    let jemaatJiwa = jemaat.jumlah_jiwa || 0;

    if (jemaat.demografi && jemaat.demografi.length > 0) {
      const demoKK = jemaat.demografi.reduce((sum, d) => sum + (d.jml_kk || 0), 0);
      const demoL = jemaat.demografi.reduce((sum, d) => sum + (d.laki || 0), 0);
      const demoP = jemaat.demografi.reduce((sum, d) => sum + (d.perempuan || 0), 0);

      if (demoKK > 0) jemaatKK = demoKK;
      if (demoL + demoP > 0) jemaatJiwa = demoL + demoP;
    }

    totalKK += jemaatKK;
    totalJiwa += jemaatJiwa;
  }

  return {
    totalJemaat,
    totalPos,
    totalPendeta,
    totalKK,
    totalJiwa,
  };
}
