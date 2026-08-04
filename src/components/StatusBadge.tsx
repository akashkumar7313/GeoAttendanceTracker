import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GeofenceStatus } from '../types';
import { COLORS } from '../constants';

interface StatusBadgeProps {
  status: GeofenceStatus;
}

const STATUS_META: Record<
  GeofenceStatus,
  { label: string; color: string; icon: string }
> = {
  inside: { label: 'Inside Geofence', color: COLORS.success, icon: 'check-circle' },
  outside: { label: 'Outside Geofence', color: COLORS.danger, icon: 'cancel' },
  unknown: { label: 'Status Unknown', color: COLORS.textSecondary, icon: 'help' },
};

/** Colored pill that shows whether the user is inside or outside the geofence. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}1A` }]}>
      <Icon name={meta.icon} size={14} color={meta.color} />
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});
