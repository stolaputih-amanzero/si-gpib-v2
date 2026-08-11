import { 
  CanonicalSpatialEntityType, 
  GeometrySemanticCategory, 
  GeoJSONFeatureCollection 
} from '@/types/geospatial.types';

export interface SpatialFeatureItemViewModel {
  id_spatial: string;
  canonical_entity_type: CanonicalSpatialEntityType;
  canonical_entity_id: string;
  semantic_category: GeometrySemanticCategory;
  semanticCategoryLabel: string;
  semanticBadgeColor: string;
  nama_wilayah: string;
  keterangan: string;
  geometryType: 'Point' | 'Polygon' | 'MultiPolygon';
  geometryTypeLabel: string;
  areaFormatted: string;
  coordinatesSummary: string;
  createdDateFormatted: string;
}

export interface GeospatialSummaryMetrics {
  totalFeatures: number;
  boundaryPolygonsCount: number;
  riskZonesCount: number;
  resourceZonesCount: number;
  pointLocationsCount: number;
  totalCoveredAreaFormatted: string;
}

export interface GeospatialWorkspaceViewModel {
  canonical_entity_type: CanonicalSpatialEntityType;
  canonical_entity_id: string;
  features: SpatialFeatureItemViewModel[];
  summaryMetrics: GeospatialSummaryMetrics;
  hasData: boolean;
  rawFeatureCollection: GeoJSONFeatureCollection;
}
