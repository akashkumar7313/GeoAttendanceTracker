import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AttendanceRecord } from '../types';
import { COLORS } from '../constants';
import { formatDateKey } from '../utils/date';
import { formatDistance } from '../utils/geo';

interface AttendanceCardProps {
  record: AttendanceRecord;
}

/** Card that displays a single attendance record. */
export function AttendanceCard({ record }: AttendanceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name="event-available" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.date}>{formatDateKey(record.date)}</Text>
          <Text style={styles.time}>{record.time}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow
          icon="place"
          label="Latitude"
          value={record.latitude.toFixed(6)}
        />
        <DetailRow
          icon="place"
          label="Longitude"
          value={record.longitude.toFixed(6)}
        />
        <DetailRow
          icon="straighten"
          label="Distance from office"
          value={formatDistance(record.distance)}
        />
      </View>
    </View>
  );
}

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={16} color={COLORS.textSecondary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  time: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  details: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
});
