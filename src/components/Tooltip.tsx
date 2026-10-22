import { PROVINCES_DATA } from '../data/provincesData.ts';
import { ALL_DISTRICTS_DATA } from '../data/allDistrictsData.ts';
import { ThematicMetric } from '../types/index.ts';
import { getThematicColor } from '../utils/thematicColor.ts';

interface TooltipProps {
  provinceId: string | null;
  districtId?: string | null;
  position: { x: number; y: number } | null;
  thematicMetric: ThematicMetric;
}

export const Tooltip: React.FC<TooltipProps> = ({
  provinceId,
  districtId,
  position,
  thematicMetric,
}) => {
  if (!position) return null;

  // District Tooltip when inspecting any province
  if (districtId) {
    const district = ALL_DISTRICTS_DATA[districtId];
    if (!district) return null;

    return (
      <div
        className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full pb-3 transition-opacity duration-150"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        <div className="bg-slate-900/95 border border-orange-500/80 rounded-xl shadow-2xl p-3 text-white min-w-[220px] backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-800">
            <span className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-500" />
            <h4 className="font-semibold text-sm tracking-wide text-slate-100">{district.name}</h4>
            <span className="ml-auto text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-orange-400">
              Cod. {district.code}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Sede</span>
              <span className="font-medium text-slate-200">{district.headquarters}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">População (Censo 2017)</span>
              <span className="font-medium text-slate-200">
                {new Intl.NumberFormat('pt-MZ').format(district.population2017)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Área Territorial</span>
              <span className="font-medium text-slate-200">
                {new Intl.NumberFormat('pt-MZ').format(district.areaKm2)} km²
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Densidade</span>
              <span className="font-medium text-orange-400">
                {(district.density2017 ?? district.density ?? (district.population2017 / Math.max(1, district.areaKm2))).toFixed(1).replace('.', ',')} hab/km²
              </span>
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>{district.administrativePosts.length} postos adm.</span>
            <span className="text-orange-400 font-medium">Clique para ver detalhes</span>
          </div>
        </div>
      </div>
    );
  }

  // Provincial Tooltip
  if (!provinceId) return null;

  const data = PROVINCES_DATA[provinceId];
  if (!data) return null;

  const themeColor = getThematicColor(provinceId, thematicMetric);

  return (
    <div
      className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full pb-3 transition-opacity duration-150"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl p-3 text-white min-w-[210px] backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-800">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          />
          <h4 className="font-semibold text-sm tracking-wide text-slate-100">{data.name}</h4>
          <span className="ml-auto text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
            {data.region}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Capital</span>
            <span className="font-medium text-slate-200">{data.capital}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">População (2024)</span>
            <span className="font-medium text-slate-200">
              {new Intl.NumberFormat('pt-MZ').format(data.population2024)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Área Territorial</span>
            <span className="font-medium text-slate-200">
              {new Intl.NumberFormat('pt-MZ').format(data.areaKm2)} km²
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Densidade</span>
            <span className="font-medium text-sky-400">
              {data.density2024.toFixed(1).replace('.', ',')} hab/km²
            </span>
          </div>
        </div>

        <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>{data.districtsCount} distritos</span>
          <span className="text-orange-400 font-semibold">
            {data.id === '07' ? 'Clique para abrir o Tete 3D Explorer' : 'Clique para abrir ficha'}
          </span>
        </div>
      </div>
    </div>
  );
};
