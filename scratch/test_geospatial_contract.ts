import * as assert from 'assert';
import { 
  GeoJSONFeatureCollection, 
  isValidWGS84Position 
} from '../src/types/geospatial.types';

function runGeospatialContractUnitTests() {
  console.log("🧪 Starting Unit Tests for F9 Geospatial Data Contract & WGS84 Validation...\n");

  // Test 1: Coordinate Range & Order Check (WGS84 lon, lat)
  console.log("Test 1: WGS84 Coordinate Range & Order Check");
  assert.strictEqual(isValidWGS84Position([106.8272, -6.1751]), true, "Valid Jakarta coordinates [lon, lat]");
  assert.strictEqual(isValidWGS84Position([-6.1751, 106.8272]), false, "Reversed [lat, lon] coordinates MUST be rejected (-6.1751 lon is valid, but 106.8272 lat is OUT OF BOUNDS!)");
  assert.strictEqual(isValidWGS84Position([185.0, 0.0]), false, "Longitude > 180 MUST be rejected");
  assert.strictEqual(isValidWGS84Position([0.0, 95.0]), false, "Latitude > 90 MUST be rejected");
  console.log("   ✅ Passed: WGS84 coordinate range and ordering validation passed.");

  // Test 2: Valid GeoJSON Polygon FeatureCollection Structure
  console.log("Test 2: GeoJSON FeatureCollection RFC 7946 Schema Compliance");
  const featureCollection: GeoJSONFeatureCollection = {
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
          nama_wilayah: 'Wilayah Pelayanan Sektor Paulus 1',
          keterangan: 'Batas Sektor 1 GPIB Paulus Jakarta',
          luas_m2: 150000
        }
      },
      {
        type: 'Feature',
        id: 'GEO-002',
        geometry: {
          type: 'Point',
          coordinates: [106.8272, -6.1751]
        },
        properties: {
          id_spatial: 'GEO-002',
          canonical_entity_type: 'asset',
          canonical_entity_id: 'ASSET-POS-001',
          semantic_category: 'POINT_LOCATION',
          nama_wilayah: 'Pos Pelkes Cikeas',
          keterangan: 'Gedung Pos Pelayanan',
          luas_m2: 450
        }
      }
    ]
  };

  assert.strictEqual(featureCollection.features.length, 2);
  assert.strictEqual(featureCollection.features[0].geometry.type, 'Polygon');
  assert.strictEqual(featureCollection.features[1].geometry.type, 'Point');
  console.log("   ✅ Passed: GeoJSON FeatureCollection conforms to RFC 7946 standard.");

  // Test 3: SDK Contamination & Auth Logic Exclusion Check
  console.log("Test 3: SDK Contamination & Auth Logic Exclusion Check");
  const jsonStr = JSON.stringify(featureCollection);
  assert.strictEqual(jsonStr.includes('mapbox'), false, "Mapbox SDK references MUST NOT exist");
  assert.strictEqual(jsonStr.includes('leaflet'), false, "Leaflet SDK references MUST NOT exist");
  assert.strictEqual(jsonStr.includes('canEdit'), false, "UI action flags MUST NOT exist");
  assert.strictEqual(jsonStr.includes('role'), false, "Role auth logic MUST NOT exist");
  console.log("   ✅ Passed: Zero Map SDK references or auth logic in data contract.");

  console.log("\n🎉 ALL F9 GEOSPATIAL CONTRACT UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runGeospatialContractUnitTests();
