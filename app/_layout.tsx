
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  // Animate the splash screen while authentication initializes.
  useEffect(() => {
    if (!loading) {
      opacity.setValue(1);
      scale.setValue(1);
      pulse.setValue(1);
      return;
    }

    const entrance = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    entrance.start();
    pulseAnimation.start();

    return () => {
      entrance.stop();
      pulseAnimation.stop();
    };
  }, [loading, opacity, scale, pulse]);

  // Redirect users according to their authentication state.
  useEffect(() => {
    if (loading) return;

    const currentRoute = segments[0];

    const inAuthScreens =
      currentRoute === 'login' ||
      currentRoute === 'register';

    const inTabs = currentRoute === '(tabs)';

    if (!session && inTabs) {
      router.replace('/login');
      return;
    }

    if (session && inAuthScreens) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, router]);

  // Show the animated startup screen while auth loads.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoCircle,
              {
                transform: [{ scale: pulse }],
              },
            ]}
          >
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>QR</Text>
            </View>
          </Animated.View>

          <Text style={styles.appTitle}>QR Attendance</Text>

          <Text style={styles.subtitle}>
            Smart attendance. Simplified.
          </Text>
        </Animated.View>

        <View style={styles.loadingArea}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Preparing your experience...
          </Text>
        </View>

        <Text style={styles.footerText}>
          QR ATTENDANCE SYSTEM
        </Text>
      </View>
    );
  }

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  brandContainer: {
    alignItems: 'center',
  },

  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    elevation: 8,
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  logoInner: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: COLORS.textOnPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },

  appTitle: {
    marginTop: 2,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  loadingArea: {
    alignItems: 'center',
    marginTop: 48,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
    textAlign: 'center',
  },

  footerText: {
    position: 'absolute',
    bottom: 36,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.primary,
    textAlign: 'center',
  },
});
