import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';

interface CheckInButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
  checkedIn?: boolean;
}

/**
 * Full-width primary action button. When `checkedIn` is true the button
 * renders a green "Checked In" state. The `disabled` state is used when
 * the user is outside the geofence or the location is unknown.
 */
export function CheckInButton({
  onPress,
  disabled,
  loading = false,
  checkedIn = false,
}: CheckInButtonProps) {
  if (checkedIn) {
    return (
      <Pressable style={[styles.button, styles.checkedIn]} disabled>
        <Icon name="verified-user" size={20} color={COLORS.white} />
        <Text style={styles.buttonText}>Checked In Today</Text>
      </Pressable>
    );
  }

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <>
          <Icon name="login" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Check In</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  checkedIn: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
