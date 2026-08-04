import { Platform } from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import type { Permission, PermissionStatus } from 'react-native-permissions';

export type AppPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

const LOCATION_PERMISSION: Permission =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

function mapStatus(status: PermissionStatus): AppPermissionStatus {
  switch (status) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    default:
      return 'unavailable';
  }
}

/** Returns the current location permission status without prompting. */
export async function getLocationPermissionStatus(): Promise<AppPermissionStatus> {
  return mapStatus(await check(LOCATION_PERMISSION));
}

/** Requests the location permission and returns the resulting status. */
export async function requestLocationPermission(): Promise<AppPermissionStatus> {
  return mapStatus(await request(LOCATION_PERMISSION));
}

/** Opens this app's settings on the device. */
export function openAppSettings(): Promise<void> {
  return openSettings();
}

/**
 * Opens the device location settings so the user can enable GPS.
 * Falls back to the app settings when the deep link is not available.
 */
export async function openDeviceLocationSettings(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await openSettings('application');
      // iOS: no supported way to deep link into Location Services,
      // so we keep the app settings screen instead.
    } else {
      await openSettings();
    }
  } catch {
    await openSettings();
  }
}
