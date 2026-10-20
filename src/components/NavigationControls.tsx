import React, { useRef, useEffect } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Maximize2,
  Move,
  Compass,
} from 'lucide-react';

interface NavigationControlsProps {
  onPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onZoom: (direction: 'in' | 'out') => void;
  onRecenter: () => void;
  isDetailedView?: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPan,
  onZoom,
  onRecenter,
  isDetailedView = false,
}) => {
  const repeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const repeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startContinuousPan = (direction: 'up' | 'down' | 'left' | 'right') => {
    stopContinuousPan();
    // Fire immediately
    onPan(direction);

    // Initial delay then repeat rapidly
    repeatTimerRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => {
        onPan(direction);
      }, 70);
    }, 240);
  };

  const stopContinuousPan = () => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  };

  const startContinuousZoom = (direction: 'in' | 'out') => {
    stopContinuousPan();
    onZoom(direction);

    repeatTimerRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => {
        onZoom(direction);
      }, 90);
    }, 240);
  };

  // Keyboard navigation listener (Arrow keys and +/-)
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
      stopContinuousPan();
    };
  }, [onPan, onZoom, onRecenter]);

  return (
    <div
      className="fixed top-24 left-3 sm:left-5 z-30 pointer-events-auto flex flex-col gap-2 select-none"
      role="toolbar"
      aria-label="Controles de movimentação e zoom do mapa"
    >
      {/* Pan D-Pad */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl p-2 backdrop-blur-md flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-1 mb-1.5 border-b border-slate-800 pb-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1">
            <Move className="w-3 h-3 text-sky-400" />
            <span>Mover</span>
          </span>
          <span className="text-[9px] text-slate-400 font-mono hidden sm:inline" title="Também podes usar as setas do teclado">
            [Setas]
          </span>
        </div>

        {/* Up Button */}
        <button
          onMouseDown={() => startContinuousPan('up')}
          onMouseUp={stopContinuousPan}
          onMouseLeave={stopContinuousPan}
          onTouchStart={() => startContinuousPan('up')}
          onTouchEnd={stopContinuousPan}
          className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-200 hover:text-white rounded-xl transition-all shadow-md border border-slate-700 hover:border-sky-500/50 mb-1 cursor-pointer"
          title="Mover mapa para Cima (Norte) [Seta Cima]"
          aria-label="Mover mapa para cima"
        >
          <ArrowUp className="w-4 h-4 text-sky-300" />
        </button>

        {/* Left, Recenter, Right row */}
        <div className="flex items-center gap-1">
          <button
            onMouseDown={() => startContinuousPan('left')}
            onMouseUp={stopContinuousPan}
            onMouseLeave={stopContinuousPan}
            onTouchStart={() => startContinuousPan('left')}
            onTouchEnd={stopContinuousPan}
            className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-200 hover:text-white rounded-xl transition-all shadow-md border border-slate-700 hover:border-sky-500/50 cursor-pointer"
            title="Mover mapa para a Esquerda (Oeste) [Seta Esquerda]"
            aria-label="Mover mapa para a esquerda"
          >
            <ArrowLeft className="w-4 h-4 text-sky-300" />
          </button>

          <button
            onClick={onRecenter}
            className="p-2 sm:p-2.5 bg-sky-950/80 hover:bg-sky-800/80 active:bg-sky-600 text-sky-400 hover:text-white rounded-xl transition-all shadow-md border border-sky-700/60 cursor-pointer"
            title="Enquadrar e Centralizar Selecção [Home]"
            aria-label="Enquadrar e centralizar mapa"
          >
            <Maximize2 className="w-4 h-4 text-sky-300" />
          </button>

          <button
            onMouseDown={() => startContinuousPan('right')}
            onMouseUp={stopContinuousPan}
            onMouseLeave={stopContinuousPan}
            onTouchStart={() => startContinuousPan('right')}
            onTouchEnd={stopContinuousPan}
            className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-200 hover:text-white rounded-xl transition-all shadow-md border border-slate-700 hover:border-sky-500/50 cursor-pointer"
            title="Mover mapa para a Direita (Este) [Seta Direita]"
            aria-label="Mover mapa para a direita"
          >
            <ArrowRight className="w-4 h-4 text-sky-300" />
          </button>
        </div>

        {/* Down Button */}
        <button
          onMouseDown={() => startContinuousPan('down')}
          onMouseUp={stopContinuousPan}
          onMouseLeave={stopContinuousPan}
          onTouchStart={() => startContinuousPan('down')}
          onTouchEnd={stopContinuousPan}
          className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-200 hover:text-white rounded-xl transition-all shadow-md border border-slate-700 hover:border-sky-500/50 mt-1 cursor-pointer"
          title="Mover mapa para Baixo (Sul) [Seta Baixo]"
          aria-label="Mover mapa para baixo"
        >
          <ArrowDown className="w-4 h-4 text-sky-300" />
        </button>
      </div>

      {/* Zoom In / Out Controls */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl p-1.5 backdrop-blur-md flex flex-col gap-1 items-center">
        <button
          onMouseDown={() => startContinuousZoom('in')}
          onMouseUp={stopContinuousPan}
          onMouseLeave={stopContinuousPan}
          onTouchStart={() => startContinuousZoom('in')}
          onTouchEnd={stopContinuousPan}
          className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-200 hover:text-white rounded-xl transition-all shadow-sm border border-slate-700/70 hover:border-sky-500/50 cursor-pointer"
          title="Aproximar Zoom (+)"
          aria-label="Aproximar zoom"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
        </button>

        <button
          onMouseDown={() => startContinuousZoom('out')}
          onMouseUp={stopContinuousPan}
          onMouseLeave={stopContinuousPan}
          onTouchStart={() => startContinuousZoom('out')}
          onTouchEnd={stopContinuousPan}
          className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-200 hover:text-white rounded-xl transition-all shadow-sm border border-slate-700/70 hover:border-sky-500/50 cursor-pointer"
          title="Afastar Zoom (-)"
          aria-label="Afastar zoom"
        >
          <Minus className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </div>
  );
};
