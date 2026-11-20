import React, { useState, useCallback, useEffect } from 'react';
import { Map3DCanvas } from './components/Map3DCanvas.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { ControlDock } from './components/ControlDock.tsx';
import { ProvinceDetailDrawer } from './components/ProvinceDetailDrawer.tsx';
import { ComparisonDrawer } from './components/ComparisonDrawer.tsx';
import { SourcesModal } from './components/SourcesModal.tsx';
import { Tooltip } from './components/Tooltip.tsx';
import { NavigationControls, StageIsolationBadge } from './components/NavigationControls.tsx';
import { GoogleRoadsMap } from './components/GoogleRoadsMap.tsx';
import { DEFAULT_MOZGIS_GEOJSON } from './data/mozgisGeoJson.ts';
import { PROVINCES_DATA } from './data/provincesData.ts';
import { ALL_DISTRICTS_DATA } from './data/allDistrictsData.ts';
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

  // View mode: national overview vs isolated provincial/district 3D view
  const [viewMode, setViewMode] = useState<ViewMode>('national');
  const [detailedProvinceId, setDetailedProvinceId] = useState<string | null>(null);

  // National interaction state
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // District interaction state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  // Interactive 3D Presentation controls (Vertical Upright vs 3D, 90° turn, 360° orbit)
  const [verticalView, setVerticalView] = useState<boolean>(true);
  const [rotateQuarterTurn, setRotateQuarterTurn] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

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
  const [compareInitialA, setCompareInitialA] = useState<string>('01');
  const [compareInitialB, setCompareInitialB] = useState<string>('02');
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

  // Patriotic Landmarks State ("Do Zumbo ao Índico") - closed by default for minimalist launch
  const [isPatrioticPanelOpen, setIsPatrioticPanelOpen] = useState<boolean>(false);
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
    }, 4000);
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
        setIsPatrioticPanelOpen(false);
        setSelectedProvinceId(null);
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
    setIsTransportPanelOpen(false);
    setSelectedProvinceId(null);
    setIsPatrioticPanelOpen(true);
    setIsPatrioticCollapsed(false);
  }, []);

  const handleSelectPatrioticLandmark = useCallback((landmarkId: string) => {
    setSelectedPatrioticLandmarkId(landmarkId);
    setIsTransportPanelOpen(false);
    setSelectedProvinceId(null);
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

  // District Hover Handler (works both from 3D raycast with mouse coords and from sidebar row hover without mouse coords)
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

  // Select Province Handler: Isolates the province vertically beside the right-hand info panel
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
      setIsTransportPanelOpen(false);
      setIsPatrioticPanelOpen(false);
      setVerticalView(true);
      setRotateQuarterTurn(false);
    } else {
      setSelectedProvinceId(null);
    }
  }, []);

  // Direct District Isolation from Search
  const handleSelectDistrictFromSearch = useCallback((provinceId: string, districtCode: string) => {
    setDetailedProvinceId(provinceId);
    setViewMode('province-detailed');
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(districtCode);
    setHoveredProvinceId(null);
    setHoveredDistrictId(null);
    setTooltipPos(null);
    setIsDrawerCollapsed(false);
    setIsTransportPanelOpen(false);
    setIsPatrioticPanelOpen(false);
    setVerticalView(true);
    setRotateQuarterTurn(false);
  }, []);

  // Select District Handler: Isolates only the clicked district vertically beside its info panel
  const handleSelectDistrict = useCallback((id: string | null) => {
    setSelectedDistrictId(id);
    setHoveredDistrictId(null);
    setTooltipPos(null);
    if (id) {
      setIsDrawerCollapsed(false);
      setVerticalView(true);
      setRotateQuarterTurn(false);
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
    setAutoRotate(false);
    setRotateQuarterTurn(false);
    setVerticalView(true);
  }, []);

  // Pan & Zoom Handlers
  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setPanAction({ id: Date.now(), type: direction });
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setPanAction({ id: Date.now(), type: direction });
  }, []);

  const handleResetCamera = useCallback(() => {
    setPanAction({ id: Date.now(), type: 'recenter' });
    if (viewMode === 'national') {
      setCameraPreset('default');
    }
  }, [viewMode]);

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
        showToast('success', 'Fronteiras actualizadas com sucesso a partir do servidor MOZGIS!');
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

  const isDetailed = viewMode === 'province-detailed' || viewMode === 'tete-detailed';
  const activeProvId = detailedProvinceId || (viewMode === 'tete-detailed' ? '07' : null);
  const activeProvince = activeProvId ? PROVINCES_DATA[activeProvId] : null;
  const activeDistrict = selectedDistrictId ? ALL_DISTRICTS_DATA[selectedDistrictId] ?? null : null;

  const selectedProvinceData =
    selectedProvinceId && viewMode === 'national' ? PROVINCES_DATA[selectedProvinceId] ?? null : null;

  const isDrawerOpen = Boolean(
    (selectedProvinceData && !isDrawerCollapsed && !isTransportPanelOpen && !isPatrioticPanelOpen) ||
    (isDetailed && !isDrawerCollapsed) ||
    (isTransportPanelOpen && !isTransportCollapsed && !isDetailed) ||
    (isPatrioticPanelOpen && !isPatrioticCollapsed && !isDetailed)
  );

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#060911] font-sans select-none">
      {/* Minimal Top Bar with Breadcrumbs & Search (non-overlapping top row) */}
      <TopHeader
        onSelectProvince={handleSelectProvince}
        onSelectDistrictFromSearch={handleSelectDistrictFromSearch}
        onSelectDistrict={handleSelectDistrict}
        onOpenCompare={() => handleOpenCompare(selectedProvinceId || '01')}
        onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        onSyncMozgis={handleSyncMozgis}
        isSyncingMozgis={isSyncingMozgis}
        syncStatus={syncStatus}
        onExportGeoJSON={() => downloadGeoJSON(geoJson)}
        onExportCSV={downloadCSV}
        viewMode={viewMode}
        detailedProvinceId={detailedProvinceId}
        selectedDistrictId={selectedDistrictId}
        onReturnToNational={handleReturnToNational}
        onSelectViewMode={(mode) => setViewMode(mode)}
        isTransportPanelOpen={isTransportPanelOpen}
        onToggleTransportPanel={() => {
          setIsTransportPanelOpen((prev) => {
            const next = !prev;
            if (next) {
              setIsTransportCollapsed(false);
              setIsPatrioticPanelOpen(false);
              setSelectedProvinceId(null);
            }
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
              setSelectedProvinceId(null);
            }
            return next;
          });
        }}
      />

      {/* Quota Exceeded Banner */}
      {quotaExceeded && (
        <div className="fixed top-20 inset-x-4 z-40 max-w-xl mx-auto p-3 rounded-xl bg-amber-950/90 border border-amber-600/80 shadow-2xl backdrop-blur-md text-amber-100 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold">Limite de Quota Google Maps</p>
              <p className="text-[11px] text-amber-200">
                A chave de demonstração atingiu o limite de consultas ou requer ativação no Google Cloud.
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuotaExceeded(false)}
            className="p-1 rounded hover:bg-amber-900/60 text-amber-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Distributed Workspace: 3D Stage + Docked Side Info Card */}
      <main className="relative flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {viewMode === 'google-roads' ? (
          <div className="relative flex-1 w-full h-full overflow-hidden">
            <GoogleRoadsMap onReturnTo3D={() => setViewMode('national')} />
          </div>
        ) : (
          <>
            {/* Dedicated Unobstructed 3D Stage */}
            <div className="relative flex-1 min-w-0 min-h-0 overflow-hidden">
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
                verticalView={verticalView}
                autoRotate={autoRotate}
                rotateQuarterTurn={rotateQuarterTurn}
              />

              {/* Top-Left Stage Isolation Badge & Back Button (anchored to top-left of 3D stage) */}
              {isDetailed && (activeDistrict || activeProvince) && (
                <StageIsolationBadge
                  title={activeDistrict ? activeDistrict.name : activeProvince!.name}
                  subtitle={activeDistrict ? 'Distrito Selecionado' : 'Província Selecionada'}
                  onBack={() => {
                    if (activeDistrict) {
                      handleSelectDistrict(null);
                    } else {
                      handleReturnToNational();
                    }
                  }}
                />
              )}

              {/* Non-overlapping Bottom Stage Controls & Dock */}
              <div className="pointer-events-none absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-end justify-between gap-2">
                <NavigationControls
                  onPan={handlePan}
                  onZoom={handleZoom}
                  onRecenter={handleResetCamera}
                  isDetailedView={isDetailed}
                  verticalView={verticalView}
                  onToggleVerticalView={() => setVerticalView((prev) => !prev)}
                  rotateQuarterTurn={rotateQuarterTurn}
                  onToggleQuarterTurn={() => setRotateQuarterTurn((prev) => !prev)}
                  autoRotate={autoRotate}
                  onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
                />

                {!isDetailed && (
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
                      setIsPatrioticPanelOpen(false);
                      setSelectedProvinceId(null);
                    }}
                    onOpenGoogleRoads={() => setViewMode('google-roads')}
                  />
                )}
              </div>

              {/* Hover Tooltip (suppressed for already-selected district so it never covers it) */}
              <Tooltip
                provinceId={hoveredProvinceId}
                districtId={hoveredDistrictId && hoveredDistrictId !== selectedDistrictId ? hoveredDistrictId : null}
                transportItem={hoveredTransportItem}
                position={tooltipPos}
                thematicMetric={thematicMetric}
              />
            </div>

            {/* Patriotic "Do Zumbo ao Índico" Side Card (National Mode) */}
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

            {/* Transport Network Side Card (National Mode) */}
            {isTransportPanelOpen && !isDetailed && (
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

            {/* National Province Dossier Side Card */}
            {selectedProvinceData && !isDetailed && !isTransportPanelOpen && !isPatrioticPanelOpen && (
              <ProvinceDetailDrawer
                province={selectedProvinceData}
                onClose={() => setSelectedProvinceId(null)}
                onOpenCompare={(id) => handleOpenCompare(id)}
                isCollapsed={isDrawerCollapsed}
                onToggleCollapse={() => setIsDrawerCollapsed((prev) => !prev)}
                onExploreProvince={(id) => handleSelectProvince(id)}
              />
            )}

            {/* Isolated Province & District Detailed Side Card */}
            {isDetailed && (
              <ProvinceDetailedPanel
                provinceId={detailedProvinceId || '07'}
                selectedDistrictId={selectedDistrictId}
                onSelectDistrict={handleSelectDistrict}
                onHoverDistrict={(id) => handleHoverDistrict(id)}
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
      </main>

      {/* Sources & Methodology Modal */}
      <SourcesModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-xs font-medium border border-white/10 bg-slate-950/95 text-white animate-fadeIn">
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
