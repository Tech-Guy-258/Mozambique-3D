import * as THREE from 'three';
import { ThematicMetric, ProvinceData } from '../types/index.ts';
import { PROVINCES_DATA } from '../data/provincesData.ts';

// Color interpolators
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  c1.lerp(c2, Math.max(0, Math.min(1, factor)));
  return '#' + c1.getHexString();
}

export function getProvinceMetricValue(data: ProvinceData, metric: ThematicMetric): number {
  switch (metric) {
    case 'population':
      return data.population2024;
    case 'density':
      return data.density2024;
    case 'area':
      return data.areaKm2;
    case 'districts':
      return data.districtsCount;
    default:
      return 0;
  }
}

export function getThematicColor(code: string, metric: ThematicMetric): string {
  const data = PROVINCES_DATA[code];
  if (!data) return '#64748b';

  if (metric === 'standard') {
    return data.color;
  }

  if (metric === 'region') {
    switch (data.region) {
      case 'Norte':
        return '#0284c7'; // Sky/Ocean Blue
      case 'Centro':
        return '#d97706'; // Warm Amber
      case 'Sul':
        return '#059669'; // Emerald Green
    }
  }

  // Min and max for each metric across the 11 provinces
  if (metric === 'population') {
    // 1,160,000 (Cidade de Maputo) to 6,950,000 (Nampula)
    const min = 1160000;
    const max = 6950000;
    const factor = (data.population2024 - min) / (max - min);
    return interpolateColor('#fed7aa', '#991b1b', factor); // Soft peach to deep red
  }

  if (metric === 'density') {
    // Range: 16.9 (Niassa) to 3342.9 (Cidade de Maputo)
    // Use log scale because Cidade de Maputo is urban capital
    const logMin = Math.log(15);
    const logMax = Math.log(3500);
    const factor = (Math.log(data.density2024) - logMin) / (logMax - logMin);
    return interpolateColor('#c7d2fe', '#312e81', factor); // Soft lavender to midnight indigo
  }

  if (metric === 'area') {
    // 347 km² to 129,056 km²
    const min = 347;
    const max = 129056;
    const factor = Math.sqrt(data.areaKm2 - min) / Math.sqrt(max - min);
    return interpolateColor('#a7f3d0', '#064e3b', factor); // Mint green to deep forest
  }

  if (metric === 'districts') {
    // 7 (Cidade de Maputo) to 23 (Nampula)
    const min = 7;
    const max = 23;
    const factor = (data.districtsCount - min) / (max - min);
    return interpolateColor('#fef08a', '#c2410c', factor); // Light yellow to dark terracotta
  }

  return data.color;
}

/**
 * Calculates 3D extrusion height based on metric
 */
export function getProvinceExtrusionHeight(
  code: string,
  metric: ThematicMetric,
  is3DExtruded: boolean
): number {
  if (!is3DExtruded || metric === 'standard' || metric === 'region') {
    return 0.45; // Uniform aesthetic base height
  }

  const data = PROVINCES_DATA[code];
  if (!data) return 0.45;

  const baseHeight = 0.35;
  const maxHeight = 2.4;

  if (metric === 'population') {
    const min = 1160000;
    const max = 6950000;
    const ratio = (data.population2024 - min) / (max - min);
    return baseHeight + ratio * (maxHeight - baseHeight);
  }

  if (metric === 'density') {
    // Log scale for density
    const logMin = Math.log(15);
    const logMax = Math.log(3500);
    const ratio = (Math.log(data.density2024) - logMin) / (logMax - logMin);
    return baseHeight + ratio * (maxHeight - baseHeight);
  }

  if (metric === 'area') {
    const min = 347;
    const max = 129056;
    const ratio = Math.sqrt(data.areaKm2 - min) / Math.sqrt(max - min);
    return baseHeight + ratio * (maxHeight - baseHeight);
  }

  if (metric === 'districts') {
    const min = 7;
    const max = 23;
    const ratio = (data.districtsCount - min) / (max - min);
    return baseHeight + ratio * (maxHeight - baseHeight);
  }

  return 0.45;
}

export function formatMetricValue(value: number, metric: ThematicMetric): string {
  switch (metric) {
    case 'population':
      return new Intl.NumberFormat('pt-MZ').format(value) + ' hab.';
    case 'density':
      return value.toFixed(1).replace('.', ',') + ' hab/km²';
    case 'area':
      return new Intl.NumberFormat('pt-MZ').format(value) + ' km²';
    case 'districts':
      return value + ' distritos';
    default:
      return '';
  }
}
