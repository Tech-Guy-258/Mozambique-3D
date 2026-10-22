import React, { useState } from 'react';
import {
  X,
  Search,
  MapPin,
  Users,
  Globe,
  Building2,
  Flame,
  Mountain,
  FileText,
  Check,
  ArrowRightLeft,
  ChevronRight,
  ChevronLeft,
  Compass,
} from 'lucide-react';
import { ProvinceData } from '../types/index.ts';

interface ProvinceDetailDrawerProps {
  province: ProvinceData | null;
  onClose: () => void;
  onOpenCompare: (provinceId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onExploreProvince?: (provinceId: string) => void;
}

export const ProvinceDetailDrawer: React.FC<ProvinceDetailDrawerProps> = ({
  province,
  onClose,
  onOpenCompare,
  isCollapsed = false,
  onToggleCollapse,
  onExploreProvince,
}) => {
  const [districtSearch, setDistrictSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'economia' | 'distritos' | 'fontes'>('geral');

  if (!province) return null;

  const filteredDistricts = province.districtsList.filter((d) =>
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleCopySummary = () => {
    const summary = `${province.officialName} (${province.region})
Capital: ${province.capital}
População (2024): ${new Intl.NumberFormat('pt-MZ').format(province.population2024)} hab.
População (Censo 2017): ${new Intl.NumberFormat('pt-MZ').format(province.population2017)} hab.
Área: ${new Intl.NumberFormat('pt-MZ').format(province.areaKm2)} km²
Densidade: ${province.density2024.toFixed(1)} hab/km²
Distritos (${province.districtsCount}): ${province.districtsList.join(', ')}
Fonte: INE Moçambique & MAEFP MOZGIS`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed top-24 right-3 sm:right-5 z-40 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl px-3.5 py-2.5 backdrop-blur-md flex items-center gap-2.5 text-xs font-bold text-sky-400 hover:text-white cursor-pointer hover:border-sky-500/60 transition-all group"
        title="Expandir Dossier da Província"
      >
        <ChevronLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ backgroundColor: province.color }}
        />
        <span>Dossier: {province.name}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] max-w-full bg-slate-900/95 backdrop-blur-md border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 transition-transform duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block"
              style={{ backgroundColor: province.color }}
            />
            <span className="text-xs font-mono tracking-wider uppercase text-sky-400 font-semibold">
              Região {province.region} • Cod. {province.id}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{province.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{province.officialName}</p>
        </div>
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Recolher dossier (Ver mapa completo)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Fechar dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {onExploreProvince && (
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => onExploreProvince(province.id)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] border border-sky-400/40"
          >
            <Compass className="w-4 h-4 text-sky-200" />
            <span>Explorar {province.name} em 3D ({province.districtsCount} Distritos)</span>
          </button>
        </div>
      )}

      {/* Special distinction notice for Maputo */}
      {province.id === '01' && (
        <div className="mx-4 mt-3 p-3 bg-sky-950/40 border border-sky-800/60 rounded-lg text-xs text-sky-200">
          <p className="font-semibold text-sky-300 mb-0.5">Estatuto Especial da Capital:</p>
          A Cidade de Maputo é uma província autónoma e sede de governo, não pertencendo administrativamente à Província de Maputo (cuja capital é a Matola).
        </div>
      )}
      {province.id === '02' && (
        <div className="mx-4 mt-3 p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg text-xs text-blue-200">
          <p className="font-semibold text-blue-300 mb-0.5">Sede Provincial da Matola:</p>
          A Província de Maputo envolve territorialmente a Cidade de Maputo e tem como sede provincial o Município da Matola.
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 p-4 bg-slate-950/40 border-b border-slate-800/80 text-center">
        <div className="p-2 rounded bg-slate-800/50">
          <span className="text-[10px] text-slate-400 block uppercase">População '24</span>
          <span className="text-sm font-bold text-white block truncate">
            {(province.population2024 / 1_000_000).toFixed(2)} M
          </span>
          <span className="text-[9px] text-slate-500">INE Proj.</span>
        </div>
        <div className="p-2 rounded bg-slate-800/50">
          <span className="text-[10px] text-slate-400 block uppercase">Área Total</span>
          <span className="text-sm font-bold text-white block truncate">
            {new Intl.NumberFormat('pt-MZ').format(province.areaKm2)}
          </span>
          <span className="text-[9px] text-slate-500">km²</span>
        </div>
        <div className="p-2 rounded bg-slate-800/50">
          <span className="text-[10px] text-slate-400 block uppercase">Densidade</span>
          <span className="text-sm font-bold text-sky-400 block truncate">
            {province.density2024.toFixed(1)}
          </span>
          <span className="text-[9px] text-slate-500">hab/km²</span>
        </div>
        <div className="p-2 rounded bg-slate-800/50">
          <span className="text-[10px] text-slate-400 block uppercase">Distritos</span>
          <span className="text-sm font-bold text-white block">
            {province.districtsCount}
          </span>
          <span className="text-[9px] text-slate-500">Oficiais</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 px-4 bg-slate-900">
        <button
          onClick={() => setActiveTab('geral')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'geral'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('economia')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'economia'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Economia & Recursos
        </button>
        <button
          onClick={() => setActiveTab('distritos')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'distritos'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Distritos ({province.districtsCount})
        </button>
        <button
          onClick={() => setActiveTab('fontes')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'fontes'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Metadados
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-slate-300">
        {activeTab === 'geral' && (
          <>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Resumo Territorial
              </h4>
              <p className="text-xs leading-relaxed text-slate-200 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                {province.economicProfile.overview}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> Capital Provincial
                </span>
                <span className="font-semibold text-slate-100 text-sm">{province.capital}</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Costa Marítima
                </span>
                <span className="font-semibold text-slate-100 text-sm">
                  {province.coastline ? 'Província Costeira (Índico)' : 'Província Interior (Sem costa)'}
                </span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Censo Oficial 2017
                </span>
                <span className="font-semibold text-slate-100 text-sm">
                  {new Intl.NumberFormat('pt-MZ').format(province.population2017)} hab.
                </span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5 flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-purple-400" /> Ponto Culminante
                </span>
                <span className="font-semibold text-slate-100 text-xs">
                  {province.highestPoint ? `${province.highestPoint.name} (${province.highestPoint.altitudeMeters} m)` : 'Planície litoral'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Línguas Nacionais e Expressão Cultural
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {province.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200 font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Clima Predominante
              </h4>
              <p className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                {province.climate}
              </p>
            </div>
          </>
        )}

        {activeTab === 'economia' && (
          <>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sky-400" /> Principais Atividades Económicas
              </h4>
              <div className="space-y-1.5">
                {province.economicProfile.primaryActivities.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span className="text-slate-200">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> Recursos Naturais & Energéticos
              </h4>
              <div className="space-y-1.5">
                {province.economicProfile.keyResources.map((res, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-slate-200">{res}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" /> Infraestruturas Estratégicas
              </h4>
              <div className="space-y-1.5">
                {province.economicProfile.majorInfrastructure.map((inf, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-200">{inf}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'distritos' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar distritos..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="text-xs text-slate-400 flex justify-between">
              <span>{filteredDistricts.length} de {province.districtsCount} distritos listados</span>
              <span className="text-slate-500">Divisão MAEFP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDistricts.map((d, index) => (
                <div
                  key={index}
                  className="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-medium text-slate-200">{d}</span>
                  {d.includes('Capital') && (
                    <span className="text-[10px] bg-sky-900/60 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">
                      Sede
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fontes' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <FileText className="w-4 h-4 text-sky-400" />
                Fontes Oficiais Verificadas
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Demografia e População:</span>
                <p className="text-slate-300 mt-0.5">{province.sources.demographics}</p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-medium">Fronteiras Geoespaciais:</span>
                <p className="text-slate-300 mt-0.5">{province.sources.geography}</p>
                <a
                  href="https://www.mozgis.gov.mz/server/rest/services/Data/Divis%C3%A3o_Administrativa_MAEFP/MapServer/0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline mt-1 inline-block"
                >
                  MOZGIS Divisão Administrativa MAEFP / MapServer 0 ↗
                </a>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-medium">Anos de Referência:</span>
                <p className="text-slate-300 mt-0.5">{province.sources.referenceYears}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/20 border border-slate-800 rounded-lg text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Rigor de Dados:</span>
              Nenhum dado é inventado ou extrapolado arbitrariamente. Caso um indicador micro-distrital não esteja disponível nas publicações públicas do INE/MAEFP, ele é omitido ou classificado como indisponível.
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCompare(province.id)}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Comparar Província
          </button>

          <button
            onClick={handleCopySummary}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            title="Copiar resumo textual"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" /> Copiar Ficha
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
