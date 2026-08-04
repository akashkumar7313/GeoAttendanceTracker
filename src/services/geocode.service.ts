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

/**
 * Search for places by name using the Google Places API (same backend
 * as YeloCab). Returns suggestions; call `getPlaceDetails` for the
 * exact coordinates once the user picks one.
 */
export async function searchPlaces(
  query: string,
  _center?: { latitude: number; longitude: number } | null,
  limit = 6,
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2 || !API_KEY) {
    return [];
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
      return [];
    }
    const body: unknown = await response.json();
    const status = (body as { status?: string })?.status;
    if (status !== 'OK' && status !== 'ZERO_RESULTS') {
      return [];
    }
    const predictions = (body as { predictions?: unknown })?.predictions;
    if (!Array.isArray(predictions)) {
      return [];
    }
    return predictions
      .filter(isPrediction)
      .slice(0, limit)
      .map(item => ({
        placeId: item.place_id,
        name: item.description,
      }));
  } catch {
    return [];
  }
}

/** Resolves a selected suggestion into exact coordinates + a name. */
export async function getPlaceDetails(
  placeId: string,
): Promise<PlaceResult | null> {
  if (!placeId || !API_KEY) {
    return null;
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
      return null;
    }
    const body = (await response.json()) as PlaceDetailResult;
    const location = body.result?.geometry?.location;
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return null;
    }
    const name = body.result?.name || body.result?.formatted_address || 'Office';
    return {
      name,
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch {
    return null;
  }
}

function isPrediction(value: unknown): value is AutocompletePrediction {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return typeof v.place_id === 'string' && typeof v.description === 'string';
}