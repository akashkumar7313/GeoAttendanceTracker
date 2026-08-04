import React, { useCallback, useLayoutEffect } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AttendanceCard } from '../components/AttendanceCard';
import { EmptyState } from '../components/EmptyState';
import { useAttendance } from '../hooks/useAttendance';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { COLORS } from '../constants';

type HistoryNavigation = NativeStackNavigationProp<RootStackParamList>;

function ClearButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityLabel="Clear attendance history"
    >
      <Icon name="delete-sweep" size={22} color={COLORS.white} />
    </Pressable>
  );
}

export function AttendanceHistoryScreen() {
  const navigation = useNavigation<HistoryNavigation>();
  const { history, reload, clearHistory } = useAttendance();

  const confirmClear = useCallback(() => {
    Alert.alert(
      'Clear History',
      'This will permanently delete all saved attendance records. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ],
    );
  }, [clearHistory]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () =>
        history.length > 0 ? (
          <ClearButton onPress={confirmClear} />
        ) : null,
    });
  }, [confirmClear, history.length, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <AttendanceCard record={item} />}
        contentContainerStyle={
          history.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListHeaderComponent={
          history.length > 0 ? (
            <View style={styles.summary}>
              <Icon name="fact-check" size={18} color={COLORS.primary} />
              <Text style={styles.summaryText}>
                {history.length} check-in{history.length === 1 ? '' : 's'}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="event-busy"
            title="No attendance records yet"
            message="Once you check in while inside the office geofence, your records will appear here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default AttendanceHistoryScreen;
