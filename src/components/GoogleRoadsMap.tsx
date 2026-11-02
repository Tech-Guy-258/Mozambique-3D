/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import {
  Search,
  Navigation,
  ArrowUpDown,
  RotateCcw,
  ExternalLink,
  Car,
  Clock,
  Compass,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Route as RouteIcon,
  HelpCircle,
  LocateFixed,
} from 'lucide-react';
import { CalculatedRouteDetails, RouteStepInfo } from '../types/index.ts';

// Central geographic coordinates for Mozambique
const MOZAMBIQUE_CENTER = { lat: -18.665695, lng: 35.529562 };
const DEFAULT_ZOOM = 6;

// Pre-configured official corridors of Mozambique
const NATIONAL_CORRIDORS = [
  {
    code: 'EN1',
    name: 'Corredor Longitudinal Nacional',
    origin: 'Maputo, Moçambique',
    destination: 'Xai-Xai, Moçambique',
    description: 'Espinha dorsal de Moçambique: liga a capital ao centro e norte.',
  },
  {
    code: 'EN4',
    name: 'Corredor de Maputo',
    origin: 'Maputo, Moçambique',
    destination: 'Ressano Garcia, Moçambique',
    description: 'Ligação estratégica de Maputo e Matola à fronteira da África do Sul.',
  },
  {
    code: 'EN6',
    name: 'Corredor da Beira',
    origin: 'Beira, Moçambique',
    destination: 'Machipanda, Moçambique',
    description: 'Eixo logístico vital que liga o Porto da Beira a Chimoio e ao Zimbabwe.',
  },
  {
    code: 'EN7',
    name: 'Corredor de Tete',
    origin: 'Tete, Moçambique',
    destination: 'Zóbuè, Moçambique',
    description: 'Ligação transfronteiriça entre Tete, Moatize e o Malawi.',
  },
  {
    code: 'EN8',
    name: 'Corredor de Nacala',
    origin: 'Nampula, Moçambique',
    destination: 'Nacala Porto, Moçambique',
    description: 'Conexão entre a capital do norte (Nampula) e o porto de águas profundas de Nacala.',
  },
];

// Inner map controller component for routes, autocomplete, markers & camera
interface RoadsMapInnerProps {
  apiKey: string;
}

const RoadsMapInner: React.FC<RoadsMapInnerProps> = () => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const placesLib = useMapsLibrary('places');

  // Input states
  const [originInput, setOriginInput] = useState<string>('Maputo, Moçambique');
  const [destInput, setDestInput] = useState<string>('Beira, Moçambique');

  // Coordinates for origin & destination markers
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Suggestions state
  const [originSuggestions, setOriginSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [activeInputFocus, setActiveInputFocus] = useState<'origin' | 'dest' | null>(null);

  // Session tokens for Places API autocomplete best practice
  const originSessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const destSessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Route calculation and results state
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [routeDetails, setRouteDetails] = useState<CalculatedRouteDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState<boolean>(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);
  const [activeCorridor, setActiveCorridor] = useState<string | null>(null);

  // Fetch autocomplete suggestions restricted to Mozambique (MZ)
  const fetchSuggestions = useCallback(
    (input: string, isOrigin: boolean) => {
      if (!placesLib || !input.trim() || input.trim().length < 2) {
        if (isOrigin) setOriginSuggestions([]);
        else setDestSuggestions([]);
        return;
      }

      const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
      const tokenRef = isOrigin ? originSessionTokenRef : destSessionTokenRef;
      if (!tokenRef.current) {
        tokenRef.current = new AutocompleteSessionToken();
      }

      const request: google.maps.places.AutocompleteRequest = {
        input: input.trim(),
        sessionToken: tokenRef.current,
        includedRegionCodes: ['MZ'], // Restrict suggestions strictly to Mozambique
      };

      AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
        .then((res: { suggestions: google.maps.places.AutocompleteSuggestion[] }) => {
          if (isOrigin) {
            setOriginSuggestions(res.suggestions || []);
          } else {
            setDestSuggestions(res.suggestions || []);
          }
        })
        .catch((err: any) => {
          console.warn('Google Places autocomplete warning:', err);
          if (isOrigin) setOriginSuggestions([]);
          else setDestSuggestions([]);
        });
    },
    [placesLib]
  );

  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion,
    isOrigin: boolean
  ) => {
    if (!placesLib || !suggestion.placePrediction) return;

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
      });

      const label =
        place.formattedAddress ||
        place.displayName ||
        suggestion.placePrediction.text.text;

      if (isOrigin) {
        setOriginInput(label);
        setOriginSuggestions([]);
        originSessionTokenRef.current = null; // Reset session token
        if (place.location) {
          setOriginCoords({
            lat: place.location.lat(),
            lng: place.location.lng(),
          });
        }
      } else {
        setDestInput(label);
        setDestSuggestions([]);
        destSessionTokenRef.current = null; // Reset session token
        if (place.location) {
          setDestCoords({
            lat: place.location.lat(),
            lng: place.location.lng(),
          });
        }
      }
    } catch (err) {
      console.error('Error fetching place fields:', err);
      const text = suggestion.placePrediction.text.text;
      if (isOrigin) {
        setOriginInput(text);
        setOriginSuggestions([]);
      } else {
        setDestInput(text);
        setDestSuggestions([]);
      }
    } finally {
      setActiveInputFocus(null);
    }
  };

  // Calculate driving route using the modern Routes library (computeRoutes)
  const handleCalculateRoute = useCallback(
    async (overrideOrigin?: string, overrideDest?: string) => {
      const orig = (overrideOrigin ?? originInput).trim();
      const dest = (overrideDest ?? destInput).trim();

      if (!orig || !dest) {
        setErrorMessage('Por favor especifique uma localidade de origem e um destino.');
        return;
      }

      if (!routesLib || !map) {
        setErrorMessage('O serviço Google Maps Routes ainda está a inicializar. Aguarde um instante...');
        return;
      }

      // Cleanup prior route
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      setErrorMessage(null);
      setIsCalculating(true);

      const request = {
        origin: orig,
        destination: dest,
        travelMode: 'DRIVING',
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
      };

      try {
        const response = await (routesLib.Route as any).computeRoutes(request);
        const routes = response?.routes;

        if (!routes || routes.length === 0) {
          setErrorMessage(
            `Não foi possível encontrar um percurso rodoviário entre "${orig}" e "${dest}". Verifique se existem ligações transitáveis ou ajuste os pontos.`
          );
          setIsCalculating(false);
          return;
        }

        const primaryRoute = routes[0];

        // Render path polylines with styling suitable for national cartography
        const newPolylines: google.maps.Polyline[] = primaryRoute.createPolylines();
        newPolylines.forEach((poly) => {
          poly.setOptions({
            strokeColor: '#0284c7', // Sky blue primary line
            strokeWeight: 6,
            strokeOpacity: 0.9,
            zIndex: 10,
          });
          poly.setMap(map);
        });
        polylinesRef.current = newPolylines;

        // Auto-fit bounds to the computed route
        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, {
            top: 80,
            right: 80,
            bottom: 80,
            left: 360, // Leave clearance for the left panel
          });
        }

        // Extract distance & duration
        const distanceMeters = primaryRoute.distanceMeters ?? 0;
        const durationMillis = primaryRoute.durationMillis ?? 0;
        const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
        const totalMinutes = Math.round(durationMillis / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const distanceText =
          distanceKm >= 1000
            ? `${distanceKm.toLocaleString('pt-PT')} km`
            : `${distanceKm} km`;
        const durationText =
          hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}min` : ''}` : `${minutes} min`;

        // Extract turn-by-turn steps if available
        const steps: RouteStepInfo[] = [];
        if (primaryRoute.legs && primaryRoute.legs.length > 0) {
          const leg = primaryRoute.legs[0];
          if (leg.startLocation) {
            setOriginCoords({
              lat: typeof leg.startLocation.lat === 'function' ? leg.startLocation.lat() : leg.startLocation.lat,
              lng: typeof leg.startLocation.lng === 'function' ? leg.startLocation.lng() : leg.startLocation.lng,
            });
          }
          if (leg.endLocation) {
            setDestCoords({
              lat: typeof leg.endLocation.lat === 'function' ? leg.endLocation.lat() : leg.endLocation.lat,
              lng: typeof leg.endLocation.lng === 'function' ? leg.endLocation.lng() : leg.endLocation.lng,
            });
          }

          if (leg.steps && Array.isArray(leg.steps)) {
            leg.steps.forEach((step: any) => {
              const stepDist = step.distanceMeters
                ? `${Math.round(step.distanceMeters / 100) / 10} km`
                : '';
              const stepTime = step.staticDurationMillis
                ? `${Math.round(step.staticDurationMillis / 60000)} min`
                : '';
              steps.push({
                instruction:
                  step.navigationInstruction?.instructions ||
                  step.localizedValues?.staticDuration?.text ||
                  'Seguir pela via indicada',
                distanceText: stepDist,
                durationText: stepTime,
              });
            });
          }
        }

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          orig
        )}&destination=${encodeURIComponent(dest)}&travelmode=driving`;

        setRouteDetails({
          originName: orig,
          destinationName: dest,
          distanceKm,
          distanceText,
          durationMinutes: totalMinutes,
          durationText,
          steps,
          googleMapsUrl: mapsUrl,
        });
      } catch (err: any) {
        console.error('Error computing routes:', err);
        const msg =
          err?.message ||
          'Erro ao comunicar com a Routes API. Verifique a ligação de rede ou restrições da chave.';
        setErrorMessage(msg);
      } finally {
        setIsCalculating(false);
      }
    },
    [originInput, destInput, routesLib, map]
  );

  // Trigger initial route calculation once routes library is loaded
  const initialCalculatedRef = useRef(false);
  useEffect(() => {
    if (routesLib && map && !initialCalculatedRef.current) {
      initialCalculatedRef.current = true;
      handleCalculateRoute();
    }
  }, [routesLib, map, handleCalculateRoute]);

  // Swap origin and destination
  const handleSwap = () => {
    const tempInput = originInput;
    const tempCoords = originCoords;
    setOriginInput(destInput);
    setOriginCoords(destCoords);
    setDestInput(tempInput);
    setDestCoords(tempCoords);
  };

  // Clear inputs and active route
  const handleClear = () => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    setRouteDetails(null);
    setOriginInput('');
    setDestInput('');
    setOriginCoords(null);
    setDestCoords(null);
    setErrorMessage(null);
    setActiveCorridor(null);
    setShowSteps(false);
  };

  // Recenter map back to Mozambique territory
  const handleRecenterMozambique = () => {
    if (map) {
      map.setCenter(MOZAMBIQUE_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }
  };

  // Quick-select national corridor
  const handleSelectCorridor = (corridor: typeof NATIONAL_CORRIDORS[0]) => {
    setActiveCorridor(corridor.code);
    setOriginInput(corridor.origin);
    setDestInput(corridor.destination);
    handleCalculateRoute(corridor.origin, corridor.destination);
  };

  return (
    <>
      {/* Markers for computed Origin & Destination */}
      {originCoords && (
        <AdvancedMarker position={originCoords} title={`Origem: ${originInput}`}>
          <Pin background="#10b981" glyph="A" glyphColor="#ffffff" borderColor="#065f46" />
        </AdvancedMarker>
      )}

      {destCoords && (
        <AdvancedMarker position={destCoords} title={`Destino: ${destInput}`}>
          <Pin background="#ef4444" glyph="B" glyphColor="#ffffff" borderColor="#991b1b" />
        </AdvancedMarker>
      )}

      {/* Floating Roads & Routes Control Panel */}
      <div
        className={`fixed top-20 left-3 sm:left-5 z-20 w-[calc(100vw-24px)] sm:w-96 max-h-[calc(100vh-100px)] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl text-white transition-all duration-300 ${
          isPanelCollapsed ? 'h-auto overflow-hidden' : 'overflow-hidden'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <RouteIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                Mapa Rodoviário de Moçambique
              </h2>
              <span className="text-[10px] text-sky-400 font-mono">
                Cartografia Oficial Google Maps & Routes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRecenterMozambique}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Recentrar mapa em Moçambique"
            >
              <LocateFixed className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isPanelCollapsed ? 'Expandir painel' : 'Recolher painel'}
            >
              {isPanelCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {!isPanelCollapsed && (
          <div className="p-3.5 space-y-3 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Origin & Destination Inputs */}
            <div className="space-y-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              {/* Origin */}
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Origem (Ponto A)
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => {
                      setOriginInput(e.target.value);
                      fetchSuggestions(e.target.value, true);
                    }}
                    onFocus={() => {
                      setActiveInputFocus('origin');
                      if (originInput) fetchSuggestions(originInput, true);
                    }}
                    placeholder="Localidade, cidade ou porto em Moçambique..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {originInput && (
                    <button
                      onClick={() => {
                        setOriginInput('');
                        setOriginSuggestions([]);
                      }}
                      className="absolute right-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Origin Autocomplete suggestions */}
                {activeInputFocus === 'origin' && originSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 p-1">
                    {originSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(s, true)}
                        className="w-full text-left p-2 rounded hover:bg-slate-800 text-xs text-white flex items-center gap-2 group transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate group-hover:text-emerald-300">
                          {s.placePrediction?.text.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap and Actions bar */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={handleSwap}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors py-0.5"
                  title="Inverter origem e destino"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Inverter percurso</span>
                </button>
                <button
                  onClick={handleClear}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors py-0.5"
                  title="Limpar campos e percurso"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Destino (Ponto B)
                </label>
                <div className="relative flex items-center">
                  <Navigation className="w-3.5 h-3.5 text-rose-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={destInput}
                    onChange={(e) => {
                      setDestInput(e.target.value);
                      fetchSuggestions(e.target.value, false);
                    }}
                    onFocus={() => {
                      setActiveInputFocus('dest');
                      if (destInput) fetchSuggestions(destInput, false);
                    }}
                    placeholder="Destino ou fronteira em Moçambique..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  {destInput && (
                    <button
                      onClick={() => {
                        setDestInput('');
                        setDestSuggestions([]);
                      }}
                      className="absolute right-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Destination Autocomplete suggestions */}
                {activeInputFocus === 'dest' && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 p-1">
                    {destSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(s, false)}
                        className="w-full text-left p-2 rounded hover:bg-slate-800 text-xs text-white flex items-center gap-2 group transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-rose-400 flex-shrink-0" />
                        <span className="truncate group-hover:text-rose-300">
                          {s.placePrediction?.text.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Calculate Button */}
              <button
                onClick={() => handleCalculateRoute()}
                disabled={isCalculating || !originInput.trim() || !destInput.trim()}
                className="w-full mt-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>A calcular percurso com Routes API...</span>
                  </>
                ) : (
                  <>
                    <Car className="w-4 h-4" />
                    <span>Calcular Percurso Rodoviário</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Aviso de Rota</p>
                  <p className="text-[11px] opacity-90">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Route Summary Results */}
            {routeDetails && (
              <div className="p-3 bg-gradient-to-br from-slate-950/90 to-sky-950/30 border border-sky-800/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Percurso Calculado</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Condução</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Navigation className="w-3 h-3 text-sky-400" />
                      <span>Distância Total</span>
                    </div>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {routeDetails.distanceText}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Duração Estimada</span>
                    </div>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {routeDetails.durationText}
                    </div>
                  </div>
                </div>

                {/* Origin to Destination */}
                <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/50 p-2 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                    <span className="truncate">{routeDetails.originName}</span>
                  </div>
                  <div className="w-0.5 h-2 bg-slate-700 ml-1"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
                    <span className="truncate">{routeDetails.destinationName}</span>
                  </div>
                </div>

                {/* External link to Google Maps */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={routeDetails.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg py-1.5 px-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Abrir no Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-sky-400" />
                  </a>

                  {routeDetails.steps.length > 0 && (
                    <button
                      onClick={() => setShowSteps(!showSteps)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg py-1.5 px-2.5 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>{showSteps ? 'Ocultar etapas' : `${routeDetails.steps.length} etapas`}</span>
                      {showSteps ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Step-by-step instructions */}
                {showSteps && routeDetails.steps.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Instruções de Itinerário
                    </div>
                    {routeDetails.steps.map((st: RouteStepInfo, i: number) => (
                      <div
                        key={i}
                        className="text-[11px] p-1.5 rounded bg-slate-900/60 border border-slate-800 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center text-[9px] font-mono flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-200">{st.instruction}</p>
                          {(st.distanceText || st.durationText) && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {st.distanceText} {st.durationText ? `• ${st.durationText}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Pick: Official National Road Corridors */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Corredores Nacionais (EN)
                </span>
                <span className="text-[10px] text-slate-400">Clique para carregar</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {NATIONAL_CORRIDORS.map((corridor) => (
                  <button
                    key={corridor.code}
                    onClick={() => handleSelectCorridor(corridor)}
                    className={`w-full text-left p-2 rounded-xl border transition-all text-xs flex items-center justify-between group cursor-pointer ${
                      activeCorridor === corridor.code
                        ? 'bg-sky-950/60 border-sky-500/80 text-white'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold font-mono text-amber-400">
                          {corridor.code}
                        </span>
                        <span className="text-white font-medium">{corridor.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {corridor.origin.split(',')[0]} ⇄ {corridor.destination.split(',')[0]}
                      </p>
                    </div>
                    <span className="text-[10px] text-sky-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      Traçar ↗
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Information Notice about Mozambique Roads */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 text-slate-300 font-semibold">
                <HelpCircle className="w-3 h-3 text-sky-400" />
                <span>Dados Oficiais de Circulação</span>
              </div>
              <p>
                Os percursos e distâncias são calculados em tempo real pela Google Maps Routes API com
                base na cartografia original do serviço. Para condições dinâmicas de tráfego, portagens
                e navegação curva a curva em tempo real no veículo, utilize a ligação oficial para a
                aplicação Google Maps.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Top-level exported component wrapping APIProvider and Map
interface GoogleRoadsMapProps {
  onReturnTo3D?: () => void;
}

export const GoogleRoadsMap: React.FC<GoogleRoadsMapProps> = ({ onReturnTo3D }) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyAaaXh5LV85FCijREwaBHgPSWYoLCtHvHc';

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950">
      <APIProvider
        apiKey={apiKey}
        language="pt"
        region="MZ"
      >
        <Map
          defaultCenter={MOZAMBIQUE_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          fullscreenControl={true}
          mapTypeControl={true}
          streetViewControl={false}
          zoomControl={true}
          className="w-full h-screen"
        >
          <RoadsMapInner apiKey={apiKey} />
        </Map>
      </APIProvider>
    </div>
  );
};
