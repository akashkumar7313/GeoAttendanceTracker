import { Coordinates } from '../types';

/** The fixed office location used as the geofence center. */
export const OFFICE_LOCATION: Coordinates = {
  latitude: 28.6139,
  longitude: 77.209,
};

/** Geofence radius around the office in meters. */
export const GEOFENCE_RADIUS_METERS = 100;

/** Keys used for local AsyncStorage persistence. */
export const STORAGE_KEYS = {
  ATTENDANCE: '@geo_attendance/records',
  OFFICE_LOCATION: '@geo_attendance/office_location',
} as const;

/** Navigation route names. */
export const SCREENS = {
  HOME: 'Home',
  ATTENDANCE_HISTORY: 'AttendanceHistory',
} as const;

/** App-wide color palette. */
export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  background: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  white: '#FFFFFF',
  disabled: '#93C5FD',
  overlay: 'rgba(0, 0, 0, 0.45)',
} as const;

/** Map camera zoom when focusing on the geofence. */
export const MAP_DEFAULT_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
} as const;
