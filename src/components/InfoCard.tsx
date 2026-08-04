import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';

interface InfoCardProps {
  /** MaterialIcons glyph name. */
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}

/** A compact card that displays a labelled value with an icon. */
export function InfoCard({
  icon,
  label,
  value,
  iconColor = COLORS.primary,
}: InfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}1A` }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
});
