
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import { signUp } from '@/lib/auth';

type Role = 'student' | 'teacher';
type FieldName = 'name' | 'email' | 'password' | 'confirmPassword';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('student');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<FieldName | null>(null);

  const handleRegister = async () => {
    if (loading) return;

    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError('Please complete all fields before continuing.');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Your password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check them and try again.');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const { data, error: authError } = await signUp(
        trimmedEmail,
        password,
        {
          full_name: trimmedName,
          role,
        }
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.session) {
        router.replace('/(tabs)');
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      console.error('Registration failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError(null);
  };

  const renderPasswordToggle = (
    visible: boolean,
    onToggle: () => void,
    label: string
  ) => (
    <Pressable
      onPress={onToggle}
      disabled={loading}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={visible ? `Hide ${label}` : `Show ${label}`}
      style={styles.passwordToggle}
    >
      <Ionicons
        name={visible ? 'eye-off-outline' : 'eye-outline'}
        size={20}
        color={COLORS.muted}
      />
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.headerContainer}>
                <Header title="QR Attendance" />
              </View>

              {success ? (
                <View style={styles.successCard}>
                  <View style={styles.successIcon}>
                    <Ionicons
                      name="mail-open-outline"
                      size={38}
                      color={COLORS.primary}
                    />
                  </View>

                  <Text style={styles.successTitle}>
                    Check Your Email!
                  </Text>

                  <Text style={styles.successText}>
                    Your account has been created. We sent a confirmation
                    link to:
                  </Text>

                  <View style={styles.emailBadge}>
                    <Ionicons
                      name="mail-outline"
                      size={17}
                      color={COLORS.primary}
                    />
                    <Text style={styles.confirmationEmail}>
                      {email.trim()}
                    </Text>
                  </View>

                  <Text style={styles.successHint}>
                    Open the email and follow the confirmation link to
                    verify your account. Then return here to sign in.
                  </Text>

                  <View style={styles.buttonFull}>
                    <AppButton
                      theme="primary"
                      title="Back to Sign In"
                      icon="log-in-outline"
                      onPress={() => router.replace('/login')}
                    />
                  </View>

                  <Text style={styles.footer}>
                    QR ATTENDANCE SYSTEM
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.intro}>
                    <View style={styles.welcomeIcon}>
                      <Ionicons
                        name="person-add-outline"
                        size={31}
                        color={COLORS.primary}
                      />
                    </View>

                    <Text style={styles.title}>Create Account</Text>

                    <Text style={styles.subtitle}>
                      Join the QR Attendance System to manage your
                      attendance.
                    </Text>
                  </View>

                  <View style={styles.form}>
                    <Text style={styles.formTitle}>
                      Registration Details
                    </Text>

                    <Text style={styles.formDescription}>
                      Fill in your information to get started.
                    </Text>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Full Name</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          focusedInput === 'name' && styles.inputFocused,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={19}
                          color={
                            focusedInput === 'name'
                              ? COLORS.primary
                              : COLORS.muted
                          }
                        />

                        <TextInput
                          style={styles.input}
                          value={fullName}
                          onChangeText={(value) => {
                            setFullName(value);
                            clearError();
                          }}
                          placeholder="Juan Dela Cruz"
                          placeholderTextColor={COLORS.muted}
                          autoCapitalize="words"
                          autoCorrect={false}
                          autoComplete="name"
                          textContentType="name"
                          returnKeyType="next"
                          maxLength={100}
                          editable={!loading}
                          onFocus={() => setFocusedInput('name')}
                          onBlur={() => setFocusedInput(null)}
                          accessibilityLabel="Full name"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Email Address</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          focusedInput === 'email' && styles.inputFocused,
                        ]}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={19}
                          color={
                            focusedInput === 'email'
                              ? COLORS.primary
                              : COLORS.muted
                          }
                        />

                        <TextInput
                          style={styles.input}
                          value={email}
                          onChangeText={(value) => {
                            setEmail(value);
                            clearError();
                          }}
                          placeholder="your.email@school.edu"
                          placeholderTextColor={COLORS.muted}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="email"
                          textContentType="emailAddress"
                          keyboardType="email-address"
                          returnKeyType="next"
                          editable={!loading}
                          onFocus={() => setFocusedInput('email')}
                          onBlur={() => setFocusedInput(null)}
                          accessibilityLabel="Email address"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Password</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          focusedInput === 'password' &&
                            styles.inputFocused,
                        ]}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={19}
                          color={
                            focusedInput === 'password'
                              ? COLORS.primary
                              : COLORS.muted
                          }
                        />

                        <TextInput
                          style={styles.input}
                          value={password}
                          onChangeText={(value) => {
                            setPassword(value);
                            clearError();
                          }}
                          placeholder="At least 6 characters"
                          placeholderTextColor={COLORS.muted}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="new-password"
                          textContentType="newPassword"
                          returnKeyType="next"
                          editable={!loading}
                          onFocus={() => setFocusedInput('password')}
                          onBlur={() => setFocusedInput(null)}
                          accessibilityLabel="Password"
                        />

                        {renderPasswordToggle(
                          showPassword,
                          () => setShowPassword((value) => !value),
                          'password'
                        )}
                      </View>
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Confirm Password</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          focusedInput === 'confirmPassword' &&
                            styles.inputFocused,
                        ]}
                      >
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={19}
                          color={
                            focusedInput === 'confirmPassword'
                              ? COLORS.primary
                              : COLORS.muted
                          }
                        />

                        <TextInput
                          style={styles.input}
                          value={confirmPassword}
                          onChangeText={(value) => {
                            setConfirmPassword(value);
                            clearError();
                          }}
                          placeholder="Re-enter your password"
                          placeholderTextColor={COLORS.muted}
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="new-password"
                          returnKeyType="done"
                          editable={!loading}
                          onFocus={() =>
                            setFocusedInput('confirmPassword')
                          }
                          onBlur={() => setFocusedInput(null)}
                          onSubmitEditing={handleRegister}
                          accessibilityLabel="Confirm password"
                        />

                        {renderPasswordToggle(
                          showConfirmPassword,
                          () =>
                            setShowConfirmPassword((value) => !value),
                          'confirm password'
                        )}
                      </View>
                    </View>

                    <View style={styles.roleSection}>
                      <Text style={styles.label}>Register As</Text>

                      <Text style={styles.roleDescription}>
                        Choose the account type you need.
                      </Text>

                      <View style={styles.roleRow}>
                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{
                            selected: role === 'student',
                            disabled: loading,
                          }}
                          disabled={loading}
                          onPress={() => setRole('student')}
                          style={({ pressed }) => [
                            styles.roleChip,
                            role === 'student' && styles.roleChipActive,
                            pressed && styles.roleChipPressed,
                          ]}
                        >
                          <View
                            style={[
                              styles.roleIcon,
                              role === 'student' &&
                                styles.roleIconActive,
                            ]}
                          >
                            <Ionicons
                              name="person-outline"
                              size={23}
                              color={
                                role === 'student'
                                  ? COLORS.textOnPrimary
                                  : COLORS.primary
                              }
                            />
                          </View>

                          <Text
                            style={[
                              styles.roleChipText,
                              role === 'student' &&
                                styles.roleChipTextActive,
                            ]}
                          >
                            Student
                          </Text>

                          <Text
                            style={[
                              styles.roleHint,
                              role === 'student' &&
                                styles.roleHintActive,
                            ]}
                          >
                            Record attendance
                          </Text>

                          {role === 'student' && (
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color={COLORS.primary}
                              style={styles.roleCheck}
                            />
                          )}
                        </Pressable>

                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{
                            selected: role === 'teacher',
                            disabled: loading,
                          }}
                          disabled={loading}
                          onPress={() => setRole('teacher')}
                          style={({ pressed }) => [
                            styles.roleChip,
                            role === 'teacher' && styles.roleChipActive,
                            pressed && styles.roleChipPressed,
                          ]}
                        >
                          <View
                            style={[
                              styles.roleIcon,
                              role === 'teacher' &&
                                styles.roleIconActive,
                            ]}
                          >
                            <Ionicons
                              name="school-outline"
                              size={23}
                              color={
                                role === 'teacher'
                                  ? COLORS.textOnPrimary
                                  : COLORS.primary
                              }
                            />
                          </View>

                          <Text
                            style={[
                              styles.roleChipText,
                              role === 'teacher' &&
                                styles.roleChipTextActive,
                            ]}
                          >
                            Teacher
                          </Text>

                          <Text
                            style={[
                              styles.roleHint,
                              role === 'teacher' &&
                                styles.roleHintActive,
                            ]}
                          >
                            Manage events
                          </Text>

                          {role === 'teacher' && (
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color={COLORS.primary}
                              style={styles.roleCheck}
                            />
                          )}
                        </Pressable>
                      </View>
                    </View>

                    {error ? (
                      <View style={styles.errorBox}>
                        <Ionicons
                          name="alert-circle-outline"
                          size={19}
                          color={COLORS.danger}
                        />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    ) : null}

                    <View style={styles.submitButton}>
                      {loading ? (
                        <View style={styles.loadingButton}>
                          <Text style={styles.loadingText}>
                            Creating Account...
                          </Text>
                        </View>
                      ) : (
                        <AppButton
                          theme="primary"
                          title="Create Account"
                          icon="person-add-outline"
                          onPress={handleRegister}
                        />
                      )}
                    </View>

                    <View style={styles.securityHint}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={17}
                        color={COLORS.primary}
                      />
                      <Text style={styles.securityText}>
                        Your account details are handled through secure
                        authentication.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.loginRow}>
                    <Text style={styles.loginText}>
                      Already have an account?
                    </Text>

                    <Link href="/login" asChild>
                      <Text style={styles.loginLink}>Sign In</Text>
                    </Link>
                  </View>

                  <Text style={styles.footer}>
                    QR ATTENDANCE SYSTEM
                  </Text>
                </>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  content: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  intro: {
    alignItems: 'center',
    marginBottom: 23,
  },

  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 21,
    backgroundColor: '#E0F8F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 13,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    maxWidth: 320,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 7,
  },

  form: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  formTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  formDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 17,
  },

  fieldContainer: {
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  inputWrapper: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  inputFocused: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.card,
  },

  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  passwordToggle: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleSection: {
    marginTop: 2,
    marginBottom: 17,
  },

  roleDescription: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: -2,
    marginBottom: 12,
  },

  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },

  roleChip: {
    flex: 1,
    minWidth: 0,
    minHeight: 126,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingHorizontal: 7,
    paddingVertical: 15,
    backgroundColor: COLORS.background,
  },

  roleChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EAF8F7',
  },

  roleChipPressed: {
    opacity: 0.8,
  },

  roleIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F8F7',
    marginBottom: 8,
  },

  roleIconActive: {
    backgroundColor: COLORS.primary,
  },

  roleChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  roleChipTextActive: {
    color: COLORS.primaryDark,
  },

  roleHint: {
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 3,
  },

  roleHintActive: {
    color: COLORS.primary,
  },

  roleCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.danger,
  },

  submitButton: {
    marginTop: 3,
  },

  loadingButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },

  securityHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
  },

  securityText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },

  loginRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 22,
  },

  loginText: {
    fontSize: 13,
    color: COLORS.muted,
  },

  loginLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    paddingVertical: 4,
  },

  footer: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 23,
  },

  successCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F8F7',
    marginBottom: 18,
  },

  successTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },

  successText: {
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 12,
  },

  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: 12,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#EAF8F7',
  },

  confirmationEmail: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },

  successHint: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 23,
  },

  buttonFull: {
    width: '100%',
  },
});
