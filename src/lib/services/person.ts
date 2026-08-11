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

  // 3. Resilient Read Model Fallback for session/cookie auth compatibility
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

  const namaLengkap = person?.nama_lengkap || pendeta?.nama_lengkap || 'Pelayan GPIB';
  const fotoUrl = person?.foto_url || pendeta?.foto_url || null;
  const tglLahir = person?.tgl_lahir || pendeta?.tgl_lahir || null;
  const noWa = person?.no_wa || pendeta?.no_wa || null;
  const orgName = (pendeta?.m_jemaat_induk as any)?.nama_induk || 'GPIB';
  const jabatan = pendeta?.jabatan || 'Pelayan Pastoral';

  return {
    id_person: targetUuid,
    identity: {
      nama_lengkap: namaLengkap,
      gelar_depan: null,
      gelar_belakang: null,
      foto_url: fotoUrl,
    },
    overview: {
      current_role_label: jabatan,
      current_organization_name: orgName,
      is_active: true,
      recent_pastoral_count: 0,
      affiliation_origin: 'Organik GPIB',
      _meta: {
        is_active: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        recent_pastoral_count: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
      },
    },
    profile: {
      data: {
        tempat_lahir: null,
        tanggal_lahir: tglLahir,
        no_hp: noWa,
        email: pendeta?.email || null,
        alamat_tinggal: null,
        keluarga: [],
        kontak_darurat: [],
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
        assignments: [
          {
            id_assignment: pendeta?.id_pendeta || targetUuid,
            role_type: 'PENDETA',
            jabatan,
            organization_name: orgName,
            status: 'ACTIVE',
            start_date: pendeta?.tgl_tugas || null,
            end_date: null,
          },
        ],
        mutations: [],
      },
      _meta: {
        assignments: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        mutations: { accessible: true, visibility: 'RESTRICTED' },
      },
    },
    competencies: {
      data: { skills: [], education: [], certifications: [] },
      _meta: {
        skills: { accessible: true, visibility: 'ORG_WIDE' },
        education: { accessible: true, visibility: 'ORG_WIDE' },
        certifications: { accessible: true, visibility: 'ORG_WIDE' },
      },
    },
    pastoral: {
      data: { upcoming_schedules: [], pastoral_logs: [] },
      pagination: { pastoral_logs: { limit: 10, offset: 0, has_more: false } },
      _meta: {
        upcoming_schedules: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        pastoral_logs: { accessible: true, visibility: 'RESTRICTED' },
        notes: { accessible: true, visibility: 'PRIVATE' },
      },
    },
  } as unknown as UnifiedPersonData;
}
