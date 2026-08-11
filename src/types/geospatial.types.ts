export type GeometrySemanticCategory = 
  | 'TERRITORY_BOUNDARY' 
  | 'RISK_ZONE' 
  | 'RESOURCE_ZONE' 
  | 'POINT_LOCATION';

export type CanonicalSpatialEntityType = 
  | 'organization' 
  | 'sector' 
  | 'asset' 
  | 'territory_zone';

export type Position = [longitude: number, latitude: number];

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: Position;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: Position[][];
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: Position[][][];
}

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon | GeoJSONMultiPolygon;

export interface SpatialFeatureProperties {
  id_spatial: string;
  canonical_entity_type: CanonicalSpatialEntityType;
  canonical_entity_id: string;
  semantic_category: GeometrySemanticCategory;
  nama_wilayah: string;
  keterangan: string | null;
  luas_m2: number | null;
  created_at?: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: GeoJSONGeometry;
  properties: SpatialFeatureProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface UnifiedGeospatialData {
  canonical_entity_type: CanonicalSpatialEntityType;
  canonical_entity_id: string;
  total_features: number;
  feature_collection: GeoJSONFeatureCollection;
}

// Coordinate Range & WGS84 Order Validation Utility
export function isValidWGS84Position(pos: Position): boolean {
  if (!Array.isArray(pos) || pos.length !== 2) return false;
  const [lon, lat] = pos;
  if (typeof lon !== 'number' || typeof lat !== 'number') return false;
  if (isNaN(lon) || isNaN(lat)) return false;

  // Strict WGS84 range check: Longitude [-180, 180], Latitude [-90, 90]
  return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}
