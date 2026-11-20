import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Box,
  Sun,
  Moon,
  Compass,
  RotateCcw,
  Tag,
  Camera,
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
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openPopover, setOpenPopover] = useState<'camera' | 'ambiente' | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const metricOptions: { id: ThematicMetric; label: string }[] = [
    { id: 'standard', label: 'Cartográfico' },
    { id: 'population', label: 'População' },
    { id: 'density', label: 'Densidade' },
    { id: 'area', label: 'Área' },
    { id: 'districts', label: 'Distritos' },
    { id: 'region', label: 'Regiões' },
  ];

  const lightingOptions: { id: LightingTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'day', label: 'Dia Tropical', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'night', label: 'Noite', icon: <Moon className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'studio', label: 'Studio PBR', icon: <Box className="w-3.5 h-3.5 text-slate-300" /> },
    { id: 'topographic', label: 'Relevo', icon: <Compass className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  const cameraOptions: { id: CameraPreset; label: string }[] = [
    { id: 'default', label: 'Isométrica 3D' },
    { id: 'topdown', label: '2D Cartográfica' },
    { id: 'norte', label: 'Zona Norte' },
    { id: 'centro', label: 'Zona Centro' },
    { id: 'sul', label: 'Zona Sul' },
  ];

  if (isCollapsed) {
    return (
      <div className="pointer-events-auto">
        <button
          onClick={() => setIsCollapsed(false)}
          className="px-3.5 py-1.5 bg-slate-950/85 hover:bg-slate-900 border border-white/10 rounded-full text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
        >
          <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
          <span>Controlos</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={dockRef}
      className="pointer-events-auto max-w-full hidden lg:flex items-center gap-1 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 text-slate-200"
    >
      {/* Thematic Metric Segmented Strip */}
      <div className="flex items-center gap-0.5">
        {metricOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelectMetric(opt.id)}
            className={`h-8 px-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              thematicMetric === opt.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

      {/* 3D Extrusion Toggle */}
      <button
        onClick={onToggle3DExtrusion}
        className={`h-8 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          is3DExtruded
            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
            : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
        }`}
        title="Alternar Extrusão 3D / Plano"
      >
        <Box className="w-3.5 h-3.5" />
        <span>3D</span>
      </button>

      {/* Labels Toggle */}
      <button
        onClick={onToggleLabels}
        className={`h-8 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          showLabels
            ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30'
            : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
        }`}
        title="Mostrar ou ocultar nomes no mapa"
      >
        <Tag className="w-3.5 h-3.5" />
        <span>Rótulos</span>
      </button>

      {/* Camera Preset Popover */}
      <div className="relative">
        <button
          onClick={() => setOpenPopover((p) => (p === 'camera' ? null : 'camera'))}
          className={`h-8 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            openPopover === 'camera'
              ? 'bg-white/15 text-white'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Vistas de Câmara"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Câmara</span>
        </button>

        {openPopover === 'camera' && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-950/95 border border-white/10 rounded-xl shadow-2xl p-1.5 backdrop-blur-xl space-y-0.5">
            {cameraOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onSelectCameraPreset(opt.id);
                  setOpenPopover(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  cameraPreset === opt.id
                    ? 'bg-sky-500/20 text-sky-300 font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <div className="border-t border-white/10 my-1" />
            <button
              onClick={() => {
                onResetView();
                setOpenPopover(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Vista</span>
            </button>
          </div>
        )}
      </div>

      {/* Lighting & Hubs Popover */}
      <div className="relative">
        <button
          onClick={() => setOpenPopover((p) => (p === 'ambiente' ? null : 'ambiente'))}
          className={`h-8 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            openPopover === 'ambiente'
              ? 'bg-white/15 text-white'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Iluminação e Hubs de Transporte"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Tema</span>
        </button>

        {openPopover === 'ambiente' && (
          <div className="absolute bottom-full right-0 mb-2 w-60 bg-slate-950/95 border border-white/10 rounded-xl shadow-2xl p-2 backdrop-blur-xl space-y-2">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1.5 block mb-1">
                Atmosfera & Luz
              </span>
              <div className="grid grid-cols-2 gap-1">
                {lightingOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSelectLighting(opt.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      lightingTheme === opt.id
                        ? 'bg-sky-500/20 text-white border border-sky-400/30'
                        : 'text-slate-300 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {onToggleTransportLayer && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between px-1.5 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Hubs no Mapa
                  </span>
                  {onOpenTransportPanel && (
                    <button
                      onClick={() => {
                        onOpenTransportPanel();
                        setOpenPopover(null);
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      Abrir Lista →
                    </button>
                  )}
                </div>
                <div className="space-y-0.5">
                  {(['ports', 'airports', 'aerodromes'] as TransportLayerId[]).map((layerId) => {
                    const conf = TRANSPORT_LAYERS_CONFIG[layerId];
                    const enabled = transportLayers ? transportLayers[layerId] : true;
                    return (
                      <button
                        key={layerId}
                        onClick={() => onToggleTransportLayer(layerId)}
                        className="w-full px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="flex items-center gap-2 text-slate-200">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: enabled ? conf.color : '#475569' }}
                          />
                          <span>{conf.label}</span>
                        </span>
                        <span className={`text-[10px] font-mono ${enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {enabled ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zen Collapse */}
      <button
        onClick={() => setIsCollapsed(true)}
        className="h-8 w-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
        title="Ocultar Barra (Modo Zen)"
        aria-label="Ocultar barra de controlos"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
