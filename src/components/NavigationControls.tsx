import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Maximize2,
  Move,
  RotateCw,
  RefreshCw,
  Columns2,
  Box,
} from 'lucide-react';

interface NavigationControlsProps {
  onPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onZoom: (direction: 'in' | 'out') => void;
  onRecenter: () => void;
  isDetailedView?: boolean;
  verticalView?: boolean;
  onToggleVerticalView?: () => void;
  rotateQuarterTurn?: boolean;
  onToggleQuarterTurn?: () => void;
  autoRotate?: boolean;
  onToggleAutoRotate?: () => void;
  isolationTitle?: string | null;
  isolationSubtitle?: string | null;
  onIsolationBack?: () => void;
}

export const StageIsolationBadge: React.FC<{
  title: string;
  subtitle?: string | null;
  onBack?: () => void;
}> = ({ title, subtitle, onBack }) => (
  <div className="absolute top-3 left-3 z-20 pointer-events-auto flex items-center gap-2 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-1.5 shadow-xl max-w-[calc(100%-175px)] sm:max-w-[340px]">
    {onBack && (
      <button
        onClick={onBack}
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
        title="Voltar ao nível anterior"
        aria-label="Voltar ao nível anterior"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
      </button>
    )}
    <div className="min-w-0">
      <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider block leading-none truncate">
        {subtitle || 'Vista Isolada'}
      </span>
      <span className="text-sm font-bold text-white block truncate mt-0.5 leading-tight">
        {title}
      </span>
    </div>
  </div>
);

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPan,
  onZoom,
  onRecenter,
  isDetailedView = false,
  verticalView = true,
  onToggleVerticalView,
  rotateQuarterTurn = false,
  onToggleQuarterTurn,
  autoRotate = false,
  onToggleAutoRotate,
}) => {
  const [isPanOpen, setIsPanOpen] = useState(false);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const panPopoverRef = useRef<HTMLDivElement>(null);

  const stopContinuous = () => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  };

  const startContinuousPan = (direction: 'up' | 'down' | 'left' | 'right') => {
    stopContinuous();
    onPan(direction);
    repeatTimerRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => {
        onPan(direction);
      }, 70);
    }, 240);
  };

  const startContinuousZoom = (direction: 'in' | 'out') => {
    stopContinuous();
    onZoom(direction);
    repeatTimerRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => {
        onZoom(direction);
      }, 90);
    }, 240);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panPopoverRef.current && !panPopoverRef.current.contains(e.target as Node)) {
        setIsPanOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onPan('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onPan('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPan('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onPan('right');
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        onZoom('in');
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        onZoom('out');
      } else if (e.key === 'Home') {
        e.preventDefault();
        onRecenter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopContinuous();
    };
  }, [onPan, onZoom, onRecenter]);

  return (
    <div
      className="pointer-events-auto flex flex-wrap items-center gap-1.5 select-none"
      role="toolbar"
      aria-label="Controlos interativos do palco 3D"
    >
        {/* Zoom, Recenter & Pan Popover */}
        <div ref={panPopoverRef} className="relative flex items-center gap-1 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl">
          <button
            onMouseDown={() => startContinuousZoom('in')}
            onMouseUp={stopContinuous}
            onMouseLeave={stopContinuous}
            onTouchStart={() => startContinuousZoom('in')}
            onTouchEnd={stopContinuous}
            className="h-8 w-8 rounded-xl hover:bg-white/10 active:bg-sky-600/40 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Aproximar Zoom (+)"
            aria-label="Aproximar zoom"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onMouseDown={() => startContinuousZoom('out')}
            onMouseUp={stopContinuous}
            onMouseLeave={stopContinuous}
            onTouchStart={() => startContinuousZoom('out')}
            onTouchEnd={stopContinuous}
            className="h-8 w-8 rounded-xl hover:bg-white/10 active:bg-sky-600/40 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Afastar Zoom (-)"
            aria-label="Afastar zoom"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={onRecenter}
            className="h-8 px-2.5 rounded-xl hover:bg-white/10 text-sky-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            title="Enquadrar e Centralizar [Home]"
            aria-label="Enquadrar mapa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enquadrar</span>
          </button>

          <button
            onClick={() => setIsPanOpen((prev) => !prev)}
            className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isPanOpen ? 'bg-sky-500/20 text-sky-300' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Mover Câmara (ou use as setas do teclado)"
            aria-label="Abrir controlo de movimento"
          >
            <Move className="w-3.5 h-3.5" />
          </button>

          {isPanOpen && (
            <div className="absolute bottom-full left-0 mb-2 bg-slate-950/95 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-1">
              <button
                onMouseDown={() => startContinuousPan('up')}
                onMouseUp={stopContinuous}
                onMouseLeave={stopContinuous}
                onTouchStart={() => startContinuousPan('up')}
                onTouchEnd={stopContinuous}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 flex items-center justify-center cursor-pointer"
                aria-label="Mover para cima"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onMouseDown={() => startContinuousPan('left')}
                  onMouseUp={stopContinuous}
                  onMouseLeave={stopContinuous}
                  onTouchStart={() => startContinuousPan('left')}
                  onTouchEnd={stopContinuous}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 flex items-center justify-center cursor-pointer"
                  aria-label="Mover para esquerda"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={onRecenter}
                  className="w-8 h-8 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 flex items-center justify-center cursor-pointer"
                  aria-label="Centralizar"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onMouseDown={() => startContinuousPan('right')}
                  onMouseUp={stopContinuous}
                  onMouseLeave={stopContinuous}
                  onTouchStart={() => startContinuousPan('right')}
                  onTouchEnd={stopContinuous}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 flex items-center justify-center cursor-pointer"
                  aria-label="Mover para direita"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onMouseDown={() => startContinuousPan('down')}
                onMouseUp={stopContinuous}
                onMouseLeave={stopContinuous}
                onTouchStart={() => startContinuousPan('down')}
                onTouchEnd={stopContinuous}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 flex items-center justify-center cursor-pointer"
                aria-label="Mover para baixo"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Interactive Presentation Controls (visible in Province & District isolation) */}
        {isDetailedView && (
          <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl">
            {onToggleVerticalView && (
              <button
                onClick={onToggleVerticalView}
                className={`h-8 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  verticalView
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
                title="Alternar entre apresentação Vertical (topo-frontal) e Perspetiva 3D"
              >
                {verticalView ? <Columns2 className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
                <span>{verticalView ? 'Vertical' : '3D'}</span>
              </button>
            )}

            {onToggleQuarterTurn && (
              <button
                onClick={onToggleQuarterTurn}
                className={`h-8 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  rotateQuarterTurn
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
                title="Rodar apresentação 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rodar 90°</span>
              </button>
            )}

            {onToggleAutoRotate && (
              <button
                onClick={onToggleAutoRotate}
                className={`h-8 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  autoRotate
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
                title="Ativar ou pausar rotação orbital 360°"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Girar 360°</span>
              </button>
            )}
          </div>
        )}
      </div>
  );
};
