import { useCallback, useEffect, useRef, useState } from 'react';
import { PositionError } from 'react-native-geolocation-service';
import { Coordinates, TrackingStatus } from '../types';
import {
  getLocationPermissionStatus,
  requestLocationPermission,
} from '../services/permission.service';
import {
  getCurrentPosition,
  getLocationErrorMessage,
  startWatchingPosition,
} from '../services/location.service';

interface UseLocationTracking {
  location: Coordinates | null;
  status: TrackingStatus;
  errorMessage: string | null;
  /** Requests location permission then starts tracking. */
  requestPermissionAndStart: () => Promise<void>;
  /** (Re)starts the whole tracking flow from scratch. */
  startTracking: () => Promise<void>;
  /** Stops the active position watcher. */
  stopTracking: () => void;
}

/**
 * Manages the whole location flow: permission, GPS availability check,
 * one-shot fix and continuous watching. Watchers are cleaned up when the
 * component using this hook unmounts.
 */
export function useLocationTracking(): UseLocationTracking {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<TrackingStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stopWatchRef = useRef<(() => void) | null>(null);

  const stopTracking = useCallback(() => {
    if (stopWatchRef.current) {
      stopWatchRef.current();
      stopWatchRef.current = null;
    }
  }, []);

  /** Starts the one-shot fix plus the continuous position watcher. */
  const startWatching = useCallback(async () => {
    stopTracking();
    setErrorMessage(null);

    try {
      const coords = await getCurrentPosition();
      setLocation(coords);
      setStatus('active');
    } catch (error) {
      const code = (error as { code?: PositionError })?.code;
      if (code === PositionError.POSITION_UNAVAILABLE) {
        setStatus('gps_disabled');
        setErrorMessage(getLocationErrorMessage(code));
        return;
      }
      setErrorMessage(getLocationErrorMessage(code));
      setStatus('error');
    }

    stopWatchRef.current = startWatchingPosition(
      coords => {
        setLocation(coords);
        setStatus('active');
        setErrorMessage(null);
      },
      error => {
        if (error.code === PositionError.PERMISSION_DENIED) {
          setStatus('denied');
          stopTracking();
          return;
        }
        setStatus('error');
        setErrorMessage(getLocationErrorMessage(error.code));
      },
    );
  }, [stopTracking]);

  const startTracking = useCallback(async () => {
    setStatus('requesting');

    const currentStatus = await getLocationPermissionStatus();
    if (currentStatus === 'granted') {
      await startWatching();
      return;
    }

    const requested = await requestLocationPermission();
    if (requested === 'granted') {
      await startWatching();
    } else if (requested === 'blocked') {
      setStatus('blocked');
    } else {
      setStatus('denied');
    }
  }, [startWatching]);

  const requestPermissionAndStart = useCallback(async () => {
    setStatus('requesting');
    const requested = await requestLocationPermission();
    if (requested === 'granted') {
      await startWatching();
    } else if (requested === 'blocked') {
      setStatus('blocked');
    } else {
      setStatus('denied');
    }
  }, [startWatching]);

  useEffect(() => {
    startTracking();
    return stopTracking;
  }, [startTracking, stopTracking]);

  return {
    location,
    status,
    errorMessage,
    requestPermissionAndStart,
    startTracking,
    stopTracking,
  };
}
