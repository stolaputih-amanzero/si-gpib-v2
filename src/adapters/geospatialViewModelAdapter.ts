import { 
  UnifiedGeospatialData, 
  GeoJSONFeature, 
  GeometrySemanticCategory 
} from '@/types/geospatial.types';
import { 
  GeospatialWorkspaceViewModel, 
  SpatialFeatureItemViewModel, 
  GeospatialSummaryMetrics 
} from '@/types/geospatialViewModel.types';

function getSemanticCategoryLabel(category: GeometrySemanticCategory): string {
  switch (category) {
    case 'TERRITORY_BOUNDARY':
      return 'Batas Wilayah Pelayanan (Poligon)';
    case 'RISK_ZONE':
      return 'Zona Rawan Bencana / Kerawanan';
    case 'RESOURCE_ZONE':
      return 'Zona Potensi Penjangkauan / Sumber Daya';
    case 'POINT_LOCATION':
      return 'Titik Koordinat Pos / Aset Fisik';
    default:
      return 'Kategori Spasial Tidak Diketahui';
  }
}

function getSemanticBadgeColor(category: GeometrySemanticCategory): string {
  switch (category) {
    case 'TERRITORY_BOUNDARY':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'RISK_ZONE':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'RESOURCE_ZONE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'POINT_LOCATION':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function formatAreaSize(luasM2: number | null): string {
  if (luasM2 === null || luasM2 === undefined || isNaN(luasM2) || luasM2 <= 0) {
    return '-';
  }
  if (luasM2 >= 10000) {
    const hectares = luasM2 / 10000;
    return `${hectares.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Hektar`;
  }
  return `${luasM2.toLocaleString('id-ID', { maximumFractionDigits: 0 })} m²`;
}

function formatCoordinatesSummary(feature: GeoJSONFeature): string {
  const geom = feature.geometry;
  if (geom.type === 'Point') {
    const [lon, lat] = geom.coordinates;
    return `Titik (${lon.toFixed(4)}, ${lat.toFixed(4)})`;
  }
  if (geom.type === 'Polygon') {
    const ringLen = geom.coordinates[0] ? geom.coordinates[0].length : 0;
    return `Poligon (${ringLen} Titik Koordinat)`;
  }
  if (geom.type === 'MultiPolygon') {
    return `MultiPoligon (${geom.coordinates.length} Poligon)`;
  }
  return 'Geometri Lain';
}

function mapFeatureToViewModel(feature: GeoJSONFeature): SpatialFeatureItemViewModel {
  const props = feature.properties;
  return {
    id_spatial: feature.id || props.id_spatial,
    canonical_entity_type: props.canonical_entity_type,
    canonical_entity_id: props.canonical_entity_id,
    semantic_category: props.semantic_category,
    semanticCategoryLabel: getSemanticCategoryLabel(props.semantic_category),
    semanticBadgeColor: getSemanticBadgeColor(props.semantic_category),
    nama_wilayah: props.nama_wilayah || 'Wilayah Tanpa Nama',
    keterangan: props.keterangan || 'Tidak ada keterangan tambahan.',
    geometryType: feature.geometry.type,
    geometryTypeLabel: feature.geometry.type === 'Point' ? 'Titik (Point)' : feature.geometry.type === 'Polygon' ? 'Poligon (Polygon)' : 'MultiPoligon',
    areaFormatted: formatAreaSize(props.luas_m2),
    coordinatesSummary: formatCoordinatesSummary(feature),
    createdDateFormatted: props.created_at ? new Date(props.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'
  };
}

export function adaptGeospatialToViewModel(
  data: UnifiedGeospatialData
): GeospatialWorkspaceViewModel {
  const features = (data.feature_collection?.features || []).map(mapFeatureToViewModel);

  let boundaryCount = 0;
  let riskCount = 0;
  let resourceCount = 0;
  let pointCount = 0;
  let totalAreaM2 = 0;

  features.forEach(f => {
    if (f.semantic_category === 'TERRITORY_BOUNDARY') boundaryCount++;
    if (f.semantic_category === 'RISK_ZONE') riskCount++;
    if (f.semantic_category === 'RESOURCE_ZONE') resourceCount++;
    if (f.semantic_category === 'POINT_LOCATION') pointCount++;

    const rawArea = data.feature_collection.features.find(feat => (feat.id || feat.properties.id_spatial) === f.id_spatial)?.properties.luas_m2;
    if (rawArea && rawArea > 0) {
      totalAreaM2 += rawArea;
    }
  });

  const summaryMetrics: GeospatialSummaryMetrics = {
    totalFeatures: features.length,
    boundaryPolygonsCount: boundaryCount,
    riskZonesCount: riskCount,
    resourceZonesCount: resourceCount,
    pointLocationsCount: pointCount,
    totalCoveredAreaFormatted: formatAreaSize(totalAreaM2)
  };

  return {
    canonical_entity_type: data.canonical_entity_type,
    canonical_entity_id: data.canonical_entity_id,
    features,
    summaryMetrics,
    hasData: features.length > 0,
    rawFeatureCollection: data.feature_collection
  };
}
