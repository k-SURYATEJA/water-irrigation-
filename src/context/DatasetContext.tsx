import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatasetSegmentId, DatasetSegment, DatasetExplorerData } from '../types.js';
import { fetchDatasetSegments, fetchDatasetExplorerData } from '../services/api.js';

export const DEFAULT_SEGMENTS: DatasetSegment[] = [
  {
    id: 'all',
    name: 'Unified Command Basin',
    zone: 'All Zones (Krishna-Godavari Inter-Basin)',
    district: 'Krishna & Godavari Command Basins',
    fieldIds: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
    canalIds: ['C1', 'C2', 'C3'],
    resourceIds: ['R1', 'R2'],
    pumpIds: ['P1', 'P2', 'P3'],
    weatherRegionKey: 'Krishna_Delta_Vijayawada',
    soilType: 'Mixed Deltaic (Alfisol, Inceptisol, Vertisol)',
    soilProfile: 'Mixed Deltaic Alluvium & Vertisol',
    description: 'Comprehensive inter-basin network spanning Krishna Delta, Godavari Lowlands, and Guntur Uplands with multi-barrage water balancing.',
    coordinates: '16.5062° N, 80.6480° E',
    primaryCrops: ['Tomato', 'Paddy', 'Groundnut', 'Cotton', 'Maize', 'Chillies'],
    crops: ['Tomato', 'Paddy', 'Groundnut', 'Cotton', 'Maize', 'Chillies'],
    waterSource: 'Prakasam & Dowleswaram Barrages',
    keyTelemetryHighlight: '12,500 L Live Barrage Storage | 3 Main Canals | 6 parcels under active QUBO management',
  },
  {
    id: 'zone-a-krishna',
    name: 'Zone A - Krishna Delta North',
    zone: 'Zone A',
    district: 'Krishna District (Vijayawada)',
    fieldIds: ['F1', 'F3'],
    canalIds: ['C1'],
    resourceIds: ['R1'],
    pumpIds: ['P1'],
    weatherRegionKey: 'Krishna_Delta_Vijayawada',
    soilType: 'Red Sandy Loam (Alfisol)',
    soilProfile: 'Red Sandy Loam (Alfisol)',
    description: 'High solar radiation delta reach served by Prakasam Barrage. High-value crops (Tomato & Groundnut) on well-drained sandy loam.',
    coordinates: '16.4851° N, 80.6571° E',
    primaryCrops: ['Tomato', 'Groundnut'],
    crops: ['Tomato', 'Groundnut'],
    waterSource: 'Prakasam Barrage · Krishna Right Main Canal',
    keyTelemetryHighlight: 'High thermal radiation (ET0 5.6 mm/d) | Free Solar Pump #1 Active | Low rain probability (10%)',
  },
  {
    id: 'zone-b-godavari',
    name: 'Zone B - Godavari Lowlands',
    zone: 'Zone B',
    district: 'East/West Godavari (Rajahmundry)',
    fieldIds: ['F2', 'F6'],
    canalIds: ['C2'],
    resourceIds: ['R2'],
    pumpIds: ['P2'],
    weatherRegionKey: 'Godavari_Delta_Rajahmundry',
    soilType: 'Clay Loam (Inceptisol)',
    soilProfile: 'Clay Loam (Inceptisol)',
    description: 'Monsoon-active lowlands fed by Sir Arthur Cotton Barrage. Water-intensive Paddy and high-yield Chillies with convective precipitation radar.',
    coordinates: '16.9891° N, 81.7840° E',
    primaryCrops: ['Paddy', 'Chillies'],
    crops: ['Paddy', 'Chillies'],
    waterSource: 'Dowleswaram Barrage · Godavari Central Canal',
    keyTelemetryHighlight: 'Convective thunderstorm incoming (28mm rain, 65% prob) | Smart Delay active saving ~1,330L water',
  },
  {
    id: 'zone-c-guntur',
    name: 'Zone C - Guntur-Amaravati Uplands',
    zone: 'Zone C',
    district: 'Guntur District (Amaravati)',
    fieldIds: ['F4', 'F5'],
    canalIds: ['C3'],
    resourceIds: ['R1'],
    pumpIds: ['P3'],
    weatherRegionKey: 'Guntur_Uplands',
    soilType: 'Black Cotton Soil (Vertisol)',
    soilProfile: 'Black Cotton Soil (Vertisol)',
    description: 'Tail-end distributary command area on deep Vertisol soils with high moisture retention. Cotton and Maize cultivation requiring precise drought rationing.',
    coordinates: '16.3067° N, 80.4365° E',
    primaryCrops: ['Cotton', 'Maize'],
    crops: ['Cotton', 'Maize'],
    waterSource: 'Nagarjuna Sagar Right Canal & Krishna Lift',
    keyTelemetryHighlight: 'High soil water capacity (AWC 200 mm/m) | Tail-end canal reach (C3 capacity 1,500 L/d)',
  },
];

export interface DatasetContextType {
  activeSegment: DatasetSegmentId;
  setActiveSegment: (segment: DatasetSegmentId) => void;
  currentSegmentId: DatasetSegmentId;
  setSegment: (segment: DatasetSegmentId) => void;
  currentSegment: DatasetSegment;
  segments: DatasetSegment[];
  isAllSegments: boolean;
  explorerData: DatasetExplorerData | null;
  loading: boolean;
  refreshExplorerData: () => Promise<void>;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSegment, setActiveSegmentState] = useState<DatasetSegmentId>(() => {
    const saved = localStorage.getItem('aquaquantum_dataset_segment') as DatasetSegmentId | null;
    if (saved && DEFAULT_SEGMENTS.some((s) => s.id === saved)) {
      return saved;
    }
    return 'all';
  });

  const [explorerData, setExplorerData] = useState<DatasetExplorerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setActiveSegment = (segment: DatasetSegmentId) => {
    setActiveSegmentState(segment);
    localStorage.setItem('aquaquantum_dataset_segment', segment);
  };

  const refreshExplorerData = async () => {
    try {
      setLoading(true);
      const data = await fetchDatasetExplorerData();
      setExplorerData(data);
    } catch (err) {
      console.error('Failed to load dataset explorer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshExplorerData();
  }, []);

  const currentSegment =
    DEFAULT_SEGMENTS.find((s) => s.id === activeSegment) || DEFAULT_SEGMENTS[0];

  return (
    <DatasetContext.Provider
      value={{
        activeSegment,
        setActiveSegment,
        currentSegmentId: activeSegment,
        setSegment: setActiveSegment,
        currentSegment,
        segments: DEFAULT_SEGMENTS,
        isAllSegments: activeSegment === 'all',
        explorerData,
        loading,
        refreshExplorerData,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = (): DatasetContextType => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};

