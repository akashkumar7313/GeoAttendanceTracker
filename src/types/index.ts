export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** A named office location used as the geofence center. */
export interface OfficeLocation extends Coordinates {
  name: string;
}

/** A geocoding search result for the office search box. */
export interface PlaceResult extends Coordinates {
  name: string;
}

/** A Google Places autocomplete suggestion (before coordinates are fetched). */
export interface PlaceSuggestion {
  placeId: string;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  /** Date key in `YYYY-MM-DD` format used to detect duplicate check-ins. */
  date: string;
  /** Human readable time e.g. `09:30 AM`. */
  time: string;
  /** Epoch milliseconds, used to sort records newest to oldest. */
  timestamp: number;
  latitude: number;
  longitude: number;
  /** Distance from the office in meters. */
  distance: number;
}

export type GeofenceStatus = 'inside' | 'outside' | 'unknown';

export type TrackingStatus =
  | 'initializing'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'blocked'
  | 'gps_disabled'
  | 'error';
