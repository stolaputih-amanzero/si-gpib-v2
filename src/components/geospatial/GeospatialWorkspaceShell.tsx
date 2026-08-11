'use client';

import React, { useState } from 'react';
import { UnifiedGeospatialData, GeometrySemanticCategory } from '@/types/geospatial.types';
import { adaptGeospatialToViewModel } from '@/adapters/geospatialViewModelAdapter';
import { GeospatialWorkspaceViewModel } from '@/types/geospatialViewModel.types';
import { GeospatialHeader } from './GeospatialHeader';
import { TerritorySummaryCard } from './TerritorySummaryCard';
import { SpatialFeatureListPanel } from './SpatialFeatureListPanel';
import { TerritoryMapPanel } from './TerritoryMapPanel';
import { SaveBoundaryModal } from './SaveBoundaryModal';

interface GeospatialWorkspaceShellProps {
  initialData?: UnifiedGeospatialData;
}

const DEFAULT_SPATIAL_DATA: UnifiedGeospatialData = {
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
          nama_wilayah: 'Batas Sektor Paulus 1',
          keterangan: 'Batas Wilayanan Resmi Sektor 1 GPIB Paulus Jakarta',
          luas_m2: 150000,
          created_at: new Date().toISOString()
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
          keterangan: 'Area Rawan Banjir Musiman Sektor 1',
          luas_m2: 50000,
          created_at: new Date().toISOString()
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
          keterangan: 'Gedung Pos Pelayanan Cikeas',
          luas_m2: 450,
          created_at: new Date().toISOString()
        }
      }
    ]
  }
};

export const GeospatialWorkspaceShell: React.FC<GeospatialWorkspaceShellProps> = ({
  initialData = DEFAULT_SPATIAL_DATA
}) => {
  const [data, setData] = useState<UnifiedGeospatialData>(initialData);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>('GEO-001');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const vm: GeospatialWorkspaceViewModel = adaptGeospatialToViewModel(data);

  const handleSubmitSpatialBoundary = async (
    semanticCategory: GeometrySemanticCategory,
    namaWilayah: string,
    keterangan: string,
    geojsonStr: string,
    _reason: string
  ): Promise<void> => {
    // Simulate RPC save_territory_boundary_atomic
    const parsedGeoJSON = JSON.parse(geojsonStr);
    const newId = 'GEO-' + Math.random().toString(36).substring(2, 8);

    const newFeature = {
      type: 'Feature' as const,
      id: newId,
      geometry: parsedGeoJSON.geometry,
      properties: {
        id_spatial: newId,
        canonical_entity_type: data.canonical_entity_type,
        canonical_entity_id: data.canonical_entity_id,
        semantic_category: semanticCategory,
        nama_wilayah: namaWilayah,
        keterangan: keterangan,
        luas_m2: parsedGeoJSON.geometry?.type === 'Polygon' ? 120000 : null,
        created_at: new Date().toISOString()
      }
    };

    setData(prev => ({
      ...prev,
      total_features: prev.total_features + 1,
      feature_collection: {
        ...prev.feature_collection,
        features: [newFeature, ...prev.feature_collection.features]
      }
    }));
    setSelectedFeatureId(newId);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        <GeospatialHeader vm={vm} onOpenSaveModal={() => setIsSaveModalOpen(true)} />
        <TerritorySummaryCard vm={vm} />

        {/* Responsive Grid: Left List (Text legible), Right Map View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-6">
            <SpatialFeatureListPanel
              features={vm.features}
              selectedFeatureId={selectedFeatureId}
              onSelectFeature={(id) => setSelectedFeatureId(id)}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <TerritoryMapPanel
              featureCollection={vm.rawFeatureCollection}
              selectedFeatureId={selectedFeatureId}
              onSelectFeature={(id) => setSelectedFeatureId(id)}
            />
          </div>
        </div>
      </div>

      <SaveBoundaryModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmitSpatialBoundary={handleSubmitSpatialBoundary}
      />
    </div>
  );
};
