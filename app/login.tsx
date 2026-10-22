
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
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import { signIn } from '@/lib/auth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<
    'email' | 'password' | null
  >(null);

  const handleLogin = async () => {
    if (loading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setLoading(true);
    Keyboard.dismiss();

    try {
      const { error: authError } = await signIn(
        trimmedEmail,
        password
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      router.replace('/(tabs)');
    } catch (err: unknown) {
      console.error('Login failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          >
            <View style={styles.content}>
              <View style={styles.headerContainer}>
                <Header title="QR Attendance" />
              </View>

              <View style={styles.intro}>
                <View style={styles.welcomeIcon}>
                  <Ionicons
                    name="person-circle-outline"
                    size={35}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.title}>Welcome Back!</Text>

                <Text style={styles.subtitle}>
                  Sign in to record and manage your attendance.
                </Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.formTitle}>Sign In</Text>

                <Text style={styles.formDescription}>
                  Enter your account details to continue.
                </Text>

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
                      size={20}
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
                        if (error) setError(null);
                      }}
                      placeholder="your.email@school.edu"
                      placeholderTextColor={COLORS.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
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
                      size={20}
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
                        if (error) setError(null);
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor={COLORS.muted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="current-password"
                      textContentType="password"
                      returnKeyType="done"
                      editable={!loading}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      onSubmitEditing={handleLogin}
                      accessibilityLabel="Password"
                    />

                    <Pressable
                      onPress={() => setShowPassword((value) => !value)}
                      disabled={loading}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      style={styles.passwordToggle}
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        size={20}
                        color={COLORS.muted}
                      />
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
                      <ActivityIndicator
                        size="small"
                        color={COLORS.textOnPrimary}
                      />
                      <Text style={styles.loadingText}>
                        Signing in...
                      </Text>
                    </View>
                  ) : (
                    <AppButton
                      theme="primary"
                      title="Sign In"
                      icon="log-in-outline"
                      onPress={handleLogin}
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
                    Your account is protected by secure authentication.
                  </Text>
                </View>
              </View>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>
                  Don&apos;t have an account?
                </Text>
                <Link href="/register" asChild>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </Link>
              </View>

              <Text style={styles.footer}>
                QR ATTENDANCE SYSTEM
              </Text>
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
    marginBottom: 25,
  },

  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#E0F8F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
    letterSpacing: -0.6,
  },

  subtitle: {
    maxWidth: 300,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
  },

  form: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  formDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 20,
  },

  fieldContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  inputWrapper: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    borderRadius: 13,
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
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  passwordToggle: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.danger,
  },

  submitButton: {
    marginTop: 4,
  },

  loadingButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  loadingText: {
    color: COLORS.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  securityHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
    marginTop: 17,
  },

  securityText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },

  registerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 23,
  },

  registerText: {
    fontSize: 13,
    color: COLORS.muted,
  },

  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    paddingVertical: 4,
  },

  footer: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 25,
  },
});
