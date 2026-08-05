/* eslint-disable no-undef */

jest.mock('react-native-config', () => {
  return {
    __esModule: true,
    default: {
      GOOGLE_MAPS_API_KEY: 'test-api-key',
    },
    GOOGLE_MAPS_API_KEY: 'test-api-key',
  };
});

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = props =>
    React.createElement(Text, props, '\uE900');
  return MockIcon;
});

jest.mock('react-native-permissions', () => ({
  __esModule: true,
  check: jest.fn(async () => 'granted'),
  request: jest.fn(async () => 'granted'),
  openSettings: jest.fn(async () => { }),
  PERMISSIONS: {
    IOS: { LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE' },
    ANDROID: { ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION' },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    LIMITED: 'limited',
    UNAVAILABLE: 'unavailable',
  },
}));

jest.mock('react-native-geolocation-service', () => {
  const api = {
    getCurrentPosition: success => {
      success({
        coords: { latitude: 28.6139, longitude: 77.209 },
        timestamp: Date.now(),
      });
    },
    watchPosition: () => 1,
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
  };
  return {
    __esModule: true,
    default: api,
    PositionError: {
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
      PLAY_SERVICE_NOT_AVAILABLE: 4,
      SETTINGS_NOT_SATISFIED: 5,
      INTERNAL_ERROR: -1,
    },
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MapView = props => {
    if (props.ref) {
      props.ref.current = {
        animateToRegion: jest.fn(),
        animateCamera: jest.fn(),
        fitToCoordinates: jest.fn(),
      };
    }
    const { ref, ...rest } = props;
    return React.createElement(View, rest);
  };
  const MockChild = props => React.createElement(View, props);
  MapView.Marker = MockChild;
  MapView.Circle = MockChild;
  return {
    __esModule: true,
    default: MapView,
    Marker: MockChild,
    Circle: MockChild,
  };
});

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key =>
        Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
      ),
      setItem: jest.fn(async (key, value) => {
        store[key] = value;
      }),
      removeItem: jest.fn(async key => {
        delete store[key];
      }),
      clear: jest.fn(async () => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
    },
  };
});

jest.mock('react-native-screens', () => {
  const React = require('react');
  const { View } = require('react-native');
  const ScreenStack = props => React.createElement(View, props);
  const ScreenStackItem = props => React.createElement(View, props);
  return {
    __esModule: true,
    ScreenStack,
    ScreenStackItem,
    compatibilityFlags: {
      nativeAnimation: true,
      preventScrollBounce: true,
    },
    enableScreens: jest.fn(),
  };
});
