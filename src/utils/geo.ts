import { Coordinates, GeofenceStatus } from '../types';

/**
 * Calculates the distance in meters between two coordinates
 * using the Haversine formula.
 */
export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const EARTH_RADIUS = 6371000;
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
}

/**
 * Checks whether a location is inside a circular geofence.
 * Returns `true` when the distance to the center is <= radius.
 */
export function isInsideGeofence(
  location: Coordinates,
  center: Coordinates,
  radius: number,
): boolean {
  return haversineDistance(location, center) <= radius;
}

/**
 * Returns the geofence status for a given location.
 */
export function getGeofenceStatus(
  location: Coordinates | null,
  center: Coordinates,
  radius: number,
): GeofenceStatus {
  if (!location) {
    return 'unknown';
  }
  return isInsideGeofence(location, center, radius) ? 'inside' : 'outside';
}

/**
 * Formats a distance in meters to a human readable string.
 * e.g. `950 m` or `1.25 km`.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}
