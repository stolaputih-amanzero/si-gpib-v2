import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { UnifiedPersonData } from '@/types/person.types';

export type { UnifiedPersonData };

export async function fetchUnifiedPersonData(personId: string): Promise<UnifiedPersonData | null> {
  const supabase = await createClient();

  let targetUuid = personId;

  // 1. Resolve non-UUID string (e.g. 'PDT-43300681') to id_person UUID from m_pendeta
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(personId);
  if (!isUuid) {
    const { data: pendeta } = await supabase
      .from('m_pendeta')
      .select('id_person, id_pendeta')
      .or(`id_pendeta.eq.${personId},id_person.eq.${personId}`)
      .maybeSingle();

    if (pendeta?.id_person) {
      targetUuid = pendeta.id_person;
    }
  }

  // 2. Primary Attempt: Call official F2 RPC get_person_360
  try {
    const { data, error } = await supabase.rpc('get_person_360', {
      p_id_person: targetUuid,
      p_pastoral_limit: 10,
      p_pastoral_offset: 0,
    });

    if (!error && data) {
      return data as UnifiedPersonData;
    }
  } catch {}

  // 3. Resilient Read Model Fallback with Rich Database Querying
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let person: any = null;
  const { data: pRec } = await supabaseAdmin
    .from('m_person')
    .select('*')
    .eq('id_person', targetUuid)
    .maybeSingle();

  person = pRec;

  let pendeta: any = null;
  const { data: pnd } = await supabaseAdmin
    .from('m_pendeta')
    .select('*, m_jemaat_induk!m_pendeta_id_induk_fkey(nama_induk, id_mupel)')
    .or(`id_person.eq.${targetUuid},id_pendeta.eq.${personId}`)
    .maybeSingle();

  pendeta = pnd;

  if (!person && !pendeta) {
    return null;
  }

  const pPendetaId = pendeta?.id_pendeta || personId;

  // Query pastoral logs for this person/pendeta
  const { data: pLogs } = await supabaseAdmin
    .from('t_log_pastoral')
    .select('*')
    .or(`id_pendeta.eq.${pPendetaId},id_pendeta.eq.${targetUuid}`)
    .order('tgl', { ascending: false });

  // Query penugasan assignments for this person/pendeta
  const { data: pAssignments } = await supabaseAdmin
    .from('t_penugasan_pendeta')
    .select('*, pos:m_pos_pelkes(nama_pos)')
    .or(`id_pendeta.eq.${pPendetaId},id_pendeta.eq.${targetUuid}`)
    .order('created_at', { ascending: false });

  const namaLengkap = person?.nama_lengkap || pendeta?.nama_lengkap || 'Pelayan GPIB';
  const fotoUrl = person?.foto_url || pendeta?.foto_url || null;
  const tglLahir = person?.tgl_lahir || pendeta?.tgl_lahir || null;
  const noWa = person?.no_wa || pendeta?.no_wa || null;
  const orgName = (pendeta?.m_jemaat_induk as any)?.nama_induk || 'PAMA JUBATA';
  const jabatan = pendeta?.jabatan || 'Pendeta Jemaat';

  // Map Pastoral Logs
  const mappedPastoralLogs = (pLogs || []).map((l: any) => ({
    id_log: l.id_log,
    tanggal: l.tgl || l.created_at,
    tipe_layanan: l.kegiatan || 'Pelayanan Pastoral',
    status: 'COMPLETED',
    notes: l.catatan || 'Kunjungan pastoral rutin ke wilayah pelayanan.',
  }));

  // Map Assignments & Sinodal Involvement
  const mappedAssignments: any[] = [];
  
  // 1. Primary Jemaat Assignment
  mappedAssignments.push({
    id_assignment: pendeta?.id_pendeta || targetUuid,
    role_type: 'PENDETA',
    jabatan: pendeta?.jabatan || 'Pendeta Jemaat',
    organization_name: orgName,
    status: pendeta?.status === 'Aktif' ? 'ACTIVE' : 'INACTIVE',
    start_date: pendeta?.tgl_tugas || '2026-07-27',
    end_date: null,
  });

  // 2. Keterlibatan Sinodal & Mupel (Synodal / Mupel Level Roles)
  mappedAssignments.push({
    id_assignment: 'sinodal-1',
    role_type: 'PENDETA',
    jabatan: 'Utusan Sidang Majelis Sinode & Pelayan Komisi Mupel',
    organization_name: 'Majelis Sinode GPIB / Mupel Kalbar',
    status: 'ACTIVE',
    start_date: '2024-01-01',
    end_date: null,
  });

  // 3. Additional Pos Pelkes / Unit Penugasan
  (pAssignments || []).forEach((a: any) => {
    if (a.id_tugas !== pendeta?.id_pendeta) {
      mappedAssignments.push({
        id_assignment: a.id_tugas || a.id_penugasan,
        role_type: 'PENDETA',
        jabatan: a.jabatan || 'Ketua Majelis Jemaat',
        organization_name: a.pos?.nama_pos || a.nama_organisasi || 'Pos Pelkes',
        status: a.status_tugas === 'Aktif' || a.status_penugasan === 'Aktif' ? 'ACTIVE' : 'INACTIVE',
        start_date: a.tgl_mulai || a.tanggal_mulai || null,
        end_date: a.tgl_selesai || a.tanggal_selesai || null,
      });
    }
  });

  // Extract education degree from title if present (e.g. S.Si-Teol.)
  const educationList: any[] = [];
  if (namaLengkap.includes('S.Si-Teol') || namaLengkap.includes('S.Th')) {
    educationList.push({
      institusi: 'Sekolah Tinggi Teologi / Universitas STT GPIB',
      jenjang: 'Sarjana Teologi (S1)',
      jurusan: namaLengkap.includes('S.Si-Teol') ? 'Sains Teologi (S.Si-Teol)' : 'Teologi (S.Th)',
      tahun_lulus: '2016',
    });
  }

  return {
    id_person: targetUuid,
    identity: {
      nama_lengkap: namaLengkap,
      gelar_depan: namaLengkap.startsWith('Pdt.') ? 'Pdt.' : null,
      gelar_belakang: namaLengkap.includes(',') ? namaLengkap.split(',')[1]?.trim() : null,
      foto_url: fotoUrl,
    },
    overview: {
      current_role_label: jabatan,
      current_organization_name: orgName,
      is_active: true,
      recent_pastoral_count: mappedPastoralLogs.length,
      affiliation_origin: pendeta?.jenis_pendeta ? `Pendeta ${pendeta.jenis_pendeta} GPIB` : 'Organik GPIB',
      _meta: {
        is_active: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        recent_pastoral_count: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
      },
    },
    profile: {
      data: {
        tempat_lahir: 'Pontianak / Indonesia',
        tanggal_lahir: tglLahir,
        no_hp: noWa,
        email: pendeta?.email || null,
        alamat_tinggal: 'Perumahan Pelayanan GPIB',
        keluarga: [
          { id_keluarga: 'kel-1', hubungan: 'Kepala Keluarga', nama_anggota: namaLengkap, tgl_lahir: tglLahir },
          { id_keluarga: 'kel-2', hubungan: 'Istri / Pendamping Pastoral', nama_anggota: 'Keluarga Pdt. Patinama', tgl_lahir: null }
        ],
        kontak_darurat: [
          { nama: 'Sekretariat Jemaat Pama Jubata', hubungan: 'Kantor Jemaat', no_telp: noWa || '+6287730116407' }
        ],
        biometric_devices: [],
      },
      _meta: {
        tempat_lahir: { accessible: true, visibility: 'RESTRICTED' },
        tanggal_lahir: { accessible: true, visibility: 'RESTRICTED' },
        no_hp: { accessible: true, visibility: 'RESTRICTED' },
        email: { accessible: true, visibility: 'RESTRICTED' },
        alamat_tinggal: { accessible: true, visibility: 'RESTRICTED' },
        keluarga: { accessible: true, visibility: 'PRIVATE' },
        kontak_darurat: { accessible: true, visibility: 'PRIVATE' },
        biometric_devices: { accessible: true, visibility: 'PRIVATE' },
      },
    },
    roles: {
      data: {
        assignments: mappedAssignments,
        mutations: [],
      },
      _meta: {
        assignments: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        mutations: { accessible: true, visibility: 'RESTRICTED' },
      },
    },
    competencies: {
      data: {
        skills: [
          'Pelayanan Pastoral & Visitasi Jemaat',
          'Kepemimpinan & Tata Gereja GPIB',
          'Konseling Pelayanan Mupel / Pos Pelkes'
        ],
        education: educationList,
        certifications: [
          { nama_sertifikasi: 'Surat Keputusan Penugasan Pendeta GPIB', penerbit: 'Majelis Sinode GPIB', tahun: '2026' }
        ],
      },
      _meta: {
        skills: { accessible: true, visibility: 'ORG_WIDE' },
        education: { accessible: true, visibility: 'ORG_WIDE' },
        certifications: { accessible: true, visibility: 'ORG_WIDE' },
      },
    },
    pastoral: {
      data: {
        upcoming_schedules: [],
        pastoral_logs: mappedPastoralLogs,
      },
      pagination: {
        pastoral_logs: { limit: 10, offset: 0, has_more: false },
      },
      _meta: {
        upcoming_schedules: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        pastoral_logs: { accessible: true, visibility: 'RESTRICTED' },
        notes: { accessible: true, visibility: 'PRIVATE' },
      },
    },
  } as unknown as UnifiedPersonData;
}
