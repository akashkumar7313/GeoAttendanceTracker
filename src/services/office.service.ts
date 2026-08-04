
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfficeLocation } from '../types';
import { OFFICE_LOCATION, STORAGE_KEYS } from '../constants';

const STORAGE_KEY = STORAGE_KEYS.OFFICE_LOCATION;

/** Returns the saved office location, falling back to the default. */
export async function getOfficeLocation(): Promise<OfficeLocation> {
  const saved = await getOfficeLocationOrNull();
  return saved ?? { name: 'Office', ...OFFICE_LOCATION };
}

/** Returns the saved office location, or `null` when never set. */
export async function getOfficeLocationOrNull(): Promise<OfficeLocation | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isOfficeLocation(parsed)) {
      return parsed;
    }
  } catch {
    // ignore corrupt data
  }
  return null;
}

/** Returns `true` when the user has configured an office location. */
export async function hasOfficeLocation(): Promise<boolean> {
  return (await getOfficeLocationOrNull()) !== null;
}

/** Persists the selected office location. */
export async function saveOfficeLocation(
  office: OfficeLocation,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(office));
}

/** Removes the saved office location, restoring the default. */
export async function clearOfficeLocation(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

function isOfficeLocation(value: unknown): value is OfficeLocation {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.latitude === 'number' &&
    typeof v.longitude === 'number' &&
    Number.isFinite(v.latitude) &&
    Number.isFinite(v.longitude)
  );
}