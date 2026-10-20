import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Search,
  Zap,
  Pickaxe,
  Waves,
  MapPin,
  Calendar,
  Layers,
  FileText,
  Compass,
  CheckCircle2,
  TreePine,
  Shield,
  Utensils,
  Share2,
} from 'lucide-react';
import {
  TETE_PROVINCE_INDICATORS,
  TETE_DISTRICTS_DATA,
  TETE_TOURISM_HERITAGE,
  TETE_INFRASTRUCTURES,
  TETE_SOURCES,
} from '../data/teteData.ts';
import { DistrictData } from '../types/index.ts';

interface TeteDetailedPanelProps {
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string | null) => void;
  onReturnToNational: () => void;
}

export const TeteDetailedPanel: React.FC<TeteDetailedPanelProps> = ({
  selectedDistrictId,
  onSelectDistrict,
  onReturnToNational,
}) => {
  const [activeTab, setActiveTab] = useState<'distritos' | 'economia' | 'turismo' | 'infraestruturas' | 'indicadores'>('distritos');
  const [districtSearch, setDistrictSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const districtsList = Object.values(TETE_DISTRICTS_DATA);
  const selectedDistrict: DistrictData | null = selectedDistrictId
    ? TETE_DISTRICTS_DATA[selectedDistrictId] ?? null
    : null;

  const filteredDistricts = districtsList.filter(
    (d) =>
      d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.headquarters.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleShareOrCopy = () => {
    const text = `Província de Tete - Moçambique (Dados Oficiais INE/MOZGIS)
Capital: Cidade de Tete | Superfície: 100.724 km²
População (2024 Proj.): 3.210.000 hab. | Censo 2017: 2.764.169 hab.
Eixo Económico: HCB Cahora Bassa (2.075 MW), Bacia Carbonífera de Moatize, Celeiro de Angónia
Património: Albufeira de Cahora Bassa, Parque Nacional de Mágoè, Dança Gule Wamkulu (UNESCO), Cabrito de Tete
Fontes: INE Moçambique, MOZGIS MAEFP e Visit Mozambique (INATUR).`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[500px] max-w-full bg-slate-900/95 backdrop-blur-md border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 transition-transform duration-300">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={onReturnToNational}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
            title="Voltar à vista geral de Moçambique"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mapa Nacional</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareOrCopy}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              title="Copiar síntese de Tete"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onReturnToNational}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              title="Fechar vista detalhada"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Província de Tete
            </h2>
            <span className="text-[10px] font-mono bg-orange-950/80 text-orange-400 border border-orange-800 px-1.5 py-0.5 rounded font-bold">
              Cod. 07
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Vale do Zambeze • Capital: <strong>Cidade de Tete</strong> • 100.724 km²
          </p>
        </div>

        {/* Quick Numbers */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
          <div className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">População '24</span>
            <span className="text-xs font-bold text-white block">3,21 M hab.</span>
            <span className="text-[9px] text-slate-500">INE Proj.</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Censo 2017</span>
            <span className="text-xs font-bold text-slate-200 block">2.764.169</span>
            <span className="text-[9px] text-slate-500">Definitivo</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Distritos</span>
            <span className="text-xs font-bold text-orange-400 block">15 Oficiais</span>
            <span className="text-[9px] text-slate-500">14 MOZGIS</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 px-3 bg-slate-900 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('distritos')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'distritos'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Distritos ({districtsList.length})
        </button>
        <button
          onClick={() => setActiveTab('economia')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'economia'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Economia & Energia
        </button>
        <button
          onClick={() => setActiveTab('turismo')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'turismo'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Turismo & Património
        </button>
        <button
          onClick={() => setActiveTab('infraestruturas')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'infraestruturas'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Infraestruturas
        </button>
        <button
          onClick={() => setActiveTab('indicadores')}
          className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'indicadores'
              ? 'border-orange-500 text-orange-400'
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
              <div className="p-4 bg-orange-950/30 border border-orange-500/50 rounded-xl space-y-2.5 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-orange-400 font-semibold uppercase">
                      Distrito Selecionado no 3D • Cod. {selectedDistrict.code}
                    </span>
                    <h3 className="text-lg font-bold text-white">{selectedDistrict.name}</h3>
                    <p className="text-slate-400 text-xs">
                      Sede: <strong className="text-slate-200">{selectedDistrict.headquarters}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectDistrict(null)}
                    className="text-xs text-slate-400 hover:text-white p-1"
                    title="Desmarcar distrito"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-orange-900/50">
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
                    <span className="text-[9px] text-slate-500">MAEFP</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Densidade</span>
                    <span className="font-bold text-orange-400 text-xs">
                      {selectedDistrict.density2017.toFixed(1)} hab/km²
                    </span>
                  </div>
                </div>

                {/* Administrative Posts */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Postos Administrativos:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDistrict.administrativePosts.map((post, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-700"
                      >
                        {post}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Destaques Económicos & Produtivos:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {selectedDistrict.economicHighlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedDistrict.notes && (
                  <p className="text-[11px] text-orange-300 bg-orange-950/40 p-2 rounded border border-orange-900/60">
                    {selectedDistrict.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-center text-slate-400">
                <p>Clique em qualquer distrito no mapa 3D ou selecione na lista abaixo para inspecionar.</p>
              </div>
            )}

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar distrito de Tete ou sede..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 pl-9 pr-3 py-2 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Districts List */}
            <div className="space-y-1.5">
              {filteredDistricts.map((district) => {
                const isSelected = selectedDistrictId === district.id;
                return (
                  <div
                    key={district.id}
                    onClick={() => onSelectDistrict(isSelected ? null : district.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-500/20 border-orange-500 text-white shadow-sm'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{district.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Cod. {district.code}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Sede: {district.headquarters} • {new Intl.NumberFormat('pt-MZ').format(district.areaKm2)} km²
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        {new Intl.NumberFormat('pt-MZ').format(district.population2017)}
                      </span>
                      <span className="text-[10px] text-slate-400">hab. (2017)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ECONOMIA & ENERGIA */}
        {activeTab === 'economia' && (
          <div className="space-y-4">
            {/* Hydroelectric Cahora Bassa */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Zap className="w-4 h-4 text-amber-400" />
                Hidroelétrica de Cahora Bassa (HCB)
              </div>
              <p className="leading-relaxed text-slate-300">
                Localizada no Rio Zambeze (vila do Songo), a Barragem de Cahora Bassa possui uma potência instalada de <strong>2.075 MW</strong> (5 geradores de 415 MW). É a principal fonte de energia elétrica da rede interligada nacional de Moçambique e abastece contratos de exportação regional para a África do Sul (Eskom) e Zimbabué (ZESA).
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-slate-900/60 p-2 rounded">
                  <span className="text-slate-400 block">Capacidade</span>
                  <span className="font-bold text-amber-400">2.075 MW</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded">
                  <span className="text-slate-400 block">Extensão do Lago</span>
                  <span className="font-bold text-white">~2.700 km² de espelho</span>
                </div>
              </div>
            </div>

            {/* Coal Moatize */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Pickaxe className="w-4 h-4 text-orange-400" />
                Bacia Carbonífera de Moatize
              </div>
              <p className="leading-relaxed text-slate-300">
                Constitui uma das maiores jazidas de carvão mineral de África. A exploração a céu aberto produz carvão metalúrgico (coque para siderurgias internacionais) e carvão térmico. O escoamento é assegurado pelos corredores ferroviários de Sena (para o Porto da Beira) e pelo Corredor de Nacala (para o terminal de águas profundas de Nacala-a-Velha).
              </p>
              <div className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                Operadora Principal: <strong>Vulcan Mozambique</strong> (aquisição de ativos anteriormente da Vale).
              </div>
            </div>

            {/* Agriculture & Livestock */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <TreePine className="w-4 h-4 text-emerald-400" />
                Agricultura de Altitude & Pecuária Tradicional
              </div>
              <p className="leading-relaxed text-slate-300">
                Os planaltos férteis de <strong>Angónia</strong> e <strong>Tsangano</strong>, com altitudes entre 1.200 m e 2.000 m e clima temperado fresco, são o celeiro alimentar de Tete e da região Centro, liderando a produção nacional de batata-reno, milho, feijão manteiga e hortícolas.
              </p>
              <p className="leading-relaxed text-slate-300">
                Na pecuária, destaca-se o <strong>Cabrito de Tete</strong> (mais de 650.000 cabeças), criado em pastoreio nativo no vale semi-árido, com grande valor gastronómico e comercial.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: TURISMO & PATRIMÓNIO */}
        {activeTab === 'turismo' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-orange-950/20 border border-orange-900/40 rounded-lg text-slate-300 text-[11px]">
              Dados verificados junto ao <strong>Visit Mozambique (INATUR)</strong> e Ministério da Cultura e Turismo.
            </div>

            {TETE_TOURISM_HERITAGE.map((item) => (
              <div key={item.id} className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  {item.yearReference && (
                    <span className="text-[10px] text-slate-500 font-mono">{item.yearReference}</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-[11px] text-sky-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {item.location}
                </p>
                <p className="leading-relaxed text-slate-300 text-xs">{item.description}</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  Fonte: {item.source}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: INFRAESTRUTURAS */}
        {activeTab === 'infraestruturas' && (
          <div className="space-y-3">
            {TETE_INFRASTRUCTURES.map((inf, i) => (
              <div key={i} className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                    {inf.type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{inf.year}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{inf.name}</h4>
                <span className="text-[11px] text-emerald-400 font-mono block">{inf.length}</span>
                <p className="leading-relaxed text-slate-300 text-xs">{inf.description}</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  Fonte: {inf.source}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: INDICADORES & METADADOS */}
        {activeTab === 'indicadores' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-800 text-slate-300 text-[11px]">
              Tabela de indicadores estatísticos consolidados para a Província de Tete. Cada linha inclui a fonte custodiante e o ano de recolha oficial.
            </div>

            <div className="space-y-2">
              {TETE_PROVINCE_INDICATORS.map((ind) => (
                <div key={ind.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{ind.label}</span>
                    <span className="text-[10px] bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded font-mono">
                      Ref: {ind.referenceYear}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white block">{ind.formattedValue}</span>
                  {ind.notes && <p className="text-[11px] text-slate-400">{ind.notes}</p>}
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    Fonte: {ind.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Return Action */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <button
          onClick={onReturnToNational}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regressar ao Mapa Nacional de Moçambique</span>
        </button>
      </div>
    </div>
  );
};
