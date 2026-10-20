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
  crs?: string;
  features: GeoJSONFeature[];
}

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
