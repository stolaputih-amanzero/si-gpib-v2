export interface GeoPoint {
  id_induk?: string;
  nama_induk?: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CentroidResult {
  centroid: { lat: number; lng: number } | null;
  validMarkers: Array<{ id_induk: string; nama_induk: string; lat: number; lng: number }>;
}

export function calculateMupelCentroid(items: GeoPoint[] = []): CentroidResult {
  const validMarkers: Array<{ id_induk: string; nama_induk: string; lat: number; lng: number }> = [];
  let sumLat = 0;
  let sumLng = 0;

  for (const item of items) {
    if (
      item.latitude !== null &&
      item.latitude !== undefined &&
      item.longitude !== null &&
      item.longitude !== undefined &&
      !isNaN(item.latitude) &&
      !isNaN(item.longitude)
    ) {
      validMarkers.push({
        id_induk: item.id_induk || '',
        nama_induk: item.nama_induk || 'Jemaat Induk',
        lat: item.latitude,
        lng: item.longitude,
      });
      sumLat += item.latitude;
      sumLng += item.longitude;
    }
  }

  if (validMarkers.length === 0) {
    return { centroid: null, validMarkers: [] };
  }

  return {
    centroid: {
      lat: sumLat / validMarkers.length,
      lng: sumLng / validMarkers.length,
    },
    validMarkers,
  };
}
