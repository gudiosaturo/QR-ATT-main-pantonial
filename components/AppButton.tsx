
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

type AppButtonProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: 'primary';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function AppButton({
  title,
  icon,
  theme,
  onPress,
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const isPrimary = theme === 'primary';
  const scale = useRef(new Animated.Value(1)).current;
  const isUnavailable = disabled || loading;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [disabled, loading, scale]);

  const animatePress = (pressed: boolean) => {
    Animated.spring(scale, {
      toValue: pressed ? 0.97 : 1,
      friction: 7,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ scale }] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{
          disabled: isUnavailable,
          busy: loading,
        }}
        onPress={onPress}
        disabled={isUnavailable}
        onPressIn={() => animatePress(true)}
        onPressOut={() => animatePress(false)}
        style={({ pressed }) => [
          styles.buttonInner,
          isPrimary ? styles.primaryFill : styles.secondaryFill,
          pressed && !isUnavailable && styles.pressed,
          isUnavailable && styles.disabled,
        ]}
      >
        <View style={styles.row}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                isPrimary
                  ? COLORS.textOnPrimary
                  : COLORS.primary
              }
            />
          ) : (
            <Ionicons
              name={icon}
              size={22}
              color={
                isPrimary
                  ? COLORS.textOnPrimary
                  : COLORS.primary
              }
            />
          )}

          <Text
            style={[
              styles.label,
              isPrimary
                ? styles.labelPrimary
                : styles.labelSecondary,
            ]}
            numberOfLines={1}
          >
            {loading ? 'Please wait...' : title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  buttonInner: {
    width: '100%',
    minHeight: 58,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryFill: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
  },

  secondaryFill: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },

  labelPrimary: {
    color: COLORS.textOnPrimary,
    fontWeight: '700',
  },

  labelSecondary: {
    color: COLORS.textPrimary,
  },

  pressed: {
    opacity: 0.9,
  },

  disabled: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
});
