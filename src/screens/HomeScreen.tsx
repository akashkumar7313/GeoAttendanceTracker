import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AttendanceMap } from '../components/AttendanceMap';
import { CheckInButton } from '../components/CheckInButton';
import { InfoCard } from '../components/InfoCard';
import { MessageView } from '../components/MessageView';
import { OfficeSearch } from '../components/OfficeSearch';
import { StatusBadge } from '../components/StatusBadge';
import { useAttendance } from '../hooks/useAttendance';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useOfficeLocation } from '../hooks/useOfficeLocation';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { COLORS, GEOFENCE_RADIUS_METERS, SCREENS } from '../constants';
import { formatDistance, getGeofenceStatus, haversineDistance } from '../utils/geo';
import {
  openAppSettings,
  openDeviceLocationSettings,
} from '../services/permission.service';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList>;

function HistoryButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityLabel="Attendance history"
    >
      <Icon name="history" size={24} color={COLORS.white} />
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const {
    location,
    status,
    errorMessage,
    requestPermissionAndStart,
    startTracking,
  } = useLocationTracking();
  const { todayRecord, checkIn, reload } = useAttendance();
  const {
    officeLocation,
    loading: officeLoading,
    setOfficeLocation,
  } = useOfficeLocation();

  const distance =
    location !== null
      ? haversineDistance(location, officeLocation)
      : null;
  const geofenceStatus = getGeofenceStatus(
    location,
    officeLocation,
    GEOFENCE_RADIUS_METERS,
  );
  const isInside = geofenceStatus === 'inside';
  const canCheckIn =
    status === 'active' && location !== null && isInside && !officeLoading;

  const prevStatusRef = useRef(status);
  useEffect(() => {
    const previous = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === 'gps_disabled' && previous !== 'gps_disabled') {
      Alert.alert(
        'GPS is Disabled',
        'Location services are turned off or the GPS signal is unavailable. Please enable location/GPS and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              openDeviceLocationSettings();
            },
          },
          { text: 'Retry', onPress: () => startTracking() },
        ],
      );
    }
  }, [status, startTracking]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <HistoryButton
          onPress={() => navigation.navigate(SCREENS.ATTENDANCE_HISTORY)}
        />
      ),
    });
  }, [navigation]);

  const onCheckIn = useCallback(async () => {
    if (location === null || !isInside) {
      return;
    }
    const success = await checkIn(location, distance ?? 0);
    if (success) {
      Alert.alert(
        'Check-In Successful',
        'Your attendance has been saved locally. You can view it in Attendance History.',
      );
    } else {
      Alert.alert(
        'Already Checked In',
        'You have already checked in today. Duplicate check-ins are not allowed.',
      );
    }
  }, [checkIn, distance, isInside, location]);

  // Remove the setup-modal gate so the search box handles office selection.
  if (status === 'requesting' || status === 'initializing') {
    return (
      <MessageView
        icon="my-location"
        title="Getting your location"
        message="Requesting location permission and GPS signal..."
        loading
      />
    );
  }

  if (status === 'denied') {
    return (
      <MessageView
        icon="location-off"
        title="Location permission is required"
        message="This app needs your location to track your position and verify you are inside the office geofence."
        actions={[
          {
            label: 'Allow Location',
            onPress: () => requestPermissionAndStart(),
          },
          {
            label: 'Open Settings',
            variant: 'secondary',
            onPress: () => openAppSettings(),
          },
        ]}
      />
    );
  }

  if (status === 'blocked') {
    return (
      <MessageView
        icon="block"
        title="Location permission is blocked"
        message="Location access was permanently denied. Please enable it from the app settings to continue."
        actions={[
          {
            label: 'Open Settings',
            onPress: () => openAppSettings(),
          },
        ]}
      />
    );
  }

  if (status === 'gps_disabled') {
    return (
      <MessageView
        icon="gps-off"
        title="GPS is disabled"
        message="Please enable location services (GPS) to track your position and check in for attendance."
        actions={[
          {
            label: 'Open Settings',
            onPress: () => openDeviceLocationSettings(),
          },
          {
            label: 'Retry',
            variant: 'secondary',
            onPress: () => startTracking(),
          },
        ]}
      />
    );
  }

  if (status === 'error') {
    return (
      <MessageView
        icon="error-outline"
        title="Location error"
        message={errorMessage || 'There was a problem getting your location.'}
        actions={[
          {
            label: 'Retry',
            onPress: () => startTracking(),
          },
          {
            label: 'Open Settings',
            variant: 'secondary',
            onPress: () => openAppSettings(),
          },
        ]}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <OfficeSearch onSelect={setOfficeLocation} userLocation={location} />

        <InfoCard
          icon="business"
          label={officeLoading ? 'Loading office…' : officeLocation.name}
          value={
            officeLoading
              ? '…'
              : `${officeLocation.latitude.toFixed(5)}, ${officeLocation.longitude.toFixed(5)}`
          }
        />

        <StatusBadge status={geofenceStatus} />

        <View style={styles.infoRow}>
          <InfoCard
            icon="explore"
            label="Latitude"
            value={location ? location.latitude.toFixed(6) : '—'}
            iconColor={COLORS.warning}
          />
          <InfoCard
            icon="explore"
            label="Longitude"
            value={location ? location.longitude.toFixed(6) : '—'}
            iconColor={COLORS.warning}
          />
        </View>

        <InfoCard
          icon="straighten"
          label="Distance from Office"
          value={distance !== null ? formatDistance(distance) : '—'}
          iconColor={isInside ? COLORS.success : COLORS.warning}
        />
      </View>

      <View style={styles.mapSection}>
        <AttendanceMap
          userLocation={location}
          officeLocation={officeLocation}
        />
      </View>

      <View style={styles.bottomSection}>
        {location !== null && !isInside ? (
          <View style={styles.warningBanner}>
            <Icon name="info" size={20} color="#B26E00" />
            <Text style={styles.warningText}>
              You are currently outside the office zone. Please come within {GEOFENCE_RADIUS_METERS} meters of the office to check in.
            </Text>
          </View>
        ) : null}
        <CheckInButton
          onPress={onCheckIn}
          disabled={!canCheckIn}
          checkedIn={todayRecord !== null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  topSection: {
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mapSection: {
    flex: 1,
  },
  bottomSection: {
    marginTop: 16,
    gap: 10,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFD8A8',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#B26E00',
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default HomeScreen;