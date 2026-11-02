import React, { useState } from 'react';
import {
  Navigation,
  Compass,
  Anchor,
  Plane,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckSquare,
  Square,
  Layers,
  Info,
  MapPin,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  TransportLayerId,
  TransportLayersState,
  TransportRoute,
  TransportNode,
} from '../types/index.ts';
import {
  TRANSPORT_LAYERS_CONFIG,
  TRANSPORT_NODES,
} from '../data/transportData.ts';

// Only point infrastructure layers are rendered in the 3D map controls
const ACTIVE_3D_LAYERS: TransportLayerId[] = ['ports', 'airports', 'aerodromes'];

interface TransportPanelProps {
  layersState: TransportLayersState;
  onToggleLayer: (layerId: TransportLayerId) => void;
  onSetAllLayers: (enabled: boolean) => void;
  onSetPreset: (preset: 'all' | 'maritime' | 'aviation' | 'none') => void;
  selectedTransportItem: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null;
  onSelectTransportItem: (item: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null) => void;
  onFocusTransportItem?: (coordinates: [number, number]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  onOpenGoogleRoads?: () => void;
}

export const TransportPanel: React.FC<TransportPanelProps> = ({
  layersState,
  onToggleLayer,
  onSetAllLayers,
  onSetPreset,
  selectedTransportItem,
  onSelectTransportItem,
  onFocusTransportItem,
  isCollapsed = false,
  onToggleCollapse,
  onClose,
  onOpenGoogleRoads,
}) => {
  const [activeTab, setActiveTab] = useState<'camadas' | 'nos' | 'detalhe'>('camadas');
  const [searchQuery, setSearchQuery] = useState('');

  // Count active layers among the available point layers (ports, airports, aerodromes)
  const activeLayersCount = ACTIVE_3D_LAYERS.filter((id) => layersState[id]).length;

  const filteredNodes = TRANSPORT_NODES.filter((n) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      n.name.toLowerCase().includes(query) ||
      n.code.toLowerCase().includes(query) ||
      n.provinceName.toLowerCase().includes(query) ||
      n.category.toLowerCase().includes(query) ||
      n.operator.toLowerCase().includes(query)
    );
  });

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed top-24 left-3 sm:left-6 z-40 bg-slate-900/95 border border-amber-500/50 rounded-2xl shadow-2xl px-3.5 py-2.5 backdrop-blur-md flex items-center gap-2.5 text-xs font-bold text-amber-400 hover:text-white cursor-pointer hover:border-amber-400 transition-all group animate-fadeIn"
        title="Expandir Painel de Transportes"
      >
        <Navigation className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
        <span>Nós de Transporte ({activeLayersCount}/3 Camadas)</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed top-20 left-3 sm:left-6 z-40 w-96 max-w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-140px)] text-slate-100 overflow-hidden transition-all duration-300">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              Rede de Transportes & Hubs
            </h3>
            <p className="text-[10px] text-slate-400">
              Portos Marítimos • Aeroportos ADM • Aeródromos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Recolher painel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Fechar painel de transportes"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 px-3 text-xs">
        <button
          onClick={() => setActiveTab('camadas')}
          className={`py-2 px-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'camadas'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Camadas ({activeLayersCount}/3)</span>
        </button>

        <button
          onClick={() => setActiveTab('nos')}
          className={`py-2 px-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'nos'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>Nós & Hubs ({TRANSPORT_NODES.length})</span>
        </button>

        {selectedTransportItem && (
          <button
            onClick={() => setActiveTab('detalhe')}
            className={`py-2 px-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'detalhe'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Ficha</span>
          </button>
        )}
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar text-xs">
        {activeTab === 'camadas' && (
          <div className="space-y-3.5">
            {/* Quick Presets for Available 3D Hubs */}
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                Predefinições Rápidas
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onSetPreset('all')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Todos os Hubs</span>
                </button>
                <button
                  onClick={() => onSetPreset('maritime')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Anchor className="w-3 h-3 text-sky-400" />
                  <span>Portos Marítimos</span>
                </button>
                <button
                  onClick={() => onSetPreset('aviation')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plane className="w-3 h-3 text-purple-400" />
                  <span>Rede Aérea</span>
                </button>
                <button
                  onClick={() => onSetPreset('none')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <EyeOff className="w-3 h-3 text-slate-400" />
                  <span>Ocultar Todos</span>
                </button>
              </div>
            </div>

            {/* Google Road Map Shortcut Banner */}
            {onOpenGoogleRoads && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-sky-950/70 to-indigo-950/70 border border-sky-800/80 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[11px] font-bold text-white">Mapa Rodoviário Google</span>
                  </div>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    Google Maps
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Consulte traçados rodoviários oficiais (EN1, EN4, EN6, etc.), localidades e cálculo de rotas no mapa dedicado.
                </p>
                <button
                  onClick={onOpenGoogleRoads}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-1.5 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Abrir no Google Maps Rodoviário</span>
                </button>
              </div>
            )}

            {/* Individual Layer Toggles - ONLY Ports, Airports, Aerodromes (No roads or railways) */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Selecção de Camadas
              </span>

              {ACTIVE_3D_LAYERS.map((layerId) => {
                const config = TRANSPORT_LAYERS_CONFIG[layerId];
                const isEnabled = layersState[layerId];
                const nodesCount = TRANSPORT_NODES.filter((n) => n.layer === layerId).length;

                return (
                  <div
                    key={layerId}
                    onClick={() => onToggleLayer(layerId)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isEnabled
                        ? 'bg-slate-800/80 border-slate-600/80 shadow-md'
                        : 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="pt-0.5">
                      {isEnabled ? (
                        <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="font-semibold text-white text-xs truncate">
                            {config.label}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] font-mono font-medium text-slate-400 border border-slate-700/60">
                          {nodesCount} nós
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {config.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'nos' && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar portos, aeroportos ou aeródromos..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredNodes.map((node) => {
                const config = TRANSPORT_LAYERS_CONFIG[node.layer];
                const isSelected = selectedTransportItem?.item.id === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      onSelectTransportItem({ type: 'node', item: node });
                      setActiveTab('detalhe');
                      if (onFocusTransportItem) {
                        onFocusTransportItem(node.coordinates);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-lg'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="font-bold text-white text-xs">{node.code}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {node.provinceName}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-200 truncate">{node.name}</p>
                    <p className="text-[10px] text-amber-400/90 mt-0.5 truncate">{node.category}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 pt-1 border-t border-slate-800">
                      <span>{node.operator}</span>
                      <span className="text-sky-400 flex items-center gap-0.5">
                        Ver ficha <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'detalhe' && selectedTransportItem && (
          <div className="space-y-3">
            {selectedTransportItem.type === 'node' ? (
              // Node Detail Card (Airport, Port, Aerodrome)
              (() => {
                const node = selectedTransportItem.item as TransportNode;
                const config = TRANSPORT_LAYERS_CONFIG[node.layer];

                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase border"
                          style={{
                            backgroundColor: `${config.color}20`,
                            borderColor: `${config.color}40`,
                            color: config.color,
                          }}
                        >
                          {node.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {node.code}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white tracking-tight">{node.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {node.provinceName} • {node.operator}
                      </p>
                      {node.runwayOrBerths && (
                        <p className="text-[10px] text-sky-400 font-mono mt-1">
                          {node.runwayOrBerths}
                        </p>
                      )}
                    </div>

                    {node.capacityOrTraffic && (
                      <div className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">
                          Capacidade & Tráfego Operacional
                        </span>
                        <p className="text-xs font-semibold text-white font-mono">
                          {node.capacityOrTraffic}
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Descrição do Hub
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    {node.highlights && node.highlights.length > 0 && (
                      <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Características & Infraestruturas
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {node.highlights.map((h, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {onFocusTransportItem && (
                      <button
                        onClick={() => onFocusTransportItem(node.coordinates)}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Focar Câmara 3D no Local</span>
                      </button>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-center text-slate-400">
                Selecione um nó de transporte (porto, aeroporto ou aeródromo) para ver a ficha detalhada.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
