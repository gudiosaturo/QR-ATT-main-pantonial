import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import QRCode from 'react-native-qrcode-svg';

import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';
import { createEvent } from '@/lib/events';
import { buildQRPayload } from '@/lib/qr';

export default function TeacherScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [eventId, setEventId] = useState('');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 60 * 60 * 1000)
  );

  const [editTarget, setEditTarget] = useState<'start' | 'end' | null>(null);
  const [editingPart, setEditingPart] = useState<'date' | 'time'>('date');

  const [payload, setPayload] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRole() {
        if (!user) {
          setRole(null);
          setRoleLoading(false);
          return;
        }

        setRoleLoading(true);

        try {
          const profile = await getProfile(user.id);

          if (active) {
            setRole(profile?.role ?? 'student');
          }
        } catch {
          if (active) {
            setRole(null);
          }
        } finally {
          if (active) {
            setRoleLoading(false);
          }
        }
      }

      void loadRole();

      return () => {
        active = false;
      };
    }, [user])
  );

  const onPickerChange = (
    event: DateTimePickerEvent,
    selected?: Date
  ) => {
    if (event.type === 'dismissed') {
      setEditTarget(null);
      setEditingPart('date');
      return;
    }

    if (selected) {
      if (editTarget === 'start') {
        setStartDate(selected);
      } else if (editTarget === 'end') {
        setEndDate(selected);
      }
    }

    if (Platform.OS === 'android' && editingPart === 'date') {
      setEditingPart('time');
    } else {
      setEditTarget(null);
      setEditingPart('date');
    }
  };

  const applyQuickDuration = (minutes: number) => {
    setEndDate(new Date(startDate.getTime() + minutes * 60 * 1000));
    setMessage(null);
  };

  const handleCreateEvent = async () => {
    if (creating) return;

    setMessage(null);
    setPayload(null);

    if (!title.trim() || !eventId.trim()) {
      setMessageType('error');
      setMessage('Please enter both the event title and event code.');
      return;
    }

    if (startDate >= endDate) {
      setMessageType('error');
      setMessage('The end time must be later than the start time.');
      return;
    }

    const eventData = {
      eventId: eventId.trim(),
      title: title.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };

    setCreating(true);

    try {
      const result = await createEvent(eventData);

      if (result.error) {
        setMessageType('error');
        setMessage('Could not save the event. Please try again.');
        return;
      }

      setPayload(buildQRPayload(eventData));
      setMessageType('success');
      setMessage('Event created successfully! Share the QR code with students.');
    } catch {
      setMessageType('error');
      setMessage('Something went wrong while creating the event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (roleLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Checking your account...</Text>
      </View>
    );
  }

  if (role !== 'teacher') {
    return (
      <View style={styles.centered}>
        <View style={styles.permissionIcon}>
          <Ionicons
            name="lock-closed-outline"
            size={36}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.lockTitle}>Teachers Only</Text>

        <Text style={styles.muted}>
          Only teacher accounts can create attendance events.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: isSmallScreen ? 16 : 22 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.pageHeader}>
        <View style={styles.badge}>
          <Ionicons name="school-outline" size={15} color="#FFFFFF" />
          <Text style={styles.badgeText}>TEACHER DASHBOARD</Text>
        </View>

        <Text style={[styles.heading, isSmallScreen && styles.headingSmall]}>
          Create Attendance Event
        </Text>

        <Text style={styles.subtitle}>
          Set up a school event and generate a QR code for student attendance.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.cardTitleRow}>
          <View style={styles.sectionIcon}>
            <Ionicons name="calendar-outline" size={21} color={COLORS.primary} />
          </View>

          <View style={styles.cardTitleText}>
            <Text style={styles.cardTitle}>Event Details</Text>
            <Text style={styles.cardSubtitle}>
              Complete the information below.
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Event Title</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="document-text-outline"
            size={19}
            color={COLORS.muted}
          />
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Founders Day Assembly"
            placeholderTextColor={COLORS.muted}
            returnKeyType="next"
            maxLength={150}
          />
        </View>

        <Text style={styles.label}>Event Code</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="key-outline" size={19} color={COLORS.muted} />
          <TextInput
            style={styles.textInput}
            value={eventId}
            onChangeText={setEventId}
            placeholder="e.g. EVT-2026-0001"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="characters"
            maxLength={60}
          />
        </View>

        <Text style={styles.label}>Start Date & Time</Text>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.dateButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            setEditTarget('start');
            setEditingPart('date');
          }}
        >
          <View style={styles.dateIcon}>
            <Ionicons
              name="play-circle-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabel}>Event starts</Text>
            <Text style={styles.dateValue}>{startDate.toLocaleString()}</Text>
          </View>

          <Ionicons name="chevron-forward" size={19} color={COLORS.muted} />
        </Pressable>

        <Text style={styles.label}>End Date & Time</Text>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.dateButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            setEditTarget('end');
            setEditingPart('date');
          }}
        >
          <View style={styles.dateIcon}>
            <Ionicons
              name="stop-circle-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabel}>Event ends</Text>
            <Text style={styles.dateValue}>{endDate.toLocaleString()}</Text>
          </View>

          <Ionicons name="chevron-forward" size={19} color={COLORS.muted} />
        </Pressable>

        {editTarget && (
          <View style={styles.pickerContainer}>
            {Platform.OS === 'ios' && (
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Choose date and time</Text>
                <Pressable
                  onPress={() => {
                    setEditTarget(null);
                    setEditingPart('date');
                  }}
                >
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
            )}

            <DateTimePicker
              value={editTarget === 'start' ? startDate : endDate}
              mode={
                Platform.OS === 'android' ? editingPart : 'datetime'
              }
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickerChange}
              minimumDate={undefined}
            />
          </View>
        )}

        <Text style={styles.label}>Quick Duration</Text>

        <View style={styles.chipRow}>
          {[
            { label: '+30 min', minutes: 30 },
            { label: '+1 hour', minutes: 60 },
            { label: '+2 hours', minutes: 120 },
          ].map((item) => (
            <Pressable
              key={item.minutes}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.pressed,
              ]}
              onPress={() => applyQuickDuration(item.minutes)}
            >
              <Text style={styles.chipText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: creating }}
          disabled={creating}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !creating && styles.primaryButtonPressed,
            creating && styles.buttonDisabled,
          ]}
          onPress={handleCreateEvent}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                Create & Generate QR
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </Pressable>

        {message && (
          <View
            accessibilityRole="alert"
            style={[
              styles.messageBox,
              messageType === 'success'
                ? styles.successMessage
                : styles.errorMessage,
            ]}
          >
            <Ionicons
              name={
                messageType === 'success'
                  ? 'checkmark-circle-outline'
                  : 'alert-circle-outline'
              }
              size={21}
              color={messageType === 'success' ? '#008577' : COLORS.danger}
            />
            <Text
              style={[
                styles.messageText,
                messageType === 'success'
                  ? styles.successText
                  : styles.errorText,
              ]}
            >
              {message}
            </Text>
          </View>
        )}
      </View>

      {payload && (
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <View style={styles.qrHeadingIcon}>
              <Ionicons name="qr-code" size={23} color={COLORS.primary} />
            </View>

            <View style={styles.qrHeadingText}>
              <Text style={styles.qrTitle}>Event QR Code</Text>
              <Text style={styles.qrSubtitle}>
                Students can scan this code to register attendance.
              </Text>
            </View>
          </View>

          <View style={styles.qrCodeFrame}>
            <QRCode
              value={payload}
              size={Math.min(width - (isSmallScreen ? 80 : 112), 240)}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>

          <View style={styles.eventSummary}>
            <Text style={styles.summaryLabel}>EVENT</Text>
            <Text style={styles.summaryValue}>{title.trim()}</Text>

            <Text style={styles.summaryLabel}>EVENT CODE</Text>
            <Text style={styles.summaryValue}>{eventId.trim()}</Text>
          </View>

          <View style={styles.payloadContainer}>
            <Text style={styles.payloadLabel}>QR PAYLOAD</Text>
            <ScrollView
              style={styles.payloadScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              <Text selectable style={styles.payloadText}>
                {payload}
              </Text>
            </ScrollView>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons name="shield-checkmark-outline" size={15} color={COLORS.muted} />
        <Text style={styles.footerText}>
          QR Attendance · Teacher tools
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

  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },

  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    gap: 12,
  },

  permissionIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  lockTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  muted: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  pageHeader: {
    marginBottom: 22,
  },

  badge: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    marginBottom: 15,
  },

  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
    flexShrink: 1,
  },

  heading: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  headingSmall: {
    fontSize: 23,
    lineHeight: 30,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
  },

  formCard: {
    width: '100%',
    minWidth: 0,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    minWidth: 0,
  },

  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  cardTitleText: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 15,
    marginBottom: 7,
  },

  inputWrapper: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: COLORS.background,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
  },

  textInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  dateButton: {
    width: '100%',
    minWidth: 0,
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 11,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  pressed: {
    opacity: 0.75,
  },

  dateIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  dateTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  dateLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 4,
  },

  dateValue: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },

  pickerContainer: {
    marginTop: 12,
    padding: 8,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  pickerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  doneText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    flexGrow: 1,
    flexBasis: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 11,
  },

  chipText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },

  primaryButton: {
    width: '100%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 15,
  },

  primaryButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },

  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 13,
    marginTop: 15,
    borderWidth: 1,
  },

  successMessage: {
    backgroundColor: COLORS.successBackground,
    borderColor: '#BDE9D9',
  },

  errorMessage: {
    backgroundColor: COLORS.dangerBackground,
    borderColor: '#FECACA',
  },

  messageText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },

  successText: {
    color: '#00695C',
  },

  errorText: {
    color: COLORS.danger,
  },

  qrCard: {
    width: '100%',
    minWidth: 0,
    marginTop: 20,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    overflow: 'hidden',
    alignItems: 'stretch',
  },

  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    minWidth: 0,
  },

  qrHeadingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  qrHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  qrTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  qrSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    marginTop: 4,
  },

  qrCodeFrame: {
    alignSelf: 'center',
    maxWidth: '100%',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: 'hidden',
  },

  eventSummary: {
    width: '100%',
    minWidth: 0,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    gap: 5,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.muted,
    marginTop: 5,
  },

  summaryValue: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  payloadContainer: {
    width: '100%',
    minWidth: 0,
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },

  payloadLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.muted,
    marginBottom: 8,
  },

  payloadScroll: {
    maxHeight: 100,
  },

  payloadText: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
    flexWrap: 'wrap',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 22,
    paddingBottom: 4,
  },

  footerText: {
    fontSize: 11,
    color: COLORS.muted,
  },
});