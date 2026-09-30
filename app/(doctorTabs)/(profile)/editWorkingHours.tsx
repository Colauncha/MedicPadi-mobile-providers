import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import { apiUpdateProfile, BusinessHours } from '@/services/api';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTimeAdv } from '@/utils/formatter';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type Day = (typeof DAYS)[number];

const DAY_LABELS: Record<Day, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const TAB_BAR_HEIGHT = 80;

type DayRange = { start: number; end: number | null };

type DayHours = Partial<Record<Day, DayRange>>;

const DEFAULT_RANGE: DayRange = { start: 9, end: 17 };

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const formatHour = (hour: number) => formatTimeAdv(hour, '24h');

const formatRange = ({ start, end }: DayRange) =>
  end === null
    ? `${formatHour(start)} – Select end time`
    : `${formatHour(start)} – ${formatHour(end)}`;

/*
 * Derive the initial per-day ranges from the saved business hours.
 */
function getInitialHours(businessHours?: BusinessHours): DayHours {
  const hours: DayHours = {};

  DAYS.forEach((day) => {
    const saved = businessHours?.[day];

    if (
      saved &&
      typeof saved.start === 'number' &&
      typeof saved.end === 'number'
    ) {
      hours[day] = { start: saved.start, end: saved.end };
    }
  });

  return hours;
}

const EditWorkingHours = () => {
  const { profile, token, refreshProfile } = useAuth();
  const { theme: appTheme } = useTheme();

  const businessHours = profile?.profile?.businessHours;

  const [hours, setHours] = useState<DayHours>(() =>
    getInitialHours(businessHours)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDays = DAYS.filter((day) => hours[day]);

  const toggleDay = (day: Day) => {
    setHours((previous) => {
      const next = { ...previous };

      if (next[day]) {
        delete next[day];
      } else {
        next[day] = { ...DEFAULT_RANGE };
      }

      return next;
    });
  };

  /*
   * First tap sets the start hour, second tap sets the end hour.
   * Tapping at or before a pending start restarts the range there.
   */
  const selectHour = (day: Day, hour: number) => {
    setHours((previous) => {
      const range = previous[day];

      if (!range) {
        return previous;
      }

      const next =
        range.end === null && hour > range.start
          ? { start: range.start, end: hour }
          : { start: hour, end: null };

      return { ...previous, [day]: next };
    });
  };

  const handleGoBack = () => {
    if (isSubmitting) {
      return;
    }
    router.replace('/profile');
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!token) {
      Alert.alert(
        'Authentication error',
        'Your session has expired. Please log in again.'
      );
      return;
    }

    const incompleteDay = selectedDays.find((day) => hours[day]?.end === null);

    if (incompleteDay) {
      Alert.alert(
        'Select an end time',
        `Select an end time for ${DAY_LABELS[incompleteDay]}.`
      );
      return;
    }

    const payload: BusinessHours = { ...businessHours };

    DAYS.forEach((day) => {
      const range = hours[day];

      payload[day] =
        range && range.end !== null
          ? { start: range.start, end: range.end }
          : { start: 'closed', end: 'closed' };
    });

    try {
      setIsSubmitting(true);

      await apiUpdateProfile({ businessHours: payload }, token);
      await refreshProfile();

      Alert.alert(
        'Working hours updated',
        'Your availability has been saved.',
        [{ text: 'OK', onPress: () => router.replace('/profile') }]
      );
    } catch (error) {
      console.error('Failed to update working hours:', error);

      Alert.alert(
        'Unable to update working hours',
        'Something went wrong while saving your availability. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },

      scroll: {
        flexGrow: 1,
        alignItems: 'center',
        padding: theme.spacing.base,
        paddingBottom: TAB_BAR_HEIGHT + theme.spacing.xxl,
      },

      content: {
        width: '100%',
        maxWidth: 500,
      },

      section: {
        marginBottom: theme.spacing.xl,
      },

      sectionTitle: {
        fontFamily: theme.typography.fonts?.rounded,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
      },

      sectionSubtitle: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.base,
      },

      dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
      },

      dayLabel: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
      },

      dayHours: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
      },

      rangeText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
      },

      timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
      },

      timeSlot: {
        width: '14.5%',
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceCardLight,
        alignItems: 'center',
      },

      timeSlotSelected: {
        backgroundColor: theme.colors.primary.extraDeep,
      },

      timeSlotInRange: {
        backgroundColor: theme.colors.primary.shallow,
      },

      timeSlotText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
      },

      timeSlotTextSelected: {
        color: theme.colors.mono.light,
      },

      chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.base,
        padding: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
      },

      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.full,
      },

      chipText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
      },

      btn: {
        width: '100%',
        marginTop: theme.spacing.base,
      },
    })
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <AppHeader
            title="Working Hours"
            onBack={handleGoBack}
            disabled={isSubmitting}
          />

          {/* Select days */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Select Days</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Select your available days to see your patient
            </ThemedText>

            {DAYS.map((day) => {
              const range = hours[day];
              const selected = !!range;

              return (
                <View key={day}>
                  <Pressable
                    style={styles.dayRow}
                    onPress={() => toggleDay(day)}
                    disabled={isSubmitting}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                  >
                    <ThemedText style={styles.dayLabel}>
                      {DAY_LABELS[day]}
                    </ThemedText>
                    <IconSymbol
                      name={selected ? 'checkmark.square.fill' : 'square'}
                      size={22}
                      color={
                        selected
                          ? appTheme.colors.primary.extraDeep
                          : appTheme.colors.textMuted
                      }
                    />
                  </Pressable>

                  {range && (
                    <View style={styles.dayHours}>
                      <ThemedText style={styles.rangeText}>
                        {formatRange(range)}
                      </ThemedText>

                      <View style={styles.timeGrid}>
                        {HOURS.map((hour) => {
                          const isEdge =
                            hour === range.start || hour === range.end;
                          const inRange =
                            range.end !== null &&
                            hour > range.start &&
                            hour < range.end;

                          return (
                            <Pressable
                              key={hour}
                              style={[
                                styles.timeSlot,
                                inRange && styles.timeSlotInRange,
                                isEdge && styles.timeSlotSelected,
                              ]}
                              onPress={() => selectHour(day, hour)}
                              disabled={isSubmitting}
                              accessibilityLabel={`${DAY_LABELS[day]} ${formatHour(hour)}`}
                            >
                              <ThemedText
                                style={[
                                  styles.timeSlotText,
                                  isEdge && styles.timeSlotTextSelected,
                                ]}
                              >
                                {String(hour).padStart(2, '0')}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {selectedDays.length > 0 && (
              <View style={styles.chipsContainer}>
                {selectedDays.map((day) => (
                  <Pressable
                    key={day}
                    style={styles.chip}
                    onPress={() => toggleDay(day)}
                    disabled={isSubmitting}
                    accessibilityLabel={`Remove ${DAY_LABELS[day]}`}
                  >
                    <ThemedText style={styles.chipText}>
                      {DAY_LABELS[day]} {formatRange(hours[day]!)}
                    </ThemedText>
                    <IconSymbol
                      name="xmark.circle"
                      size={14}
                      color={appTheme.colors.textMuted}
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Button
            label="Save"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.btn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditWorkingHours;
