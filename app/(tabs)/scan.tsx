import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';
import { registerAttendance } from '@/lib/attendance';

export default function ScanScreen() {
  const { user } = useAuth();

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [lastData, setLastData] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<Role | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);

  const scanLock = useRef(false);
  const scanLinePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLinePosition, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLinePosition, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [scanLinePosition]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        setProfileName(null);
        setProfileRole(null);
        setIdentityLoading(false);
        return;
      }

      setIdentityLoading(true);

      try {
        const profile = await getProfile(user.id);

        if (!active) return;

        setProfileName(profile?.full_name ?? null);
        setProfileRole(profile?.role ?? null);
      } catch (error) {
        if (!active) return;

        console.error('Unable to load profile:', error);
        setProfileName(null);
        setProfileRole(null);
      } finally {
        if (active) {
          setIdentityLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const resetScanner = () => {
    scanLock.current = false;
    setScanned(false);
    setRegistering(false);
    setMessage(null);
    setLastData(null);
    setSuccess(false);
  };

  const handleBarcodeScanned = async ({
    data,
  }: {
    data: string;
  }) => {
    if (scanLock.current || registering) return;

    scanLock.current = true;
    setScanned(true);
    setLastData(data);
    setMessage(null);
    setSuccess(false);

    if (!user) {
      setMessage('Please log in first to record your attendance.');
      return;
    }

    if (identityLoading) {
      setMessage('Your account is still loading. Please try again.');
      return;
    }

    if (profileRole === 'teacher') {
      setMessage(
        'Teacher accounts cannot record student attendance. Please use a student account.',
      );
      return;
    }

    setRegistering(true);

    try {
      const result = await registerAttendance(data, user.id);

      setMessage(result.message);
      setSuccess(result.success);
    } catch (error) {
      console.error('Attendance registration failed:', error);

      setMessage(
        'Unable to register attendance. Check your internet connection and try again.',
      );
      setSuccess(false);
    } finally {
      setRegistering(false);
    }
  };

  const identityLabel = identityLoading
    ? 'Checking account...'
    : profileName ?? user?.email ?? 'Not logged in';

  const scanLineTranslateY = scanLinePosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 218],
  });

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.permissionSubtitle}>
          Checking camera permissions...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <View style={styles.permissionIcon}>
          <Ionicons
            name="camera-outline"
            size={38}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.permissionTitle}>
          Camera Access Needed
        </Text>

        <Text style={styles.permissionSubtitle}>
          Allow camera access to scan QR codes and register your
          attendance at school events.
        </Text>

        <View style={styles.permissionButton}>
          <AppButton
            theme="primary"
            title="Grant Camera Permission"
            icon="camera-outline"
            onPress={() => {
              void requestPermission();
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleBarcodeScanned
        }
      />

      <View pointerEvents="none" style={styles.topBar}>
        <View style={styles.cameraBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.cameraBadgeText}>
            QR SCANNER
          </Text>
        </View>

        <Text style={styles.topHint}>
          Point your camera at an event QR code
        </Text>
      </View>

      {!scanned && (
        <View pointerEvents="none" style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineTranslateY }],
                },
              ]}
            />
          </View>

          <Text style={styles.frameHint}>
            Align the QR code inside the frame
          </Text>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.identityBar}>
          <View style={styles.identityIcon}>
            <Ionicons
              name="person-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.identityInfo}>
            <Text style={styles.identityLabel}>
              SCANNING AS
            </Text>

            <Text
              style={styles.identityName}
              numberOfLines={1}
            >
              {identityLabel}
            </Text>
          </View>

          <View style={styles.accountStatus}>
            <View
              style={[
                styles.accountDot,
                {
                  backgroundColor: identityLoading
                    ? COLORS.warning
                    : user
                      ? COLORS.success
                      : COLORS.danger,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.resultCard}>
          {registering ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text style={styles.processingTitle}>
                Registering Attendance
              </Text>

              <Text style={styles.processingSubtitle}>
                Please wait while we process your scan.
              </Text>
            </View>
          ) : message ? (
            <View style={styles.resultContent}>
              <View
                style={[
                  styles.resultIcon,
                  success
                    ? styles.successIcon
                    : styles.errorIcon,
                ]}
              >
                <Ionicons
                  name={
                    success
                      ? 'checkmark-circle'
                      : 'alert-circle'
                  }
                  size={32}
                  color={
                    success
                      ? COLORS.success
                      : COLORS.danger
                  }
                />
              </View>

              <Text
                style={[
                  styles.resultTitle,
                  success
                    ? styles.successText
                    : styles.errorText,
                ]}
              >
                {success ? 'Attendance Recorded' : 'Scan Result'}
              </Text>

              <Text style={styles.message}>
                {message}
              </Text>

              {lastData ? (
                <View style={styles.scannedDataBox}>
                  <Text style={styles.scannedDataLabel}>
                    SCANNED DATA
                  </Text>

                  <Text
                    style={styles.raw}
                    numberOfLines={3}
                  >
                    {lastData}
                  </Text>
                </View>
              ) : null}

              <AppButton
                theme="primary"
                title="Scan Again"
                icon="refresh-outline"
                onPress={resetScanner}
              />
            </View>
          ) : (
            <View style={styles.readyContent}>
              <View style={styles.readyIcon}>
                <Ionicons
                  name="qr-code-outline"
                  size={28}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.readyTextContainer}>
                <Text style={styles.scanTitle}>
                  Ready to Scan
                </Text>

                <Text style={styles.hint}>
                  Hold your phone steady and position the QR
                  code inside the frame.
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B2023',
  },

  camera: {
    flex: 1,
  },

  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  permissionIcon: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },

  permissionSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },

  permissionButton: {
    width: '100%',
    maxWidth: 360,
  },

  topBar: {
    position: 'absolute',
    top: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  cameraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 30, 35, 0.78)',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },

  cameraBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  topHint: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  scanArea: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  scanFrame: {
    width: 250,
    height: 250,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 183, 181, 0.25)',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 84, 97, 0.08)',
  },

  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: COLORS.accent,
    borderWidth: 4,
    zIndex: 2,
  },

  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 18,
  },

  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 18,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 18,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 18,
  },

  scanLine: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },

  frameHint: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: 'rgba(244, 244, 244, 0.97)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  identityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    paddingVertical: 12,
    gap: 12,
  },

  identityIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  identityInfo: {
    flex: 1,
  },

  identityLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.muted,
  },

  identityName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },

  accountStatus: {
    padding: 4,
  },

  accountDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  readyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  readyIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  readyTextContainer: {
    flex: 1,
  },

  scanTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },

  hint: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
  },

  processingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  processingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
  },

  processingSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 5,
  },

  resultContent: {
    alignItems: 'center',
    gap: 12,
  },

  resultIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successIcon: {
    backgroundColor: COLORS.successBackground,
  },

  errorIcon: {
    backgroundColor: COLORS.dangerBackground,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  successText: {
    color: COLORS.success,
  },

  errorText: {
    color: COLORS.danger,
  },

  message: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  scannedDataBox: {
    width: '100%',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },

  scannedDataLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.muted,
  },

  raw: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
});