import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { Coordinates } from '../types';
import {
  COLORS,
  GEOFENCE_RADIUS_METERS,
  MAP_DEFAULT_DELTA,
  OFFICE_LOCATION,
} from '../constants';
import { formatDistance, haversineDistance } from '../utils/geo';

interface AttendanceMapProps {
  /** The user's latest known location. `null` hides the user marker. */
  userLocation: Coordinates | null;
  /** Geofence center. Defaults to the configured office location. */
  officeLocation?: Coordinates;
  /** Geofence radius in meters. Defaults to 100m. */
  radius?: number;
  /** Height of the map in pixels. Defaults to a flexible container. */
  height?: number;
}

const ZOOM = {
  in: 0.5,
  out: 2,
  minDelta: 0.0005,
  maxDelta: 40,
};

/** Minimum zoom width so the 100 m circle is clearly visible. */
const MIN_DELTA = 0.004;

/** Minimum user movement (meters) before the camera re-fits both points. */
const REFIT_THRESHOLD_METERS = 100;

/**
 * Computes a region that shows both the user and the office, always
 * keeping a minimum zoom so the geofence circle stays visible.
 */
function regionForBoth(
  user: Coordinates,
  office: Coordinates,
): Region {
  const minLat = Math.min(user.latitude, office.latitude);
  const maxLat = Math.max(user.latitude, office.latitude);
  const minLon = Math.min(user.longitude, office.longitude);
  const maxLon = Math.max(user.longitude, office.longitude);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, MIN_DELTA),
    longitudeDelta: Math.max((maxLon - minLon) * 1.4, MIN_DELTA),
  };
}

/**
 * Map that renders the office marker, the circular geofence and the user's
 * current location. The camera fits BOTH the user and the office into view,
 * with zoom in/out and a "locate me" button overlay.
 */
export function AttendanceMap({
  userLocation,
  officeLocation = OFFICE_LOCATION,
  radius = GEOFENCE_RADIUS_METERS,
  height,
}: AttendanceMapProps) {
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region>({ ...officeLocation, ...MAP_DEFAULT_DELTA });
  const lastFitRef = useRef<Coordinates | null>(null);

  // Keep track of the current visible region so zoom buttons stay consistent.
  const onRegionChange = useCallback((region: Region) => {
    regionRef.current = region;
  }, []);

  // Whenever the office changes, or the user moves noticeably, pan the
  // camera so BOTH the user and the office stay visible.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!userLocation) {
      map.animateToRegion({ ...officeLocation, ...MAP_DEFAULT_DELTA }, 500);
      lastFitRef.current = null;
      return;
    }

    const lastFit = lastFitRef.current;
    if (
      lastFit &&
      haversineDistance(userLocation, lastFit) < REFIT_THRESHOLD_METERS
    ) {
      return;
    }

    map.animateToRegion(regionForBoth(userLocation, officeLocation), 600);
    lastFitRef.current = userLocation;
  }, [userLocation, officeLocation]);

  const zoomIn = useCallback(() => {
    const { latitude, longitude, latitudeDelta } = regionRef.current;
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: Math.max(latitudeDelta * ZOOM.in, ZOOM.minDelta),
        longitudeDelta: Math.max(latitudeDelta * ZOOM.in, ZOOM.minDelta),
      },
      300,
    );
  }, []);

  const zoomOut = useCallback(() => {
    const { latitude, longitude, latitudeDelta } = regionRef.current;
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: Math.min(latitudeDelta * ZOOM.out, ZOOM.maxDelta),
        longitudeDelta: Math.min(latitudeDelta * ZOOM.out, ZOOM.maxDelta),
      },
      300,
    );
  }, []);

  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    if (userLocation) {
      map.animateToRegion(regionForBoth(userLocation, officeLocation), 500);
    } else {
      map.animateToRegion({ ...officeLocation, ...MAP_DEFAULT_DELTA }, 500);
    }
  }, [officeLocation, userLocation]);

  const centerOnUser = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    }
  }, [userLocation]);

  const centerOnOffice = useCallback(() => {
    mapRef.current?.animateToRegion(
      {
        ...officeLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  }, [officeLocation]);

  return (
    <View style={[styles.container, height ? { height } : styles.flex]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ ...officeLocation, ...MAP_DEFAULT_DELTA }}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        loadingEnabled
        loadingBackgroundColor={COLORS.background}
        loadingIndicatorColor={COLORS.primary}
      >
        <Circle
          center={officeLocation}
          radius={radius}
          fillColor="rgba(37, 99, 235, 0.15)"
          strokeColor={COLORS.primary}
          strokeWidth={2}
        />
        <Marker
          coordinate={officeLocation}
          title="Office"
          description={`Office location (${radius} m radius)`}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={centerOnOffice}
        >
          <MapMarkerIcon icon="business" color={COLORS.primary} />
        </Marker>
        {userLocation ? (
          <Marker
            coordinate={userLocation}
            title="You"
            description="Your current location"
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={centerOnUser}
          >
            <MapMarkerIcon icon="person" color={COLORS.success} />
          </Marker>
        ) : null}
      </MapView>

      <View style={styles.controls}>
        <MapControl icon="my-location" onPress={centerOnUser} />
        <MapControl icon="business" onPress={centerOnOffice} />
        <MapControl icon="layers" onPress={locateMe} />
        <MapControl icon="add" onPress={zoomIn} />
        <MapControl icon="remove" onPress={zoomOut} />
      </View>

      {userLocation ? (
        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>
            You: {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
          </Text>
          {officeLocation ? (
            <Text style={styles.distanceText}>
              Distance: {formatDistance(haversineDistance(userLocation, officeLocation))}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function MapControl({
  icon,
  onPress,
}: {
  icon: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlButton,
        pressed && styles.controlButtonPressed,
      ]}
      accessibilityLabel={`Map control ${icon}`}
    >
      <Icon name={icon} size={22} color={COLORS.primary} />
    </Pressable>
  );
}

/** A distinct map marker built from a colored circular badge + icon. */
function MapMarkerIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <View
      style={[
        styles.markerBadge,
        { backgroundColor: color, borderColor: COLORS.white },
      ]}
    >
      <Icon name={icon} size={18} color={COLORS.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  flex: {
    flex: 1,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controls: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  controlButtonPressed: {
    backgroundColor: COLORS.background,
  },
  markerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  infoPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  infoPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 2,
  },
});