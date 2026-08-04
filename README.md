# Geolocation Tracking & Geofence-Based Attendance System

A React Native (TypeScript) application that demonstrates **real-time GPS tracking**, a **circular geofence** around a fixed office location, and a **geofence-gated attendance check-in** system that works fully offline.

## Features

- **Real-time location tracking** — continuous GPS watch with live latitude/longitude display, cleaned up automatically on unmount.
- **Map integration** — `react-native-maps` shows the office marker, the 100 m geofence circle and the user's position; the camera follows the user.
- **Geofence** — Haversine distance calculation, `Inside Geofence` / `Outside Geofence` status badge.
- **Check-in** — button enabled only inside the geofence, duplicate check-ins per day are blocked, success message on save.
- **Local storage** — attendance records persisted with `@react-native-async-storage/async-storage` (works offline, no backend).
- **Attendance History screen** — records shown newest-first in cards with an empty state and clear-history option.
- **Error handling** — permission denied/blocked (deep-links to app settings), GPS disabled (alert + open settings + retry), timeouts, signal loss and unknown errors.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React Native CLI (0.86) + TypeScript | App framework |
| React Navigation (native-stack) | Navigation |
| `react-native-maps` | Google Maps (Android) / Apple Maps (iOS) |
| `react-native-geolocation-service` | GPS tracking |
| `react-native-permissions` | Location permission flow |
| `@react-native-async-storage/async-storage` | Local persistence |
| `react-native-vector-icons` | Icons |
| `react-native-safe-area-context` | Safe areas |
| `react-native-config` | `.env` config (Maps API key) |

## Prerequisites

- Node.js ≥ 22
- JDK 17+, Android Studio with Android SDK 36
- Xcode 16+ (for iOS)
- A Google Maps API key (Android). Create one in the [Google Cloud Console](https://console.cloud.google.com) with the **Maps SDK for Android** enabled, and restrict it to your app's package name `com.geoattendancetracker`.

## Installation

```sh
# 1. Install JS dependencies
npm install

# 2. Create the environment file from the template
cp .env.example .env
```

Edit `.env` and put your real Maps key:

```
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

> The `.env` file is gitignored and must never be committed. Only `.env.example` (with a placeholder) is checked in.

## Android configuration (already done, reference)

- **Permissions** — `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` are declared in `android/app/src/main/AndroidManifest.xml`.
- **Maps key** — `android/app/build.gradle` reads `GOOGLE_MAPS_API_KEY` from `.env` via `react-native-config` and injects it as a manifest placeholder referenced in `AndroidManifest.xml` (`${GOOGLE_MAPS_API_KEY}`). No secret is stored in the repo.
- **Icons** — `react-native-vector-icons/fonts.gradle` is applied in `android/app/build.gradle` (fonts are bundled automatically).

## iOS configuration (already done, reference)

- **Location usage string** — `NSLocationWhenInUseUsageDescription` is set in `ios/GeoAttendanceTracker/Info.plist`.
- **Maps** — iOS uses the default Apple Maps provider, so no Google API key is needed on iOS. (See below if you want Google Maps on iOS too.)
- **Icons / native modules** — installed via CocoaPods (`pod install`).

### Optional: Google Maps provider on iOS

1. Add `GoogleMaps` to the podfile and `pod install`.
2. Provide the API key in `AppDelegate.swift`:

```swift
import GoogleMaps
GMSServices.provideAPIKey(ProcessInfo.processInfo.environment["GOOGLE_MAPS_API_KEY"] ?? "")
```

3. Render the map with `provider={PROVIDER_GOOGLE}` in `src/components/AttendanceMap.tsx`.

## Running the app

```sh
# iOS (after installing pods)
cd ios && bundle exec pod install && cd ..
npm run ios

# Android
npm run android

# Start only the Metro bundler
npm start
```

### Useful scripts

```sh
npm run lint     # ESLint
npm test         # Jest unit tests
npx tsc --noEmit # TypeScript type-check
```

## Project structure

```
src/
├── assets/                 # Static assets (placeholder)
├── components/             # Reusable UI components
│   ├── AttendanceCard.tsx      # Single history record card
│   ├── AttendanceMap.tsx       # Map + geofence circle + markers
│   ├── CheckInButton.tsx       # Primary check-in action
│   ├── EmptyState.tsx          # Empty list placeholder
│   ├── InfoCard.tsx            # Label/value card (lat, lng, distance)
│   ├── MessageView.tsx         # Full-screen info/error state
│   └── StatusBadge.tsx         # Inside/Outside geofence pill
├── constants/
│   └── index.ts            # Office location, radius, colors, keys
├── hooks/
│   ├── useAttendance.ts        # Check-in + history state
│   └── useLocationTracking.ts  # Permission, GPS, watching lifecycle
├── navigation/
│   └── RootNavigator.tsx       # Stack navigator + types
├── screens/
│   ├── HomeScreen.tsx          # Tracking + map + check-in
│   └── AttendanceHistoryScreen.tsx  # FlatList of records
├── services/
│   ├── location.service.ts     # getCurrentPosition / watchPosition
│   ├── permission.service.ts   # Permission status, request, settings
│   └── storage.service.ts      # AsyncStorage CRUD
├── types/
│   ├── index.ts                # Shared TypeScript types
│   └── vector-icons.d.ts       # Icons module declaration
└── utils/
    ├── date.ts                 # Date/time formatting
    └── geo.ts                  # Haversine + geofence helpers
```

## How it works

1. **HomeScreen** mounts → `useLocationTracking` requests location permission (`react-native-permissions`), then starts a one-shot fix plus a `watchPosition` stream (`react-native-geolocation-service`).
2. Every fix updates `location`, and `AttendanceMap` animates the camera to it. `utils/geo.ts` computes the distance to `OFFICE_LOCATION` via the **Haversine formula** and decides `inside`/`outside`.
3. **Check In** calls `useAttendance().checkIn`, which:
   - refuses if the user is outside the 100 m geofence or has already checked in today;
   - builds an `AttendanceRecord` (`id`, `date`, `time`, `latitude`, `longitude`, `distance`) and saves it with `storage.service.ts`.
4. **Attendance History** loads records from AsyncStorage, sorts them newest-first, and renders them with `FlatList`; a clear button removes everything.
5. All state lives on-device, so the app works with no internet connection.

## Customization

- Change the office location and geofence radius in `src/constants/index.ts` (`OFFICE_LOCATION`, `GEOFENCE_RADIUS_METERS`).

## Troubleshooting

- **Blank map on Android** — your Google Maps API key is missing/invalid, or the **Maps SDK for Android** isn't enabled. Check `.env` and the Cloud Console.
- **Location errors on simulator** — enable a simulated location in Android Studio's emulator (Extended Controls → Location) or Xcode Simulator (Features → Location).
- **`pod install` fails** — run `bundle install` first, then `bundle exec pod install`.
