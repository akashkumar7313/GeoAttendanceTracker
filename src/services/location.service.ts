import Geolocation, {
  GeoOptions,
  GeoWatchOptions,
  PositionError,
} from 'react-native-geolocation-service';
import { Coordinates } from '../types';

const HIGH_ACCURACY_OPTIONS = {
  enableHighAccuracy: true,
  accuracy: {
    android: 'high' as const,
    ios: 'best' as const,
  },
  showLocationDialog: true,
};

/** Converts a native geo position into our lightweight Coordinates type. */
function toCoordinates(position: {
  coords: { latitude: number; longitude: number };
}): Coordinates {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

/**
 * Returns a user friendly message for a geolocation error code.
 */
export function getLocationErrorMessage(
  code: PositionError | number | undefined,
): string {
  switch (code) {
    case PositionError.PERMISSION_DENIED:
      return 'Location permission was denied.';
    case PositionError.POSITION_UNAVAILABLE:
      return 'Location is currently unavailable. Please check that GPS is enabled and that you have a clear signal.';
    case PositionError.TIMEOUT:
      return 'Timed out while trying to get your location. Please try again.';
    case PositionError.PLAY_SERVICE_NOT_AVAILABLE:
      return 'Google Play Services are not available on this device.';
    default:
      return 'Something went wrong while fetching your location. Please try again.';
  }
}

/** Requests a one-shot position fix. */
export function getCurrentPosition(
  options?: Partial<GeoOptions>,
): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(toCoordinates(position)),
      error => reject(error),
      {
        timeout: 15000,
        maximumAge: 1000,
        ...HIGH_ACCURACY_OPTIONS,
        ...options,
      },
    );
  });
}

/**
 * Starts watching the user's position. Returns an unsubscribe function
 * that stops the watcher. Call it when the consumer unmounts.
 */
export function startWatchingPosition(
  onLocation: (coords: Coordinates) => void,
  onError: (error: { code: PositionError | number; message: string }) => void,
  options?: Partial<GeoWatchOptions>,
): () => void {
  const watchId = Geolocation.watchPosition(
    position => onLocation(toCoordinates(position)),
    error => onError(error),
    {
      distanceFilter: 5,
      interval: 5000,
      fastestInterval: 2000,
      ...HIGH_ACCURACY_OPTIONS,
      ...options,
    },
  );

  return () => {
    Geolocation.clearWatch(watchId);
    Geolocation.stopObserving();
  };
}
