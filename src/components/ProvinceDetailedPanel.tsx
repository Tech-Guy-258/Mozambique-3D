import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Search,
  MapPin,
  FileText,
  Compass,
  CheckCircle2,
  TreePine,
  Shield,
  Share2,
  ChevronRight,
  ChevronLeft,
  Building2,
  TrendingUp,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { PROVINCES_DATA } from '../data/provincesData.ts';
import { ALL_DISTRICTS_DATA } from '../data/allDistrictsData.ts';
import { PROVINCIAL_DOSSIERS } from '../data/provincialDossiersData.ts';
import { DistrictData } from '../types/index.ts';

interface ProvinceDetailedPanelProps {
  provinceId: string;
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string | null) => void;
  onReturnToNational: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ProvinceDetailedPanel: React.FC<ProvinceDetailedPanelProps> = ({
  provinceId,
  selectedDistrictId,
  onSelectDistrict,
  onReturnToNational,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'distritos' | 'economia' | 'turismo' | 'infraestruturas' | 'indicadores'>('distritos');
  const [districtSearch, setDistrictSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const province = PROVINCES_DATA[provinceId] || PROVINCES_DATA['07'];
  const dossier = PROVINCIAL_DOSSIERS[provinceId] || PROVINCIAL_DOSSIERS['07'];

  // Filter districts belonging to this province
  const districtsList = Object.values(ALL_DISTRICTS_DATA).filter(
    (d) => d.provinceId === provinceId
  );

  const selectedDistrict: DistrictData | null = selectedDistrictId
    ? ALL_DISTRICTS_DATA[selectedDistrictId] ?? null
    : null;

  const filteredDistricts = districtsList.filter(
    (d) =>
      d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.headquarters.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleShareOrCopy = () => {
    const text = `${province.officialName} - Moçambique (Dados Oficiais INE/MOZGIS)
Capital: ${province.capital} | Superfície: ${new Intl.NumberFormat('pt-MZ').format(province.areaKm2)} km²
População (2024 Proj.): ${new Intl.NumberFormat('pt-MZ').format(province.population2024)} hab. | Censo 2017: ${new Intl.NumberFormat('pt-MZ').format(province.population2017)} hab.
Distritos (${districtsList.length}): ${districtsList.map((d) => d.name).join(', ')}
Eixo Económico: ${province.economicProfile.primaryActivities.join(', ')}
Fontes: INE Moçambique, MOZGIS MAEFP e Visit Mozambique (INATUR).`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = province.color || '#f97316';

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed top-24 right-3 sm:right-5 z-40 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl px-3.5 py-2.5 backdrop-blur-md flex items-center gap-2.5 text-xs font-bold text-sky-400 hover:text-white cursor-pointer hover:border-sky-500/60 transition-all group"
        title="Expandir Painel da Província"
      >
        <ChevronLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ backgroundColor: accentColor }}
        />
        <span>Painel: {province.name} {selectedDistrict ? `• ${selectedDistrict.name}` : `(${districtsList.length} Distritos)`}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[500px] max-w-full bg-slate-900/95 backdrop-blur-md border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 transition-transform duration-300">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={onReturnToNational}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm cursor-pointer"
            title="Voltar ao mapa geral de Moçambique"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mapa Nacional</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareOrCopy}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer"
              title={`Copiar síntese de ${province.name}`}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer"
                title="Recolher painel (Ver mapa 3D completo)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onReturnToNational}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer"
              title="Fechar vista 3D provincial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {province.name}
            </h2>
            <span className="text-[10px] font-mono bg-sky-950/80 text-sky-400 border border-sky-800 px-1.5 py-0.5 rounded font-bold">
              Cod. {province.id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Região {province.region} • Capital: <strong className="text-slate-200">{province.capital}</strong> • {new Intl.NumberFormat('pt-MZ').format(province.areaKm2)} km²
          </p>
        </div>

        {/* Special Official Portal Button for Tete */}
        {province.id === '07' && (
          <div className="mt-3">
            <a
              href="https://ciit2026.diva.co.mz/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-950/40 flex items-center justify-between gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] border border-amber-300/80 group"
              title="Aceder ao portal oficial da Conferência Internacional de Investimentos de Tete (CIIT 2026)"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform flex-shrink-0" />
                <span className="uppercase tracking-wider font-extrabold text-[12px]">Visite Tete</span>
                <span className="text-[10px] font-bold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded">
                  CIIT 2026
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-950">
                <span className="hidden sm:inline font-mono">ciit2026.diva.co.mz</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
              </div>
            </a>
          </div>
        )}

        {/* Quick Numbers */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
          <div className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">População '24</span>
            <span className="text-xs font-bold text-white block">
              {(province.population2024 / 1_000_000).toFixed(2)} M hab.
            </span>
            <span className="text-[9px] text-slate-500">INE Proj.</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Censo 2017</span>
            <span className="text-xs font-bold text-slate-200 block">
              {new Intl.NumberFormat('pt-MZ').format(province.population2017)}
            </span>
            <span className="text-[9px] text-slate-500">Definitivo</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Distritos 3D</span>
            <span className="text-xs font-bold text-sky-400 block">
              {districtsList.length} Distritos
            </span>
            <span className="text-[9px] text-slate-500">MOZGIS Layer 2</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 px-3 bg-slate-900 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('distritos')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === 'distritos'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Distritos ({districtsList.length})
        </button>
        <button
          onClick={() => setActiveTab('economia')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === 'economia'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Economia & Recursos
        </button>
        <button
          onClick={() => setActiveTab('turismo')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === 'turismo'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Turismo & Cultura
        </button>
        <button
          onClick={() => setActiveTab('infraestruturas')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === 'infraestruturas'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Infraestruturas
        </button>
        <button
          onClick={() => setActiveTab('indicadores')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === 'indicadores'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Metadados INE
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs text-slate-300">
        {/* TAB 1: DISTRITOS */}
        {activeTab === 'distritos' && (
          <div className="space-y-3">
            {/* Selected District Highlight Card if any */}
            {selectedDistrict ? (
              <div className="p-4 bg-sky-950/40 border border-sky-500/60 rounded-xl space-y-2.5 shadow-xl animate-fadeIn">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 font-semibold uppercase">
                      Distrito Focado no 3D • Cod. {selectedDistrict.code}
                    </span>
                    <h3 className="text-lg font-bold text-white">{selectedDistrict.name}</h3>
                    <p className="text-slate-400 text-xs">
                      Sede: <strong className="text-slate-200">{selectedDistrict.headquarters}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectDistrict(null)}
                    className="text-xs text-slate-400 hover:text-white p-1 cursor-pointer"
                    title="Desmarcar distrito"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-sky-900/50">
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">População 2017</span>
                    <span className="font-bold text-white text-xs">
                      {new Intl.NumberFormat('pt-MZ').format(selectedDistrict.population2017)}
                    </span>
                    <span className="text-[9px] text-slate-500">INE Censo</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Área Territorial</span>
                    <span className="font-bold text-white text-xs">
                      {new Intl.NumberFormat('pt-MZ').format(selectedDistrict.areaKm2)} km²
                    </span>
                    <span className="text-[9px] text-slate-500">MOZGIS</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Densidade</span>
                    <span className="font-bold text-sky-400 text-xs">
                      {(selectedDistrict.density2017 ?? selectedDistrict.density ?? (selectedDistrict.population2017 / Math.max(1, selectedDistrict.areaKm2))).toFixed(1)} hab/km²
                    </span>
                    <span className="text-[9px] text-slate-500">hab/km²</span>
                  </div>
                </div>

                {selectedDistrict.administrativePosts && selectedDistrict.administrativePosts.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Postos Administrativos
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDistrict.administrativePosts.map((post, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] border border-slate-700 font-mono"
                        >
                          {post}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDistrict.economicHighlights && selectedDistrict.economicHighlights.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Destaques Económicos & Produtivos
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {selectedDistrict.economicHighlights.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {((selectedDistrict.tourismHighlights && selectedDistrict.tourismHighlights.length > 0) ||
                  (selectedDistrict.tourismAttractions && selectedDistrict.tourismAttractions.length > 0)) && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Património, Natureza & Cultura
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {(selectedDistrict.tourismHighlights || selectedDistrict.tourismAttractions || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 text-[10px] text-slate-500 border-t border-sky-900/50 flex items-center justify-between">
                  <span>Fontes: {selectedDistrict.sources?.demographics || 'INE Moçambique'}</span>
                  <button
                    onClick={() => onSelectDistrict(null)}
                    className="text-sky-400 hover:underline cursor-pointer"
                  >
                    Ver todos os distritos
                  </button>
                </div>
              </div>
            ) : null}

            {/* District Search & List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Distritos Oficiais da Província ({filteredDistricts.length})
                </span>
                <span className="text-[10px] text-slate-500">Clique para focar no mapa 3D</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar distrito ou sede..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-1.5 max-h-96 overflow-y-auto pr-1">
                {filteredDistricts.map((dist) => {
                  const isSelected = selectedDistrictId === dist.code;
                  return (
                    <button
                      key={dist.code}
                      onClick={() => onSelectDistrict(isSelected ? null : dist.code)}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-sky-950/70 border-sky-500 text-white shadow-md'
                          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-850 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white group-hover:text-sky-300">
                            {dist.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{dist.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Sede: {dist.headquarters} • {new Intl.NumberFormat('pt-MZ').format(dist.areaKm2)} km²
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-200 block">
                          {new Intl.NumberFormat('pt-MZ').format(dist.population2017)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">hab.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ECONOMIA */}
        {activeTab === 'economia' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                Visão Geral Económica
              </span>
              <p className="text-slate-300 leading-relaxed">
                {province.economicProfile.overview}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                Sectores e Recursos Estratégicos
              </span>
              <div className="grid grid-cols-1 gap-2">
                {province.economicProfile.keyResources.map((res, i) => (
                  <div key={i} className="p-2.5 bg-slate-800/40 border border-slate-700/60 rounded-lg flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200 block">{res}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                Actividades Primárias
              </span>
              <div className="flex flex-wrap gap-1.5">
                {province.economicProfile.primaryActivities.map((act, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs">
                    {act}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TURISMO E PATRIMÓNIO */}
        {activeTab === 'turismo' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Património natural, reservas, monumentos e manifestações culturais de {province.name}.
            </p>

            <div className="space-y-2.5">
              {dossier.tourismHeritage.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.location}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                  <span className="text-[9px] text-slate-500 block pt-1 border-t border-slate-800">
                    Fonte: {item.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INFRAESTRUTURAS */}
        {activeTab === 'infraestruturas' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              Infraestruturas Estratégicas de {province.name}
            </span>

            <div className="space-y-2">
              {dossier.infrastructures.map((inf, i) => (
                <div key={i} className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{inf.name}</h4>
                    <span className="text-[9px] font-mono bg-slate-700 px-1.5 py-0.5 rounded text-sky-300">
                      {inf.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{inf.description}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-850/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Corredores Rodoviários & Acesso
              </span>
              <ul className="space-y-1 text-slate-300 text-xs">
                {province.economicProfile.majorInfrastructure.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 5: INDICADORES E METADADOS */}
        {activeTab === 'indicadores' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
              Indicadores Oficiais MAEFP & INE
            </span>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-800/40">
              {dossier.indicators.map((ind) => (
                <div key={ind.id} className="p-2.5 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">{ind.label}</span>
                    <span className="font-bold text-white text-xs">{ind.formattedValue}</span>
                  </div>
                  {ind.notes && (
                    <span className="text-[10px] text-slate-500 italic">{ind.notes}</span>
                  )}
                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                    <span>Ano ref.: {ind.referenceYear}</span>
                    <span>Fonte: {ind.source.split('-')[0].trim()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
