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
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      const { data: authData } = await supabase.auth.getUser();

      if (!dbUser && authData?.user?.email) {
        const { data: dbUserByEmail } = await supabase
          .from('users')
          .select('*')
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

      return {
        id: dbUser.id,
        email: dbUser.email,
        nama_lengkap: dbUser.nama_lengkap || dbUser.email,
        role: userRole,
        id_mupel: dbUser.id_mupel || null,
        id_induk: dbUser.id_induk || null,
        id_pos: dbUser.id_pos || null,
        id_pendeta: dbUser.id_pendeta || null,
        status: dbUser.status || 'Active',
        last_login_at: dbUser.last_login_at || null,
        created_at: dbUser.created_at || null,
        no_hp: dbUser.no_hp || dbUser.no_telepon || null,
        avatar_url: dbUser.avatar_url || dbUser.foto_url || null,
        foto_url: dbUser.foto_url || dbUser.avatar_url || null,
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
  const supabase = createClient();

  return useQuery<RiwayatMutasiItem[]>({
    queryKey: ['profile-mutasi', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];

      const { data, error } = await supabase
        .from('t_riwayat_mutasi_pendeta')
        .select(`
          id_mutasi,
          id_pendeta,
          tgl_mutasi,
          jenis_mutasi,
          id_induk_lama,
          id_induk_baru,
          alasan,
          catatan,
          jemaat_lama:m_jemaat_induk!t_riwayat_mutasi_pendeta_id_induk_lama_fkey(nama_induk),
          jemaat_baru:m_jemaat_induk!t_riwayat_mutasi_pendeta_id_induk_baru_fkey(nama_induk)
        `)
        .eq('id_pendeta', idPendeta)
        .order('tgl_mutasi', { ascending: false });

      if (error || !data) {
        // Fallback without strict foreign key aliases
        const { data: rawData } = await supabase
          .from('t_riwayat_mutasi_pendeta')
          .select('*')
          .eq('id_pendeta', idPendeta)
          .order('tgl_mutasi', { ascending: false });

        return (rawData || []).map((m: any) => ({
          id_mutasi: m.id_mutasi || m.id,
          id_pendeta: m.id_pendeta,
          tgl_mutasi: m.tgl_mutasi || m.created_at,
          jenis_mutasi: m.jenis_mutasi || 'Mutasi Penugasan',
          id_induk_lama: m.id_induk_lama || null,
          id_induk_baru: m.id_induk_baru || null,
          nama_induk_lama: m.nama_induk_lama || null,
          nama_induk_baru: m.nama_induk_baru || null,
          alasan: m.alasan || null,
          catatan: m.catatan || null,
        }));
      }

      return data.map((m: any) => ({
        id_mutasi: m.id_mutasi,
        id_pendeta: m.id_pendeta,
        tgl_mutasi: m.tgl_mutasi,
        jenis_mutasi: m.jenis_mutasi || 'Mutasi Penugasan',
        id_induk_lama: m.id_induk_lama || null,
        id_induk_baru: m.id_induk_baru || null,
        nama_induk_lama: (m.jemaat_lama as any)?.nama_induk || null,
        nama_induk_baru: (m.jemaat_baru as any)?.nama_induk || null,
        alasan: m.alasan || null,
        catatan: m.catatan || null,
      }));
    },
    staleTime: 1000 * 60 * 5,
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
 * 5.b Fetch Hierarki Names directly for account fallback
 */
export function useHierarkiInfo(idMupel?: string | null, idInduk?: string | null, idPos?: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['hierarki-info', idMupel, idInduk, idPos],
    queryFn: async () => {
      let mupelNama: string | null = null;
      let jemaatNama: string | null = null;
      let posNama: string | null = null;

      if (idMupel) {
        const { data } = await supabase.from('m_mupel').select('nama_mupel').eq('id_mupel', idMupel).maybeSingle();
        mupelNama = data?.nama_mupel || null;
      }

      if (idInduk) {
        const { data } = await supabase
          .from('m_jemaat_induk')
          .select('nama_induk, id_mupel, mupel:m_mupel(nama_mupel)')
          .eq('id_induk', idInduk)
          .maybeSingle();
        if (data) {
          jemaatNama = data.nama_induk || null;
          if (!mupelNama && (data.mupel as any)?.nama_mupel) {
            mupelNama = (data.mupel as any).nama_mupel;
          }
        }
      }

      if (idPos) {
        const { data } = await supabase.from('m_pos_pelkes').select('nama_pos').eq('id_pos', idPos).maybeSingle();
        posNama = data?.nama_pos || null;
      }

      return { mupelNama, jemaatNama, posNama };
    },
    enabled: Boolean(idMupel || idInduk || idPos),
    staleTime: 0,
  });
}

/**
 * 6. Fetch 8 Log Pastoral Ringkas
 */
export function useLogPastoralRingkas(idPendeta?: string | null) {
  const supabase = createClient();

  return useQuery<LogPastoralRingkasItem[]>({
    queryKey: ['profile-log-pastoral-ringkas', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];

      const { data, error } = await supabase
        .from('t_log_pastoral')
        .select(`
          id_log,
          id_pendeta,
          id_pos,
          kegiatan,
          tgl_kegiatan,
          jumlah_jiwa,
          catatan,
          pos:m_pos_pelkes(nama_pos)
        `)
        .eq('id_pendeta', idPendeta)
        .order('tgl_kegiatan', { ascending: false })
        .limit(8);

      if (error || !data) return [];

      return data.map((l: any) => ({
        id_log: l.id_log,
        id_pendeta: l.id_pendeta,
        id_pos: l.id_pos || null,
        nama_pos: (l.pos as any)?.nama_pos || null,
        kegiatan: l.kegiatan || 'Pelayanan Pastoral',
        tgl_kegiatan: l.tgl_kegiatan,
        jumlah_jiwa: Number(l.jumlah_jiwa || 0),
        catatan: l.catatan || null,
      }));
    },
    staleTime: 1000 * 60 * 5,
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

      let { data, error } = await supabase
        .from('t_log_aktivitas')
        .select('*')
        .eq('id_user', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        const fallback = await supabase
          .from('t_log_aktivitas')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        if (!fallback.error && fallback.data) {
          data = fallback.data;
        }
      }

      if (!data) return [];

      return data.map((a: any) => ({
        id: a.id,
        user_id: a.id_user || a.user_id,
        aksi: a.aksi || a.action || 'LOG',
        fitur: a.fitur || a.feature || null,
        detail: a.detail || a.description || a.keterangan || null,
        created_at: a.created_at,
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
