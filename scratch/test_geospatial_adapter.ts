import * as assert from 'assert';
import { UnifiedGeospatialData } from '../src/types/geospatial.types';
import { adaptGeospatialToViewModel, formatAreaSize } from '../src/adapters/geospatialViewModelAdapter';

function runGeospatialAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptGeospatialToViewModel...\n");

  // Test 2: Area Size Formatter Check
  console.log("Test 2: Area Size Formatter Check");
  assert.strictEqual(formatAreaSize(150000), '15 Hektar');
  assert.strictEqual(formatAreaSize(450), '450 m²');
  assert.strictEqual(formatAreaSize(null), '-');
  console.log("   ✅ Passed: formatAreaSize correctly formats square meters into hectares and m².");

  const mockGeospatialData: UnifiedGeospatialData = {
    canonical_entity_type: 'sector',
    canonical_entity_id: 'ORG-SEKTOR-01',
    total_features: 3,
    feature_collection: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'GEO-001',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [106.82, -6.17],
                [106.83, -6.17],
                [106.83, -6.18],
                [106.82, -6.18],
                [106.82, -6.17]
              ]
            ]
          },
          properties: {
            id_spatial: 'GEO-001',
            canonical_entity_type: 'sector',
            canonical_entity_id: 'ORG-SEKTOR-01',
            semantic_category: 'TERRITORY_BOUNDARY',
            nama_wilayah: 'Sektor Paulus 1',
            keterangan: 'Batas Wilayanan Sektor 1',
            luas_m2: 150000,
            created_at: '2026-08-01T10:00:00Z'
          }
        },
        {
          type: 'Feature',
          id: 'GEO-002',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [106.84, -6.19],
                [106.85, -6.19],
                [106.85, -6.20],
                [106.84, -6.20],
                [106.84, -6.19]
              ]
            ]
          },
          properties: {
            id_spatial: 'GEO-002',
            canonical_entity_type: 'territory_zone',
            canonical_entity_id: 'ZONE-RISK-01',
            semantic_category: 'RISK_ZONE',
            nama_wilayah: 'Zona Rawan Banjir Ciliwung',
            keterangan: 'Area Genangan Musiman',
            luas_m2: 50000,
            created_at: '2026-08-01T10:00:00Z'
          }
        },
        {
          type: 'Feature',
          id: 'GEO-003',
          geometry: {
            type: 'Point',
            coordinates: [106.8272, -6.1751]
          },
          properties: {
            id_spatial: 'GEO-003',
            canonical_entity_type: 'asset',
            canonical_entity_id: 'ASSET-POS-001',
            semantic_category: 'POINT_LOCATION',
            nama_wilayah: 'Pos Pelkes Cikeas',
            keterangan: 'Bangunan Fisik Pos',
            luas_m2: 450,
            created_at: '2026-08-01T10:00:00Z'
          }
        }
      ]
    }
  };

  // Test 1: Pure GeoJSON Read Model to ViewModel & Semantic Category Preservation
  console.log("Test 1: Pure GeoJSON Read Model to ViewModel & Semantic Category Preservation");
  const vm = adaptGeospatialToViewModel(mockGeospatialData);

  assert.strictEqual(vm.features.length, 3);
  assert.strictEqual(vm.summaryMetrics.boundaryPolygonsCount, 1);
  assert.strictEqual(vm.summaryMetrics.riskZonesCount, 1);
  assert.strictEqual(vm.summaryMetrics.pointLocationsCount, 1);
  assert.strictEqual(vm.features[0].semanticCategoryLabel, 'Batas Wilayah Pelayanan (Poligon)');
  assert.strictEqual(vm.features[1].semanticCategoryLabel, 'Zona Rawan Bencana / Kerawanan');
  assert.strictEqual(vm.features[2].semanticCategoryLabel, 'Titik Koordinat Pos / Aset Fisik');
  console.log("   ✅ Passed: GeoJSON features and semantic category badges mapped correctly.");

  // Test 3: Graceful EMPTY State Handling
  console.log("Test 3: Graceful EMPTY State Handling");
  const emptyData: UnifiedGeospatialData = {
    canonical_entity_type: 'sector',
    canonical_entity_id: 'ORG-EMPTY-00',
    total_features: 0,
    feature_collection: {
      type: 'FeatureCollection',
      features: []
    }
  };
  const emptyVm = adaptGeospatialToViewModel(emptyData);

  assert.strictEqual(emptyVm.hasData, false);
  assert.strictEqual(emptyVm.features.length, 0);
  assert.strictEqual(emptyVm.summaryMetrics.totalFeatures, 0);
  console.log("   ✅ Passed: Empty FeatureCollection handled gracefully without error.");

  // Test 4: Pure Adapter Invariants (0 Map SDK References / 0 Auth Logic)
  console.log("Test 4: Pure Adapter Invariants (0 Map SDK References / 0 Auth Logic)");
  const jsonStr = JSON.stringify(vm);
  assert.strictEqual(jsonStr.includes('mapbox'), false, "mapbox reference MUST NOT be present");
  assert.strictEqual(jsonStr.includes('leaflet'), false, "leaflet reference MUST NOT be present");
  assert.strictEqual(jsonStr.includes('canEditPoly'), false, "canEditPoly MUST NOT be present");
  assert.strictEqual(jsonStr.includes('role'), false, "role MUST NOT be present");
  console.log("   ✅ Passed: Zero Map SDK references or auth logic in ViewModel payload.");

  console.log("\n🎉 ALL F9 GEOSPATIAL ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runGeospatialAdapterUnitTests();
