import * as THREE from 'three';
import { GeoJSONFeature, GeoJSONGeometry, GeoJSONRing } from '../types/index.ts';

// Central point of Mozambique
export const MOZ_CENTER_LON = 35.5;
export const MOZ_CENTER_LAT = -18.65;
export const GEO_SCALE = 2.2;

/**
 * Projects WGS84 lon/lat into 2D plane coordinates centered at Mozambique center
 */
export function projectLonLat(lon: number, lat: number): [number, number] {
  const x = (lon - MOZ_CENTER_LON) * GEO_SCALE;
  // Note: latitude increases northwards, which corresponds to positive Y in 2D shape
  const y = (lat - MOZ_CENTER_LAT) * GEO_SCALE;
  return [x, y];
}

/**
 * Calculates signed area of a 2D ring to check orientation
 */
export function ringSignedArea(ring: GeoJSONRing): number {
  let area = 0;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1];
  }
  return area / 2;
}

/**
 * Converts a GeoJSON geometry (Polygon or MultiPolygon) into Three.js Shapes
 */
export function convertGeometryToShapes(geometry: GeoJSONGeometry): THREE.Shape[] {
  const shapes: THREE.Shape[] = [];

  const processPolygon = (rings: GeoJSONRing[]) => {
    if (!rings || rings.length === 0) return;

    // First ring is exterior ring
    const exterior = rings[0];
    if (!exterior || exterior.length < 3) return;

    const shape = new THREE.Shape();
    const [startX, startY] = projectLonLat(exterior[0][0], exterior[0][1]);
    shape.moveTo(startX, startY);

    for (let i = 1; i < exterior.length; i++) {
      const [x, y] = projectLonLat(exterior[i][0], exterior[i][1]);
      shape.lineTo(x, y);
    }
    shape.closePath();

    // Subsequent rings are holes
    for (let h = 1; h < rings.length; h++) {
      const holeRing = rings[h];
      if (!holeRing || holeRing.length < 3) continue;

      const holePath = new THREE.Path();
      const [hStartX, hStartY] = projectLonLat(holeRing[0][0], holeRing[0][1]);
      holePath.moveTo(hStartX, hStartY);

      for (let i = 1; i < holeRing.length; i++) {
        const [hx, hy] = projectLonLat(holeRing[i][0], holeRing[i][1]);
        holePath.lineTo(hx, hy);
      }
      holePath.closePath();
      shape.holes.push(holePath);
    }

    shapes.push(shape);
  };

  if (geometry.type === 'Polygon') {
    processPolygon(geometry.coordinates as GeoJSONRing[]);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygonRings of geometry.coordinates) {
      processPolygon(polygonRings as GeoJSONRing[]);
    }
  }

  return shapes;
}

/**
 * Computes centroid and bounding box of a province feature in 3D world coordinates
 */
export function computeFeatureCentroidAndBounds(feature: GeoJSONFeature): {
  centroid: [number, number, number]; // [X, Y, Z]
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
} {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const sampleRing = (ring: GeoJSONRing) => {
    for (const pt of ring) {
      const [x, y] = projectLonLat(pt[0], pt[1]);
      sumX += x;
      sumY += y;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  };

  if (feature.geometry.type === 'Polygon') {
    if (feature.geometry.coordinates[0]) {
      sampleRing(feature.geometry.coordinates[0]);
    }
  } else if (feature.geometry.type === 'MultiPolygon') {
    // For MultiPolygon, weigh towards the largest polygon (mainland)
    let maxRingPoints = 0;
    let mainRing: GeoJSONRing | null = null;
    for (const poly of feature.geometry.coordinates) {
      if (poly[0] && poly[0].length > maxRingPoints) {
        maxRingPoints = poly[0].length;
        mainRing = poly[0];
      }
    }
    if (mainRing) {
      sampleRing(mainRing);
    }
  }

  const avgX = count > 0 ? sumX / count : 0;
  const avgY = count > 0 ? sumY / count : 0;

  // In 3D: shape X -> world X, shape Y -> world -Z, and elevation -> world Y
  return {
    centroid: [avgX, 0.4, -avgY],
    bounds: {
      minX: minX === Infinity ? -10 : minX,
      maxX: maxX === -Infinity ? 10 : maxX,
      minZ: -maxY === -Infinity ? -10 : -maxY,
      maxZ: -minY === Infinity ? 10 : -minY,
    },
  };
}
