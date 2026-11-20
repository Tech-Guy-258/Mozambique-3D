import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  CheckCircle2,
  Share2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Globe,
  TrendingUp,
  Compass,
  MapPin,
  Filter,
  Mountain,
  Waves,
  Languages,
  CloudSun,
} from 'lucide-react';
import { PROVINCES_DATA } from '../data/provincesData.ts';
import { ALL_DISTRICTS_DATA } from '../data/allDistrictsData.ts';
import { PROVINCIAL_DOSSIERS } from '../data/provincialDossiersData.ts';
import { DistrictData } from '../types/index.ts';

interface ProvinceDetailedPanelProps {
  provinceId: string;
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string | null) => void;
  onHoverDistrict?: (districtId: string | null) => void;
  onReturnToNational: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ProvinceDetailedPanel: React.FC<ProvinceDetailedPanelProps> = ({
  provinceId,
  selectedDistrictId,
  onSelectDistrict,
  onHoverDistrict,
  onReturnToNational,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'resumo' | 'economia' | 'turismo' | 'infraestruturas' | 'indicadores'>('resumo');
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const province = PROVINCES_DATA[provinceId] || PROVINCES_DATA['07'];
  const dossier = PROVINCIAL_DOSSIERS[provinceId] || PROVINCIAL_DOSSIERS['07'];

  const districtsList = Object.values(ALL_DISTRICTS_DATA)
    .filter((d) => d.provinceId === provinceId)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'));

  const selectedDistrict: DistrictData | null = selectedDistrictId
    ? ALL_DISTRICTS_DATA[selectedDistrictId] ?? null
    : null;

  const selectedIndex = selectedDistrict
    ? districtsList.findIndex((d) => d.code === selectedDistrict.code)
    : -1;
  const prevDistrict = selectedIndex > 0 ? districtsList[selectedIndex - 1] : null;
  const nextDistrict =
    selectedIndex >= 0 && selectedIndex < districtsList.length - 1
      ? districtsList[selectedIndex + 1]
      : null;

  // Reset tab to province overview when changing province
  useEffect(() => {
    setActiveTab('resumo');
  }, [provinceId]);

  // Reset scroll when switching between province and district
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [provinceId, selectedDistrictId, activeTab]);

  // Clear hover highlight if panel unmounts or district changes
  useEffect(() => {
    onHoverDistrict?.(null);
  }, [selectedDistrictId, provinceId]);

  const handleShareOrCopy = () => {
    const text = selectedDistrict
      ? `${selectedDistrict.name} - Moçambique (INE/MOZGIS)
Sede: ${selectedDistrict.headquarters} | Área: ${new Intl.NumberFormat('pt-MZ').format(selectedDistrict.areaKm2)} km²
População (Censo 2017): ${new Intl.NumberFormat('pt-MZ').format(selectedDistrict.population2017)} hab.`
      : `${province.officialName} - Moçambique (INE/MOZGIS)
Capital: ${province.capital} | Superfície: ${new Intl.NumberFormat('pt-MZ').format(province.areaKm2)} km²
População (2024 Proj.): ${new Intl.NumberFormat('pt-MZ').format(province.population2024)} hab.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = province.color || '#f97316';

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="absolute top-3 right-3 z-30 bg-slate-950/90 border border-white/15 rounded-2xl shadow-2xl px-3.5 py-2 backdrop-blur-xl flex items-center gap-2 text-xs font-semibold text-white hover:border-sky-400/60 transition-all cursor-pointer group"
        title="Abrir Painel de Informação"
      >
        <ChevronLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: selectedDistrict ? '#f59e0b' : accentColor }}
        />
        <span>{selectedDistrict ? selectedDistrict.name : province.name}</span>
      </button>
    );
  }

  /* ============================================================================
   * MODO DISTRITO SELECIONADO: Exibe EXCLUSIVAMENTE informações do Distrito
   * ========================================================================== */
  if (selectedDistrict) {
    const densityVal =
      selectedDistrict.density2017 ??
      selectedDistrict.density ??
      selectedDistrict.population2017 / Math.max(1, selectedDistrict.areaKm2);
    const tourismList = selectedDistrict.tourismHighlights || selectedDistrict.tourismAttractions || [];

    return (
      <aside className="w-full h-[46%] md:h-full md:w-[380px] lg:w-[420px] xl:w-[440px] shrink-0 bg-slate-950/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10 shadow-2xl flex flex-col text-slate-100 z-20 overflow-hidden">
        {/* Top Action & Filter Bar */}
        <div className="shrink-0 px-4 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 border-b border-white/10 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onSelectDistrict(null)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-sky-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
              title={`Voltar às informações da província (${province.name})`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar à Província</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handleShareOrCopy}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={`Copiar ficha de ${selectedDistrict.name}`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Recolher painel para ver 3D em ecrã inteiro"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onReturnToNational}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Voltar ao mapa nacional"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Specific Filter Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              aria-label="Filtrar por distrito ou província"
              value={selectedDistrict.code}
              onChange={(e) => {
                const val = e.target.value;
                onSelectDistrict(val === '__province__' ? null : val);
              }}
              className="flex-1 h-8 bg-white/5 hover:bg-white/10 border border-white/10 focus:border-amber-400/60 rounded-xl px-2.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="__province__" className="bg-slate-900 text-sky-300">
                Mostrar apenas a Província ({province.name})
              </option>
              {districtsList.map((d) => (
                <option key={d.code} value={d.code} className="bg-slate-900 text-white">
                  Distrito: {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Strict District Hero Header */}
        <div className="shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-[11px] font-medium text-amber-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span>Distrito</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
            {selectedDistrict.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sede: <span className="text-slate-200 font-medium">{selectedDistrict.headquarters}</span> · Código {selectedDistrict.code}
          </p>

          {/* 3 Tabular KPI Columns strictly for this District */}
          <div className="grid grid-cols-3 divide-x divide-white/10 mt-4 pt-3 border-t border-white/10">
            <div className="pr-3">
              <span className="text-[11px] text-slate-400 block">População 2017</span>
              <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">
                {new Intl.NumberFormat('pt-MZ').format(selectedDistrict.population2017)}
              </span>
            </div>
            <div className="px-3">
              <span className="text-[11px] text-slate-400 block">Área</span>
              <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">
                {new Intl.NumberFormat('pt-MZ').format(selectedDistrict.areaKm2)} km²
              </span>
            </div>
            <div className="pl-3">
              <span className="text-[11px] text-slate-400 block">Densidade</span>
              <span className="text-sm font-bold text-amber-400 tabular-nums mt-0.5 block">
                {densityVal.toFixed(1).replace('.', ',')} <span className="text-[11px] font-normal text-slate-400">hab/km²</span>
              </span>
            </div>
          </div>
        </div>

        {/* Organized Scrollable District Details (ONLY District Data) */}
        <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 space-y-4 sm:space-y-5 text-xs">
          {selectedDistrict.administrativePosts && selectedDistrict.administrativePosts.length > 0 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Postos Administrativos ({selectedDistrict.administrativePosts.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedDistrict.administrativePosts.map((post, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs"
                  >
                    {post}
                  </span>
                ))}
              </div>
            </section>
          )}

          {selectedDistrict.economicHighlights && selectedDistrict.economicHighlights.length > 0 && (
            <section className="pt-4 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Economia & Actividade Produtiva</span>
              </h3>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                {selectedDistrict.economicHighlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tourismList.length > 0 && (
            <section className="pt-4 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Património, Natureza & Cultura</span>
              </h3>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                {tourismList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {selectedDistrict.notes && (
            <section className="pt-4 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Notas do Distrito
              </h3>
              <p className="text-slate-300 leading-relaxed">{selectedDistrict.notes}</p>
            </section>
          )}

          <section className="pt-4 border-t border-white/10 text-[11px] text-slate-500">
            Fonte: {selectedDistrict.sources?.demographics || 'INE Moçambique'} · {selectedDistrict.sources?.referenceYears || 'MOZGIS MAEFP'}
          </section>
        </div>

        {/* Sticky Footer Stepper (Previous / Next District) */}
        <div className="shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 border-t border-white/10 bg-slate-950 flex items-center justify-between gap-2">
          <button
            onClick={() => prevDistrict && onSelectDistrict(prevDistrict.code)}
            disabled={!prevDistrict}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-colors ${
              prevDistrict
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 cursor-pointer'
                : 'border-transparent text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{prevDistrict ? prevDistrict.name : 'Início'}</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {selectedIndex + 1} / {districtsList.length}
          </span>

          <button
            onClick={() => nextDistrict && onSelectDistrict(nextDistrict.code)}
            disabled={!nextDistrict}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-colors ${
              nextDistrict
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 cursor-pointer'
                : 'border-transparent text-slate-600 cursor-not-allowed'
            }`}
          >
            <span className="truncate max-w-[120px]">{nextDistrict ? nextDistrict.name : 'Fim'}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </aside>
    );
  }

  /* ============================================================================
   * MODO PROVÍNCIA SELECIONADA: Exibe EXCLUSIVAMENTE informações da Província
   * ========================================================================== */
  return (
    <aside className="w-full h-[46%] md:h-full md:w-[380px] lg:w-[420px] xl:w-[440px] shrink-0 bg-slate-950/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10 shadow-2xl flex flex-col text-slate-100 z-20 overflow-hidden">
      {/* Top Action & District Filter Bar */}
      <div className="shrink-0 px-4 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onReturnToNational}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-sky-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
            title="Voltar ao mapa nacional de Moçambique"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Moçambique</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShareOrCopy}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title={`Copiar síntese de ${province.name}`}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Recolher painel para ver 3D em ecrã inteiro"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onReturnToNational}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Fechar vista provincial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* District Filter Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <select
            aria-label="Filtrar para um distrito específico"
            value="__province__"
            onChange={(e) => {
              const val = e.target.value;
              if (val !== '__province__') {
                onSelectDistrict(val);
              }
            }}
            className="flex-1 h-8 bg-white/5 hover:bg-white/10 border border-white/10 focus:border-sky-400/60 rounded-xl px-2.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value="__province__" className="bg-slate-900 text-sky-300">
              Província: {province.name} (Vista Geral)
            </option>
            {districtsList.map((d) => (
              <option key={d.code} value={d.code} className="bg-slate-900 text-white">
                Filtrar distrito: {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Province Hero Header + KPIs */}
      <div className="shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-sky-400 mb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <span>Província · Região {province.region}</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {province.name}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Capital: <span className="text-slate-200 font-medium">{province.capital}</span> · {new Intl.NumberFormat('pt-MZ').format(province.areaKm2)} km² · {province.districtsCount} distritos
        </p>

        {/* Official Tete CIIT 2026 Button (strictly in Tete Province view) */}
        {province.id === '07' && (
          <a
            href="https://ciit2026.diva.co.mz/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg flex items-center justify-between gap-2 transition-all group"
            title="Aceder ao portal oficial da Conferência Internacional de Investimentos de Tete (CIIT 2026)"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="uppercase tracking-wider">Visite Tete · CIIT 2026</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <span className="hidden sm:inline">ciit2026.diva.co.mz</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </a>
        )}

        {/* 3 Tabular KPI Columns strictly for the Province */}
        <div className="grid grid-cols-3 divide-x divide-white/10 mt-4 pt-3 border-t border-white/10">
          <div className="pr-3">
            <span className="text-[11px] text-slate-400 block">População '24</span>
            <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">
              {(province.population2024 / 1_000_000).toFixed(2)} M
            </span>
          </div>
          <div className="px-3">
            <span className="text-[11px] text-slate-400 block">Censo 2017</span>
            <span className="text-sm font-bold text-slate-200 tabular-nums mt-0.5 block">
              {new Intl.NumberFormat('pt-MZ').format(province.population2017)}
            </span>
          </div>
          <div className="pl-3">
            <span className="text-[11px] text-slate-400 block">Densidade</span>
            <span className="text-sm font-bold text-sky-400 tabular-nums mt-0.5 block">
              {province.density2024.toFixed(1).replace('.', ',')} <span className="text-[11px] font-normal text-slate-400">hab/km²</span>
            </span>
          </div>
        </div>
      </div>

      {/* Underline Segmented Navigation (Strictly Province Information Tabs) */}
      <div className="shrink-0 flex border-b border-white/10 px-4 sm:px-5 gap-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'resumo', label: 'Geral' },
          { id: 'economia', label: 'Economia' },
          { id: 'turismo', label: 'Turismo' },
          { id: 'infraestruturas', label: 'Infraestruturas' },
          { id: 'indicadores', label: 'INE' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-sky-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Body (Strictly Province Content) */}
      <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 space-y-4 sm:space-y-5 text-xs text-slate-300">
        {activeTab === 'resumo' && (
          <div className="space-y-5">
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Perfil da Província
              </h3>
              <p className="text-slate-200 leading-relaxed">{province.economicProfile.overview}</p>
            </section>

            <section className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-start gap-2.5">
                <CloudSun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Clima</span>
                  <span className="text-slate-200">{province.climate}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Languages className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Línguas Principais</span>
                  <span className="text-slate-200">{province.languages.join(', ')}</span>
                </div>
              </div>

              {province.highestPoint && (
                <div className="flex items-start gap-2.5">
                  <Mountain className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Ponto Mais Elevado</span>
                    <span className="text-slate-200">
                      {province.highestPoint.name} ({new Intl.NumberFormat('pt-MZ').format(province.highestPoint.altitudeMeters)} m)
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <Waves className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Faixa Litoral</span>
                  <span className="text-slate-200">
                    {province.coastline ? 'Província costeira banhada pelo Oceano Índico' : 'Província interior (sem costa marítima)'}
                  </span>
                </div>
              </div>
            </section>

            {province.notes && (
              <section className="pt-4 border-t border-white/10">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Notas Territoriais
                </h3>
                <p className="text-slate-300 leading-relaxed">{province.notes}</p>
              </section>
            )}

            <section className="pt-4 border-t border-white/10 text-[11px] text-slate-500">
              Fontes: {province.sources.demographics} · {province.sources.geography}
            </section>
          </div>
        )}

        {activeTab === 'economia' && (
          <div className="space-y-5">
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Visão Geral Económica
              </h3>
              <p className="text-slate-300 leading-relaxed">{province.economicProfile.overview}</p>
            </section>

            <section className="pt-4 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Sectores e Recursos Estratégicos
              </h3>
              <ul className="space-y-2">
                {province.economicProfile.keyResources.map((res, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-200">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="pt-4 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Actividades Primárias
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {province.economicProfile.primaryActivities.map((act, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-200 text-xs">
                    {act}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'turismo' && (
          <div className="divide-y divide-white/10">
            {dossier.tourismHeritage.map((item) => (
              <article key={item.id} className="py-3.5 first:pt-0 space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-amber-400">{item.category}</span>
                  <span className="text-slate-500">{item.location}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'infraestruturas' && (
          <div className="space-y-5">
            <div className="divide-y divide-white/10">
              {dossier.infrastructures.map((inf, i) => (
                <div key={i} className="py-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-white">{inf.name}</h4>
                    <span className="text-[11px] text-sky-400 shrink-0">{inf.category}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{inf.description}</p>
                </div>
              ))}
            </div>

            <section className="pt-4 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Corredores & Acesso
              </h3>
              <ul className="space-y-1.5 text-slate-300">
                {province.economicProfile.majorInfrastructure.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {activeTab === 'indicadores' && (
          <div className="divide-y divide-white/10">
            {dossier.indicators.map((ind) => (
              <div key={ind.id} className="py-3 first:pt-0 flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-slate-200 block">{ind.label}</span>
                  <span className="text-[11px] text-slate-500">
                    {ind.referenceYear} · {ind.source.split('-')[0].trim()}
                  </span>
                </div>
                <span className="font-bold text-white tabular-nums shrink-0">{ind.formattedValue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
