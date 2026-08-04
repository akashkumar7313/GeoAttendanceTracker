# GeoAttendanceTracker - AI Agent Instructions

This document provides essential information for AI coding agents to effectively contribute to the `GeoAttendanceTracker` codebase.

## Project Overview
`GeoAttendanceTracker` is a React Native project bootstrapped using `@react-native-community/cli`. It is a mobile application, likely for tracking attendance based on geographical location.

## Key Technologies
- **React Native**: For building cross-platform mobile applications.
- **JavaScript/TypeScript**: Primary development languages.
- **Metro**: JavaScript build tool for React Native.
- **npm/Yarn**: Package managers for JavaScript dependencies.
- **CocoaPods**: Dependency manager for iOS projects.
- **Ruby Bundler**: Used for managing Ruby dependencies (specifically CocoaPods).

## Developer Workflows

### 1. Starting the Development Server (Metro)
To start the Metro dev server, which is essential for running the React Native application:
```sh
npm start
# OR
yarn start
```

### 2. Building and Running the Application

#### Android
To build and run the app on Android:
```sh
npm run android
# OR
yarn android
```

#### iOS
For iOS, ensure CocoaPods dependencies are installed first. This is typically done once after cloning the repository or after updating native dependencies.

**First-time setup (or after updating native deps):**
```sh
bundle install
bundle exec pod install
```

Then, to build and run the app on iOS:
```sh
npm run ios
# OR
yarn ios
```

### 3. Making Changes and Fast Refresh
- Open `App.tsx` (or other relevant `.tsx` files) to make changes.
- The app will automatically update due to [Fast Refresh](https://reactnative.dev/docs/fast-refresh).
- To forcefully reload (e.g., to reset app state):
    - **Android**: Press `R` twice or `Ctrl + M` (Windows/Linux) / `Cmd ⌘ + M` (macOS) for Dev Menu -> "Reload".
    - **iOS**: Press `R` in iOS Simulator.

## Project Structure
- `App.tsx`: Main application component.
- `android/`: Android-specific project files.
- `ios/`: iOS-specific project files, including `Podfile` for CocoaPods.
- `package.json`: Lists project dependencies and scripts.
- `Gemfile`: Specifies Ruby dependencies, including CocoaPods.

## Conventions and Patterns
- React Native component-based architecture.
- Use of TypeScript for type safety.

## Integration Points
- **Native Modules**: Interaction with native Android/iOS code is handled through React Native's bridge.
- **CocoaPods**: Manages iOS native dependencies.
- **Ruby Bundler**: Manages Ruby dependencies for CocoaPods.

## Troubleshooting
Refer to the [React Native Troubleshooting page](https://reactnative.dev/docs/troubleshooting) for common issues.
