import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRightLeft,
  Info,
  Download,
  RefreshCw,
  Globe,
  FileSpreadsheet,
  Compass,
  Route as RouteIcon,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PROVINCES_DATA } from '../data/provincesData.ts';
import { ALL_DISTRICTS_DATA } from '../data/allDistrictsData.ts';
import { ViewMode } from '../types/index.ts';

interface TopHeaderProps {
  onSelectProvince: (id: string) => void;
  onSelectDistrictFromSearch?: (provinceId: string, districtCode: string) => void;
  onSelectDistrict?: (districtId: string | null) => void;
  onOpenCompare: () => void;
  onOpenSourcesModal: () => void;
  onSyncMozgis: () => Promise<void>;
  isSyncingMozgis: boolean;
  syncStatus: 'idle' | 'success' | 'error';
  onExportGeoJSON: () => void;
  onExportCSV: () => void;
  viewMode?: ViewMode;
  detailedProvinceId?: string | null;
  selectedDistrictId?: string | null;
  onReturnToNational?: () => void;
  onSelectViewMode?: (mode: ViewMode) => void;
  isTransportPanelOpen?: boolean;
  onToggleTransportPanel?: () => void;
  activeTransportLayersCount?: number;
  isPatrioticPanelOpen?: boolean;
  onTogglePatrioticPanel?: () => void;
}

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSelectProvince,
  onSelectDistrictFromSearch,
  onSelectDistrict,
  onOpenCompare,
  onOpenSourcesModal,
  onSyncMozgis,
  isSyncingMozgis,
  syncStatus,
  onExportGeoJSON,
  onExportCSV,
  viewMode = 'national',
  detailedProvinceId = null,
  selectedDistrictId = null,
  onReturnToNational,
  onSelectViewMode,
  isTransportPanelOpen = false,
  onToggleTransportPanel,
  activeTransportLayersCount = 3,
  isPatrioticPanelOpen = false,
  onTogglePatrioticPanel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build quick lookup from provinceId + normalized name -> district code
  const districtLookup = useMemo(() => {
    const map = new Map<string, string>();
    Object.values(ALL_DISTRICTS_DATA).forEach((d) => {
      map.set(`${d.provinceId}:${normalizeText(d.name)}`, d.code);
    });
    return map;
  }, []);

  const searchResults = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return [];

    const results: {
      type: 'provincia' | 'distrito' | 'capital';
      name: string;
      provinceId: string;
      provinceName: string;
      districtCode?: string;
      subtitle: string;
    }[] = [];

    Object.values(PROVINCES_DATA).forEach((prov) => {
      if (normalizeText(prov.name).includes(query) || normalizeText(prov.officialName).includes(query)) {
        results.push({
          type: 'provincia',
          name: prov.name,
          provinceId: prov.id,
          provinceName: prov.name,
          subtitle: `Província · ${prov.districtsCount} distritos`,
        });
      }

      if (normalizeText(prov.capital).includes(query) && !normalizeText(prov.name).includes(query)) {
        results.push({
          type: 'capital',
          name: prov.capital,
          provinceId: prov.id,
          provinceName: prov.name,
          subtitle: `Capital de ${prov.name}`,
        });
      }
    });

    Object.values(ALL_DISTRICTS_DATA).forEach((dist) => {
      if (
        normalizeText(dist.name).includes(query) ||
        normalizeText(dist.headquarters).includes(query)
      ) {
        const provName = PROVINCES_DATA[dist.provinceId]?.name || dist.provinceName || '';
        results.push({
          type: 'distrito',
          name: dist.name,
          provinceId: dist.provinceId,
          provinceName: provName,
          districtCode: dist.code,
          subtitle: `Distrito · ${provName}`,
        });
      }
    });

    // Also include any districtsList entries not matched above
    if (results.length < 10) {
      Object.values(PROVINCES_DATA).forEach((prov) => {
        prov.districtsList.forEach((dName) => {
          if (normalizeText(dName).includes(query)) {
            const code = districtLookup.get(`${prov.id}:${normalizeText(dName)}`);
            const already = results.some(
              (r) => r.type === 'distrito' && r.provinceId === prov.id && normalizeText(r.name) === normalizeText(dName)
            );
            if (!already) {
              results.push({
                type: 'distrito',
                name: dName,
                provinceId: prov.id,
                provinceName: prov.name,
                districtCode: code,
                subtitle: `Distrito · ${prov.name}`,
              });
            }
          }
        });
      });
    }

    return results.slice(0, 12);
  }, [searchQuery, districtLookup]);

  const handleSelectResult = (res: (typeof searchResults)[number]) => {
    if (res.type === 'distrito' && res.districtCode && onSelectDistrictFromSearch) {
      onSelectDistrictFromSearch(res.provinceId, res.districtCode);
    } else {
      onSelectProvince(res.provinceId);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const isDetailed = viewMode === 'province-detailed' || viewMode === 'tete-detailed';
  const isGoogleRoads = viewMode === 'google-roads';
  const targetProv = detailedProvinceId
    ? PROVINCES_DATA[detailedProvinceId]
    : viewMode === 'tete-detailed'
      ? PROVINCES_DATA['07']
      : null;
  const provName = targetProv?.name || 'Província';
  const selectedDistrict = selectedDistrictId ? ALL_DISTRICTS_DATA[selectedDistrictId] ?? null : null;

  return (
    <header className="shrink-0 px-3 sm:px-5 pt-3 pb-2 z-30">
      <div className="h-13 px-3 sm:px-4 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Minimal Brand & Interactive Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <button
            onClick={() => {
              if (isGoogleRoads && onSelectViewMode) {
                onSelectViewMode('national');
              } else if (isDetailed && onReturnToNational) {
                onReturnToNational();
              } else {
                onReturnToNational?.();
              }
            }}
            className="flex items-center gap-2 text-left group cursor-pointer whitespace-nowrap shrink-0"
            title="Regressar à vista nacional de Moçambique"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 via-amber-400 to-red-600 flex items-center justify-center text-slate-950 shadow-sm shrink-0">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
              Moçambique
            </span>
          </button>

          {isGoogleRoads && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-semibold text-sky-400">Estradas</span>
            </div>
          )}

          {isDetailed && (
            <nav aria-label="Navegação territorial" className="hidden sm:flex items-center gap-1.5 text-xs min-w-0">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => onSelectDistrict?.(null)}
                className={`font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDistrict
                    ? 'text-slate-300 hover:text-white'
                    : 'text-sky-400'
                }`}
                title={`Ver todos os distritos de ${provName}`}
              >
                {provName}
              </button>

              {selectedDistrict && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="font-semibold text-amber-400 truncate max-w-[140px]">
                    {selectedDistrict.name}
                  </span>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Center: Direct Search (Provinces + Districts) */}
        {!isGoogleRoads && (
          <div ref={searchRef} className="relative flex-1 max-w-sm">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={isDetailed ? `Pesquisar distrito ou província...` : 'Pesquisar província ou distrito...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full h-8 bg-white/5 hover:bg-white/[0.07] focus:bg-slate-900 border border-white/10 focus:border-sky-500/70 rounded-xl pl-8 pr-7 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-white/10 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-50 backdrop-blur-xl p-1">
                {searchResults.map((res, i) => (
                  <button
                    key={`${res.type}-${res.provinceId}-${res.name}-${i}`}
                    onClick={() => handleSelectResult(res)}
                    className="w-full px-2.5 py-2 text-left rounded-lg hover:bg-white/10 flex items-center justify-between gap-2 text-xs transition-colors group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-white group-hover:text-sky-300 block truncate">
                        {res.name}
                      </span>
                      <span className="block text-[11px] text-slate-400 truncate">{res.subtitle}</span>
                    </div>
                    <span className="text-[11px] text-sky-400 font-medium whitespace-nowrap shrink-0">
                      {res.type === 'distrito' ? 'Isolar ↗' : 'Abrir ↗'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right: Minimal Action Strip */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isDetailed && !isGoogleRoads && (
            <button
              onClick={onOpenCompare}
              className="h-8 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Comparar duas províncias lado a lado"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden md:inline">Comparar</span>
            </button>
          )}

          {onTogglePatrioticPanel && !isGoogleRoads && !isDetailed && (
            <button
              onClick={onTogglePatrioticPanel}
              className={`h-8 px-2.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isPatrioticPanelOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/10'
              }`}
              title="Do Zumbo ao Índico • História e Identidade de Moçambique"
            >
              <span className="text-xs leading-none">🇲🇿</span>
              <span className="hidden lg:inline">História</span>
            </button>
          )}

          {onSelectViewMode && (
            <button
              onClick={() => onSelectViewMode(isGoogleRoads ? 'national' : 'google-roads')}
              className={`h-8 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isGoogleRoads
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40'
                  : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-400/30'
              }`}
              title={isGoogleRoads ? 'Voltar ao Mapa 3D' : 'Abrir Mapa de Estradas & Rotas'}
            >
              {isGoogleRoads ? (
                <>
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>Mapa 3D</span>
                </>
              ) : (
                <>
                  <RouteIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Estradas</span>
                </>
              )}
            </button>
          )}

          {/* Overflow Menu ("Mais") for secondary utilities */}
          {!isGoogleRoads && (
            <div ref={moreMenuRef} className="relative">
              <button
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                className={`h-8 px-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isMoreMenuOpen
                    ? 'bg-white/15 text-white border-white/25'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                }`}
                title="Transportes, Sincronização e Exportação"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Mais</span>
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-slate-950/95 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 w-56 backdrop-blur-xl space-y-0.5">
                  {onToggleTransportPanel && (
                    <button
                      onClick={() => {
                        onToggleTransportPanel();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 text-xs text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hubs de Transportes</span>
                      </span>
                      <span className="text-[11px] font-mono text-amber-400 tabular-nums">
                        {activeTransportLayersCount}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSyncMozgis();
                      setIsMoreMenuOpen(false);
                    }}
                    disabled={isSyncingMozgis}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 text-xs text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingMozgis ? 'animate-spin' : ''}`} />
                      <span>Sincronizar MOZGIS</span>
                    </span>
                    {syncStatus === 'success' && (
                      <span className="text-[11px] font-mono text-emerald-400">OK</span>
                    )}
                  </button>

                  <div className="border-t border-white/10 my-1" />

                  <button
                    onClick={() => {
                      onExportGeoJSON();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 text-xs text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Exportar GeoJSON</span>
                  </button>

                  <button
                    onClick={() => {
                      onExportCSV();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 text-xs text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exportar CSV (INE)</span>
                  </button>

                  <div className="border-t border-white/10 my-1" />

                  <button
                    onClick={() => {
                      onOpenSourcesModal();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 text-xs text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fontes Oficiais</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
