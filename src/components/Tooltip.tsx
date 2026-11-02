import { PROVINCES_DATA } from '../data/provincesData.ts';
import { ALL_DISTRICTS_DATA } from '../data/allDistrictsData.ts';
import { ThematicMetric, TransportRoute, TransportNode } from '../types/index.ts';
import { getThematicColor } from '../utils/thematicColor.ts';
import { TRANSPORT_LAYERS_CONFIG } from '../data/transportData.ts';
import { Navigation, Train, Anchor, Plane, Compass } from 'lucide-react';

interface TooltipProps {
  provinceId: string | null;
  districtId?: string | null;
  transportItem?: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null;
  position: { x: number; y: number } | null;
  thematicMetric: ThematicMetric;
}

export const Tooltip: React.FC<TooltipProps> = ({
  provinceId,
  districtId,
  transportItem,
  position,
  thematicMetric,
}) => {
  if (!position) return null;

  // Transport Item Tooltip (Highway, Railway, Port, Airport, Aerodrome)
  if (transportItem) {
    if (transportItem.type === 'route') {
      const route = transportItem.item as TransportRoute;
      const config = TRANSPORT_LAYERS_CONFIG[route.layer];

      return (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full pb-3 transition-opacity duration-150"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
          <div className="bg-slate-900/95 border border-amber-500/80 rounded-xl shadow-2xl p-3 text-white min-w-[240px] max-w-xs backdrop-blur-md">
            <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-800">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: route.color }}
              />
              <span className="font-bold text-sm tracking-wide text-white">{route.code}</span>
              <span className="ml-auto text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-semibold">
                {route.extentKm} km
              </span>
            </div>

            <p className="font-semibold text-xs text-slate-100">{route.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{route.operator}</p>

            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-medium">{route.status}</span>
              <span className="text-amber-400">Clique p/ detalhes</span>
            </div>
          </div>
        </div>
      );
    } else {
      const node = transportItem.item as TransportNode;
      const config = TRANSPORT_LAYERS_CONFIG[node.layer];

      return (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full pb-3 transition-opacity duration-150"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
          <div
            className="bg-slate-900/95 border rounded-xl shadow-2xl p-3 text-white min-w-[240px] max-w-xs backdrop-blur-md"
            style={{ borderColor: config.color }}
          >
            <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-800">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className="font-bold text-sm tracking-wide text-white">{node.code}</span>
              <span
                className="ml-auto text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold"
                style={{
                  backgroundColor: `${config.color}20`,
                  color: config.color,
                }}
              >
                {config.shortLabel}
              </span>
            </div>

            <p className="font-semibold text-xs text-slate-100">{node.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {node.provinceName} • {node.operator}
            </p>

            {node.runwayOrBerths && (
              <p className="text-[10px] text-sky-400 font-mono mt-1">
                {node.runwayOrBerths}
              </p>
            )}

            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 truncate">{node.category}</span>
              <span className="text-amber-400 font-medium flex-shrink-0">Ver ficha</span>
            </div>
          </div>
        </div>
      );
    }
  }

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
            {data.id === '07' ? 'Clique para abrir Tete 3D • Visite Tete' : 'Clique para abrir ficha'}
          </span>
        </div>
      </div>
    </div>
  );
};
