import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ArrowRightLeft,
  Info,
  Download,
  RefreshCw,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Compass,
  ArrowLeft,
  Route as RouteIcon,
} from 'lucide-react';
import { PROVINCES_DATA, MOZAMBIQUE_NATIONAL_STATS, OFFICIAL_SOURCES } from '../data/provincesData.ts';
import { ViewMode } from '../types/index.ts';

interface TopHeaderProps {
  onSelectProvince: (id: string) => void;
  onOpenCompare: () => void;
  onOpenSourcesModal: () => void;
  onSyncMozgis: () => Promise<void>;
  isSyncingMozgis: boolean;
  syncStatus: 'idle' | 'success' | 'error';
  onExportGeoJSON: () => void;
  onExportCSV: () => void;
  viewMode?: ViewMode;
  detailedProvinceId?: string | null;
  onReturnToNational?: () => void;
  onSelectViewMode?: (mode: ViewMode) => void;
  isTransportPanelOpen?: boolean;
  onToggleTransportPanel?: () => void;
  activeTransportLayersCount?: number;
  isPatrioticPanelOpen?: boolean;
  onTogglePatrioticPanel?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSelectProvince,
  onOpenCompare,
  onOpenSourcesModal,
  onSyncMozgis,
  isSyncingMozgis,
  syncStatus,
  onExportGeoJSON,
  onExportCSV,
  viewMode = 'national',
  detailedProvinceId = null,
  onReturnToNational,
  onSelectViewMode,
  isTransportPanelOpen = false,
  onToggleTransportPanel,
  activeTransportLayersCount = 7,
  isPatrioticPanelOpen = false,
  onTogglePatrioticPanel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter provinces and districts
  const searchResults: {
    type: 'provincia' | 'distrito' | 'capital';
    name: string;
    provinceId: string;
    provinceName: string;
    subtitle: string;
  }[] = [];

  if (searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase().trim();

    Object.values(PROVINCES_DATA).forEach((prov) => {
      if (prov.name.toLowerCase().includes(query) || prov.officialName.toLowerCase().includes(query)) {
        searchResults.push({
          type: 'provincia',
          name: prov.name,
          provinceId: prov.id,
          provinceName: prov.name,
          subtitle: `Província • Região ${prov.region} • Capital: ${prov.capital}`,
        });
      }

      if (prov.capital.toLowerCase().includes(query) && !prov.name.toLowerCase().includes(query)) {
        searchResults.push({
          type: 'capital',
          name: prov.capital,
          provinceId: prov.id,
          provinceName: prov.name,
          subtitle: `Capital provincial de ${prov.name}`,
        });
      }

      prov.districtsList.forEach((district) => {
        if (district.toLowerCase().includes(query)) {
          searchResults.push({
            type: 'distrito',
            name: district,
            provinceId: prov.id,
            provinceName: prov.name,
            subtitle: `Distrito em ${prov.name}`,
          });
        }
      });
    });
  }

  const handleSelectResult = (provinceId: string) => {
    onSelectProvince(provinceId);
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

  return (
    <header className="fixed top-3 inset-x-3 sm:inset-x-5 z-30 pointer-events-none flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      {/* Brand Badge */}
      <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl p-3 sm:px-4 sm:py-3 backdrop-blur-md flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
            isGoogleRoads
              ? 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white'
              : isDetailed
                ? 'bg-gradient-to-br from-orange-500 to-sky-600 text-slate-950 font-bold'
                : 'bg-gradient-to-br from-emerald-500 via-yellow-500 to-red-600 text-slate-950 font-bold'
          }`}
        >
          {isGoogleRoads ? (
            <RouteIcon className="w-5 h-5 text-white" />
          ) : isDetailed ? (
            <Compass className="w-5 h-5" />
          ) : (
            <Globe className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
              {isGoogleRoads
                ? 'Moçambique Google Roads'
                : isDetailed
                  ? `${provName} 3D Explorer`
                  : 'Mozambique 3D Explorer'}
            </h1>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold border ${
                isGoogleRoads
                  ? 'bg-sky-950/80 text-sky-400 border-sky-800'
                  : isDetailed
                    ? 'bg-sky-950/80 text-sky-400 border-sky-800'
                    : 'bg-sky-950/80 text-sky-400 border-sky-800/80'
              }`}
            >
              {isGoogleRoads
                ? 'Google Maps • Routes API'
                : isDetailed
                  ? 'Distritos MOZGIS Layer 2'
                  : 'MOZGIS WGS84'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isGoogleRoads
              ? 'Cartografia Rodoviária Oficial, Pesquisa de Destinos & Rotas'
              : isDetailed
                ? `Divisão Distrital Verificada, Economia & Património de ${provName}`
                : 'Fronteiras Administrativas MAEFP & Estatísticas INE Moçambique'}
          </p>
        </div>
      </div>

      {/* Center Search & Actions */}
      <div className="pointer-events-auto flex items-center gap-2 self-stretch md:self-auto justify-end">
        {/* Toggle between Google Road Map and 3D Explorer */}
        {onSelectViewMode && (
          <button
            onClick={() => onSelectViewMode(isGoogleRoads ? 'national' : 'google-roads')}
            className={`border rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-bold backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              isGoogleRoads
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-950/30'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400/50 shadow-sky-950/30'
            }`}
            title={
              isGoogleRoads
                ? 'Alternar para o Explorador Territorial 3D'
                : 'Alternar para o Mapa Rodoviário Oficial Google Maps com cálculo de rotas'
            }
          >
            {isGoogleRoads ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Explorador 3D</span>
              </>
            ) : (
              <>
                <RouteIcon className="w-4 h-4" />
                <span>Google Estradas</span>
              </>
            )}
          </button>
        )}

        {/* Return to National Map button when in Detailed 3D View */}
        {isDetailed && onReturnToNational && (
          <button
            onClick={onReturnToNational}
            className="bg-sky-600 hover:bg-sky-500 text-white border border-sky-400/50 rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-bold backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Regressar à vista nacional de Moçambique"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mapa Nacional</span>
          </button>
        )}

        {/* Search Input with Autocomplete */}
        <div ref={searchRef} className="relative flex-1 md:w-64 lg:w-72">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={isDetailed ? `Pesquisar distrito de ${provName}...` : 'Pesquisar província ou distrito...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 backdrop-blur-md shadow-lg focus:outline-none focus:border-sky-500 transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-50 backdrop-blur-md p-1">
              {searchResults.slice(0, 10).map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectResult(res.provinceId)}
                  className="w-full p-2 text-left rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-white group-hover:text-sky-300">
                      {res.name}
                    </span>
                    <span className="block text-[10px] text-slate-400">{res.subtitle}</span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-mono">Focar ↗</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action: Compare (visible in national 3D mode) */}
        {!isDetailed && !isGoogleRoads && (
          <button
            onClick={onOpenCompare}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:text-white backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Comparar 2 províncias lado a lado"
          >
            <ArrowRightLeft className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Comparar</span>
          </button>
        )}

        {/* Action: Do Zumbo ao Índico (História & Pátria) */}
        {onTogglePatrioticPanel && !isGoogleRoads && (
          <button
            onClick={onTogglePatrioticPanel}
            className={`rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-bold border backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              isPatrioticPanelOpen
                ? 'bg-gradient-to-r from-emerald-600/30 via-amber-500/30 to-red-600/30 text-amber-300 border-amber-400 shadow-amber-950/40'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80 hover:border-amber-400/60'
            }`}
            title="Do Zumbo ao Índico • História do Nascimento e Identidade de Moçambique"
          >
            <span className="text-sm leading-none">🇲🇿</span>
            <span className="hidden sm:inline">Do Zumbo ao Índico</span>
          </button>
        )}

        {/* Action: Transport Network */}
        {onToggleTransportPanel && !isGoogleRoads && (
          <button
            onClick={onToggleTransportPanel}
            className={`rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-medium border backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              isTransportPanelOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-amber-950/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80'
            }`}
            title="Rede de Transportes de Moçambique: Portos Marítimos, Aeroportos e Aeródromos"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Transportes</span>
            {activeTransportLayersCount !== undefined && activeTransportLayersCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {activeTransportLayersCount}
              </span>
            )}
          </button>
        )}

        {/* Action: Sync MOZGIS */}
        {!isGoogleRoads && (
          <button
            onClick={onSyncMozgis}
            disabled={isSyncingMozgis}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:text-white backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sincronizar fronteiras ao vivo com servidor MOZGIS MAEFP"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncingMozgis ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">MOZGIS</span>
            {syncStatus === 'success' && (
              <span className="hidden sm:inline text-[10px] text-emerald-400 font-mono">✓</span>
            )}
          </button>
        )}

        {/* Action: Export Menu */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:text-white backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar dados oficiais"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 w-48 backdrop-blur-md">
              <button
                onClick={() => {
                  onExportGeoJSON();
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span>GeoJSON WGS84</span>
              </button>
              <button
                onClick={() => {
                  onExportCSV();
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Estatísticas CSV (INE)</span>
              </button>
            </div>
          )}
        </div>

        {/* Action: Sources / Methodology */}
        <button
          onClick={onOpenSourcesModal}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2 text-xs font-medium text-slate-300 hover:text-white backdrop-blur-md shadow-lg flex items-center transition-colors cursor-pointer"
          title="Ver Fontes Oficiais e Metadados"
        >
          <Info className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
