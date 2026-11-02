import React, { useState } from 'react';
import {
  X,
  Compass,
  MapPin,
  Flame,
  Award,
  BookOpen,
  Globe,
  Waves,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Sparkles,
  Info,
  Shield,
  Layers,
} from 'lucide-react';
import {
  PATRIOTIC_LANDMARKS,
  MOZAMBIQUE_BIRTH_TIMELINE,
  NATIONAL_FLAG_MEANINGS,
  PatrioticLandmark,
} from '../data/patrioticData.ts';

interface PatrioticInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusLandmark: (coords: [number, number], landmarkId?: string) => void;
  selectedLandmarkId?: string | null;
  onSelectLandmark?: (landmarkId: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const PatrioticInfoPanel: React.FC<PatrioticInfoPanelProps> = ({
  isOpen,
  onClose,
  onFocusLandmark,
  selectedLandmarkId = 'zumbo',
  onSelectLandmark,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'expressao' | 'historial' | 'geografia'>('expressao');
  const [activeLandmark, setActiveLandmark] = useState<string>(selectedLandmarkId || 'zumbo');

  if (!isOpen) return null;

  const currentLandmark: PatrioticLandmark =
    PATRIOTIC_LANDMARKS[activeLandmark] || PATRIOTIC_LANDMARKS['zumbo'];

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed top-24 left-3 sm:left-6 z-40 bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-red-950/95 border border-amber-400/60 rounded-2xl shadow-2xl px-3.5 py-2.5 backdrop-blur-md flex items-center gap-2.5 text-xs font-bold text-amber-300 hover:text-white cursor-pointer hover:border-amber-300 transition-all group animate-fadeIn"
        title="Expandir Painel Histórico: Do Zumbo ao Índico"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 via-amber-400 to-red-600 flex items-center justify-center text-[10px] shadow">
          🇲🇿
        </div>
        <span>Do Zumbo ao Índico (História & Pátria)</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed top-20 left-3 sm:left-6 z-40 w-[420px] max-w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-140px)] text-slate-100 overflow-hidden transition-all duration-300">
      {/* Patriotic Flag Banner Header */}
      <div className="relative p-4 border-b border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Mozambique Flag Color Accents Top Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 flex">
          <div className="flex-1 bg-[#007A3D]" />
          <div className="flex-1 bg-[#111827]" />
          <div className="flex-1 bg-[#FFD100]" />
          <div className="flex-1 bg-[#FFFFFF]" />
          <div className="flex-1 bg-[#DA291C]" />
        </div>

        <div className="flex items-start justify-between gap-2 mt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-emerald-600 p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-lg">
                🇲🇿
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  Pátria Amada
                </span>
                <span className="text-[10px] font-mono text-slate-400">25 Junho 1975</span>
              </div>
              <h3 className="text-base font-extrabold text-white tracking-tight leading-tight">
                Do Zumbo ao Índico
              </h3>
              <p className="text-[11px] text-slate-300">
                Historial da Fundação & Identidade de Moçambique
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
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Fechar painel patriótico"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Quote banner */}
        <div className="mt-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 italic flex items-center gap-2">
          <span className="text-amber-400 font-bold not-italic text-sm">“</span>
          <span>
            Do Rovuma ao Maputo, do Zumbo ao Índico, um só povo, uma só nação!
          </span>
          <span className="text-amber-400 font-bold not-italic text-sm">”</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 px-3 text-xs">
        <button
          onClick={() => setActiveTab('expressao')}
          className={`py-2 px-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'expressao'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Zumbo & Índico</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`py-2 px-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'historial'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Historial da Nação</span>
        </button>

        <button
          onClick={() => setActiveTab('geografia')}
          className={`py-2 px-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'geografia'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Moçambique Hoje</span>
        </button>
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar text-xs">
        {/* TAB 1: ZUMBO & ÍNDICO */}
        {activeTab === 'expressao' && (
          <div className="space-y-3">
            {/* Context explanation */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>O Significado da Expressão</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                A célebre expressão <strong className="text-amber-300">«Do Zumbo ao Índico»</strong> é, a par de
                <strong className="text-emerald-300"> «Do Rovuma ao Maputo»</strong>, o mais poderoso símbolo da soberania,
                geografia e unidade inabalável do povo moçambicano. Ela traça o eixo este-oeste que abraça desde a fronteira
                mais continental e profunda do sertão de Tete até à imensidão azul do Oceano Índico.
              </p>
            </div>

            {/* Landmark Selector Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Marcos Cardeais de Moçambique no Mapa 3D
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(PATRIOTIC_LANDMARKS).map((lm) => {
                  const isSel = activeLandmark === lm.id;
                  return (
                    <button
                      key={lm.id}
                      onClick={() => {
                        setActiveLandmark(lm.id);
                        onSelectLandmark?.(lm.id);
                        onFocusLandmark(lm.coordinates, lm.id);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSel
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs truncate flex items-center gap-1">
                          <MapPin
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: lm.badgeColor }}
                          />
                          {lm.name}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: lm.badgeColor }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 truncate">
                        {lm.referencePhrase}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Card of Selected Landmark */}
            <div className="p-3.5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: currentLandmark.badgeColor }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {currentLandmark.province}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white mt-0.5">
                    {currentLandmark.name}
                  </h4>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border"
                  style={{
                    backgroundColor: `${currentLandmark.badgeColor}20`,
                    borderColor: `${currentLandmark.badgeColor}50`,
                    color: currentLandmark.badgeColor,
                  }}
                >
                  {currentLandmark.referencePhrase}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {currentLandmark.description}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Memória Histórica
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  {currentLandmark.historicalNote}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-sky-400 flex items-center gap-1">
                  <Compass className="w-3 h-3" /> Relevância Soberana
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  {currentLandmark.significance}
                </p>
              </div>

              {/* Focus Camera Button */}
              <button
                onClick={() => onFocusLandmark(currentLandmark.coordinates, currentLandmark.id)}
                className="w-full py-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Focar Câmara 3D em {currentLandmark.name}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORIAL DO NASCIMENTO DE MOÇAMBIQUE */}
        {activeTab === 'historial' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> A Epopeia da Libertação Nacional
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                A República de Moçambique nasceu da coragem, unidade e sacrifício de gerações que resistiram
                à opressão colonial, culminando na vitória da Luta Armada e na proclamação da Independência Nacional em 1975.
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-2.5 relative pl-4 border-l-2 border-amber-500/40 ml-2">
              {MOZAMBIQUE_BIRTH_TIMELINE.map((item, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Dot on line */}
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-950 border-2 border-amber-400 shadow" />

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30">
                      {item.year}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-white tracking-tight">
                    {item.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* National Anthem extract */}
            <div className="p-3 bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-800/40 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                🇲🇿 Hino Nacional • Pátria Amada (Extracto)
              </span>
              <p className="text-[10px] text-slate-300 italic leading-relaxed">
                «Na memória de África e do Mundo, pátria bela dos que ousaram lutar.<br />
                Moçambique, o teu nome é liberdade, o Sol de Junho para sempre brilhará!<br />
                Pátria Amada, viva Moçambique!»
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: MOÇAMBIQUE HOJE & GEOGRAFIA */}
        {activeTab === 'geografia' && (
          <div className="space-y-3">
            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                  Superfície Total
                </span>
                <span className="text-sm font-black text-white block mt-0.5">
                  799.380 km²
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">Costa: 2.700 km</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                  População Estimada
                </span>
                <span className="text-sm font-black text-amber-300 block mt-0.5">
                  ~32,4 Milhões
                </span>
                <span className="text-[9px] text-slate-400 font-mono">INE Moçambique</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                  Divisão Territorial
                </span>
                <span className="text-sm font-black text-white block mt-0.5">
                  11 Províncias
                </span>
                <span className="text-[9px] text-sky-400 font-mono">154 Distritos MAEFP</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                  Ponto Mais Alto
                </span>
                <span className="text-sm font-black text-purple-300 block mt-0.5">
                  Monte Binga
                </span>
                <span className="text-[9px] text-purple-400 font-mono">2.436 m (Manica)</span>
              </div>
            </div>

            {/* National Flag Symbology */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Significado das Cores da Bandeira
              </span>
              <div className="space-y-1.5">
                {NATIONAL_FLAG_MEANINGS.map((flagItem, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5 shadow-sm"
                      style={{ backgroundColor: flagItem.color }}
                    />
                    <div className="text-[10px] leading-tight">
                      <strong className="text-white font-semibold">{flagItem.name}: </strong>
                      <span className="text-slate-300">{flagItem.meaning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Location */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                Localização Geoestratégica
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Situado na Costa Oriental da África Austral, Moçambique faz fronteira a norte com a Tanzânia;
                a noroeste com o Malawi e Zâmbia; a oeste com o Zimbabué e África do Sul; a sul com a África do Sul e Eswatini;
                e a leste com o Oceano Índico através do Canal de Moçambique.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
