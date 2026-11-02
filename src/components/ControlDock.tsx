import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Box,
  Sun,
  Moon,
  Compass,
  RotateCcw,
  Tag,
  Eye,
  Camera,
  Navigation,
  Train,
  Anchor,
  Plane,
} from 'lucide-react';
import {
  ThematicMetric,
  LightingTheme,
  CameraPreset,
  TransportLayerId,
  TransportLayersState,
} from '../types/index.ts';
import { TRANSPORT_LAYERS_CONFIG } from '../data/transportData.ts';

interface ControlDockProps {
  thematicMetric: ThematicMetric;
  onSelectMetric: (metric: ThematicMetric) => void;
  is3DExtruded: boolean;
  onToggle3DExtrusion: () => void;
  lightingTheme: LightingTheme;
  onSelectLighting: (theme: LightingTheme) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onResetView: () => void;
  transportLayers?: TransportLayersState;
  onToggleTransportLayer?: (layerId: TransportLayerId) => void;
  onOpenTransportPanel?: () => void;
  onOpenGoogleRoads?: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  thematicMetric,
  onSelectMetric,
  is3DExtruded,
  onToggle3DExtrusion,
  lightingTheme,
  onSelectLighting,
  showLabels,
  onToggleLabels,
  cameraPreset,
  onSelectCameraPreset,
  onResetView,
  transportLayers,
  onToggleTransportLayer,
  onOpenTransportPanel,
  onOpenGoogleRoads,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'camadas' | 'transportes' | 'camara' | 'ambiente'>('camadas');

  const metricOptions: { id: ThematicMetric; label: string; desc: string }[] = [
    { id: 'standard', label: 'Cartográfico', desc: 'Cores provinciais oficiais' },
    { id: 'population', label: 'População', desc: 'INE Projecção 2024' },
    { id: 'density', label: 'Densidade', desc: 'Habitantes / km²' },
    { id: 'area', label: 'Área (km²)', desc: 'Extensão territorial' },
    { id: 'districts', label: 'Distritos', desc: 'Divisão MAEFP' },
    { id: 'region', label: 'Regiões', desc: 'Norte, Centro e Sul' },
  ];

  const lightingOptions: { id: LightingTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'day', label: 'Dia Tropical', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'night', label: 'Noite', icon: <Moon className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'studio', label: 'Studio PBR', icon: <Box className="w-3.5 h-3.5 text-slate-300" /> },
    { id: 'topographic', label: 'Relevo', icon: <Compass className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-4xl px-3 transition-transform duration-300">
      <div className="flex flex-col items-center">
        {/* Toggle Collapse Pill */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mb-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-full text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" /> Mostrar Controlos 3D
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> Ocultar Controlos (Modo Zen)
            </>
          )}
        </button>

        {/* Main Dock Card */}
        {!isCollapsed && (
          <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-3 backdrop-blur-md flex flex-col gap-2.5 text-slate-200">
            {/* Dock Header Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('camadas')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'camadas'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Camadas Temáticas
                </button>

                <button
                  onClick={() => setActiveTab('transportes')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'transportes'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" /> Rede Transportes
                </button>

                <button
                  onClick={() => setActiveTab('camara')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'camara'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" /> Câmara & Vistas
                </button>

                <button
                  onClick={() => setActiveTab('ambiente')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'ambiente'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Atmosfera & Luz
                </button>
              </div>

              {/* Quick Actions in Dock Header */}
              <div className="flex items-center gap-1.5">
                {/* 3D Extrusion Switch */}
                <button
                  onClick={onToggle3DExtrusion}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                    is3DExtruded
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Extrusão 3D proporcional ao indicador selecionado"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Extrusão 3D:</span>
                  <span className="font-bold">{is3DExtruded ? 'Prismática' : 'Plana'}</span>
                </button>

                {/* 3D Labels Toggle */}
                <button
                  onClick={onToggleLabels}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                    showLabels
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Exibir ou ocultar nomes das províncias e capitais em 3D"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Rótulos:</span>
                  <span className="font-bold">{showLabels ? 'Ligados' : 'Desligados'}</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Camadas Temáticas */}
            {activeTab === 'camadas' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                {metricOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSelectMetric(opt.id)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      thematicMetric === opt.id
                        ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Hubs de Transporte (Portos Marítimos, Aeroportos e Aeródromos) */}
            {activeTab === 'transportes' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['ports', 'airports', 'aerodromes'] as TransportLayerId[]).map((layerId) => {
                    const conf = TRANSPORT_LAYERS_CONFIG[layerId];
                    const isEnabled = transportLayers ? transportLayers[layerId] : true;
                    return (
                      <button
                        key={layerId}
                        onClick={() => onToggleTransportLayer?.(layerId)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isEnabled
                            ? 'bg-slate-800 border-amber-500/60 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: isEnabled ? conf.color : '#64748b' }}
                          />
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${
                              isEnabled ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isEnabled ? 'ACTIVA' : 'OFF'}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-white truncate">{conf.label}</div>
                        <div className="text-[9px] text-slate-400 truncate">{conf.description}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center justify-between pt-1 border-t border-slate-800 gap-2">
                  {onOpenGoogleRoads && (
                    <button
                      onClick={onOpenGoogleRoads}
                      className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/50 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3 h-3 text-sky-400" />
                      <span>Mapa Rodoviário Oficial Google (Rotas)</span>
                    </button>
                  )}
                  {onOpenTransportPanel && (
                    <button
                      onClick={onOpenTransportPanel}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Painel de Hubs (Portos & Aeródromos)</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Câmara & Vistas */}
            {activeTab === 'camara' && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => onSelectCameraPreset('default')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'default'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  Vista Isométrica 3D
                </button>

                <button
                  onClick={() => onSelectCameraPreset('topdown')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'topdown'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  Vista 2D Cartográfica (Nadir)
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

                <button
                  onClick={() => onSelectCameraPreset('norte')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'norte'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  Zona Norte
                </button>

                <button
                  onClick={() => onSelectCameraPreset('centro')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'centro'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  Zona Centro
                </button>

                <button
                  onClick={() => onSelectCameraPreset('sul')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'sul'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  Zona Sul
                </button>

                <button
                  onClick={onResetView}
                  className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restaurar Posição
                </button>
              </div>
            )}

            {/* Tab 3: Atmosfera & Iluminação */}
            {activeTab === 'ambiente' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {lightingOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSelectLighting(opt.id)}
                    className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all ${
                      lightingTheme === opt.id
                        ? 'bg-sky-500/20 border-sky-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {opt.icon}
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
