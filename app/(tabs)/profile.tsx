import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { useAuth, signOut } from '@/lib/auth';
import {
  getProfile,
  updateProfile,
  type Profile,
} from '@/lib/profiles';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [draftName, setDraftName] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const avatarScale = useRef(new Animated.Value(0.85)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [avatarScale, contentOpacity]);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setDraftName('');
      setLoadError('Please log in to view your profile.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const result = await getProfile(user.id);

      setProfile(result);
      setDraftName(result?.full_name ?? '');
    } catch (error) {
      console.error('Unable to load profile:', error);
      setLoadError(
        'Unable to load your profile. Check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  const handleSaveName = async () => {
    if (!user || saving) return;

    const trimmedName = draftName.trim();

    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }

    setSaving(true);

    try {
      const { error } = await updateProfile(user.id, {
        full_name: trimmedName,
      });

      if (error) {
        Alert.alert('Unable to Save', error);
        return;
      }

      await loadProfile();
      setEditing(false);
      Alert.alert('Profile Updated', 'Your name was saved successfully.');
    } catch (error) {
      console.error('Unable to save profile:', error);
      Alert.alert(
        'Save Failed',
        'Check your internet connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDraftName(profile?.full_name ?? '');
    setEditing(false);
  };

  const handleSignOut = () => {
    if (signingOut) return;

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            void performSignOut();
          },
        },
      ],
    );
  };

  const performSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Sign out failed:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Failed to sign out. Please try again.';

      Alert.alert('Sign Out Failed', message);
    } finally {
      setSigningOut(false);
    }
  };

  const initials =
    profile?.full_name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'JP';

  const role = profile?.role ?? 'student';
  const isTeacher = role === 'teacher';

  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>

        <Text style={styles.loadingTitle}>Loading Profile</Text>

        <Text style={styles.muted}>
          Retrieving your account information...
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <View style={styles.stateIcon}>
          <Ionicons
            name="cloud-offline-outline"
            size={36}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.loadingTitle}>
          Unable to Load Profile
        </Text>

        <Text style={styles.muted}>{loadError}</Text>

        <View style={styles.retryButton}>
          <AppButton
            theme="primary"
            title="Try Again"
            icon="refresh-outline"
            onPress={() => {
              void loadProfile();
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>My Profile</Text>

        <Text style={styles.pageSubtitle}>
          Manage your account information and preferences.
        </Text>
      </View>

      <Animated.View
        style={[
          styles.profileHero,
          {
            opacity: contentOpacity,
            transform: [{ scale: avatarScale }],
          },
        ]}
      >
        <View style={styles.avatarOuter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.avatarStatus}>
            <Ionicons
              name="checkmark"
              size={12}
              color={COLORS.textOnPrimary}
            />
          </View>
        </View>

        <Text style={styles.profileName}>
          {profile?.full_name || 'Welcome'}
        </Text>

        <Text style={styles.profileEmail}>
          {user?.email ?? profile?.email ?? 'No email available'}
        </Text>

        <View
          style={[
            styles.roleBadge,
            isTeacher ? styles.teacherBadge : styles.studentBadge,
          ]}
        >
          <Ionicons
            name={isTeacher ? 'school-outline' : 'person-outline'}
            size={15}
            color={COLORS.primary}
          />

          <Text style={styles.roleText}>
            {isTeacher ? 'Teacher Account' : 'Student Account'}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <Text style={styles.sectionCaption}>
          Your registered details
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldIcon}>
            <Ionicons
              name="person-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.fieldLabel}>Full Name</Text>

          {!editing && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit full name"
              onPress={() => setEditing(true)}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={COLORS.primary}
              />

              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          )}
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.muted}
              editable={!saving}
              autoCapitalize="words"
              returnKeyType="done"
              maxLength={100}
              accessibilityLabel="Full name"
            />

            <View style={styles.editActions}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Cancel"
                  icon="close-outline"
                  onPress={handleCancelEdit}
                  disabled={saving}
                />
              </View>

              <View style={styles.actionButton}>
                <AppButton
                  theme="primary"
                  title="Save Name"
                  icon="checkmark-outline"
                  onPress={() => {
                    void handleSaveName();
                  }}
                  disabled={saving}
                  loading={saving}
                />
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.fieldValue}>
            {profile?.full_name || 'Add your name'}
          </Text>
        )}

        <View style={styles.divider} />

        <View style={styles.fieldHeader}>
          <View style={styles.fieldIcon}>
            <Ionicons
              name="mail-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.fieldLabel}>Email Address</Text>
        </View>

        <Text style={styles.fieldValue}>
          {user?.email ?? profile?.email ?? 'Not available'}
        </Text>

        <View style={styles.divider} />

        <View style={styles.fieldHeader}>
          <View style={styles.fieldIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.fieldLabel}>Account Role</Text>
        </View>

        <Text style={styles.fieldValue}>
          {isTeacher ? 'Teacher' : 'Student'}
        </Text>

        <View style={styles.divider} />

        <View style={styles.fieldHeader}>
          <View style={styles.fieldIcon}>
            <Ionicons
              name="finger-print-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.fieldLabel}>User ID</Text>
        </View>

        <Text selectable style={styles.userId}>
          {user?.id ?? 'Not available'}
        </Text>
      </View>

      <View style={styles.securityNote}>
        <Ionicons
          name="lock-closed-outline"
          size={19}
          color={COLORS.primary}
        />

        <Text style={styles.securityText}>
          Your account details are managed through the attendance
          system.
        </Text>
      </View>

      <View style={styles.signOutSection}>
        <AppButton
          title={signingOut ? 'Signing Out...' : 'Sign Out'}
          icon="log-out-outline"
          onPress={handleSignOut}
          disabled={signingOut}
          loading={signingOut}
        />

        <Text style={styles.footerText}>
          QR ATTENDANCE SYSTEM · VERSION 1.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 36,
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
  },

  pageHeader: {
    marginBottom: 24,
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
  },

  pageSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    marginTop: 6,
  },

  profileHero: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 26,
    marginBottom: 28,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  avatarOuter: {
    position: 'relative',
    marginBottom: 16,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: COLORS.primaryDark,
    borderWidth: 4,
    borderColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: COLORS.textOnPrimary,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1,
  },

  avatarStatus: {
    position: 'absolute',
    right: -3,
    bottom: 2,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileName: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  profileEmail: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 16,
  },

  teacherBadge: {
    backgroundColor: COLORS.accentLight,
  },

  studentBadge: {
    backgroundColor: COLORS.accentLight,
  },

  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  sectionCaption: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  fieldValue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 10,
    marginLeft: 46,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.accentLight,
  },

  editText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },

  pressed: {
    opacity: 0.7,
  },

  editForm: {
    marginTop: 12,
  },

  nameInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.borderFocused,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },

  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  actionButton: {
    flex: 1,
    minWidth: 0,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },

  userId: {
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.muted,
    marginTop: 10,
    marginLeft: 46,
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.accentLight,
    borderRadius: 15,
    padding: 14,
    marginTop: 18,
  },

  securityText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.primaryDark,
  },

  signOutSection: {
    marginTop: 26,
  },

  footerText: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginTop: 22,
  },

  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  loadingIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  stateIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },

  muted: {
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: 'center',
  },

  retryButton: {
    width: '100%',
    maxWidth: 340,
    marginTop: 24,
  },
});