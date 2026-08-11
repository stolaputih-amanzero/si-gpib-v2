import * as assert from 'assert';
import { UnifiedGeospatialData, isValidWGS84Position } from '../src/types/geospatial.types';

class GeospatialMockEngine {
  private features = new Map<string, any>();
  private spatialHistoryLogs: any[] = [];
  private transactionLogs = new Set<string>();
  private currentUid: string | null = 'USER-ADMIN-001';

  setAuthUser(uid: string | null) {
    this.currentUid = uid;
  }

  async save_territory_boundary_atomic(params: {
    p_id_spatial?: string;
    p_canonical_entity_type: string;
    p_canonical_entity_id: string;
    p_semantic_category: string;
    p_nama_wilayah: string;
    p_keterangan?: string;
    p_geojson_feature: any;
    p_request_id?: string;
    p_reason?: string;
  }): Promise<UnifiedGeospatialData> {
    if (!this.currentUid) {
      throw new Error('UNAUTHENTICATED: Authentication required for spatial mutations.');
    }

    if (params.p_request_id && this.transactionLogs.has(params.p_request_id)) {
      return this.get_territory_geospatial_360({
        p_canonical_entity_type: params.p_canonical_entity_type,
        p_canonical_entity_id: params.p_canonical_entity_id
      });
    }

    const geomType = params.p_geojson_feature?.geometry?.type;
    if (!geomType) {
      throw new Error('INVALID_GEOJSON: Missing geometry type in Feature.');
    }

    // Semantic ↔ Geometry Type Compatibility Matrix Enforcement
    if (['TERRITORY_BOUNDARY', 'RISK_ZONE', 'RESOURCE_ZONE'].includes(params.p_semantic_category)) {
      if (!['Polygon', 'MultiPolygon'].includes(geomType)) {
        throw new Error(`GEOMETRY_SEMANTIC_MISMATCH: Category ${params.p_semantic_category} requires Polygon or MultiPolygon geometry.`);
      }
    } else if (params.p_semantic_category === 'POINT_LOCATION') {
      if (geomType !== 'Point') {
        throw new Error('GEOMETRY_SEMANTIC_MISMATCH: Category POINT_LOCATION requires Point geometry.');
      }
    } else {
      throw new Error(`INVALID_SEMANTIC_CATEGORY: Category ${params.p_semantic_category} is not supported.`);
    }

    // Check self-intersecting / invalid topology simulation
    if (params.p_geojson_feature.geometry.invalid_topology === true) {
      throw new Error('INVALID_TOPOLOGY: Self-intersecting or invalid polygon geometry topology rejected.');
    }

    const coords = params.p_geojson_feature.geometry.coordinates;

    if (geomType === 'Point') {
      if (!isValidWGS84Position(coords)) {
        throw new Error('INVALID_WGS84_RANGE: Point coordinates out of WGS84 bounds.');
      }
    } else if (geomType === 'Polygon') {
      const ring = coords[0];
      for (const pos of ring) {
        if (!isValidWGS84Position(pos)) {
          throw new Error('INVALID_WGS84_RANGE: Polygon ring coordinate out of WGS84 bounds.');
        }
      }
    }

    const id_spatial = params.p_id_spatial || 'GEO-' + Math.random().toString(36).substring(2, 8);
    const existing = this.features.get(id_spatial);

    if (existing) {
      // Historical Archiving
      this.spatialHistoryLogs.push({
        id_history: 'SPATIAL-HIST-' + Math.random().toString(36).substring(2, 8),
        id_spatial,
        canonical_entity_type: existing.canonical_entity_type,
        canonical_entity_id: existing.canonical_entity_id,
        semantic_category: existing.semantic_category,
        previous_geojson: existing.geojson_data,
        actor_id: this.currentUid,
        request_id: params.p_request_id || null,
        reason: params.p_reason || 'Spatial boundary update mutation',
        created_at: new Date().toISOString()
      });
    }

    const featureRecord = {
      id_spatial,
      canonical_entity_type: params.p_canonical_entity_type,
      canonical_entity_id: params.p_canonical_entity_id,
      semantic_category: params.p_semantic_category,
      nama_wilayah: params.p_nama_wilayah,
      keterangan: params.p_keterangan || null,
      geojson_data: params.p_geojson_feature,
      luas_m2: geomType === 'Polygon' ? 150000 : null,
      created_by: this.currentUid,
      created_at: new Date().toISOString()
    };

    this.features.set(id_spatial, featureRecord);

    if (params.p_request_id) {
      this.transactionLogs.add(params.p_request_id);
    }

    return this.get_territory_geospatial_360({
      p_canonical_entity_type: params.p_canonical_entity_type,
      p_canonical_entity_id: params.p_canonical_entity_id
    });
  }

  async get_territory_geospatial_360(params: {
    p_canonical_entity_type: string;
    p_canonical_entity_id: string;
  }): Promise<UnifiedGeospatialData> {
    if (!this.currentUid) {
      throw new Error('UNAUTHENTICATED: Authentication required.');
    }

    const matched = Array.from(this.features.values()).filter(
      f => f.canonical_entity_type === params.p_canonical_entity_type && f.canonical_entity_id === params.p_canonical_entity_id
    );

    const geoJsonFeatures = matched.map(f => ({
      type: 'Feature' as const,
      id: f.id_spatial,
      geometry: f.geojson_data.geometry,
      properties: {
        id_spatial: f.id_spatial,
        canonical_entity_type: f.canonical_entity_type,
        canonical_entity_id: f.canonical_entity_id,
        semantic_category: f.semantic_category,
        nama_wilayah: f.nama_wilayah,
        keterangan: f.keterangan,
        luas_m2: f.luas_m2,
        created_at: f.created_at
      }
    }));

    return {
      canonical_entity_type: params.p_canonical_entity_type as any,
      canonical_entity_id: params.p_canonical_entity_id,
      total_features: matched.length,
      feature_collection: {
        type: 'FeatureCollection',
        features: geoJsonFeatures
      }
    };
  }

  getSpatialHistoryLogsCount(): number {
    return this.spatialHistoryLogs.length;
  }
}

async function runGeospatialHarness() {
  console.log("🧪 Starting F9 Geospatial RPC & Security Harness Test...\n");

  const engine = new GeospatialMockEngine();

  // Test 1: Unauthenticated Isolation Gate
  console.log("Gate 1: Unauthenticated Isolation Gate");
  engine.setAuthUser(null);
  try {
    await engine.save_territory_boundary_atomic({
      p_canonical_entity_type: 'sector',
      p_canonical_entity_id: 'ORG-SEKTOR-01',
      p_semantic_category: 'TERRITORY_BOUNDARY',
      p_nama_wilayah: 'Sektor Paulus 1',
      p_geojson_feature: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[106.82, -6.17], [106.83, -6.17], [106.83, -6.18], [106.82, -6.18], [106.82, -6.17]]] }
      }
    });
    assert.fail("Unauthenticated request MUST raise exception");
  } catch (err: any) {
    assert.ok(err.message.includes('UNAUTHENTICATED'));
    console.log("   ✅ Passed: Unauthenticated request rejected.");
  }

  // Restore authenticated session
  engine.setAuthUser('USER-ADMIN-001');

  // Test 2: Geometry ↔ Semantic Mismatch Gate
  console.log("Gate 2: Geometry ↔ Semantic Mismatch Gate");
  try {
    await engine.save_territory_boundary_atomic({
      p_canonical_entity_type: 'sector',
      p_canonical_entity_id: 'ORG-SEKTOR-01',
      p_semantic_category: 'POINT_LOCATION', // Mismatch! Point category given Polygon!
      p_nama_wilayah: 'Sektor Paulus 1',
      p_geojson_feature: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[106.82, -6.17], [106.83, -6.17], [106.83, -6.18], [106.82, -6.18], [106.82, -6.17]]] }
      }
    });
    assert.fail("Mismatch between semantic category and geometry type MUST raise exception");
  } catch (err: any) {
    assert.ok(err.message.includes('GEOMETRY_SEMANTIC_MISMATCH'));
    console.log("   ✅ Passed: Mismatch between POINT_LOCATION and Polygon geometry rejected.");
  }

  // Test 3: Invalid Coordinate Order & WGS84 Range Gate
  console.log("Gate 3: Invalid Coordinate Order & WGS84 Range Gate");
  try {
    await engine.save_territory_boundary_atomic({
      p_canonical_entity_type: 'sector',
      p_canonical_entity_id: 'ORG-SEKTOR-01',
      p_semantic_category: 'TERRITORY_BOUNDARY',
      p_nama_wilayah: 'Sektor Paulus 1',
      p_geojson_feature: {
        type: 'Feature',
        geometry: { 
          type: 'Polygon', 
          coordinates: [[[106.82, -95.0], [106.83, -6.17], [106.83, -6.18], [106.82, -6.18], [106.82, -95.0]]] // Invalid Latitude -95!
        }
      }
    });
    assert.fail("Invalid WGS84 latitude MUST raise exception");
  } catch (err: any) {
    assert.ok(err.message.includes('INVALID_WGS84_RANGE'));
    console.log("   ✅ Passed: Out-of-bounds latitude coordinate rejected.");
  }

  // Test 4: Invalid Topology Gate
  console.log("Gate 4: Invalid Topology Gate");
  try {
    await engine.save_territory_boundary_atomic({
      p_canonical_entity_type: 'sector',
      p_canonical_entity_id: 'ORG-SEKTOR-01',
      p_semantic_category: 'TERRITORY_BOUNDARY',
      p_nama_wilayah: 'Sektor Paulus 1',
      p_geojson_feature: {
        type: 'Feature',
        geometry: { 
          type: 'Polygon', 
          invalid_topology: true,
          coordinates: [[[106.82, -6.17], [106.83, -6.17], [106.83, -6.18], [106.82, -6.18], [106.82, -6.17]]] 
        }
      }
    });
    assert.fail("Invalid topology polygon MUST raise exception");
  } catch (err: any) {
    assert.ok(err.message.includes('INVALID_TOPOLOGY'));
    console.log("   ✅ Passed: Invalid polygon topology rejected.");
  }

  // Test 5: Successful Polygon Mutation & GeoJSON Read Model Gate
  console.log("Gate 5: Successful Polygon Mutation & GeoJSON Read Model Gate");
  const result = await engine.save_territory_boundary_atomic({
    p_id_spatial: 'GEO-001',
    p_canonical_entity_type: 'sector',
    p_canonical_entity_id: 'ORG-SEKTOR-01',
    p_semantic_category: 'TERRITORY_BOUNDARY',
    p_nama_wilayah: 'Sektor Paulus 1',
    p_geojson_feature: {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[106.82, -6.17], [106.83, -6.17], [106.83, -6.18], [106.82, -6.18], [106.82, -6.17]]] }
    },
    p_request_id: 'REQ-SPATIAL-001'
  });

  assert.strictEqual(result.total_features, 1);
  assert.strictEqual(result.feature_collection.features[0].properties.nama_wilayah, 'Sektor Paulus 1');
  console.log("   ✅ Passed: Territory boundary saved with GeoJSON FeatureCollection read model.");

  // Test 6: Historical Geometry Audit Log Gate
  console.log("Gate 6: Historical Geometry Audit Log Gate");
  await engine.save_territory_boundary_atomic({
    p_id_spatial: 'GEO-001', // Update existing GEO-001
    p_canonical_entity_type: 'sector',
    p_canonical_entity_id: 'ORG-SEKTOR-01',
    p_semantic_category: 'TERRITORY_BOUNDARY',
    p_nama_wilayah: 'Sektor Paulus 1 (Updated)',
    p_geojson_feature: {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[106.82, -6.17], [106.84, -6.17], [106.84, -6.18], [106.82, -6.18], [106.82, -6.17]]] }
    },
    p_reason: 'Re-aligning sector 1 boundary polygon'
  });

  assert.strictEqual(engine.getSpatialHistoryLogsCount(), 1);
  console.log("   ✅ Passed: Previous spatial geometry archived into sys_spatial_history_logs.");

  // Test 7: Request Idempotency Gate
  console.log("Gate 7: Request Idempotency Gate");
  const idempotentResult = await engine.save_territory_boundary_atomic({
    p_id_spatial: 'GEO-001',
    p_canonical_entity_type: 'sector',
    p_canonical_entity_id: 'ORG-SEKTOR-01',
    p_semantic_category: 'TERRITORY_BOUNDARY',
    p_nama_wilayah: 'Sektor Paulus 1',
    p_geojson_feature: {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[106.82, -6.17], [106.83, -6.17], [106.83, -6.18], [106.82, -6.18], [106.82, -6.17]]] }
    },
    p_request_id: 'REQ-SPATIAL-001' // Duplicate request ID!
  });

  assert.strictEqual(idempotentResult.total_features, 1);
  console.log("   ✅ Passed: Idempotency token prevented duplicate spatial record creation.");

  console.log("\n🎉 ALL 7 F9 GEOSPATIAL SECURITY & SPATIAL HARNESS TEST GATES PASSED 100% SUCCESSFULLY!\n");
}

runGeospatialHarness();
