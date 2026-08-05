# GeoAttendanceTracker

`GeoAttendanceTracker` ek React Native CLI + TypeScript app hai jo live GPS location, office geofence aur attendance check-in flow ko combine karti hai. App ka main use-case hai: user apni current location dekhe, office location select ya persist kare, geofence ke andar aane par check-in kare, aur saari attendance history locally device par save ho.

Detailed project documentation, flow diagrams aur requirement analysis ke liye dekhein: `docs/PROJECT_REQUIREMENT_GUIDE.md`

## What This Project Does

- Live user location track karta hai using `react-native-geolocation-service`
- Office location ko search karke select karne deta hai via Google Places API
- Office ke around circular geofence draw karta hai
- User aur office distance calculate karta hai using Haversine formula
- Sirf geofence ke andar attendance check-in allow karta hai
- Ek din me duplicate check-in block karta hai
- Attendance history ko local storage me persist karta hai
- Android aur iOS dono par permission aur GPS state handle karta hai

## Main Screens

### Home

- Office search input with live place suggestions
- Selected office details card
- Current latitude and longitude cards
- Distance from office card
- Map with office marker, user marker aur geofence circle
- Map controls:
  - current user location
  - office location
  - show both locations in the current map viewport
  - zoom in / zoom out
- Check-in button jo tabhi enable hota hai jab user geofence ke andar ho

### Attendance History

- Saved check-ins ki list, newest-first order me
- Empty state jab koi record available na ho
- Header action se full history clear karne ka option

## Key Features

- **Live GPS tracking**: initial location fetch ke baad continuous watch start hota hai
- **Office search**: Google Places autocomplete aur place details se office coordinates milte hain
- **Persistent office selection**: selected office AsyncStorage me save hota hai aur app restart ke baad restore hota hai
- **Geofence status**: `inside`, `outside` aur `unknown` state derive hoti hai
- **Offline attendance storage**: attendance history backend ke bina local device me save hoti hai
- **Permission handling**: denied, blocked, GPS disabled aur generic error flows cover kiye gaye hain
- **Map fit behavior**: office aur user dono ko current map size ke andar fit karke dikhaya ja sakta hai

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React Native CLI `0.86.2` | Mobile app framework |
| React `19.2.3` | UI runtime |
| TypeScript | Static typing |
| React Navigation (`native-stack`) | App navigation |
| `react-native-maps` | Map rendering |
| `react-native-geolocation-service` | GPS location fetch and watch |
| `react-native-permissions` | Runtime permission flow |
| `@react-native-async-storage/async-storage` | Local persistence |
| `react-native-config` | `.env` based configuration |
| `react-native-vector-icons` | Material icons |
| `react-native-safe-area-context` | Safe area handling |
| Jest | Unit tests |
| ESLint | Linting |

## Requirements

- Node.js `>= 22.11.0`
- npm
- JDK 17+
- Android Studio with Android SDK
- Xcode and CocoaPods for iOS
- Google Maps / Places API key

## Environment Setup

Project root me `.env` file create karo:

```bash
cp .env.example .env
```

`.env` me apni API key set karo:

```env
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

Recommended Google APIs:

- Maps SDK for Android
- Places API

Notes:

- Android map rendering ke liye API key required hai
- Office search ke liye Places API required hai
- `.env` repo me commit nahi karna chahiye

## Installation

```bash
npm install
```

iOS ke liye:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## Run The App

Metro start:

```bash
npm start
```

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

## Available Scripts

```bash
npm start
npm run android
npm run ios
npm run lint
npm test
```

TypeScript type-check ke liye:

```bash
npx tsc --noEmit
```

## Native Configuration Already Present

### Android

- `android/app/src/main/AndroidManifest.xml`
  - `INTERNET`
  - `ACCESS_COARSE_LOCATION`
  - `ACCESS_FINE_LOCATION`
  - `ACCESS_BACKGROUND_LOCATION`
  - Google Maps API key meta-data
- `android/app/build.gradle`
  - `react-native-config` dotenv integration
  - `GOOGLE_MAPS_API_KEY` manifest placeholder
  - `react-native-vector-icons` fonts setup

### iOS

- `ios/GeoAttendanceTracker/Info.plist`
  - `NSLocationWhenInUseUsageDescription` configured
- `ios/Podfile`
  - React Native pods setup available
- Default map provider iOS par Apple Maps hai

## Project Structure

```text
.
├── __tests__/                     # Jest tests
├── src/
│   ├── assets/                    # Static assets placeholder
│   ├── components/
│   │   ├── AttendanceCard.tsx     # Single attendance history card
│   │   ├── AttendanceMap.tsx      # Map, markers, circle and controls
│   │   ├── CheckInButton.tsx      # Check-in CTA
│   │   ├── EmptyState.tsx         # Empty list / no-data placeholder
│   │   ├── InfoCard.tsx           # Reusable info display card
│   │   ├── MessageView.tsx        # Permission / error / loading state screen
│   │   ├── OfficeSearch.tsx       # Office place search UI
│   │   └── StatusBadge.tsx        # Geofence status pill
│   ├── constants/
│   │   └── index.ts               # Colors, defaults, storage keys, routes
│   ├── hooks/
│   │   ├── useAttendance.ts       # Attendance state and actions
│   │   ├── useLocationTracking.ts # Permission + GPS tracking lifecycle
│   │   └── useOfficeLocation.ts   # Saved office location management
│   ├── navigation/
│   │   └── RootNavigator.tsx      # App stack navigator
│   ├── screens/
│   │   ├── AttendanceHistoryScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── services/
│   │   ├── geocode.service.ts     # Google Places autocomplete and details
│   │   ├── location.service.ts    # Current position and watch helpers
│   │   ├── office.service.ts      # Office location storage helpers
│   │   ├── permission.service.ts  # Permission and settings helpers
│   │   └── storage.service.ts     # Attendance storage helpers
│   ├── types/
│   │   ├── index.ts               # Shared app types
│   │   └── vector-icons.d.ts      # Type declaration for icons
│   └── utils/
│       ├── date.ts                # Date/time helpers
│       └── geo.ts                 # Distance and geofence helpers
├── App.tsx                        # Navigation + safe area bootstrap
├── package.json
└── README.md
```

## App Flow

1. App start hone par `RootNavigator` home screen render karta hai
2. `useLocationTracking` permission check karta hai aur GPS tracking start karta hai
3. `useOfficeLocation` saved office ko AsyncStorage se load karta hai, warna default office use hota hai
4. User `OfficeSearch` se office search karke select kar sakta hai
5. `AttendanceMap` office marker, user marker aur geofence circle render karta hai
6. `utils/geo.ts` distance aur geofence state calculate karta hai
7. User geofence ke andar hone par `Check In` enable hota hai
8. Check-in success par record local storage me save hota hai
9. `AttendanceHistoryScreen` saved records ko list me show karta hai

## Data Persistence

AsyncStorage me do primary data groups save hote hain:

- `@geo_attendance/records`
  - attendance records list
- `@geo_attendance/office_location`
  - selected office location

Is wajah se:

- Attendance history offline available rehti hai
- Last selected office restart ke baad bhi restore ho jata hai

## Testing

Project me Jest tests available hain. Existing tests mostly app bootstrap, geo helpers aur storage-related logic cover karte hain.

Run tests:

```bash
npm test
```

## Customization

`src/constants/index.ts` me ye values update ki ja sakti hain:

- `OFFICE_LOCATION`
- `GEOFENCE_RADIUS_METERS`
- `COLORS`
- `SCREENS`

## Limitations

- Attendance storage local-only hai, koi backend sync nahi hai
- Office search ke liye internet aur valid Places API key chahiye
- iOS par Google Maps provider configure nahi kiya gaya; default Apple Maps use hota hai
- Check-in model abhi single event per day hai, check-out flow nahi hai

## Troubleshooting

- **Android map blank hai**
  - `.env` me valid `GOOGLE_MAPS_API_KEY` verify karo
  - Google Cloud me Maps SDK for Android enabled ho

- **Office search result nahi aa rahe**
  - Places API enabled hai ya nahi check karo
  - Internet connectivity verify karo
  - API key restrictions review karo

- **Location permission denied aa raha hai**
  - App settings open karke location permission allow karo

- **GPS disabled state aa rahi hai**
  - Device location services on karo
  - Retry action se tracking restart karo

- **iOS pods issue**
  - `bundle install` ke baad `bundle exec pod install` chalao

## Summary

Ye project ek practical geofence attendance tracker hai jisme:

- live location tracking
- office place search
- map-based visibility
- geofence-gated check-in
- local attendance history

already integrated hai aur codebase clean module structure me organized hai.
