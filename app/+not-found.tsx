
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';

export default function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Page Not Found',
          headerShown: false,
        }}
      />

      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 24),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons
                name="compass-outline"
                size={54}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.questionBadge}>
              <Ionicons
                name="help"
                size={19}
                color={COLORS.textOnPrimary}
              />
            </View>
          </View>

          <Text style={styles.errorCode}>404</Text>

          <Text style={styles.title}>Oops! Page Not Found</Text>

          <Text style={styles.subtitle}>
            The page you are looking for doesn't exist or may have
            been moved. Let's get you back to your attendance dashboard.
          </Text>

          <View style={styles.buttonContainer}>
            <AppButton
              theme="primary"
              title="Back to Home"
              icon="home-outline"
              onPress={goHome}
            />
          </View>

          <Text style={styles.footer}>
            QR ATTENDANCE SYSTEM
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },

  iconOuter: {
    position: 'relative',
    marginBottom: 25,
  },

  iconInner: {
    width: 124,
    height: 124,
    borderRadius: 38,
    backgroundColor: '#E0F8F7',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  questionBadge: {
    position: 'absolute',
    right: -5,
    bottom: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorCode: {
    fontSize: 52,
    lineHeight: 62,
    fontWeight: '900',
    letterSpacing: 2,
    color: COLORS.primary,
  },

  title: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 5,
  },

  subtitle: {
    maxWidth: 330,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 12,
  },

  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: 28,
  },

  footer: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 35,
  },
});
