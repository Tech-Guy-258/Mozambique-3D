import { PROVINCES_DATA, MOZAMBIQUE_NATIONAL_STATS } from '../data/provincesData.ts';
import { GeoJSONFeatureCollection } from '../types/index.ts';

export function downloadGeoJSON(geoJson: GeoJSONFeatureCollection) {
  const jsonStr = JSON.stringify(geoJson, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mozambique_provincias_mozgis_wgs84_${new Date().toISOString().slice(0, 10)}.geojson`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSV() {
  const headers = [
    'Codigo_Provincial',
    'Nome_Provincia',
    'Nome_Oficial',
    'Capital_Provincial',
    'Regiao',
    'Area_km2',
    'Populacao_Censo_2017',
    'Populacao_Projecao_2024',
    'Densidade_2024_hab_km2',
    'Numero_Distritos',
    'Costa_Maritima',
    'Clima_Predominante',
    'Principais_Linguas',
    'Principais_Atividades_Economicas',
    'Recursos_Chave',
    'Fonte_Demografica',
    'Fonte_Geografica',
  ];

  const rows = Object.values(PROVINCES_DATA).map((p) => [
    `"${p.id}"`,
    `"${p.name}"`,
    `"${p.officialName}"`,
    `"${p.capital}"`,
    `"${p.region}"`,
    p.areaKm2,
    p.population2017,
    p.population2024,
    p.density2024.toFixed(1),
    p.districtsCount,
    p.coastline ? '"Sim"' : '"Não"',
    `"${p.climate}"`,
    `"${p.languages.join('; ')}"`,
    `"${p.economicProfile.primaryActivities.join('; ')}"`,
    `"${p.economicProfile.keyResources.join('; ')}"`,
    `"${p.sources.demographics}"`,
    `"${p.sources.geography}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mocambique_estatisticas_provincias_ine_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
