import React from 'react';
import { X, ExternalLink, ShieldCheck, Database, Layers, CheckCircle2 } from 'lucide-react';
import { MOZAMBIQUE_NATIONAL_STATS, OFFICIAL_SOURCES } from '../data/provincesData.ts';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Fontes Oficiais, Metadados & Metodologia
              </h3>
              <p className="text-xs text-slate-400">
                Rigour Científico, Cartografia MOZGIS e Estatísticas do INE Moçambique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Cartographic Source */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5 text-sm">
                <Layers className="w-4 h-4 text-sky-400" /> Cartografia & Fronteiras Reais
              </span>
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded font-mono">
                EPSG:4326 WGS84
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              As fronteiras provinciais utilizadas no Mozambique 3D Explorer são originadas directamente da camada oficial do Sistema de Informação Geográfica de Moçambique (MOZGIS) mantido pelo <strong>Ministério da Administração Estatal e Função Pública (MAEFP)</strong>.
            </p>
            <div className="pt-2">
              <a
                href={OFFICIAL_SOURCES.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Serviço de Mapas MOZGIS (MapServer 0) <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Demographics Source */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-white flex items-center gap-1.5 text-sm">
              <Database className="w-4 h-4 text-emerald-400" /> Demografia e Indicadores Estatísticos
            </span>
            <p className="text-slate-300 leading-relaxed">
              Os dados de população, áreas de superfície e densidades são provenientes das publicações oficiais do <strong>Instituto Nacional de Estatística de Moçambique (INE)</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li><strong>IV Recenseamento Geral da População e Habitação (Censo 2017)</strong> - Resultados Definitivos Consolidados.</li>
              <li><strong>Projecções da População das Províncias 2017-2050 (Edição 2020)</strong> - Projecções de referência para o ano corrente de 2024.</li>
              <li><strong>Divisão Administrativa de Moçambique (MAEFP)</strong> - Delimitação dos 154 distritos e municípios do país.</li>
            </ul>
            <div className="pt-2">
              <a
                href={OFFICIAL_SOURCES.ineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Portal Oficial do INE Moçambique (ine.gov.mz) <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Scientific Anti-Hallucination Policy */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-white flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> Rigor Metodológico e Princípio de Integridade
            </span>
            <p className="text-slate-300 leading-relaxed">
              Em cumprimento das directrizes cartográficas e estatísticas:
            </p>
            <ul className="space-y-1.5 pl-1 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Distinção Rigorosa:</strong> A Província de Maputo (com sede na Matola, 8 distritos) é formalmente distinguida da Cidade de Maputo (capital do país, com estatuto provincial especial e 7 distritos urbanos/municipais).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Não Invenção de Dados:</strong> Nenhuma fronteira, estatística demográfica ou facto económico é gerado ficticiamente. Todas as referências apresentam o seu ano e entidade de custódia.
                </span>
              </li>
            </ul>
          </div>

          {/* National Summary */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Províncias</span>
              <span className="text-base font-bold text-white">{MOZAMBIQUE_NATIONAL_STATS.totalProvinces}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Distritos Totais</span>
              <span className="text-base font-bold text-white">{MOZAMBIQUE_NATIONAL_STATS.totalDistricts}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Área Nacional</span>
              <span className="text-base font-bold text-white">{new Intl.NumberFormat('pt-MZ').format(MOZAMBIQUE_NATIONAL_STATS.totalAreaKm2)} km²</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">População Est.</span>
              <span className="text-base font-bold text-white">~31.6 M</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
