import * as assert from 'assert';
import { adaptPersonToViewModel } from '../src/adapters/personViewModelAdapter';
import { UnifiedPersonData } from '../src/types/person.types';

console.log("🧪 Starting Unit Tests for personViewModelAdapter...\n");

// Mock Data 1: Self Access (Full Privileges)
const mockSelfData: UnifiedPersonData = {
  id_person: 'person-123',
  identity: {
    nama_lengkap: 'Pdt. Putra Sang Bayu',
    gelar_depan: null,
    gelar_belakang: 'S.Fil.',
    foto_url: null
  },
  overview: {
    current_role_label: 'Pendeta Jemaat',
    current_organization_name: 'GPIB Immanuel',
    is_active: true,
    recent_pastoral_count: 5,
    affiliation_origin: 'Organik GPIB',
    _meta: {
      is_active: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
      recent_pastoral_count: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' }
    }
  },
  profile: {
    data: {
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '1985-05-15',
      no_hp: '08123456789',
      email: 'putra@gpib.org',
      alamat_tinggal: 'Jl. Immanuel No. 10',
      keluarga: [{ id_keluarga: 'k1', nama_anggota: 'Istri', hubungan: 'Istri' }],
      kontak_darurat: null,
      biometric_devices: null
    },
    _meta: {
      tempat_lahir: { accessible: true, visibility: 'RESTRICTED' },
      tanggal_lahir: { accessible: true, visibility: 'RESTRICTED' },
      no_hp: { accessible: true, visibility: 'RESTRICTED' },
      email: { accessible: true, visibility: 'RESTRICTED' },
      alamat_tinggal: { accessible: true, visibility: 'RESTRICTED' },
      keluarga: { accessible: true, visibility: 'PRIVATE' },
      kontak_darurat: { accessible: true, visibility: 'PRIVATE' },
      biometric_devices: { accessible: true, visibility: 'PRIVATE' }
    }
  },
  roles: {
    data: {
      assignments: [{
        id_assignment: 'asg-1',
        role_type: 'PENDETA',
        jabatan: 'Pendeta Jemaat',
        organization_name: 'GPIB Immanuel',
        status: 'ACTIVE',
        start_date: '2020-01-01',
        end_date: null
      }],
      mutations: null
    },
    _meta: {
      assignments: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
      mutations: { accessible: true, visibility: 'RESTRICTED' }
    }
  },
  competencies: {
    data: { skills: ['Pastoral Counseling'], education: null, certifications: null },
    _meta: {
      skills: { accessible: true, visibility: 'ORG_WIDE' },
      education: { accessible: true, visibility: 'ORG_WIDE' },
      certifications: { accessible: true, visibility: 'ORG_WIDE' }
    }
  },
  pastoral: {
    data: {
      upcoming_schedules: [],
      pastoral_logs: [
        {
          id_log: 'log-1',
          tanggal: '2026-08-01',
          tipe_layanan: 'Perkunjungan',
          status: 'COMPLETED',
          notes: 'Rahasia Self Only',
          _meta: { notes: { accessible: true, visibility: 'PRIVATE' } }
        }
      ]
    },
    pagination: { pastoral_logs: { limit: 10, offset: 0, has_more: false } },
    _meta: {
      upcoming_schedules: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
      pastoral_logs: { accessible: true, visibility: 'RESTRICTED' }
    }
  }
};

// 1. Test Self Adaptation
console.log("Test 1: Self ViewModel Mapping");
const selfVm = adaptPersonToViewModel(mockSelfData);
assert.strictEqual(selfVm.header.identity.nama_lengkap, 'Pdt. Putra Sang Bayu');
assert.strictEqual(selfVm.profile.noHp.type, 'DATA');
if (selfVm.profile.noHp.type === 'DATA') {
  assert.strictEqual(selfVm.profile.noHp.value, '08123456789');
}
assert.strictEqual(selfVm.profile.kontakDarurat.type, 'EMPTY'); // Null data maps to EMPTY
assert.strictEqual(selfVm.pastoral.pastoralLogs.type, 'DATA');
if (selfVm.pastoral.pastoralLogs.type === 'DATA') {
  assert.strictEqual(selfVm.pastoral.pastoralLogs.value[0].notes.type, 'DATA');
}
console.log("   ✅ Passed: Self ViewModel correctly maps DATA and EMPTY states.");

// 2. Test Outside Context Adaptation
console.log("\nTest 2: Outside Context ViewModel Mapping (Masking Logic)");
const mockOutsideData: UnifiedPersonData = {
  ...mockSelfData,
  profile: {
    data: { ...mockSelfData.profile.data, no_hp: null, keluarga: null },
    _meta: {
      ...mockSelfData.profile._meta,
      no_hp: { accessible: false, visibility: 'RESTRICTED', reason: 'OUTSIDE_CONTEXT' },
      keluarga: { accessible: false, visibility: 'PRIVATE', reason: 'OUTSIDE_CONTEXT' }
    }
  },
  pastoral: {
    ...mockSelfData.pastoral,
    data: {
      ...mockSelfData.pastoral.data,
      pastoral_logs: [
        {
          id_log: 'log-1',
          tanggal: '2026-08-01',
          tipe_layanan: 'Perkunjungan',
          status: 'COMPLETED',
          notes: null,
          _meta: { notes: { accessible: false, visibility: 'PRIVATE', reason: 'SELF_ONLY' } }
        }
      ]
    }
  }
};

const outsideVm = adaptPersonToViewModel(mockOutsideData);
assert.strictEqual(outsideVm.profile.noHp.type, 'PRIVACY_MASKED');
if (outsideVm.profile.noHp.type === 'PRIVACY_MASKED') {
  assert.strictEqual(outsideVm.profile.noHp.reason, 'OUTSIDE_CONTEXT');
}
assert.strictEqual(outsideVm.profile.keluarga.type, 'PRIVACY_MASKED');

// Check Pastoral Notes Granularity (Log metadata visible, notes masked)
if (outsideVm.pastoral.pastoralLogs.type === 'DATA') {
  const logItem = outsideVm.pastoral.pastoralLogs.value[0];
  assert.strictEqual(logItem.tipe_layanan, 'Perkunjungan');
  assert.strictEqual(logItem.notes.type, 'PRIVACY_MASKED');
  if (logItem.notes.type === 'PRIVACY_MASKED') {
    assert.strictEqual(logItem.notes.reason, 'SELF_ONLY');
  }
}
console.log("   ✅ Passed: Outside Context correctly handles field-level masking & Pastoral Notes granularity.");

console.log("\n🎉 All Adapter Unit Tests Passed Successfully!");
