import React, { useState, useCallback, useEffect } from 'react';
import { Map3DCanvas } from './components/Map3DCanvas.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { ControlDock } from './components/ControlDock.tsx';
import { ProvinceDetailDrawer } from './components/ProvinceDetailDrawer.tsx';
import { TeteDetailedPanel } from './components/TeteDetailedPanel.tsx';
import { ComparisonDrawer } from './components/ComparisonDrawer.tsx';
import { SourcesModal } from './components/SourcesModal.tsx';
import { Tooltip } from './components/Tooltip.tsx';
import { NavigationControls } from './components/NavigationControls.tsx';
import { GoogleRoadsMap } from './components/GoogleRoadsMap.tsx';
import { DEFAULT_MOZGIS_GEOJSON } from './data/mozgisGeoJson.ts';
import { PROVINCES_DATA } from './data/provincesData.ts';
import {
  ThematicMetric,
  LightingTheme,
  CameraPreset,
  GeoJSONFeatureCollection,
  ViewMode,
  PanAction,
  TransportLayerId,
  TransportLayersState,
  TransportRoute,
  TransportNode,
} from './types/index.ts';
import { ProvinceDetailedPanel } from './components/ProvinceDetailedPanel.tsx';
import { TransportPanel } from './components/TransportPanel.tsx';
import { downloadGeoJSON, downloadCSV } from './utils/exporter.ts';
import { syncLiveMozgisData } from './utils/mozgisSync.ts';
import { DEFAULT_TRANSPORT_LAYERS } from './data/transportData.ts';
import { PatrioticInfoPanel } from './components/PatrioticInfoPanel.tsx';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  // GeoJSON state (initially official bundled MOZGIS data, can be refreshed live)
  const [geoJson, setGeoJson] = useState<GeoJSONFeatureCollection>(DEFAULT_MOZGIS_GEOJSON);

  // View mode: national overview vs provincial detailed 3D view
  const [viewMode, setViewMode] = useState<ViewMode>('national');
  const [detailedProvinceId, setDetailedProvinceId] = useState<string | null>(null);

  // National interaction state
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // District interaction state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  // Pan, Zoom & Drawer collapse state
  const [panAction, setPanAction] = useState<PanAction | null>(null);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false);

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

  // Transport Network State
  const [isTransportPanelOpen, setIsTransportPanelOpen] = useState<boolean>(false);
  const [isTransportCollapsed, setIsTransportCollapsed] = useState<boolean>(false);
  const [transportLayers, setTransportLayers] = useState<TransportLayersState>(DEFAULT_TRANSPORT_LAYERS);
  const [selectedTransportItem, setSelectedTransportItem] = useState<{
    type: 'route' | 'node';
    item: TransportRoute | TransportNode;
  } | null>(null);
  const [hoveredTransportItem, setHoveredTransportItem] = useState<{
    type: 'route' | 'node';
    item: TransportRoute | TransportNode;
  } | null>(null);
  const [focusTransportCoords, setFocusTransportCoords] = useState<[number, number] | null>(null);

  // Patriotic Landmarks State ("Do Zumbo ao Índico")
  const [isPatrioticPanelOpen, setIsPatrioticPanelOpen] = useState<boolean>(true);
  const [isPatrioticCollapsed, setIsPatrioticCollapsed] = useState<boolean>(false);
  const [selectedPatrioticLandmarkId, setSelectedPatrioticLandmarkId] = useState<string | null>('zumbo');

  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
      showToast('error', 'Aviso: Quota da API Google Maps atingida ou chave de teste expirada.');
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Transport Layer Handlers
  const handleToggleTransportLayer = useCallback((layerId: TransportLayerId) => {
    setTransportLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  const handleSetAllTransportLayers = useCallback((enabled: boolean) => {
    setTransportLayers({
      primary_roads: false,
      secondary_roads: false,
      railways: false,
      ports: enabled,
      airports: enabled,
      aerodromes: enabled,
    });
  }, []);

  const handleSetTransportPreset = useCallback(
    (preset: 'all' | 'maritime' | 'aviation' | 'none') => {
      switch (preset) {
        case 'all':
          setTransportLayers({
            primary_roads: false,
            secondary_roads: false,
            railways: false,
            ports: true,
            airports: true,
            aerodromes: true,
          });
          break;
        case 'maritime':
          setTransportLayers({
            primary_roads: false,
            secondary_roads: false,
            railways: false,
            ports: true,
            airports: false,
            aerodromes: false,
          });
          break;
        case 'aviation':
          setTransportLayers({
            primary_roads: false,
            secondary_roads: false,
            railways: false,
            ports: false,
            airports: true,
            aerodromes: true,
          });
          break;
        case 'none':
          setTransportLayers({
            primary_roads: false,
            secondary_roads: false,
            railways: false,
            ports: false,
            airports: false,
            aerodromes: false,
          });
          break;
      }
    },
    []
  );

  const handleSelectTransportItem = useCallback(
    (item: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null) => {
      setSelectedTransportItem(item);
      if (item) {
        setIsTransportPanelOpen(true);
        setIsTransportCollapsed(false);
        if (item.type === 'node') {
          setFocusTransportCoords((item.item as TransportNode).coordinates);
        } else {
          const coords = (item.item as TransportRoute).coordinates;
          const mid = coords[Math.floor(coords.length / 2)];
          setFocusTransportCoords(mid);
        }
      }
    },
    []
  );

  const handleHoverTransportItem = useCallback(
    (
      item: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null,
      mouseEvent?: { x: number; y: number }
    ) => {
      setHoveredTransportItem(item);
      if (item && mouseEvent) {
        setTooltipPos({ x: mouseEvent.x, y: mouseEvent.y });
      } else if (!hoveredProvinceId && !hoveredDistrictId) {
        setTooltipPos(null);
      }
    },
    [hoveredProvinceId, hoveredDistrictId]
  );

  const handleFocusTransportItem = useCallback((coordinates: [number, number]) => {
    setFocusTransportCoords([...coordinates]);
  }, []);

  const handleFocusPatrioticLandmark = useCallback((coordinates: [number, number], landmarkId?: string) => {
    setFocusTransportCoords([...coordinates]);
    if (landmarkId) {
      setSelectedPatrioticLandmarkId(landmarkId);
    }
    setIsPatrioticPanelOpen(true);
    setIsPatrioticCollapsed(false);
  }, []);

  const handleSelectPatrioticLandmark = useCallback((landmarkId: string) => {
    setSelectedPatrioticLandmarkId(landmarkId);
    setIsPatrioticPanelOpen(true);
    setIsPatrioticCollapsed(false);
  }, []);

  // Province Hover Handler
  const handleHoverProvince = useCallback(
    (id: string | null, mouseEvent?: { x: number; y: number }) => {
      if (viewMode === 'national') {
        setHoveredProvinceId(id);
        if (id && mouseEvent) {
          setTooltipPos({ x: mouseEvent.x, y: mouseEvent.y });
        } else if (!hoveredTransportItem) {
          setTooltipPos(null);
        }
      }
    },
    [viewMode, hoveredTransportItem]
  );

  // District Hover Handler
  const handleHoverDistrict = useCallback(
    (id: string | null, mouseEvent?: { x: number; y: number }) => {
      if (viewMode === 'province-detailed' || viewMode === 'tete-detailed') {
        setHoveredDistrictId(id);
        if (id && mouseEvent) {
          setTooltipPos({ x: mouseEvent.x, y: mouseEvent.y });
        } else if (!hoveredTransportItem) {
          setTooltipPos(null);
        }
      }
    },
    [viewMode, hoveredTransportItem]
  );

  // Select Province Handler (automatically opens that province's 3D explorer with all districts)
  const handleSelectProvince = useCallback((id: string | null) => {
    if (id) {
      setDetailedProvinceId(id);
      setViewMode('province-detailed');
      setSelectedProvinceId(id);
      setSelectedDistrictId(null);
      setHoveredProvinceId(null);
      setHoveredDistrictId(null);
      setTooltipPos(null);
      setIsDrawerCollapsed(false);
      const prov = PROVINCES_DATA[id];
      const provName = prov?.name || id;
      const count = prov?.districtsCount || 0;
      showToast('success', `${provName} 3D Explorer aberto (${count} distritos oficiais do MOZGIS).`);
    } else {
      setSelectedProvinceId(null);
    }
  }, []);

  // Select District Handler
  const handleSelectDistrict = useCallback((id: string | null) => {
    setSelectedDistrictId(id);
    if (id) {
      setIsDrawerCollapsed(false);
    }
  }, []);

  // Return to National Map Mode
  const handleReturnToNational = useCallback(() => {
    setViewMode('national');
    setDetailedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedProvinceId(null);
    setHoveredProvinceId(null);
    setHoveredDistrictId(null);
    setTooltipPos(null);
    setCameraPreset('default');
  }, []);

  // Pan & Zoom Handlers for Navigation Controls
  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setPanAction({ id: Date.now(), type: direction });
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setPanAction({ id: Date.now(), type: direction });
  }, []);

  const handleRecenter = useCallback(() => {
    setPanAction({ id: Date.now(), type: 'recenter' });
  }, []);

  // Open Compare for a specific province
  const handleOpenCompare = (provinceId?: string) => {
    if (provinceId) {
      setCompareInitialA(provinceId);
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
    if (viewMode === 'province-detailed' || viewMode === 'tete-detailed') {
      setSelectedDistrictId(null);
      setPanAction({ id: Date.now(), type: 'recenter' });
    } else {
      setSelectedProvinceId(null);
      setCameraPreset('default');
      setPanAction({ id: Date.now(), type: 'recenter' });
    }
  };

  const isDetailed = viewMode === 'province-detailed' || viewMode === 'tete-detailed';

  const selectedProvinceData =
    selectedProvinceId && viewMode === 'national' ? PROVINCES_DATA[selectedProvinceId] ?? null : null;

  const isDrawerOpen = Boolean(
    (selectedProvinceData && !isDrawerCollapsed) ||
    (isDetailed && !isDrawerCollapsed) ||
    (isTransportPanelOpen && !isTransportCollapsed)
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Header & Search Bar */}
      <TopHeader
        onSelectProvince={handleSelectProvince}
        onOpenCompare={() => handleOpenCompare(selectedProvinceId || '01')}
        onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        onSyncMozgis={handleSyncMozgis}
        isSyncingMozgis={isSyncingMozgis}
        syncStatus={syncStatus}
        onExportGeoJSON={() => downloadGeoJSON(geoJson)}
        onExportCSV={downloadCSV}
        viewMode={viewMode}
        detailedProvinceId={detailedProvinceId}
        onReturnToNational={handleReturnToNational}
        onSelectViewMode={(mode) => setViewMode(mode)}
        isTransportPanelOpen={isTransportPanelOpen}
        onToggleTransportPanel={() => {
          setIsTransportPanelOpen((prev) => {
            const next = !prev;
            if (next) setIsPatrioticCollapsed(true);
            return next;
          });
        }}
        activeTransportLayersCount={[transportLayers.ports, transportLayers.airports, transportLayers.aerodromes].filter(Boolean).length}
        isPatrioticPanelOpen={isPatrioticPanelOpen}
        onTogglePatrioticPanel={() => {
          setIsPatrioticPanelOpen((prev) => {
            const next = !prev;
            if (next) {
              setIsPatrioticCollapsed(false);
              setIsTransportPanelOpen(false);
            }
            return next;
          });
        }}
      />

      {/* Quota Exceeded Banner */}
      {quotaExceeded && (
        <div className="fixed top-18 inset-x-4 z-40 max-w-xl mx-auto p-3 rounded-xl bg-amber-950/90 border border-amber-600/80 shadow-2xl backdrop-blur-md text-amber-100 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold">Limite de Demonstração / Quota Google Maps</p>
              <p className="text-[11px] text-amber-200">
                A chave de demonstração atingiu o limite de consultas ou requer ativação de faturação no projeto Google Cloud.
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuotaExceeded(false)}
            className="p-1 rounded hover:bg-amber-900/60 text-amber-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Google Road Map View */}
      {viewMode === 'google-roads' ? (
        <GoogleRoadsMap onReturnTo3D={() => setViewMode('national')} />
      ) : (
        <>
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
            viewMode={viewMode}
            detailedProvinceId={detailedProvinceId}
            selectedDistrictId={selectedDistrictId}
            hoveredDistrictId={hoveredDistrictId}
            onSelectDistrict={handleSelectDistrict}
            onHoverDistrict={handleHoverDistrict}
            onReturnToNational={handleReturnToNational}
            panAction={panAction}
            isDrawerOpen={isDrawerOpen}
            transportLayers={transportLayers}
            selectedTransportItem={selectedTransportItem}
            hoveredTransportItem={hoveredTransportItem}
            onSelectTransportItem={handleSelectTransportItem}
            onHoverTransportItem={handleHoverTransportItem}
            focusTransportCoords={focusTransportCoords}
            onSelectPatrioticLandmark={handleSelectPatrioticLandmark}
            selectedPatrioticLandmarkId={selectedPatrioticLandmarkId}
          />

          {/* On-Screen Navigation Controls (Pan D-Pad, Recenter & Zoom) */}
          <NavigationControls
            onPan={handlePan}
            onZoom={handleZoom}
            onRecenter={handleResetCamera}
            isDetailedView={isDetailed}
          />

          {/* Hover Tooltip (supports provincial, district, and transport hover states) */}
          <Tooltip
            provinceId={hoveredProvinceId}
            districtId={hoveredDistrictId}
            transportItem={hoveredTransportItem}
            position={tooltipPos}
            thematicMetric={thematicMetric}
          />

          {/* Consolidated Bottom Dock Controls */}
          <ControlDock
            thematicMetric={thematicMetric}
            onSelectMetric={(metric) => setThematicMetric(metric)}
            is3DExtruded={is3DExtruded}
            onToggle3DExtrusion={() => setIs3DExtruded((prev) => !prev)}
            lightingTheme={lightingTheme}
            onSelectLighting={(theme) => setLightingTheme(theme)}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
            cameraPreset={cameraPreset}
            onSelectCameraPreset={(preset) => setCameraPreset(preset)}
            onResetView={handleResetCamera}
            transportLayers={transportLayers}
            onToggleTransportLayer={handleToggleTransportLayer}
            onOpenTransportPanel={() => {
              setIsTransportPanelOpen(true);
              setIsTransportCollapsed(false);
              setIsPatrioticCollapsed(true);
            }}
            onOpenGoogleRoads={() => setViewMode('google-roads')}
          />

          {/* Patriotic "Do Zumbo ao Índico" Info & History Panel */}
          {isPatrioticPanelOpen && !isDetailed && (
            <PatrioticInfoPanel
              isOpen={isPatrioticPanelOpen}
              onClose={() => setIsPatrioticPanelOpen(false)}
              onFocusLandmark={handleFocusPatrioticLandmark}
              selectedLandmarkId={selectedPatrioticLandmarkId}
              onSelectLandmark={setSelectedPatrioticLandmarkId}
              isCollapsed={isPatrioticCollapsed}
              onToggleCollapse={() => setIsPatrioticCollapsed((prev) => !prev)}
            />
          )}

          {/* Transport Network Drawer & Layer Selector */}
          {isTransportPanelOpen && (
            <TransportPanel
              layersState={transportLayers}
              onToggleLayer={handleToggleTransportLayer}
              onSetAllLayers={handleSetAllTransportLayers}
              onSetPreset={handleSetTransportPreset}
              selectedTransportItem={selectedTransportItem}
              onSelectTransportItem={handleSelectTransportItem}
              onFocusTransportItem={handleFocusTransportItem}
              isCollapsed={isTransportCollapsed}
              onToggleCollapse={() => setIsTransportCollapsed((prev) => !prev)}
              onClose={() => setIsTransportPanelOpen(false)}
              onOpenGoogleRoads={() => setViewMode('google-roads')}
            />
          )}

          {/* National Province Dossier Detail Drawer (when a province is selected in national mode) */}
          {selectedProvinceData && !isDetailed && !isTransportPanelOpen && (
            <ProvinceDetailDrawer
              province={selectedProvinceData}
              onClose={() => setSelectedProvinceId(null)}
              onOpenCompare={(id) => handleOpenCompare(id)}
              isCollapsed={isDrawerCollapsed}
              onToggleCollapse={() => setIsDrawerCollapsed((prev) => !prev)}
              onExploreProvince={(id) => handleSelectProvince(id)}
            />
          )}

          {/* Provincial Detailed Explorer Panel (active in detailed 3D mode for ANY province) */}
          {isDetailed && (
            <ProvinceDetailedPanel
              provinceId={detailedProvinceId || '07'}
              selectedDistrictId={selectedDistrictId}
              onSelectDistrict={handleSelectDistrict}
              onReturnToNational={handleReturnToNational}
              isCollapsed={isDrawerCollapsed}
              onToggleCollapse={() => setIsDrawerCollapsed((prev) => !prev)}
            />
          )}

          {/* Province Comparison Drawer */}
          {isCompareOpen && (
            <ComparisonDrawer
              initialProvinceIdA={compareInitialA}
              initialProvinceIdB={compareInitialB}
              onClose={() => setIsCompareOpen(false)}
              onFocusProvince={(id) => handleSelectProvince(id)}
            />
          )}
        </>
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
            className="ml-2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
