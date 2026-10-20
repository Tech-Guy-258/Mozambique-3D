import { GeoJSONFeatureCollection, GeoJSONFeature, GeoJSONRing } from '../types/index.ts';
import { DEFAULT_MOZGIS_GEOJSON } from '../data/mozgisGeoJson.ts';

export const MOZGIS_ENDPOINT =
  'https://www.mozgis.gov.mz/server/rest/services/Data/Divis%C3%A3o_Administrativa_MAEFP/MapServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson';

function pointLineDistance(point: [number, number], start: [number, number], end: [number, number]): number {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) {
    return Math.hypot(point[0] - start[0], point[1] - start[1]);
  }
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy));
}

function douglasPeucker(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length <= 2) return points;
  let dmax = 0;
  let idx = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = pointLineDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax > tolerance) {
    const left = douglasPeucker(points.slice(0, idx + 1), tolerance);
    const right = douglasPeucker(points.slice(idx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[end]];
}

function simplifyRing(ring: [number, number][], tolerance: number): [number, number][] {
  if (ring.length < 4) return ring;
  const pts =
    ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;
  if (pts.length < 4) return ring;

  let dmax = 0;
  let farIdx = Math.floor(pts.length / 2);
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > dmax) {
      dmax = d;
      farIdx = i;
    }
  }

  const p1 = pts.slice(0, farIdx + 1);
  const p2 = pts.slice(farIdx).concat([pts[0]]);
  const s1 = douglasPeucker(p1, tolerance);
  const s2 = douglasPeucker(p2, tolerance);
  const res = s1.slice(0, -1).concat(s2);
  res.push(res[0]);
  return res.map((p) => [Math.round(p[0] * 100000) / 100000, Math.round(p[1] * 100000) / 100000]);
}

/**
 * Fetches official boundaries live from MOZGIS MAEFP endpoint
 */
export async function syncLiveMozgisData(): Promise<{
  success: boolean;
  data: GeoJSONFeatureCollection;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(MOZGIS_ENDPOINT, {
      signal: controller.signal,
      headers: {
        Accept: 'application/geo+json, application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Servidor MOZGIS respondeu com status: ${response.status} ${response.statusText}`);
    }

    const rawGj = await response.json();
    if (!rawGj.features || rawGj.features.length === 0) {
      throw new Error('Nenhuma feição geográfica encontrada na resposta do MOZGIS.');
    }

    // Process and optimize geometries for 3D extrusion
    const processedFeatures: GeoJSONFeature[] = rawGj.features.map((feat: any) => {
      const props = feat.properties || {};
      const provName = props.Provincia || '';
      const tol = provName === 'Cidade de Maputo' ? 0.001 : 0.004;

      const newGeom: any = { type: feat.geometry.type };

      if (feat.geometry.type === 'Polygon') {
        newGeom.coordinates = (feat.geometry.coordinates as [number, number][][]).map((r) =>
          simplifyRing(r, tol)
        );
      } else if (feat.geometry.type === 'MultiPolygon') {
        newGeom.coordinates = (feat.geometry.coordinates as [number, number][][][]).map((poly) =>
          poly.map((r) => simplifyRing(r, tol))
        );
      }

      return {
        type: 'Feature',
        id: props.CodProv || String(feat.id),
        properties: props,
        geometry: newGeom,
      };
    });

    const optimizedCollection: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      source: 'MOZGIS MAEFP - Sincronizado ao Vivo',
      sourceUrl: MOZGIS_ENDPOINT,
      crs: 'WGS84 EPSG:4326',
      features: processedFeatures,
    };

    return {
      success: true,
      data: optimizedCollection,
    };
  } catch (err: any) {
    console.warn('Falha na sincronização ao vivo com MOZGIS, mantendo dados base oficiais:', err);
    return {
      success: false,
      data: DEFAULT_MOZGIS_GEOJSON,
      error: err.message || 'Erro de rede ao contactar https://www.mozgis.gov.mz',
    };
  }
}
