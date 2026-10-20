import React, { useState } from 'react';
import { X, ArrowRightLeft, Users, Maximize2, Layers } from 'lucide-react';
import { PROVINCES_DATA } from '../data/provincesData.ts';

interface ComparisonDrawerProps {
  initialProvinceIdA?: string;
  initialProvinceIdB?: string;
  onClose: () => void;
  onFocusProvince: (id: string) => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  initialProvinceIdA = '01', // Cidade de Maputo
  initialProvinceIdB = '02', // Maputo Província
  onClose,
  onFocusProvince,
}) => {
  const [provA, setProvA] = useState<string>(initialProvinceIdA);
  const [provB, setProvB] = useState<string>(
    initialProvinceIdB === initialProvinceIdA ? (initialProvinceIdA === '01' ? '02' : '01') : initialProvinceIdB
  );

  const dataA = PROVINCES_DATA[provA];
  const dataB = PROVINCES_DATA[provB];

  const allProvinces = Object.values(PROVINCES_DATA);

  const swapProvinces = () => {
    const temp = provA;
    setProvA(provB);
    setProvB(temp);
  };

  if (!dataA || !dataB) return null;

  // Max calculations for relative bars
  const maxPop = Math.max(dataA.population2024, dataB.population2024, 1);
  const maxArea = Math.max(dataA.areaKm2, dataB.areaKm2, 1);
  const maxDensity = Math.max(dataA.density2024, dataB.density2024, 1);
  const maxDistricts = Math.max(dataA.districtsCount, dataB.districtsCount, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Comparador Provincial de Moçambique</h3>
              <p className="text-xs text-slate-400">Análise comparativa direta baseada no Censo e dados do INE / MAEFP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-center">
          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Província A
            </label>
            <select
              value={provA}
              onChange={(e) => setProvA(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-lg p-2.5 focus:outline-none focus:border-sky-500 font-medium"
            >
              {allProvinces.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === provB}>
                  {p.name} ({p.region})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swapProvinces}
            className="self-center p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sky-400 transition-colors mx-auto"
            title="Inverter províncias"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Província B
            </label>
            <select
              value={provB}
              onChange={(e) => setProvB(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-lg p-2.5 focus:outline-none focus:border-sky-500 font-medium"
            >
              {allProvinces.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === provA}>
                  {p.name} ({p.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Province Titles and Action */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
                Região {dataA.region}
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">{dataA.name}</h4>
              <p className="text-xs text-slate-400">Capital: {dataA.capital}</p>
              <button
                onClick={() => {
                  onFocusProvince(dataA.id);
                  onClose();
                }}
                className="mt-2 text-[11px] text-sky-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Focar no 3D ↗
              </button>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                Região {dataB.region}
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">{dataB.name}</h4>
              <p className="text-xs text-slate-400">Capital: {dataB.capital}</p>
              <button
                onClick={() => {
                  onFocusProvince(dataB.id);
                  onClose();
                }}
                className="mt-2 text-[11px] text-amber-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Focar no 3D ↗
              </button>
            </div>
          </div>

          {/* Metric: População 2024 */}
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" /> População Estimada (INE 2024)
              </span>
              <span className="text-[10px] text-slate-500">
                Dif: {new Intl.NumberFormat('pt-MZ').format(Math.abs(dataA.population2024 - dataB.population2024))} hab.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{new Intl.NumberFormat('pt-MZ').format(dataA.population2024)}</span>
                  <span className="text-slate-400">{((dataA.population2024 / maxPop) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dataA.population2024 / maxPop) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{new Intl.NumberFormat('pt-MZ').format(dataB.population2024)}</span>
                  <span className="text-slate-400">{((dataB.population2024 / maxPop) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dataB.population2024 / maxPop) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metric: Área Territorial */}
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-emerald-400" /> Área Territorial (km²)
              </span>
              <span className="text-[10px] text-slate-500">
                Dif: {new Intl.NumberFormat('pt-MZ').format(Math.abs(dataA.areaKm2 - dataB.areaKm2))} km²
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{new Intl.NumberFormat('pt-MZ').format(dataA.areaKm2)} km²</span>
                  <span className="text-slate-400">{((dataA.areaKm2 / maxArea) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dataA.areaKm2 / maxArea) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{new Intl.NumberFormat('pt-MZ').format(dataB.areaKm2)} km²</span>
                  <span className="text-slate-400">{((dataB.areaKm2 / maxArea) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dataB.areaKm2 / maxArea) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metric: Densidade Populacional */}
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" /> Densidade Populacional (hab/km²)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-sky-400">{dataA.density2024.toFixed(1)} hab/km²</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dataA.density2024 / maxDensity) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-400">{dataB.density2024.toFixed(1)} hab/km²</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dataB.density2024 / maxDensity) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metric: Distritos Oficiais */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Distritos Oficiais</span>
              <span className="text-xl font-bold text-white">{dataA.districtsCount}</span>
              <span className="text-slate-500 text-[11px] block mt-1 truncate">
                {dataA.districtsList.slice(0, 3).join(', ')}...
              </span>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Distritos Oficiais</span>
              <span className="text-xl font-bold text-white">{dataB.districtsCount}</span>
              <span className="text-slate-500 text-[11px] block mt-1 truncate">
                {dataB.districtsList.slice(0, 3).join(', ')}...
              </span>
            </div>
          </div>

          {/* Economic highlights comparison */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span className="text-sky-400 font-semibold block mb-1.5 uppercase text-[10px] tracking-wider">
                Recursos Principais ({dataA.name})
              </span>
              <ul className="space-y-1 text-slate-300">
                {dataA.economicProfile.keyResources.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-sky-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-semibold block mb-1.5 uppercase text-[10px] tracking-wider">
                Recursos Principais ({dataB.name})
              </span>
              <ul className="space-y-1 text-slate-300">
                {dataB.economicProfile.keyResources.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Fechar Comparação
          </button>
        </div>
      </div>
    </div>
  );
};
