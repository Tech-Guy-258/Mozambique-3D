import React, { useState, useCallback } from 'react';
import { Map3DCanvas } from './components/Map3DCanvas.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { ControlDock } from './components/ControlDock.tsx';
import { ProvinceDetailDrawer } from './components/ProvinceDetailDrawer.tsx';
import { ComparisonDrawer } from './components/ComparisonDrawer.tsx';
import { SourcesModal } from './components/SourcesModal.tsx';
import { Tooltip } from './components/Tooltip.tsx';
import { DEFAULT_MOZGIS_GEOJSON } from './data/mozgisGeoJson.ts';
import { PROVINCES_DATA } from './data/provincesData.ts';
import { ThematicMetric, LightingTheme, CameraPreset, GeoJSONFeatureCollection } from './types/index.ts';
import { downloadGeoJSON, downloadCSV } from './utils/exporter.ts';
import { syncLiveMozgisData } from './utils/mozgisSync.ts';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  // GeoJSON state (initially official bundled MOZGIS data, can be refreshed live)
  const [geoJson, setGeoJson] = useState<GeoJSONFeatureCollection>(DEFAULT_MOZGIS_GEOJSON);

  // Interaction state
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Visualization settings
  const [thematicMetric, setThematicMetric] = useState<ThematicMetric>('standard');
  const [is3DExtruded, setIs3DExtruded] = useState<boolean>(true);
  const [lightingTheme, setLightingTheme] = useState<LightingTheme>('day');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('default');

  // Modals & Drawers
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareInitialA, setCompareInitialA] = useState<string>('01'); // Cidade de Maputo
  const [compareInitialB, setCompareInitialB] = useState<string>('02'); // Maputo Província
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);

  // Synchronization status with MOZGIS
  const [isSyncingMozgis, setIsSyncingMozgis] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Hover Handler
  const handleHoverProvince = useCallback(
    (id: string | null, mouseEvent?: { x: number; y: number }) => {
      setHoveredProvinceId(id);
      if (id && mouseEvent) {
        setTooltipPos({ x: mouseEvent.x, y: mouseEvent.y });
      } else {
        setTooltipPos(null);
      }
    },
    []
  );

  // Select Province Handler
  const handleSelectProvince = useCallback((id: string | null) => {
    setSelectedProvinceId(id);
  }, []);

  // Open Compare for a specific province
  const handleOpenCompare = (provinceId?: string) => {
    if (provinceId) {
      setCompareInitialA(provinceId);
      // If currently selected is Maputo Cidade, default B to Maputo Província; else Cidade de Maputo
      setCompareInitialB(provinceId === '01' ? '02' : '01');
    }
    setIsCompareOpen(true);
  };

  // Live Sync with MOZGIS
  const handleSyncMozgis = async () => {
    setIsSyncingMozgis(true);
    setSyncStatus('idle');

    try {
      const res = await syncLiveMozgisData();
      if (res.success && res.data) {
        setGeoJson(res.data);
        setSyncStatus('success');
        showToast('success', 'Fronteiras actualizadas com sucesso a partir do servidor MOZGIS MAEFP!');
      } else {
        setSyncStatus('error');
        showToast('error', res.error || 'Não foi possível contactar o servidor MOZGIS. Dados locais mantidos.');
      }
    } catch (err: any) {
      setSyncStatus('error');
      showToast('error', 'Erro ao sincronizar com MOZGIS: ' + err.message);
    } finally {
      setIsSyncingMozgis(false);
    }
  };

  // Reset Camera
  const handleResetCamera = () => {
    setSelectedProvinceId(null);
    setCameraPreset('default');
  };

  const selectedProvinceData = selectedProvinceId ? PROVINCES_DATA[selectedProvinceId] ?? null : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas */}
      <Map3DCanvas
        geoJson={geoJson}
        selectedProvinceId={selectedProvinceId}
        hoveredProvinceId={hoveredProvinceId}
        onSelectProvince={handleSelectProvince}
        onHoverProvince={handleHoverProvince}
        thematicMetric={thematicMetric}
        is3DExtruded={is3DExtruded}
        lightingTheme={lightingTheme}
        showLabels={showLabels}
        cameraPreset={cameraPreset}
        onResetCameraPreset={() => setCameraPreset('default')}
      />

      {/* Top Header & Search Bar */}
      <TopHeader
        onSelectProvince={(id) => {
          setSelectedProvinceId(id);
        }}
        onOpenCompare={() => handleOpenCompare(selectedProvinceId || '01')}
        onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        onSyncMozgis={handleSyncMozgis}
        isSyncingMozgis={isSyncingMozgis}
        syncStatus={syncStatus}
        onExportGeoJSON={() => downloadGeoJSON(geoJson)}
        onExportCSV={downloadCSV}
      />

      {/* Hover Tooltip (pointer-events-none) */}
      <Tooltip
        provinceId={hoveredProvinceId}
        position={tooltipPos}
        thematicMetric={thematicMetric}
      />

      {/* Consolidated Bottom Dock Controls (Zero viewport obstruction) */}
      <ControlDock
        thematicMetric={thematicMetric}
        onSelectMetric={(metric) => setThematicMetric(metric)}
        is3DExtruded={is3DExtruded}
        onToggle3DExtrusion={() => setIs3DExtruded(!is3DExtruded)}
        lightingTheme={lightingTheme}
        onSelectLighting={(theme) => setLightingTheme(theme)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        cameraPreset={cameraPreset}
        onSelectCameraPreset={(preset) => setCameraPreset(preset)}
        onResetView={handleResetCamera}
      />

      {/* Province Dossier Detail Drawer */}
      <ProvinceDetailDrawer
        province={selectedProvinceData}
        onClose={() => setSelectedProvinceId(null)}
        onOpenCompare={(id) => handleOpenCompare(id)}
      />

      {/* Province Comparison Drawer */}
      {isCompareOpen && (
        <ComparisonDrawer
          initialProvinceIdA={compareInitialA}
          initialProvinceIdB={compareInitialB}
          onClose={() => setIsCompareOpen(false)}
          onFocusProvince={(id) => {
            setSelectedProvinceId(id);
          }}
        />
      )}

      {/* Sources & Methodology Modal */}
      <SourcesModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-medium border border-slate-700 bg-slate-900/95 text-white animate-fadeIn">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
