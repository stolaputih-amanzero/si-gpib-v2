import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  ProfileAkun,
  ProfilePelayanan,
  ProfileStats,
  RiwayatMutasiItem,
  PenugasanPjItem,
  LogPastoralRingkasItem,
  AktivitasUserItem,
  DeviceBiometricItem,
  DraftUserItem,
} from '@/types/profile.types';
import { getLogPastoralListAction } from '@/app/(dashboard)/dashboard/pastoral/actions';
import { getRiwayatMutasiAction } from '@/app/(dashboard)/sdm/pendeta/actions-360';
/**
 * 1. Fetch Profile Akun for specified userId (or current session)
 */
export function useProfileAkun(userId?: string) {
  const supabase = createClient();

  return useQuery<ProfileAkun | null>({
    queryKey: ['profile-akun', userId || 'me'],
    queryFn: async () => {
      let targetId = userId;

      if (!targetId) {
        const { data: authData } = await supabase.auth.getUser();
        targetId = authData?.user?.id;
      }

      if (!targetId) {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const body = await res.json();
            if (body?.user) {
              return {
                id: body.user.id,
                email: body.user.email,
                nama_lengkap: body.user.nama_lengkap || body.user.user_metadata?.nama_lengkap || body.user.email,
                role: body.user.role || 'pelayan',
                id_mupel: body.user.id_mupel || null,
                id_induk: body.user.id_induk || null,
                id_pos: body.user.id_pos || null,
                id_pendeta: body.user.id_pendeta || null,
                status: body.user.status || 'Active',
                last_login_at: body.user.last_login_at || null,
                created_at: body.user.created_at || null,
                no_hp: body.user.no_hp || body.user.no_telepon || null,
                avatar_url: body.user.avatar_url || body.user.foto_url || body.user.user_metadata?.avatar_url || null,
                biometric_enabled: Boolean(body.user.biometric_enabled),
              };
            }
          }
        } catch {}
        return null;
      }

      let { data: dbUser } = await supabase
        .from('users')
        .select('*, pendeta:m_pendeta!users_id_pendeta_fkey(nama_lengkap, foto_url, no_wa)')
        .eq('id', targetId)
        .maybeSingle();

      const { data: authData } = await supabase.auth.getUser();

      if (!dbUser && authData?.user?.email) {
        const { data: dbUserByEmail } = await supabase
          .from('users')
          .select('*, pendeta:m_pendeta!users_id_pendeta_fkey(nama_lengkap, foto_url, no_wa)')
          .eq('email', authData.user.email)
          .maybeSingle();
        dbUser = dbUserByEmail;
      }

      if (!dbUser) {
        if (authData?.user) {
          const u = authData.user;
          const meta = u.user_metadata || {};
          return {
            id: u.id,
            email: u.email || '',
            nama_lengkap: meta.nama_lengkap || meta.full_name || u.email || 'Pengguna',
            role: meta.role || u.role || 'pelayan',
            id_mupel: meta.id_mupel || null,
            id_induk: meta.id_induk || null,
            id_pos: meta.id_pos || null,
            id_pendeta: meta.id_pendeta || null,
            status: 'Active',
            created_at: u.created_at || null,
            no_hp: meta.no_hp || null,
            avatar_url: meta.avatar_url || meta.picture || null,
            biometric_enabled: false,
          };
        }
        return null;
      }

      let userRole = dbUser.role || 'pelayan';
      if (
        userRole === 'kmj' &&
        (dbUser.email?.toLowerCase().includes('benbianco') ||
          dbUser.email?.toLowerCase().includes('stolaputih') ||
          dbUser.nama_lengkap?.toLowerCase().includes('ben bianco'))
      ) {
        userRole = 'pj';
      }

      const pendetaObj = (dbUser as any).pendeta;
      const resolvedNamaLengkap = pendetaObj?.nama_lengkap || dbUser.nama_lengkap || dbUser.email;

      return {
        id: dbUser.id,
        email: dbUser.email,
        nama_lengkap: resolvedNamaLengkap,
        role: userRole,
        id_mupel: dbUser.id_mupel || null,
        id_induk: dbUser.id_induk || null,
        id_pos: dbUser.id_pos || null,
        id_pendeta: dbUser.id_pendeta || null,
        status: dbUser.status || 'Active',
        last_login_at: dbUser.last_login_at || null,
        created_at: dbUser.created_at || null,
        no_hp: dbUser.no_hp || dbUser.no_telepon || null,
        avatar_url: dbUser.avatar_url || dbUser.foto_url || pendetaObj?.foto_url || null,
        foto_url: dbUser.foto_url || dbUser.avatar_url || pendetaObj?.foto_url || null,
        biometric_enabled: Boolean(dbUser.biometric_enabled),
      };
    },
    staleTime: 0,
  });
}

/**
 * 2. Fetch Profile Pelayanan (data pendeta) if idPendeta exists
 */
export function useProfilePelayanan(idPendeta?: string | null) {
  const supabase = createClient();

  return useQuery<ProfilePelayanan | null>({
    queryKey: ['profile-pelayanan', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return null;

      let pendetaRow: any = null;

      const { data, error } = await supabase
        .from('m_pendeta')
        .select(`
          *,
          jemaat_induk:m_jemaat_induk(
            id_induk,
            nama_induk,
            id_mupel,
            mupel:m_mupel(id_mupel, nama_mupel)
          )
        `)
        .eq('id_pendeta', idPendeta)
        .maybeSingle();

      if (!error && data) {
        pendetaRow = data;
      } else {
        const { data: rawData } = await supabase
          .from('m_pendeta')
          .select('*')
          .eq('id_pendeta', idPendeta)
          .maybeSingle();
        pendetaRow = rawData;
      }

      if (!pendetaRow) return null;

      const jemaatObj = pendetaRow.jemaat_induk as any;
      const mupelObj = jemaatObj?.mupel as any;

      let jemaatNama = jemaatObj?.nama_induk || null;
      let mupelNama = mupelObj?.nama_mupel || null;

      // Fallback query for jemaat and mupel if missing
      if (!jemaatNama && pendetaRow.id_induk) {
        const { data: jData } = await supabase
          .from('m_jemaat_induk')
          .select('nama_induk, id_mupel, mupel:m_mupel(nama_mupel)')
          .eq('id_induk', pendetaRow.id_induk)
          .maybeSingle();
        if (jData) {
          jemaatNama = jData.nama_induk;
          mupelNama = (jData.mupel as any)?.nama_mupel || null;
        }
      }

      const isBenBianco =
        pendetaRow.email?.toLowerCase().includes('benbianco') ||
        pendetaRow.email?.toLowerCase().includes('stolaputih') ||
        pendetaRow.nama_lengkap?.toLowerCase().includes('ben bianco') ||
        pendetaRow.nama_pendeta?.toLowerCase().includes('ben bianco');

      const isKmjFinal = isBenBianco ? false : Boolean(pendetaRow.is_kmj);
      const isPjFinal = isBenBianco ? true : Boolean(pendetaRow.is_pj);

      return {
        id_pendeta: pendetaRow.id_pendeta,
        nama_pendeta: pendetaRow.nama_lengkap || pendetaRow.nama_pendeta || 'Pendeta GPIB',
        gelar_depan: pendetaRow.gelar_depan || null,
        gelar_belakang: pendetaRow.gelar_belakang || null,
        foto_url: pendetaRow.foto_url || null,
        nip: pendetaRow.nip || null,
        nik: pendetaRow.nik || null,
        tempat_lahir: pendetaRow.tempat_lahir || null,
        tgl_lahir: pendetaRow.tgl_lahir || null,
        jenis_kelamin: pendetaRow.jenis_kelamin || pendetaRow.gender || null,
        no_telepon: pendetaRow.no_telepon || pendetaRow.no_wa || null,
        email: pendetaRow.email || null,
        tgl_tugas_awal: pendetaRow.tgl_tugas_awal || pendetaRow.tgl_tugas || null,
        jenis_pendeta: pendetaRow.jenis_pendeta || 'Organik',
        status_aktif: Boolean(pendetaRow.status_aktif ?? true),
        id_induk: pendetaRow.id_induk || null,
        is_kmj: isKmjFinal,
        is_pj: isPjFinal,
        jemaat_induk_nama: jemaatNama,
        mupel_nama: mupelNama,
      };
    },
    staleTime: 0,
  });
}

/**
 * 3. Fetch Profile Stats via RPC get_profile_stats
 */
export function useProfileStats(idPendeta?: string | null) {
  const supabase = createClient();

  return useQuery<ProfileStats>({
    queryKey: ['profile-stats', idPendeta || 'none'],
    queryFn: async () => {
      if (!idPendeta) {
        return {
          total_log: 0,
          total_jiwa: 0,
          pos_aktif: 0,
          log_bulan_ini: 0,
          lama_melayani_bulan: 0,
        };
      }

      // Try RPC call get_profile_stats
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_profile_stats', {
        p_id_pendeta: idPendeta,
      });

      if (!rpcError && rpcData) {
        return {
          total_log: Number(rpcData.total_log || 0),
          total_jiwa: Number(rpcData.total_jiwa || 0),
          pos_aktif: Number(rpcData.pos_aktif || 0),
          log_bulan_ini: Number(rpcData.log_bulan_ini || 0),
          lama_melayani_bulan: Number(rpcData.lama_melayani_bulan || 0),
        };
      }

      // Manual query fallback if RPC is missing
      let totalLog = 0;
      let totalJiwa = 0;
      let logBulanIni = 0;

      const { data: logs } = await supabase
        .from('t_log_pastoral')
        .select('jumlah_jiwa, tgl_kegiatan')
        .eq('id_pendeta', idPendeta);

      if (logs) {
        totalLog = logs.length;
        const currentMonth = new Date().toISOString().slice(0, 7);
        logs.forEach((l) => {
          totalJiwa += Number(l.jumlah_jiwa || 0);
          if (l.tgl_kegiatan && l.tgl_kegiatan.startsWith(currentMonth)) {
            logBulanIni += 1;
          }
        });
      }

      const { count: posCount } = await supabase
        .from('t_penugasan_pj')
        .select('*', { count: 'exact', head: true })
        .eq('id_pendeta', idPendeta);

      return {
        total_log: totalLog,
        total_jiwa: totalJiwa,
        pos_aktif: posCount || 0,
        log_bulan_ini: logBulanIni,
        lama_melayani_bulan: 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 4. Fetch Riwayat Mutasi Pendeta
 */
export function useRiwayatMutasi(idPendeta?: string | null) {
  return useQuery<RiwayatMutasiItem[]>({
    queryKey: ['profile-mutasi', idPendeta || 'me'],
    enabled: true,
    queryFn: async () => {
      let targetPendetaId = idPendeta || null;
      if (!targetPendetaId) {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const body = await res.json();
            targetPendetaId = body?.user?.id_pendeta || null;
          }
        } catch {}
      }

      const data = await getRiwayatMutasiAction(targetPendetaId || undefined);

      return (data || []).map((m: any) => ({
        id_mutasi: m.id_mutasi || m.id_riwayat || String(m.id || ''),
        id_pendeta: m.id_pendeta,
        tgl_mutasi: m.tgl_mutasi || m.created_at || new Date().toISOString().split('T')[0],
        jenis_mutasi: m.jenis_mutasi || 'Mutasi Penugasan',
        id_induk_lama: m.id_induk_lama || null,
        id_induk_baru: m.id_induk_baru || null,
        nama_induk_lama: (m.jemaat_lama as any)?.nama_induk || m.nama_induk_lama || m.id_induk_lama || null,
        nama_induk_baru: (m.jemaat_baru as any)?.nama_induk || m.nama_induk_baru || m.id_induk_baru || null,
        alasan: m.alasan || null,
        catatan: m.catatan || null,
      }));
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * 5. Fetch Penugasan PJ Pos Pelkes Aktif
 */
export function usePenugasanPj(idPendeta?: string | null) {
  const supabase = createClient();

  return useQuery<PenugasanPjItem[]>({
    queryKey: ['profile-penugasan-pj', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];

      let rawData: any[] = [];
      const { data, error } = await supabase
        .from('t_penugasan_pendeta')
        .select(`
          id_tugas,
          id_pendeta,
          id_pos,
          tgl_mulai,
          tgl_selesai,
          status_tugas,
          pos:m_pos_pelkes(nama_pos, id_induk)
        `)
        .eq('id_pendeta', idPendeta);

      if (!error && data) {
        rawData = data;
      } else {
        const { data: altData } = await supabase
          .from('t_pj_jemaat')
          .select('*, pos:m_pos_pelkes(nama_pos, id_induk)')
          .eq('id_pendeta', idPendeta);
        if (altData) rawData = altData;
      }

      return rawData.map((p: any) => ({
        id_penugasan: p.id_tugas || p.id_penugasan || String(p.id || ''),
        id_pendeta: p.id_pendeta,
        id_pos: p.id_pos,
        nama_pos: (p.pos as any)?.nama_pos || null,
        id_induk: (p.pos as any)?.id_induk || null,
        tgl_mulai: p.tgl_mulai || p.tanggal_mulai || null,
        tgl_selesai: p.tgl_selesai || p.tanggal_selesai || null,
        status_aktif: p.status_tugas === 'Aktif' || p.status === 'Aktif' || true,
      }));
    },
    staleTime: 0,
  });
}

/**
 * 5.b Fetch Hierarki Names & IDs directly for account & routing fallback
 */
export function useHierarkiInfo(idMupel?: string | null, idInduk?: string | null, idPos?: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['hierarki-info', idMupel, idInduk, idPos],
    queryFn: async () => {
      let mupelNama: string | null = null;
      let jemaatNama: string | null = null;
      let posNama: string | null = null;
      let resolvedIdMupel: string | null = idMupel || null;
      let resolvedIdInduk: string | null = idInduk || null;
      let resolvedIdPos: string | null = idPos || null;
      let posList: { id_pos: string; nama_pos: string; kategori?: string | null }[] = [];

      if (idPos) {
        const { data: posData } = await supabase
          .from('m_pos_pelkes')
          .select('id_pos, nama_pos, kategori, id_induk, jemaat_induk:m_jemaat_induk(id_induk, nama_induk, id_mupel, mupel:m_mupel(id_mupel, nama_mupel))')
          .eq('id_pos', idPos)
          .maybeSingle();

        if (posData) {
          posNama = posData.nama_pos || null;
          if (!resolvedIdInduk && posData.id_induk) resolvedIdInduk = posData.id_induk;
          const jObj = posData.jemaat_induk as any;
          if (jObj) {
            if (!jemaatNama && jObj.nama_induk) jemaatNama = jObj.nama_induk;
            if (!resolvedIdMupel && jObj.id_mupel) resolvedIdMupel = jObj.id_mupel;
            if (!mupelNama && jObj.mupel?.nama_mupel) mupelNama = jObj.mupel.nama_mupel;
          }
        }
      }

      if (resolvedIdInduk) {
        const { data: jData } = await supabase
          .from('m_jemaat_induk')
          .select('id_induk, nama_induk, id_mupel, mupel:m_mupel(id_mupel, nama_mupel)')
          .eq('id_induk', resolvedIdInduk)
          .maybeSingle();

        if (jData) {
          if (!jemaatNama) jemaatNama = jData.nama_induk || null;
          if (!resolvedIdMupel && jData.id_mupel) resolvedIdMupel = jData.id_mupel;
          if (!mupelNama && (jData.mupel as any)?.nama_mupel) {
            mupelNama = (jData.mupel as any).nama_mupel;
          }
        }

        const { data: posRows } = await supabase
          .from('m_pos_pelkes')
          .select('id_pos, nama_pos, kategori')
          .eq('id_induk', resolvedIdInduk)
          .order('nama_pos', { ascending: true });

        if (posRows && posRows.length > 0) {
          posList = posRows;
        }
      }

      if (resolvedIdMupel && !mupelNama) {
        const { data: mData } = await supabase
          .from('m_mupel')
          .select('nama_mupel')
          .eq('id_mupel', resolvedIdMupel)
          .maybeSingle();
        mupelNama = mData?.nama_mupel || null;
      }

      return {
        mupelNama,
        jemaatNama,
        posNama,
        resolvedIdMupel,
        resolvedIdInduk,
        resolvedIdPos,
        posList,
      };
    },
    enabled: Boolean(idMupel || idInduk || idPos),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 6. Fetch 8 Log Pastoral Ringkas
 */
export function useLogPastoralRingkas(idPendeta?: string | null) {
  return useQuery<LogPastoralRingkasItem[]>({
    queryKey: ['profile-log-pastoral-ringkas', idPendeta || 'me'],
    enabled: true,
    queryFn: async () => {
      const allLogs = await getLogPastoralListAction();

      let userAuth: any = null;
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const body = await res.json();
          userAuth = body?.user;
        }
      } catch {}

      const targetPendetaId = idPendeta || userAuth?.id_pendeta;

      let filtered = allLogs;
      if (targetPendetaId) {
        filtered = allLogs.filter((l: any) => l.id_pendeta === targetPendetaId);
      }

      if (filtered.length === 0 && userAuth) {
        filtered = allLogs.filter((l: any) => {
          if (userAuth.id_pos && l.id_pos === userAuth.id_pos) return true;
          if (userAuth.id_induk && l.pos?.jemaat_induk?.id_induk === userAuth.id_induk) return true;
          if (
            userAuth.id_mupel &&
            (l.pos?.jemaat_induk?.id_mupel === userAuth.id_mupel ||
              l.pos?.jemaat_induk?.mupel?.id_mupel === userAuth.id_mupel)
          ) {
            return true;
          }
          return false;
        });
      }

      if (filtered.length === 0 && !targetPendetaId && !userAuth?.id_induk && !userAuth?.id_pos) {
        filtered = allLogs;
      }

      return filtered.slice(0, 8).map((l: any) => ({
        id_log: l.id_log,
        id_pendeta: l.id_pendeta,
        id_pos: l.id_pos || null,
        nama_pos: l.pos?.nama_pos || (l.pos?.jemaat_induk?.nama_induk ? `Jemaat ${l.pos.jemaat_induk.nama_induk}` : null),
        kegiatan: l.kegiatan || 'Pelayanan Pastoral',
        tgl_kegiatan: l.tgl || new Date().toISOString().split('T')[0],
        jumlah_jiwa: Number(l.jml_jiwa || 0),
        catatan: l.catatan || null,
      }));
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * 7. Fetch Aktivitas User (Audit Log)
 */
export function useAktivitasUser(userId?: string) {
  const supabase = createClient();

  return useQuery<AktivitasUserItem[]>({
    queryKey: ['profile-aktivitas', userId || 'me'],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('t_log_aktivitas')
        .select('*')
        .eq('id_user', userId)
        .order('waktu', { ascending: false })
        .limit(30);

      if (error) {
        console.warn('Error fetching t_log_aktivitas:', error);
        return [];
      }

      if (!data) return [];

      return data.map((a: any) => ({
        id: a.id_log || a.id || `log-${Math.random()}`,
        user_id: a.id_user || a.user_id,
        aksi: a.aksi || a.action || 'LOG',
        fitur: a.objek_type || a.fitur || a.feature || null,
        detail: a.keterangan || a.detail || a.description || null,
        created_at: a.waktu || new Date().toISOString(),
        ip_address: a.ip_address || null,
      }));
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * 8. Fetch Device Biometric (Passkey credentials)
 */
export function useDeviceBiometric(userId?: string) {
  const supabase = createClient();

  return useQuery<DeviceBiometricItem[]>({
    queryKey: ['profile-biometric-devices', userId || 'me'],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];

      let { data, error } = await supabase
        .from('m_webauthn_credentials')
        .select('*')
        .eq('id_user', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        const fallback = await supabase
          .from('m_webauthn_credentials')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!fallback.error && fallback.data) {
          data = fallback.data;
        }
      }

      if (!data) return [];

      return data.map((d: any) => ({
        id: d.id,
        user_id: d.id_user || d.user_id,
        credential_id: d.credential_id,
        device_type: d.device_type || 'Platform Credential',
        created_at: d.created_at,
        last_used_at: d.last_used_at || null,
        friendly_name: d.friendly_name || d.display_name || d.device_name || 'Perangkat Biometrik',
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 9. Fetch Draft User from Local Storage / DB
 */
export function useDraftUser(userId?: string) {
  return useQuery<DraftUserItem[]>({
    queryKey: ['profile-drafts', userId || 'me'],
    queryFn: async () => {
      const result: DraftUserItem[] = [];
      if (typeof window === 'undefined') return result;

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('si_gpib_draft_') || key.startsWith('draft_'))) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                result.push({
                  id: key,
                  form_type: parsed.form_type || key.replace('si_gpib_draft_', '').replace('draft_', ''),
                  key_name: key,
                  updated_at: parsed.updated_at || new Date().toISOString(),
                  data_preview: parsed.preview || JSON.stringify(parsed.data || parsed).slice(0, 100),
                });
              } catch {}
            }
          }
        }
      } catch {}

      return result.sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1));
    },
    staleTime: 1000 * 10,
  });
}

/**
 * 10. Mutation: Revoke Device Biometric
 */
export function useRevokeDeviceBiometric() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (credentialId: string) => {
      const { error } = await supabase
        .from('m_webauthn_credentials')
        .delete()
        .eq('id', credentialId);

      if (error) {
        throw new Error(error.message || 'Gagal menghapus perangkat biometrik');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-biometric-devices'] });
      queryClient.invalidateQueries({ queryKey: ['profile-akun'] });
    },
  });
}

/**
 * 11. Mutation: Delete Draft User
 */
export function useDeleteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyName: string) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(keyName);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-drafts'] });
    },
  });
}
