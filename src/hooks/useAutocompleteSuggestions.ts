// Source: Google Maps Platform Code Assist
import { useEffect, useRef, useState, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface UseAutocompleteSuggestionsReturn {
  suggestions: google.maps.places.AutocompleteSuggestion[];
  isLoading: boolean;
  error: string | null;
  resetSession: () => void;
}

/**
 * Reusable hook that retrieves autocomplete suggestions using the modern
 * Places API (New) AutocompleteSuggestion.fetchAutocompleteSuggestions method.
 * Enforces session token reuse and Mozambican region filtering ('mz').
 */
export function useAutocompleteSuggestions(
  inputString: string,
  requestOptions: Partial<google.maps.places.AutocompleteRequest> = {}
): UseAutocompleteSuggestionsReturn {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placesLib) return;

    const trimmed = inputString.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const request: any = {
      ...requestOptions,
      input: trimmed,
      sessionToken: sessionTokenRef.current,
      includedRegionCodes: ['mz'], // Strictly biased to Mozambique
    };

    setIsLoading(true);
    setError(null);

    AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      .then((res: { suggestions: google.maps.places.AutocompleteSuggestion[] }) => {
        setSuggestions(res.suggestions || []);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.warn('Google Places Autocomplete error:', err);
        setError(err?.message || 'Erro ao carregar sugestões');
        setIsLoading(false);
      });
  }, [placesLib, inputString]);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    resetSession,
  };
}
