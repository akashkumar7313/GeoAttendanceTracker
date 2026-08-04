import { useCallback, useEffect, useState } from 'react';
import { OfficeLocation } from '../types';
import {
  getOfficeLocation,
  getOfficeLocationOrNull,
  saveOfficeLocation,
} from '../services/office.service';

interface UseOfficeLocation {
  /** The active office location used as the geofence center. */
  officeLocation: OfficeLocation;
  /** True when the user has configured an office (not the default). */
  hasOffice: boolean;
  /** True while the persisted value is being loaded. */
  loading: boolean;
  /** Saves a new office location. */
  setOfficeLocation: (office: OfficeLocation) => Promise<void>;
}

/**
 * Loads and persists the user's selected office location.
 * Falls back to the default office from the constants file.
 */
export function useOfficeLocation(): UseOfficeLocation {
  const [officeLocation, setLocation] = useState<OfficeLocation>({
    name: 'Office',
    latitude: 0,
    longitude: 0,
  });
  const [hasOffice, setHasOffice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getOfficeLocation(), getOfficeLocationOrNull()]).then(
      ([office, saved]) => {
        if (!cancelled) {
          setLocation(office);
          setHasOffice(saved !== null);
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const setOfficeLocation = useCallback(
    async (office: OfficeLocation) => {
      await saveOfficeLocation(office);
      setLocation(office);
      setHasOffice(true);
    },
    [],
  );

  return { officeLocation, hasOffice, loading, setOfficeLocation };
}