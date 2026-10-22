
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [opacity, translateY, logoScale]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.logoOuter,
          {
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoInner}>
          <MaterialIcons
            name="qr-code-2"
            size={44}
            color={COLORS.textOnPrimary}
          />
        </View>

        <View style={styles.statusDot} />
      </Animated.View>

      <Text style={styles.eyebrow}>
        SCHOOL ATTENDANCE
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.subtitle}>
        School Event Attendance System
      </Text>

      <View style={styles.accentLine} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 16,
  },

  logoOuter: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  logoInner: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  statusDot: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 7,
    right: 2,
    bottom: 5,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.background,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: 'center',
  },

  accentLine: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 18,
  },
});
