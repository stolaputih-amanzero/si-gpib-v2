import * as assert from 'assert';
import { UnifiedOrganizationData } from '../src/types/organization.types';
import { adaptOrganizationToViewModel } from '../src/adapters/organizationViewModelAdapter';

function createMockOrganizationData(overrides: Partial<UnifiedOrganizationData> = {}): UnifiedOrganizationData {
  const base: UnifiedOrganizationData = {
    id_org: '01-10-YB',
    identity: {
      id_org: '01-10-YB',
      org_level: 'JEMAAT_INDUK',
      nama: 'GPIB Jemaat Immanuel',
      keterangan: 'Jemaat Induk Wilayah 01',
      status: 'Aktif'
    },
    structure: {
      parent: { id_org: 'M-01', nama: 'Mupel M-01', org_level: 'MUPEL' },
      children: [
        { id_org: 'POS-001', nama: 'Pos Pelkes Alfa', org_level: 'POS_PELKES' }
      ],
      ancestors: [
        { id_org: 'M-01', nama: 'Mupel M-01', org_level: 'MUPEL' }
      ]
    },
    context: {
      requester_access_level: 'FULL_ADMIN',
      is_same_ancestral_tree: true
    },
    overview: {
      alamat: 'Jl. Medan Merdeka Barat No. 10',
      latitude: -6.175392,
      longitude: 106.827153,
      tgl_berdiri: '1980-01-01',
      kmj_nama: 'Pdt. Immanuel Test',
      total_pos_count: 1,
      total_pelayan_count: 5
    },
    people: {
      kmj: { id_person: '11111111-1111-1111-1111-111111111111', nama_lengkap: 'Pdt. Immanuel Test', role_label: 'KMJ', status: 'Aktif' },
      pj_list: [],
      pelayan_list: [
        { id_person: '22222222-2222-2222-2222-222222222222', nama_lengkap: 'Pelayan Test', role_label: 'Diaken', status: 'Aktif' }
      ],
      relawan_list: []
    },
    assets: {
      total_count: 2,
      total_tanah: 1,
      total_bangunan: 1,
      total_bergerak: 0,
      items: [
        { id_asset: 'TANAH-01', nama_aset: 'Tanah Gereja', kategori: 'tanah', kondisi: 'Baik', detail: 'Sertifikat Hak Milik' }
      ]
    },
    aid_requests: {
      total_count: 1,
      active_count: 1,
      approved_count: 0,
      items: [
        { id_ajuan: 'AJUAN-01', jenis_bantuan: 'Renovasi', biaya: 50000000, urgensi: 'Tinggi', status: 'Pending_KMJ', created_at: '2026-08-01' }
      ]
    },
    territory: {
      demografi: [{ kategori_pelkat: 'PKP', jml_kk: 50, laki: 60, perempuan: 70 }],
      kerawanan: [{ id_risiko: 'R1', kategori: 'Bencana', jenis_risiko: 'Banjir', frekuensi: 'Tahunan' }],
      potensi: [{ id_potensi: 'P1', nama_potensi: 'Lahan Parkir', kategori: 'Fasilitas', deskripsi: 'Luas' }]
    },
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        structure: { accessible: true, visibility: 'ORG_WIDE' },
        overview: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        people: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        assets: { accessible: true, visibility: 'RESTRICTED' },
        aid_requests: { accessible: true, visibility: 'RESTRICTED' },
        territory: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' }
      }
    }
  };

  return { ...base, ...overrides };
}

function runUnitTests() {
  console.log("🧪 Starting Unit Tests for organizationViewModelAdapter...\n");

  // 1. Full Context Access Test (DATA states)
  console.log("Test 1: Full Context ViewModel Mapping (DATA States)");
  const fullOrg = createMockOrganizationData();
  const vmFull = adaptOrganizationToViewModel(fullOrg);

  assert.strictEqual(vmFull.id_org, '01-10-YB');
  assert.strictEqual(vmFull.org_level, 'JEMAAT_INDUK');
  assert.strictEqual(vmFull.overview.alamat.type, 'DATA');
  assert.strictEqual((vmFull.overview.alamat as any).value, 'Jl. Medan Merdeka Barat No. 10');
  assert.strictEqual(vmFull.assets.items.type, 'DATA');
  assert.strictEqual(vmFull.aidRequests.items.type, 'DATA');
  console.log("   ✅ Passed: Full context data correctly mapped to DATA states.");

  // 2. Same Context / Restricted Access Test (PRIVACY_MASKED for restricted nodes)
  console.log("Test 2: Restricted Node Privacy Masking (PRIVACY_MASKED)");
  const restrictedOrg = createMockOrganizationData({
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        structure: { accessible: true, visibility: 'ORG_WIDE' },
        overview: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        people: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        assets: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' },
        aid_requests: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' },
        territory: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' }
      }
    }
  });

  const vmRestricted = adaptOrganizationToViewModel(restrictedOrg);
  assert.strictEqual(vmRestricted.overview.alamat.type, 'DATA');
  assert.strictEqual(vmRestricted.assets.items.type, 'PRIVACY_MASKED');
  assert.strictEqual((vmRestricted.assets.items as any).reason, 'INSUFFICIENT_PERMISSION');
  assert.strictEqual(vmRestricted.aidRequests.items.type, 'PRIVACY_MASKED');
  console.log("   ✅ Passed: Restricted nodes correctly masked to PRIVACY_MASKED.");

  // 3. Outside Context Test
  console.log("Test 3: Outside Context Privacy Masking");
  const outsideOrg = createMockOrganizationData({
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        structure: { accessible: true, visibility: 'ORG_WIDE' },
        overview: { accessible: false, visibility: 'PUBLIC_WITHIN_CONTEXT', reason: 'OUTSIDE_CONTEXT' },
        people: { accessible: false, visibility: 'PUBLIC_WITHIN_CONTEXT', reason: 'OUTSIDE_CONTEXT' },
        assets: { accessible: false, visibility: 'RESTRICTED', reason: 'OUTSIDE_CONTEXT' },
        aid_requests: { accessible: false, visibility: 'RESTRICTED', reason: 'OUTSIDE_CONTEXT' },
        territory: { accessible: false, visibility: 'PUBLIC_WITHIN_CONTEXT', reason: 'OUTSIDE_CONTEXT' }
      }
    }
  });

  const vmOutside = adaptOrganizationToViewModel(outsideOrg);
  assert.strictEqual(vmOutside.overview.alamat.type, 'PRIVACY_MASKED');
  assert.strictEqual((vmOutside.overview.alamat as any).reason, 'OUTSIDE_CONTEXT');
  assert.strictEqual(vmOutside.people.kmj.type, 'PRIVACY_MASKED');
  assert.strictEqual(vmOutside.assets.items.type, 'PRIVACY_MASKED');
  console.log("   ✅ Passed: Outside context correctly masked across restricted/context nodes.");

  // 4. EMPTY vs MASKED Invariant Test
  console.log("Test 4: EMPTY vs PRIVACY_MASKED Invariant Assertion");
  const emptyOrg = createMockOrganizationData({
    assets: {
      total_count: 0,
      total_tanah: 0,
      total_bangunan: 0,
      total_bergerak: 0,
      items: []
    },
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        structure: { accessible: true, visibility: 'ORG_WIDE' },
        overview: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        people: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        assets: { accessible: true, visibility: 'RESTRICTED' }, // ACCESSIBLE + EMPTY
        aid_requests: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' }, // INACCESSIBLE
        territory: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' }
      }
    }
  });

  const vmEmpty = adaptOrganizationToViewModel(emptyOrg);
  assert.strictEqual(vmEmpty.assets.items.type, 'EMPTY', "Accessible + empty array MUST resolve to EMPTY");
  assert.strictEqual(vmEmpty.aidRequests.items.type, 'PRIVACY_MASKED', "Accessible=false MUST resolve to PRIVACY_MASKED");
  console.log("   ✅ Passed: Invariant verified (accessible+empty = EMPTY, inaccessible = PRIVACY_MASKED).");

  console.log("\n🎉 ALL ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runUnitTests();
