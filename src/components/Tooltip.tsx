import React from 'react';
import { PROVINCES_DATA } from '../data/provincesData.ts';
import { ThematicMetric } from '../types/index.ts';
import { getThematicColor } from '../utils/thematicColor.ts';

interface TooltipProps {
  provinceId: string | null;
  position: { x: number; y: number } | null;
  thematicMetric: ThematicMetric;
}

export const Tooltip: React.FC<TooltipProps> = ({ provinceId, position, thematicMetric }) => {
  if (!provinceId || !position) return null;

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
          <span className="text-sky-400 font-medium">Clique para abrir ficha</span>
        </div>
      </div>
    </div>
  );
};
