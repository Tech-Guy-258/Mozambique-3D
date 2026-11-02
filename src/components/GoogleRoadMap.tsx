// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
} from '@vis.gl/react-google-maps';
import {
  Navigation,
  Search,
  ArrowUpDown,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowLeft,
  X,
  Share2,
} from 'lucide-react';
import { useAutocompleteSuggestions } from '../hooks/useAutocompleteSuggestions.ts';

// Default Mozambique Territorial Center and Bounding Box
const MOZAMBIQUE_CENTER = { lat: -18.6657, lng: 35.5296 };
const MOZAMBIQUE_DEFAULT_ZOOM = 6;

// Strategic Mozambican Road Corridors for 1-Click Exploration
export const MOZAMBIQUE_CORRIDORS = [
  {
    id: 'en4',
    code: 'EN4',
    name: 'Corredor do Maputo (EN4)',
    origin: 'Maputo, Moçambique',
    destination: 'Ressano Garcia, Moçambique',
    description: 'Autoestrada com portagem ligando Maputo à África do Sul',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  {
    id: 'en1-xai',
    code: 'EN1',
    name: 'EN1: Maputo → Xai-Xai',
    origin: 'Maputo, Moçambique',
    destination: 'Xai-Xai, Moçambique',
    description: 'Eixo rodoviário vital do Sul ao longo do vale do Limpopo',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  },
  {
    id: 'en1-beira',
    code: 'EN1',
    name: 'EN1: Maputo → Beira',
    origin: 'Maputo, Moçambique',
    destination: 'Beira, Moçambique',
    description: 'Ligação vertebral entre as regiões Sul e Centro de Moçambique',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
  },
  {
    id: 'en6-beira',
    code: 'EN6',
    name: 'Corredor da Beira (EN6)',
    origin: 'Beira, Moçambique',
    destination: 'Machipanda, Moçambique',
    description: 'Ligação estratégica do Porto da Beira a Chimoio e Zimbabwe',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  {
    id: 'n13-nacala',
    code: 'N13',
    name: 'Corredor de Nacala (N13)',
    origin: 'Nampula, Moçambique',
    destination: 'Nacala-Porto, Moçambique',
    description: 'Ligação da metrópole nortenha ao porto de águas profundas',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  },
  {
    id: 'n7-tete',
    code: 'N7',
    name: 'Corredor de Tete (N7)',
    origin: 'Chimoio, Moçambique',
    destination: 'Tete, Moçambique',
    description: 'Travessia do Rio Zambeze e corredor de carvão e energia',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  },
];

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  originAddress: string;
  destinationAddress: string;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  steps: RouteStep[];
}

interface GoogleRoadMapProps {
  onReturnTo3D: () => void;
}

/**
 * Inner Map Controller that uses useMap() and useMapsLibrary() inside the APIProvider
 */
function RoadMapInner({ onReturnTo3D }: GoogleRoadMapProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const placesLib = useMapsLibrary('places');

  // Input state
  const [originInput, setOriginInput] = useState('Maputo, Moçambique');
  const [destinationInput, setDestinationInput] = useState('Xai-Xai, Moçambique');
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);

  // Active suggestions hooks for both inputs
  const originSuggestions = useAutocompleteSuggestions(
    activeInput === 'origin' ? originInput : ''
  );
  const destSuggestions = useAutocompleteSuggestions(
    activeInput === 'destination' ? destinationInput : ''
  );

  // Calculation state
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Panel state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  // Polylines references for cleanup
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear polylines from the map
  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach((polyline) => {
      polyline.setMap(null);
    });
    polylinesRef.current = [];
  }, []);

  // Compute road route using the modern Routes API SDK wrapper
  const handleCalculateRoute = useCallback(
    async (overrideOrigin?: string, overrideDest?: string) => {
      const orig = (overrideOrigin ?? originInput).trim();
      const dest = (overrideDest ?? destinationInput).trim();

      if (!orig || !dest) {
        setErrorMessage('Por favor especifique a localidade de origem e o destino.');
        return;
      }

      if (!routesLib || !map) {
        setErrorMessage('A biblioteca de rotas da Google ainda está a carregar...');
        return;
      }

      setIsCalculating(true);
      setErrorMessage(null);
      setQuotaExceeded(false);
      clearPolylines();

      try {
        const request = {
          origin: orig,
          destination: dest,
          travelMode: 'DRIVING',
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
        };

        const response: any = await (routesLib.Route as any).computeRoutes(request);
        const routes = response?.routes;

        if (!routes || routes.length === 0) {
          setErrorMessage('Não foi possível calcular um percurso rodoviário entre estas localidades.');
          setIsCalculating(false);
          return;
        }

        const primaryRoute = routes[0];

        // Render path polylines with high visual contrast for Mozambican roads
        const newPolylines: google.maps.Polyline[] = primaryRoute.createPolylines();
        newPolylines.forEach((p) => {
          p.setOptions({
            strokeColor: '#0284c7', // Sky-600
            strokeWeight: 6,
            strokeOpacity: 0.9,
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;

        // Automatically frame Mozambique viewport around the calculated route
        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, {
            top: 80,
            right: 80,
            bottom: 80,
            left: 380, // Offset for side control panel
          });
        }

        // Parse turn-by-turn steps & statistics
        const leg = primaryRoute.legs?.[0];
        const steps: RouteStep[] = [];

        if (leg?.steps) {
          leg.steps.forEach((s: any) => {
            const rawInstruction = s.navigationInstruction?.instructions || s.instructions || '';
            // Strip HTML tags if present in instructions
            const cleanInstruction = rawInstruction.replace(/<[^>]*>?/gm, '');
            if (cleanInstruction) {
              steps.push({
                instruction: cleanInstruction,
                distance: s.distanceMeters ? `${(s.distanceMeters / 1000).toFixed(1)} km` : '',
                duration: s.durationMillis ? `${Math.round(s.durationMillis / 60000)} min` : '',
              });
            }
          });
        }

        const distanceKm = primaryRoute.distanceMeters
          ? Math.round((primaryRoute.distanceMeters / 1000) * 10) / 10
          : 0;
        const durationMinutes = primaryRoute.durationMillis
          ? Math.round(primaryRoute.durationMillis / 60000)
          : 0;

        const startLoc = leg?.startLocation?.latLng
          ? { lat: leg.startLocation.latLng.latitude, lng: leg.startLocation.latLng.longitude }
          : MOZAMBIQUE_CENTER;
        const endLoc = leg?.endLocation?.latLng
          ? { lat: leg.endLocation.latLng.latitude, lng: leg.endLocation.latLng.longitude }
          : MOZAMBIQUE_CENTER;

        setRouteResult({
          distanceKm,
          durationMinutes,
          originAddress: orig,
          destinationAddress: dest,
          startLocation: startLoc,
          endLocation: endLoc,
          steps,
        });
      } catch (err: any) {
        console.error('Error computing routes:', err);
        const errStr = String(err?.message || err);
        if (
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('Quota exceeded') ||
          errStr.includes('OVER_QUERY_LIMIT')
        ) {
          setQuotaExceeded(true);
          setErrorMessage(
            'Limite de demonstração da API Google Maps atingido. Configure uma chave de produção no Google Cloud Console para tráfego contínuo.'
          );
        } else {
          setErrorMessage(`Falha ao calcular percurso: ${err?.message || 'Verifique a conectividade ou as localidades'}`);
        }
      } finally {
        setIsCalculating(false);
      }
    },
    [originInput, destinationInput, routesLib, map, clearPolylines]
  );

  // Initial calculation on mount (Maputo -> Xai-Xai EN1)
  useEffect(() => {
    if (routesLib && map && !routeResult && !isCalculating) {
      handleCalculateRoute();
    }
  }, [routesLib, map]);

  // Clean up polylines on unmount
  useEffect(() => {
    return () => {
      clearPolylines();
    };
  }, [clearPolylines]);

  // Swap Origin and Destination
  const handleSwap = () => {
    const temp = originInput;
    setOriginInput(destinationInput);
    setDestinationInput(temp);
    if (routeResult) {
      handleCalculateRoute(destinationInput, temp);
    }
  };

  // Recenter map on Mozambique
  const handleRecenterMozambique = () => {
    if (map) {
      map.setCenter(MOZAMBIQUE_CENTER);
      map.setZoom(MOZAMBIQUE_DEFAULT_ZOOM);
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format minutes into hours and minutes string
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours === 0) return `${m} min`;
    return `${hours}h ${m > 0 ? `${m}m` : ''}`;
  };

  // Google Maps External URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originInput
  )}&destination=${encodeURIComponent(destinationInput)}&travelmode=driving`;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 font-sans select-none overflow-hidden">
      {/* Google Maps Base Canvas */}
      <Map
        defaultCenter={MOZAMBIQUE_CENTER}
        defaultZoom={MOZAMBIQUE_DEFAULT_ZOOM}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
        mapTypeId={mapType}
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeControl={true}
        streetViewControl={true}
        fullscreenControl={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Origin Marker */}
        {routeResult && (
          <AdvancedMarker
            position={routeResult.startLocation}
            title={`Origem: ${routeResult.originAddress}`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-xl text-slate-950 font-black text-xs animate-bounce">
              A
            </div>
          </AdvancedMarker>
        )}

        {/* Destination Marker */}
        {routeResult && (
          <AdvancedMarker
            position={routeResult.endLocation}
            title={`Destino: ${routeResult.destinationAddress}`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl text-white font-black text-xs animate-bounce">
              B
            </div>
          </AdvancedMarker>
        )}
      </Map>

      {/* Top Floating App Bar */}
      <header className="absolute top-3 inset-x-3 sm:inset-x-5 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Return to 3D Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onReturnTo3D}
            className="bg-slate-900/95 hover:bg-slate-800 text-white border border-slate-700/80 rounded-2xl px-3 py-2 text-xs font-semibold backdrop-blur-md shadow-2xl flex items-center gap-2 transition-all cursor-pointer group"
            title="Voltar ao mapa 3D interactivo de Moçambique"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Mapa 3D (MOZGIS)</span>
          </button>

          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl px-3.5 py-2 backdrop-blur-md shadow-2xl flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Navigation className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                  Rede Rodoviária de Moçambique
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                  Google Maps Cartography
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Map Actions (Recenter, Fullscreen) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleRecenterMozambique}
            className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md shadow-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Recentrar no enquadramento nacional de Moçambique"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Recentrar Moçambique</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl p-2 text-xs font-medium backdrop-blur-md shadow-xl flex items-center transition-colors cursor-pointer"
            title={isFullscreen ? 'Sair de ecrã inteiro' : 'Ecrã inteiro'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-slate-300" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </header>

      {/* Floating Route Calculation Panel (Left Desktop / Bottom Mobile) */}
      <div
        className={`absolute z-20 transition-all duration-300 ${
          isPanelCollapsed
            ? 'bottom-4 left-4'
            : 'top-18 left-3 sm:left-5 bottom-4 w-full max-w-[360px] sm:max-w-[400px]'
        }`}
      >
        {isPanelCollapsed ? (
          <button
            onClick={() => setIsPanelCollapsed(false)}
            className="bg-slate-900/95 hover:bg-slate-800 text-white border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs font-bold backdrop-blur-md shadow-2xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <Navigation className="w-4 h-4 text-sky-400" />
            <span>Abrir Calculador de Rotas</span>
            <ChevronUp className="w-4 h-4 text-slate-400" />
          </button>
        ) : (
          <div className="h-full flex flex-col bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden text-slate-100">
            {/* Panel Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  Calculador Rodoviário
                </h2>
              </div>
              <button
                onClick={() => setIsPanelCollapsed(true)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Minimizar painel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Origin & Destination Inputs */}
              <div className="relative space-y-2">
                {/* Origin Input */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-400">Origem:</span>
                  </div>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      value={originInput}
                      onChange={(e) => {
                        setOriginInput(e.target.value);
                        setActiveInput('origin');
                      }}
                      onFocus={() => setActiveInput('origin')}
                      placeholder="Ex: Maputo, Matola, Chimoio..."
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                    {originInput && (
                      <button
                        onClick={() => setOriginInput('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Origin Autocomplete Suggestions Dropdown */}
                  {activeInput === 'origin' && originSuggestions.suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 p-1">
                      {originSuggestions.suggestions.map((sug, idx) => {
                        const text = sug.placePrediction?.text?.toString() || '';
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setOriginInput(text);
                              setActiveInput(null);
                              originSuggestions.resetSession();
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-end pr-2 -my-1 relative z-10">
                  <button
                    onClick={handleSwap}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 rounded-lg shadow transition-colors cursor-pointer"
                    title="Inverter origem e destino"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                </div>

                {/* Destination Input */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-300 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-400">Destino:</span>
                  </div>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      value={destinationInput}
                      onChange={(e) => {
                        setDestinationInput(e.target.value);
                        setActiveInput('destination');
                      }}
                      onFocus={() => setActiveInput('destination')}
                      placeholder="Ex: Beira, Nampula, Tete, Pemba..."
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                    {destinationInput && (
                      <button
                        onClick={() => setDestinationInput('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Destination Autocomplete Suggestions Dropdown */}
                  {activeInput === 'destination' && destSuggestions.suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 p-1">
                      {destSuggestions.suggestions.map((sug, idx) => {
                        const text = sug.placePrediction?.text?.toString() || '';
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setDestinationInput(text);
                              setActiveInput(null);
                              destSuggestions.resetSession();
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                            <span className="truncate">{text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Compute Route Button */}
              <button
                onClick={() => handleCalculateRoute()}
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>A calcular percurso com Google Routes API...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>Calcular Percurso Rodoviário</span>
                  </>
                )}
              </button>

              {/* Error / Quota Notice */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Aviso da API</p>
                    <p className="text-[11px] text-rose-200 mt-0.5">{errorMessage}</p>
                    {quotaExceeded && (
                      <a
                        href="https://console.cloud.google.com/google/maps-apis/overview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-sky-400 underline font-semibold mt-1"
                      >
                        Consola Google Cloud <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Corridors Presets */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Corredores Nacionais Estratégicos
                  </span>
                  <span className="text-[10px] text-slate-500">1-clique</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {MOZAMBIQUE_CORRIDORS.map((corridor) => (
                    <button
                      key={corridor.id}
                      onClick={() => {
                        setOriginInput(corridor.origin);
                        setDestinationInput(corridor.destination);
                        handleCalculateRoute(corridor.origin, corridor.destination);
                      }}
                      className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono font-bold px-1 rounded border ${corridor.badgeColor}`}>
                          {corridor.code}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors" />
                      </div>
                      <p className="text-[11px] font-semibold text-white group-hover:text-sky-300 truncate mt-1">
                        {corridor.name}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{corridor.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Route Details */}
              {routeResult && (
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                        Resumo do Percurso
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        Via Rodoviária
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <Navigation className="w-3.5 h-3.5 text-sky-400" />
                          <span>Distância</span>
                        </div>
                        <p className="text-base font-black text-white mt-0.5 font-mono">
                          {routeResult.distanceKm} <span className="text-xs font-normal text-slate-400">km</span>
                        </p>
                      </div>

                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tempo Estimado</span>
                        </div>
                        <p className="text-base font-black text-white mt-0.5 font-mono">
                          {formatDuration(routeResult.durationMinutes)}
                        </p>
                      </div>
                    </div>

                    {/* Step-by-step navigation instructions */}
                    {routeResult.steps.length > 0 && (
                      <div className="pt-1">
                        <button
                          onClick={() => setShowSteps(!showSteps)}
                          className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white py-1 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                          <span className="font-semibold">
                            Instruções de Condução ({routeResult.steps.length} passos)
                          </span>
                          {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {showSteps && (
                          <div className="mt-2 max-h-56 overflow-y-auto space-y-1.5 pr-1">
                            {routeResult.steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2"
                              >
                                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 font-mono text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="leading-snug">{step.instruction}</p>
                                  {step.distance && (
                                    <span className="text-[10px] text-sky-400 font-mono mt-0.5 block">
                                      {step.distance} • {step.duration}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Open in Google Maps Button */}
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Navegar no Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main GoogleRoadMap Component wrapping APIProvider and Quota Fallback
 */
export const GoogleRoadMap: React.FC<GoogleRoadMapProps> = ({ onReturnTo3D }) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAaaXh5LV85FCijREwaBHgPSWYoLCtHvHc';

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={['routes', 'places', 'marker']}
      language="pt-PT"
      region="MZ"
    >
      <RoadMapInner onReturnTo3D={onReturnTo3D} />
    </APIProvider>
  );
};
