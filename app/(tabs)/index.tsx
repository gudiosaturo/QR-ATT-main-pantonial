import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const iconAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(iconAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fadeAnim, slideAnim, iconAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: isSmallScreen ? 16 : 24,
            },
          ]}
        >
          <View style={styles.headerSection}>
            <Header title="QR Attendance" />
          </View>

          <Animated.View
            style={[
              styles.welcomeCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.labelContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.eyebrow} numberOfLines={2}>
                  STUDENT DASHBOARD
                </Text>
              </View>

              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: iconAnim }],
                  },
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={26}
                  color={COLORS.primary}
                />
              </Animated.View>
            </View>

            <Text
              style={[
                styles.mainTitle,
                isSmallScreen && styles.mainTitleSmall,
              ]}
            >
              School Event{' \n'}Attendance
            </Text>

            <Text style={styles.subtitle}>
              Keep your attendance organized. Scan event QR codes
              to register quickly and check your attendance records
              whenever you need them.
            </Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.infoText}>
                Fast and convenient attendance tracking
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.actionsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <Text style={styles.sectionSubtitle}>
              Choose what you would like to do.
            </Text>

            <View style={styles.buttonStack}>
              <AppButton
                theme="primary"
                title="Scan QR Code"
                icon="qr-code-outline"
                onPress={() => router.push('/scan')}
              />

              <AppButton
                title="Attendance History"
                icon="time-outline"
                onPress={() => router.push('/history')}
              />

              <AppButton
                title="My Profile"
                icon="person-outline"
                onPress={() => router.push('/profile')}
              />
            </View>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <Text style={styles.footerText}>
            QR ATTENDANCE SYSTEM
          </Text>

          <Text style={styles.versionText}>Version 1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },

  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
    paddingTop: 12,
  },

  headerSection: {
    marginBottom: 16,
    width: '100%',
  },

  welcomeCard: {
    width: '100%',
    minWidth: 0,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 20,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
    minWidth: 0,
  },

  labelContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    flexShrink: 0,
  },

  eyebrow: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: COLORS.primary,
  },

  iconContainer: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: 15,
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainTitle: {
    flexShrink: 1,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.primaryDark,
    marginBottom: 12,
  },

  mainTitleSmall: {
    fontSize: 25,
    lineHeight: 32,
  },

  subtitle: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    minWidth: 0,
  },

  infoText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  actionsSection: {
    width: '100%',
    minWidth: 0,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 18,
  },

  buttonStack: {
    width: '100%',
    gap: 14,
  },

  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    marginTop: 'auto',
  },

  footerLine: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginBottom: 12,
  },

  footerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },

  versionText: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 5,
  },
});