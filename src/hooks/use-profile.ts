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

      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (error || !dbUser) {
        // Fallback search by auth user
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user && authData.user.id === targetId) {
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

      return {
        id: dbUser.id,
        email: dbUser.email,
        nama_lengkap: dbUser.nama_lengkap || dbUser.email,
        role: dbUser.role || 'pelayan',
        id_mupel: dbUser.id_mupel || null,
        id_induk: dbUser.id_induk || null,
        id_pos: dbUser.id_pos || null,
        id_pendeta: dbUser.id_pendeta || null,
        status: dbUser.status || 'Active',
        last_login_at: dbUser.last_login_at || null,
        created_at: dbUser.created_at || null,
        no_hp: dbUser.no_hp || dbUser.no_telepon || null,
        avatar_url: dbUser.avatar_url || dbUser.foto_url || null,
        biometric_enabled: Boolean(dbUser.biometric_enabled),
      };
    },
    staleTime: 1000 * 60 * 5,
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

      const { data, error } = await supabase
        .from('m_pendeta')
        .select(`
          *,
          jemaat_induk:m_jemaat_induk(nama_induk),
          mupel:m_mupel(nama_mupel)
        `)
        .eq('id_pendeta', idPendeta)
        .maybeSingle();

      if (error || !data) return null;

      const jemaatObj = data.jemaat_induk as { nama_induk: string } | null;
      const mupelObj = data.mupel as { nama_mupel: string } | null;

      return {
        id_pendeta: data.id_pendeta,
        nama_pendeta: data.nama_pendeta || 'Pendeta GPIB',
        gelar_depan: data.gelar_depan || null,
        gelar_belakang: data.gelar_belakang || null,
        nip: data.nip || null,
        nik: data.nik || null,
        tempat_lahir: data.tempat_lahir || null,
        tgl_lahir: data.tgl_lahir || null,
        jenis_kelamin: data.jenis_kelamin || null,
        no_telepon: data.no_telepon || null,
        email: data.email || null,
        tgl_tugas_awal: data.tgl_tugas_awal || null,
        status_aktif: Boolean(data.status_aktif ?? true),
        id_induk: data.id_induk || null,
        is_kmj: Boolean(data.is_kmj),
        is_pj: Boolean(data.is_pj),
        jemaat_induk_nama: jemaatObj?.nama_induk || null,
        mupel_nama: mupelObj?.nama_mupel || null,
      };
    },
    staleTime: 1000 * 60 * 5,
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

      const { data, error } = await supabase
        .from('t_penugasan_pj')
        .select(`
          id_penugasan,
          id_pendeta,
          id_pos,
          tgl_mulai,
          tgl_selesai,
          status_aktif,
          pos:m_pos_pelkes(nama_pos, id_induk)
        `)
        .eq('id_pendeta', idPendeta)
        .order('tgl_mulai', { ascending: false });

      if (error || !data) return [];

      return data.map((p: any) => ({
        id_penugasan: p.id_penugasan,
        id_pendeta: p.id_pendeta,
        id_pos: p.id_pos,
        nama_pos: (p.pos as any)?.nama_pos || null,
        id_induk: (p.pos as any)?.id_induk || null,
        tgl_mulai: p.tgl_mulai || null,
        tgl_selesai: p.tgl_selesai || null,
        status_aktif: Boolean(p.status_aktif ?? true),
      }));
    },
    staleTime: 1000 * 60 * 5,
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
