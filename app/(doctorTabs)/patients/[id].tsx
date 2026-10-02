import AvatarFromString from '@/components/avatar';
import { PatientReports } from '@/components/patients/PatientReports';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/ui/AppHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import {
  apiGetAppointments,
  apiGetProfileById,
  AppointmentData,
  ProfileFields,
} from '@/services/api';
import { useTheme } from '@/theme/ThemeProvider';
import { Theme } from '@/theme/types';
import { formatDateWeekday, formatTime, getAge } from '@/utils/formatter';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'detail' | 'report';

const AVATAR_SIZE = 120;
const AVATAR_BORDER = 5;

type DetailsTabProps = {
  patient: ProfileFields;
  patientId: string;
  providerId: string;
  token: string;
  theme: Theme;
};

const DetailsTab = ({
  patient,
  patientId,
  providerId,
  token,
  theme,
}: DetailsTabProps) => {
  const [pastAppointments, setPastAppointments] = useState<AppointmentData[]>(
    []
  );

  useEffect(() => {
    if (!token || !patientId || !providerId) {
      return;
    }

    let isMounted = true;

    const loadAppointments = async () => {
      try {
        const response = await apiGetAppointments(
          {
            ids: [patientId, providerId],
          },
          token
        );

        if (isMounted) {
          setPastAppointments(response?.data ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setPastAppointments([]);
        }

        console.error('Failed to load appointments:', error);
      }
    };

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [patientId, providerId, token]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginBottom: theme.spacing.xl,
          backgroundColor: theme.colors.surfaceCard,
          borderRadius: theme.radius.xl,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.md,
          borderWidth: 0.5,
          borderColor: theme.colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 1,
        },
        sectionPlain: {
          marginBottom: theme.spacing.xl,
        },

        sectionHeader: {
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.xs,
          color: theme.colors.textSecondary,
          fontSize: theme.typography.sizes.sm,
          fontWeight: '800',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        },

        sectionRow: {
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.spacing.base,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        },

        sectionRowLast: {
          borderBottomWidth: 0,
        },

        sectionLabel: {
          color: theme.colors.textMuted,
          fontSize: theme.typography.sizes.sm,
        },

        sectionSubText: {
          color: theme.colors.text,
          fontWeight: '600',
          fontSize: theme.typography.sizes.md,
          textTransform: 'capitalize',
          flexShrink: 1,
          textAlign: 'right',
        },

        pastAppHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.xs,
        },

        viewAll: {
          marginTop: theme.spacing.md,
          color: theme.colors.primary.extraDeep,
          fontSize: theme.typography.sizes.sm,
          fontWeight: '700',
        },

        avatar: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.full,
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
        },

        avatarImg: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.full,
        },

        listCard: {
          backgroundColor: theme.colors.surfaceCard,
          padding: theme.spacing.base,
          marginTop: theme.spacing.md,
          borderRadius: theme.radius.xl,
          borderWidth: 0.5,
          borderColor: theme.colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        },

        listHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          paddingBottom: theme.spacing.md,
        },

        listHeaderInfo: {
          flex: 1,
        },

        listHeaderText: {
          color: theme.colors.text,
          fontSize: theme.typography.sizes.base,
          fontWeight: '700',
        },

        listHeaderSubText: {
          marginTop: 2,
          color: theme.colors.textMuted,
          fontSize: theme.typography.sizes.sm,
        },

        statusBox: {
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          justifyContent: 'center',
          alignItems: 'center',
        },

        statusText: {
          fontWeight: '700',
          fontFamily: theme.typography.fonts?.mono,
          fontSize: theme.typography.sizes.xs ?? theme.typography.sizes.sm,
          textTransform: 'capitalize',
        },

        listContent: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingVertical: theme.spacing.md,
        },

        listContentIcon: {
          padding: theme.spacing.sm,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          backgroundColor: theme.colors.primary.shallow,
        },

        listSubContent: {
          flexDirection: 'row',
          width: '46%',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },

        listButtons: {
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },

        listContentText: {
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        },

        listContentLabel: {
          color: theme.colors.textMuted,
          fontSize: theme.typography.sizes.xs ?? theme.typography.sizes.sm,
        },

        listContentSubText: {
          marginTop: 2,
          color: theme.colors.text,
          fontWeight: '600',
          fontSize: theme.typography.sizes.sm,
        },

        listButton: {
          width: '100%',
          height: theme.spacing.xxl,
        },

        emptyState: {
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: theme.spacing.md,
          paddingVertical: theme.spacing.xl,
          gap: theme.spacing.sm,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: theme.colors.border,
        },

        emptyStateText: {
          color: theme.colors.textMuted,
          fontSize: theme.typography.sizes.sm,
        },

        allergyList: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.md,
        },

        allergyChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs + 2,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.dangerBg,
        },

        allergyChipText: {
          color: theme.colors.danger,
          fontSize: theme.typography.sizes.sm,
          fontWeight: '600',
          textTransform: 'capitalize',
        },

        noAllergiesText: {
          paddingVertical: theme.spacing.md,
          color: theme.colors.textMuted,
          fontSize: theme.typography.sizes.sm,
        },
      }),
    [theme]
  );

  const patientName =
    [patient?.firstName, patient?.lastName].filter(Boolean).join(' ') ||
    'Unnamed Patient';

  const statusColors = useCallback(
    (status: AppointmentData['status']) => {
      switch (status) {
        case 'confirmed':
          return {
            bg: theme.colors.blue.base,
            text: theme.colors.blue.extraDeep,
          };
        case 'completed':
          return {
            bg: theme.colors.successBg,
            text: theme.colors.success,
          };
        case 'pending':
          return {
            bg: theme.colors.warningBg,
            text: theme.colors.warning,
          };
        default:
          return {
            bg: theme.colors.dangerBg,
            text: theme.colors.danger,
          };
      }
    },
    [theme]
  );

  const renderAppointment = useCallback(
    (item: AppointmentData, index: number) => {
      const appointmentType =
        item.description?.split(' – ')[0]?.trim() || 'Consultation';
      const { bg, text } = statusColors(item.status);

      return (
        <View
          key={item.id ? String(item.id) : `appointment-${index}`}
          style={styles.listCard}
        >
          <View style={styles.listHeader}>
            <View style={styles.avatar}>
              {patient.profilePicture?.url ? (
                <Image
                  source={{ uri: patient.profilePicture.url }}
                  style={styles.avatarImg}
                  contentFit="cover"
                />
              ) : (
                <AvatarFromString input={patientName} size={40} />
              )}
            </View>

            <View style={styles.listHeaderInfo}>
              <ThemedText style={styles.listHeaderText} numberOfLines={1}>
                {patientName}
              </ThemedText>

              <ThemedText style={styles.listHeaderSubText} numberOfLines={1}>
                {appointmentType}
              </ThemedText>
            </View>

            <View style={[styles.statusBox, { backgroundColor: bg }]}>
              <ThemedText style={[styles.statusText, { color: text }]}>
                {item.status}
              </ThemedText>
            </View>
          </View>
          <View style={styles.listContent}>
            <View style={styles.listSubContent}>
              <IconSymbol
                name={'calendar.badge'}
                size={22}
                style={styles.listContentIcon}
                color={theme.colors.primary.extraDeep}
              />
              <View style={styles.listContentText}>
                <ThemedText style={styles.listContentLabel}>Date</ThemedText>
                <ThemedText style={styles.listContentSubText}>
                  {formatDateWeekday(item.appointment_time, true, true)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.listSubContent}>
              <IconSymbol
                name={'clock.badge.fill'}
                size={22}
                style={styles.listContentIcon}
                color={theme.colors.primary.extraDeep}
              />
              <View style={styles.listContentText}>
                <ThemedText style={styles.listContentLabel}>Time</ThemedText>
                <ThemedText style={styles.listContentSubText}>
                  {formatTime(item.appointment_time)}
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.listButtons}>
            <Button
              label="View Details"
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: '/appointments/[id]',
                  params: { id: item.id },
                })
              }
              style={styles.listButton}
            />
          </View>
        </View>
      );
    },
    [patient, patientName, statusColors, styles, theme]
  );

  const allergies = (patient.allergies ?? [])
    .map((allergy) => allergy.trim())
    .filter(Boolean);

  const infoRows: { label: string; value?: string | null }[][] = [
    [
      { label: 'Name', value: patientName },
      {
        label: 'Age',
        value: patient.dateOfBirth ? getAge(patient.dateOfBirth, 'yrs') : '-',
      },
      { label: 'Gender', value: patient.gender },
      { label: 'Blood Group', value: patient.bloodGroup },
      { label: 'Genotype', value: patient.genotype },
    ],
    [
      { label: 'Name', value: patient.nextOfKin?.name },
      { label: 'Email', value: patient.nextOfKin?.email },
      { label: 'Phone', value: patient.nextOfKin?.phone },
      { label: 'Relationship', value: patient.nextOfKin?.relationship },
    ],
  ];

  return (
    <View>
      {/* Personal Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionHeader}>
          Personal Information
        </ThemedText>

        {infoRows[0].map((row, idx) => (
          <View
            key={row.label}
            style={[
              styles.sectionRow,
              idx === infoRows[0].length - 1 && styles.sectionRowLast,
            ]}
          >
            <ThemedText style={styles.sectionLabel}>{row.label}</ThemedText>
            <ThemedText
              style={[
                styles.sectionSubText,
                row.label === 'Email' && { textTransform: 'none' },
              ]}
            >
              {row.value || '-'}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionHeader}>Allergies</ThemedText>

        {allergies.length > 0 ? (
          <View style={styles.allergyList}>
            {allergies.map((allergy, idx) => (
              <View key={`${allergy}-${idx}`} style={styles.allergyChip}>
                <IconSymbol
                  name="exclamationmark.triangle.fill"
                  size={14}
                  color={theme.colors.danger}
                />
                <ThemedText style={styles.allergyChipText}>
                  {allergy}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <ThemedText style={styles.noAllergiesText}>
            No known allergies
          </ThemedText>
        )}
      </View>

      {/* Emergency Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionHeader}>Emergency Details</ThemedText>

        {infoRows[1].map((row, idx) => (
          <View
            key={row.label}
            style={[
              styles.sectionRow,
              idx === infoRows[1].length - 1 && styles.sectionRowLast,
            ]}
          >
            <ThemedText style={styles.sectionLabel}>{row.label}</ThemedText>
            <ThemedText
              style={[
                styles.sectionSubText,
                row.label === 'Email' && { textTransform: 'none' },
              ]}
            >
              {row.value || '-'}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Past Appointments */}
      <View style={styles.sectionPlain}>
        <View style={styles.pastAppHeader}>
          <ThemedText style={styles.sectionHeader}>
            Past Appointments
          </ThemedText>

          <TouchableOpacity activeOpacity={0.7}>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {pastAppointments.length > 0 ? (
          pastAppointments.map(renderAppointment)
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol
              name="calendar.badge"
              size={28}
              color={theme.colors.textMuted}
            />
            <ThemedText style={styles.emptyStateText}>
              No past appointments
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

const PatientDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const { theme: appTheme } = useTheme();

  const [patient, setPatient] = useState<ProfileFields | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>('detail');
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0);

  const [tabAnimation] = useState(() => new Animated.Value(0));

  const [tabWidth, setTabWidth] = useState(0);

  const tabIndex = currentTab === 'detail' ? 0 : 1;

  useEffect(() => {
    if (!token || !id) {
      return;
    }

    let isMounted = true;

    const loadPatient = async () => {
      try {
        const response = await apiGetProfileById(id, 'patient', token);

        if (isMounted && response?.profile) {
          setPatient(response.profile);
        }
      } catch (error) {
        console.error('Failed to load patient:', error);
      }
    };

    loadPatient();

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  useEffect(() => {
    Animated.spring(tabAnimation, {
      toValue: tabIndex,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    }).start();
  }, [tabAnimation, tabIndex]);

  const handleTabPress = useCallback(
    (tab: Tab) => {
      if (tab === currentTab) {
        return;
      }

      setCurrentTab(tab);
    },
    [currentTab]
  );

  const handleTabLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;

      if (width !== tabWidth) {
        setTabWidth(width);
      }
    },
    [tabWidth]
  );

  const handleRefresh = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    setRefreshing(true);
    setReportsRefreshKey((key) => key + 1);

    try {
      const response = await apiGetProfileById(id, 'patient', token);

      if (response?.profile) {
        setPatient(response.profile);
      }
    } catch (error) {
      console.error('Failed to refresh patient:', error);
    } finally {
      setRefreshing(false);
    }
  }, [id, token]);

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: theme.spacing.xxl,
      },

      scroll: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: theme.spacing.base,
        paddingBottom: theme.spacing.xxl + 60,
      },

      avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: theme.radius.full,
        borderWidth: AVATAR_BORDER,
        borderColor: theme.colors.background,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        position: 'absolute',
        top: -AVATAR_SIZE / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
      },

      appHeader: {
        paddingHorizontal: theme.spacing.base,
      },

      header: {
        borderRadius: theme.radius.xl,
        width: '100%',
        backgroundColor: theme.colors.surfaceCardLight,
        marginTop: AVATAR_SIZE / 2 + theme.spacing.base,
        paddingTop: AVATAR_SIZE / 2 + theme.spacing.md,
        paddingBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 4,
      },

      details: {
        alignItems: 'center',
        justifyContent: 'center',
      },

      headerText: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: '700',
        color: theme.colors.text,
      },

      vitals: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
      },

      vitalChip: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.background,
      },

      vitalChipText: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: '600',
        color: theme.colors.textSecondary,
      },

      tabGroup: {
        width: '100%',
        marginTop: theme.spacing.xl,
      },

      tabHeaders: {
        width: '100%',
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },

      tab: {
        width: '50%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      },

      tabText: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sizes.base,
        fontWeight: '500',
      },

      tabTextActive: {
        color: theme.colors.primary.extraDeep,
        fontWeight: '700',
      },

      tabIndicator: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        width: '50%',
        height: 3,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primary.extraDeep,
      },

      tabBody: {
        width: '100%',
        overflow: 'hidden',
        marginTop: theme.spacing.lg,
      },

      tabContent: {
        width: '100%',
      },
    })
  );

  const patientUrl = patient?.profilePicture?.url;

  const patientName =
    [patient?.firstName, patient?.lastName].filter(Boolean).join(' ') ||
    'Patient';

  const indicatorTranslateX = tabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth / 2],
  });

  const bodyOpacity = tabAnimation.interpolate({
    inputRange: [0, 0.35, 0.65, 1],
    outputRange: [1, 0.7, 0.7, 1],
  });

  const handleGoBack = () => {
    router.replace('/patients');
  };

  if (!patient) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator color={appTheme.colors.primary.extraDeep} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <AppHeader
        title="Patient"
        onBack={handleGoBack}
        style={styles.appHeader}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={appTheme.colors.textSecondary}
            colors={[appTheme.colors.textSecondary]}
          />
        }
      >
        {/* Patient Header */}
        <View style={styles.header}>
          {patientUrl ? (
            <Image
              source={{ uri: patientUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <AvatarFromString
                input={patientName}
                size={AVATAR_SIZE - AVATAR_BORDER * 2}
              />
            </View>
          )}

          <View style={styles.details}>
            <ThemedText type="title" style={styles.headerText}>
              {patientName}
            </ThemedText>

            <View style={styles.vitals}>
              {[
                patient.dateOfBirth
                  ? getAge(patient.dateOfBirth, ' yrs')
                  : 'Age –',
                patient.weight ? `${patient.weight} kg` : 'Weight –',
                patient.height ? `${patient.height} cm` : 'Height –',
              ].map((vital) => (
                <View key={vital} style={styles.vitalChip}>
                  <ThemedText style={styles.vitalChipText}>{vital}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabGroup}>
          <View style={styles.tabHeaders} onLayout={handleTabLayout}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleTabPress('detail')}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{
                selected: currentTab === 'detail',
              }}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  currentTab === 'detail' && styles.tabTextActive,
                ]}
              >
                Patient Details
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleTabPress('report')}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{
                selected: currentTab === 'report',
              }}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  currentTab === 'report' && styles.tabTextActive,
                ]}
              >
                Reports
              </ThemedText>
            </TouchableOpacity>

            {/* Sliding underline */}
            {tabWidth > 0 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tabIndicator,
                  {
                    transform: [
                      {
                        translateX: indicatorTranslateX,
                      },
                    ],
                  },
                ]}
              />
            )}
          </View>

          {/* Sliding tab body */}
          <View style={styles.tabBody}>
            <Animated.View
              style={[
                styles.tabContent,
                {
                  opacity: bodyOpacity,
                },
              ]}
            >
              {currentTab === 'detail' ? (
                <DetailsTab
                  patient={patient}
                  patientId={id}
                  providerId={user?.id ?? ''}
                  token={token ?? ''}
                  theme={appTheme}
                />
              ) : (
                <View style={{ paddingVertical: 20 }}>
                  <PatientReports
                    patientId={id}
                    patient={patient}
                    refreshKey={reportsRefreshKey}
                  />
                </View>
              )}
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientDetails;
