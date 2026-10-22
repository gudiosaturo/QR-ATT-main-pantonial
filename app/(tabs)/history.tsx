import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';
import {
  getAttendanceHistory,
  getTeacherEventAttendance,
  type AttendanceRecord,
  type TeacherEventAttendance,
} from '@/lib/attendance';

function shortId(id: string) {
  return id ? `...${id.slice(-8)}` : 'Unknown';
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString();
}

export default function HistoryScreen() {
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentRecords, setStudentRecords] = useState<
    AttendanceRecord[]
  >([]);

  const [teacherEvents, setTeacherEvents] = useState<
    TeacherEventAttendance[]
  >([]);

  const load = useCallback(async () => {
    if (!user) {
      setRole(null);
      setStudentRecords([]);
      setTeacherEvents([]);
      setError('Please log in to view attendance records.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await getProfile(user.id);
      const currentRole = profile?.role ?? 'student';

      setRole(currentRole);

      if (currentRole === 'teacher') {
        const events = await getTeacherEventAttendance(user.id);

        setTeacherEvents(events);
        setStudentRecords([]);
      } else {
        const records = await getAttendanceHistory(user.id);

        setStudentRecords(records);
        setTeacherEvents([]);
      }
    } catch (err) {
      console.error('Failed to load attendance history:', err);
      setError(
        'Unable to load your records. Check your internet connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.stateTitle}>
          Loading your records
        </Text>

        <Text style={styles.muted}>
          Please wait while we retrieve your attendance.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.stateIcon}>
          <Ionicons
            name="cloud-offline-outline"
            size={36}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.stateTitle}>
          Unable to Load Records
        </Text>

        <Text style={styles.muted}>{error}</Text>

        <View style={styles.retryButton}>
          <AppButton
            theme="primary"
            title="Try Again"
            icon="refresh-outline"
            onPress={() => {
              void load();
            }}
          />
        </View>
      </View>
    );
  }

  if (role === 'teacher') {
    return (
      <View style={styles.screen}>
        <View style={styles.pageHeader}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="stats-chart-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>
              Attendance History
            </Text>

            <Text style={styles.pageSubtitle}>
              Review your events and student attendance.
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={COLORS.textOnPrimary}
            />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>
              TOTAL EVENTS
            </Text>

            <Text style={styles.summaryValue}>
              {teacherEvents.length}
            </Text>
          </View>
        </View>

        {teacherEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.stateIcon}>
              <Ionicons
                name="calendar-clear-outline"
                size={36}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.stateTitle}>
              No Events Yet
            </Text>

            <Text style={styles.muted}>
              Create an event in the Teacher tab to see its
              attendance records here.
            </Text>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={teacherEvents}
            keyExtractor={(item) => item.eventId}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={23}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.eventTitleContainer}>
                    <Text style={styles.cardTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.meta}>
                      Event code: {item.eventCode}
                    </Text>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {item.attendeeCount}
                    </Text>
                  </View>
                </View>

                {item.startTime ? (
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={COLORS.textSecondary}
                    />

                    <Text style={styles.dateText}>
                      {formatDate(item.startTime)}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.attendeesHeader}>
                  <Text style={styles.attendeesTitle}>
                    Registered Attendees
                  </Text>

                  <Text style={styles.attendeesCount}>
                    {item.attendees.length}
                  </Text>
                </View>

                {item.attendees.length === 0 ? (
                  <View style={styles.noAttendees}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={COLORS.muted}
                    />

                    <Text style={styles.muted}>
                      No students have scanned yet.
                    </Text>
                  </View>
                ) : (
                  item.attendees.map((attendee) => (
                    <View
                      key={attendee.studentId}
                      style={styles.attendeeRow}
                    >
                      <View style={styles.attendeeAvatar}>
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color={COLORS.primary}
                        />
                      </View>

                      <View style={styles.attendeeInfo}>
                        <Text style={styles.attendeeName}>
                          {attendee.studentName ??
                            shortId(attendee.studentId)}
                        </Text>

                        <Text style={styles.attendeeDate}>
                          {formatDate(attendee.scannedAt)}
                        </Text>
                      </View>

                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.success}
                      />
                    </View>
                  ))
                )}
              </View>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.pageHeader}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="time-outline"
            size={25}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.pageTitle}>
            Attendance History
          </Text>

          <Text style={styles.pageSubtitle}>
            Keep track of the school events you attended.
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="checkmark-done-outline"
            size={25}
            color={COLORS.textOnPrimary}
          />
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.summaryLabel}>
            TOTAL ATTENDANCE RECORDS
          </Text>

          <Text style={styles.summaryValue}>
            {studentRecords.length}
          </Text>
        </View>
      </View>

      {studentRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="document-text-outline"
              size={36}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.stateTitle}>
            No Attendance Records Yet
          </Text>

          <Text style={styles.muted}>
            Your scanned school events will appear here.
            Scan an event QR code to record your attendance.
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={studentRecords}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.eventIcon}>
                  <Ionicons
                    name="school-outline"
                    size={23}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.eventTitleContainer}>
                  <Text style={styles.cardTitle}>
                    {item.eventTitle}
                  </Text>

                  <Text style={styles.meta}>
                    Event ID: {item.eventId}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={COLORS.success}
                  />

                  <Text style={styles.statusText}>
                    Present
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.dateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={COLORS.primary}
                />

                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>
                    ATTENDANCE RECORDED
                  </Text>

                  <Text style={styles.dateText}>
                    {formatDate(item.scannedAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 18,
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 13,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },

  pageSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    marginTop: 4,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 18,
    gap: 14,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryText: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#D5F3F1',
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 3,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 28,
    gap: 14,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eventTitleContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  meta: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    marginTop: 4,
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    fontWeight: '800',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.successBackground,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
  },

  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 12,
  },

  dateInfo: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.muted,
    marginBottom: 4,
  },

  dateText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  attendeesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 5,
  },

  attendeesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  attendeesCount: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },

  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },

  attendeeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  attendeeInfo: {
    flex: 1,
  },

  attendeeName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  attendeeDate: {
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 3,
  },

  noAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  stateTitle: {
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

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },

  retryButton: {
    width: '100%',
    maxWidth: 340,
    marginTop: 24,
  },
});