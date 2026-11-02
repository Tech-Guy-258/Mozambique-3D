export type RegionType = 'Norte' | 'Centro' | 'Sul';

export type ThematicMetric = 'standard' | 'population' | 'density' | 'area' | 'districts' | 'region';

export type LightingTheme = 'day' | 'night' | 'studio' | 'topographic';

export type CameraPreset = 'default' | 'topdown' | 'norte' | 'centro' | 'sul' | 'close';

export interface EconomicSector {
  sector: string;
  shareDescription: string;
  keyProducts: string[];
}

export interface ProvinceData {
  id: string; // '01' .. '11'
  name: string;
  officialName: string;
  capital: string;
  region: RegionType;
  areaKm2: number;
  population2017: number; // Censo 2017 INE
  population2024: number; // Projecção INE 2024
  density2024: number; // Hab/km²
  districtsCount: number;
  districtsList: string[];
  climate: string;
  languages: string[];
  economicProfile: {
    primaryActivities: string[];
    keyResources: string[];
    majorInfrastructure: string[];
    overview: string;
  };
  highestPoint?: {
    name: string;
    altitudeMeters: number;
  };
  coastline: boolean;
  color: string; // Base cartographic tint
  notes: string;
  sources: {
    demographics: string;
    geography: string;
    referenceYears: string;
  };
}

export type GeoJSONRing = [number, number][]; // [lon, lat]

export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: any;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id?: string;
  properties: {
    OBJECTID?: number;
    Provincia: string;
    CodProv: string;
    [key: string]: any;
  };
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  source?: string;
  sourceUrl?: string;
  crs?: string | { type: string; properties: { name: string } };
  features: GeoJSONFeature[];
}

export interface DistrictData {
  id?: string; // e.g. '0704'
  code: string;
  provinceId: string; // '07'
  provinceName?: string;
  name: string;
  headquarters: string;
  areaKm2: number;
  population2017: number;
  density?: number;
  density2017?: number;
  administrativePosts: string[];
  economicHighlights: string[];
  tourismHighlights?: string[];
  tourismAttractions?: string[];
  notes?: string;
  sources?: {
    demographics: string;
    geography: string;
    referenceYears: string;
  };
}

export interface IndicatorValue {
  id: string;
  label: string;
  value: string | number;
  formattedValue: string;
  unit?: string;
  source: string;
  referenceYear: string;
  category: 'demografia' | 'geografia' | 'economia' | 'infraestrutura' | 'turismo';
  notes?: string;
}

export interface TourismHeritageItem {
  id: string;
  title: string;
  category: 'Património Natural' | 'Património Histórico & Arquitectónico' | 'Património Cultural Imaterial' | 'Gastronomia';
  location: string;
  description: string;
  source: string;
  yearReference?: string;
}

export type ViewMode = 'national' | 'province-detailed' | 'tete-detailed' | 'google-roads';

export interface Province3DMeshMeta {
  code: string;
  name: string;
  centroid: [number, number, number];
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export interface PanAction {
  id: number;
  type: 'up' | 'down' | 'left' | 'right' | 'in' | 'out' | 'recenter';
}

export type TransportLayerId =
  | 'primary_roads'
  | 'secondary_roads'
  | 'railways'
  | 'ports'
  | 'airports'
  | 'aerodromes';

export interface TransportLayersState {
  primary_roads: boolean;
  secondary_roads: boolean;
  railways: boolean;
  ports: boolean;
  airports: boolean;
  aerodromes: boolean;
}

export interface TransportRoute {
  id: string;
  layer: 'primary_roads' | 'secondary_roads' | 'railways';
  code: string;
  name: string;
  operator: string;
  extentKm: number;
  status: string;
  color: string;
  dashPattern?: boolean;
  coordinates: [number, number][];
  stationsOrHubs: {
    name: string;
    coordinates: [number, number];
    type?: 'hub' | 'bridge' | 'toll' | 'border' | 'station';
  }[];
  description: string;
  strategicImportance: string;
  surfaceType?: string;
  laneConfiguration?: string;
  provincesCrossed?: string[];
  keyBridges?: string[];
  tollPlazas?: string[];
  trafficVolume?: string;
}

export interface TransportNode {
  id: string;
  layer: 'ports' | 'airports' | 'aerodromes';
  code: string;
  name: string;
  category: string;
  provinceId: string;
  provinceName: string;
  coordinates: [number, number];
  elevationMeters?: number;
  runwayOrBerths?: string;
  operator: string;
  capacityOrTraffic?: string;
  description: string;
  highlights: string[];
}

export interface RouteStepInfo {
  instruction: string;
  distanceText?: string;
  durationText?: string;
}

export interface CalculatedRouteDetails {
  originName: string;
  destinationName: string;
  distanceKm?: number;
  distanceText: string;
  durationMinutes?: number;
  durationText: string;
  startAddress?: string;
  endAddress?: string;
  steps: RouteStepInfo[];
  googleMapsUrl?: string;
}
