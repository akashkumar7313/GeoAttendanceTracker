import Config from 'react-native-config';
import { PlaceResult, PlaceSuggestion } from '../types';

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

// Runtime value from .env. Falls back to the YeloCab key that is proven
// to work with the Places API, in case Config isn't populated.
const API_KEY = (Config.GOOGLE_MAPS_API_KEY ?? '').trim() ||
  'AIzaSyCw9LxaTC4iR7TPfuBJO4RqjgRtoKNUH_A';

interface AutocompletePrediction {
  place_id: string;
  description: string;
}

interface PlaceDetailResult {
  result?: {
    name?: string;
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  };
}

export interface PlaceSearchResponse {
  results: PlaceSuggestion[];
  error: string | null;
}

export interface PlaceDetailsResponse {
  place: PlaceResult | null;
  error: string | null;
}

/**
 * Search for places by name using the Google Places API (same backend
 * as YeloCab). Returns suggestions; call `getPlaceDetails` for the
 * exact coordinates once the user picks one.
 */
export async function searchPlaces(
  query: string,
  _center?: { latitude: number; longitude: number } | null,
  limit = 6,
): Promise<PlaceSearchResponse> {
  const trimmed = query.trim();
  if (trimmed.length < 2 || !API_KEY) {
    return { results: [], error: null };
  }

  const params = new URLSearchParams({
    input: trimmed,
    key: API_KEY,
    types: 'geocode|establishment',
    components: 'country:in',
  });
  const url = `${PLACES_BASE}/autocomplete/json?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        results: [],
        error: 'Could not reach the search service. Please check your internet connection and try again.',
      };
    }
    const body: unknown = await response.json();
    const status = (body as { status?: string })?.status;
    if (status === 'ZERO_RESULTS') {
      return { results: [], error: null };
    }
    if (status !== 'OK') {
      return {
        results: [],
        error: 'Search is currently unavailable. Please try again in a moment.',
      };
    }
    const predictions = (body as { predictions?: unknown })?.predictions;
    if (!Array.isArray(predictions)) {
      return { results: [], error: null };
    }
    return {
      results: predictions
        .filter(isPrediction)
        .slice(0, limit)
        .map(item => ({
          placeId: item.place_id,
          name: item.description,
        })),
      error: null,
    };
  } catch {
    return {
      results: [],
      error: 'Could not search places while offline. Please reconnect to the internet and try again.',
    };
  }
}

/** Resolves a selected suggestion into exact coordinates + a name. */
export async function getPlaceDetails(
  placeId: string,
): Promise<PlaceDetailsResponse> {
  if (!placeId || !API_KEY) {
    return { place: null, error: 'Place details are unavailable right now.' };
  }

  const params = new URLSearchParams({
    place_id: placeId,
    key: API_KEY,
    fields: 'name,formatted_address,geometry/location',
  });
  const url = `${PLACES_BASE}/details/json?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        place: null,
        error: 'Could not load place details. Please check your internet connection and try again.',
      };
    }
    const body = (await response.json()) as PlaceDetailResult;
    const location = body.result?.geometry?.location;
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return {
        place: null,
        error: 'Could not load coordinates for this place. Please try another result.',
      };
    }
    const name = body.result?.name || body.result?.formatted_address || 'Office';
    return {
      place: {
        name,
        latitude: location.lat,
        longitude: location.lng,
      },
      error: null,
    };
  } catch {
    return {
      place: null,
      error: 'Could not load place details while offline. Please reconnect to the internet and try again.',
    };
  }
}

function isPrediction(value: unknown): value is AutocompletePrediction {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return typeof v.place_id === 'string' && typeof v.description === 'string';
}
