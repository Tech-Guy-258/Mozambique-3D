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
} from 'lucide-react';
import { PROVINCES_DATA, MOZAMBIQUE_NATIONAL_STATS, OFFICIAL_SOURCES } from '../data/provincesData.ts';

interface TopHeaderProps {
  onSelectProvince: (id: string) => void;
  onOpenCompare: () => void;
  onOpenSourcesModal: () => void;
  onSyncMozgis: () => Promise<void>;
  isSyncingMozgis: boolean;
  syncStatus: 'idle' | 'success' | 'error';
  onExportGeoJSON: () => void;
  onExportCSV: () => void;
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

  return (
    <header className="fixed top-3 inset-x-3 sm:inset-x-5 z-30 pointer-events-none flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      {/* Brand Badge */}
      <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl p-3 sm:px-4 sm:py-3 backdrop-blur-md flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-yellow-500 to-red-600 flex items-center justify-center shadow-md">
          <Globe className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
              Mozambique 3D Explorer
            </h1>
            <span className="text-[10px] font-mono bg-sky-950/80 text-sky-400 border border-sky-800/80 px-1.5 py-0.5 rounded font-semibold">
              MOZGIS WGS84
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Fronteiras Administrativas MAEFP & Estatísticas INE Moçambique
          </p>
        </div>
      </div>

      {/* Center Search & Actions */}
      <div className="pointer-events-auto flex items-center gap-2 self-stretch md:self-auto justify-end">
        {/* Search Input with Autocomplete */}
        <div ref={searchRef} className="relative flex-1 md:w-64 lg:w-72">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar província ou distrito..."
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
                  className="w-full p-2 text-left rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors group"
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

        {/* Action: Compare */}
        <button
          onClick={onOpenCompare}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:text-white backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors"
          title="Comparar 2 províncias lado a lado"
        >
          <ArrowRightLeft className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Comparar</span>
        </button>

        {/* Action: Sync MOZGIS */}
        <button
          onClick={onSyncMozgis}
          disabled={isSyncingMozgis}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:text-white backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors"
          title="Sincronizar fronteiras ao vivo com servidor MOZGIS MAEFP"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncingMozgis ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline">MOZGIS</span>
          {syncStatus === 'success' && (
            <span className="hidden sm:inline text-[10px] text-emerald-400 font-mono">✓</span>
          )}
        </button>

        {/* Action: Export Menu */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:text-white backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors"
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
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2 transition-colors"
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span>GeoJSON WGS84</span>
              </button>
              <button
                onClick={() => {
                  onExportCSV();
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2 transition-colors"
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
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2 text-xs font-medium text-slate-300 hover:text-white backdrop-blur-md shadow-lg flex items-center transition-colors"
          title="Ver Fontes Oficiais e Metadados"
        >
          <Info className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
