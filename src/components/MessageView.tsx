import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';

interface Action {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface MessageViewProps {
  icon: string;
  title: string;
  message?: string;
  actions?: Action[];
  loading?: boolean;
}

/** Full-screen centered message used for permission, GPS and error states. */
export function MessageView({
  icon,
  title,
  message,
  actions = [],
  loading = false,
}: MessageViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <Icon name={icon} size={42} color={COLORS.primary} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map(action => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.button,
                action.variant === 'secondary'
                  ? styles.buttonSecondary
                  : styles.buttonPrimary,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  action.variant === 'secondary'
                    ? styles.buttonSecondaryText
                    : styles.buttonPrimaryText
                }
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  actions: {
    marginTop: 24,
    alignSelf: 'stretch',
    gap: 10,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonPrimaryText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
