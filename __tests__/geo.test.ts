import {
  formatDistance,
  getGeofenceStatus,
  haversineDistance,
  isInsideGeofence,
} from '../src/utils/geo';
import { OFFICE_LOCATION, GEOFENCE_RADIUS_METERS } from '../src/constants';

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(
      haversineDistance(
        { latitude: 28.6139, longitude: 77.209 },
        { latitude: 28.6139, longitude: 77.209 },
      ),
    ).toBe(0);
  });

  it('computes a realistic distance between two cities', () => {
    const delhi = { latitude: 28.6139, longitude: 77.209 };
    const mumbai = { latitude: 19.076, longitude: 72.8777 };
    const distance = haversineDistance(delhi, mumbai);
    expect(distance).toBeGreaterThan(1000000);
    expect(distance).toBeLessThan(1500000);
  });
});

describe('isInsideGeofence', () => {
  it('returns true when within radius', () => {
    const near = { latitude: 28.61391, longitude: 77.209 };
    expect(
      isInsideGeofence(near, OFFICE_LOCATION, GEOFENCE_RADIUS_METERS),
    ).toBe(true);
  });

  it('returns false when far outside radius', () => {
    const far = { latitude: 28.7, longitude: 77.2 };
    expect(
      isInsideGeofence(far, OFFICE_LOCATION, GEOFENCE_RADIUS_METERS),
    ).toBe(false);
  });
});

describe('getGeofenceStatus', () => {
  it('returns unknown for a null location', () => {
    expect(getGeofenceStatus(null, OFFICE_LOCATION, 100)).toBe('unknown');
  });

  it('returns inside/outside correctly', () => {
    expect(
      getGeofenceStatus(
        { latitude: 28.6139, longitude: 77.209 },
        OFFICE_LOCATION,
        100,
      ),
    ).toBe('inside');
    expect(
      getGeofenceStatus(
        { latitude: 28.9, longitude: 77.0 },
        OFFICE_LOCATION,
        100,
      ),
    ).toBe('outside');
  });
});

describe('formatDistance', () => {
  it('formats meters', () => {
    expect(formatDistance(950)).toBe('950 m');
  });

  it('formats kilometers', () => {
    expect(formatDistance(1250)).toBe('1.25 km');
  });
});
