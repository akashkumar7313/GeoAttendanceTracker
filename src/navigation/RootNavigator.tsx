import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import { COLORS, SCREENS } from '../constants';

export type RootStackParamList = {
  Home: undefined;
  AttendanceHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{ title: 'Geo Attendance' }}
      />
      <Stack.Screen
        name={SCREENS.ATTENDANCE_HISTORY}
        component={AttendanceHistoryScreen}
        options={{ title: 'Attendance History' }}
      />
    </Stack.Navigator>
  );
}
