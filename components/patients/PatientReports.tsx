import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AvatarFromString from '@/components/avatar';
import { Button } from '@/components/ui/Button';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import {
  apiCreateEHRRecord,
  apiGetAppointments,
  apiGetConsentList,
  apiGetEHRRecords,
  apiGetProfileById,
  apiRequestConsent,
  ConsentAccessLevel,
  EHRRecord,
  EHRSourceType,
  ProfileFields,
} from '@/services/api';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTime } from '@/utils/formatter';
import { truncate } from '@/utils/truncate';
// import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { openBrowserAsync } from 'expo-web-browser';

type ConsentStatus = 'none' | 'pending' | 'granted';

// interface PickedDocument {
//   uri: string;
//   name: string;
//   mimeType: string;
// }

// const MAX_DOCUMENT_SIZE = 2 * 1024 * 1024; // 2MB
// const DOCUMENT_TYPES = [
//   'application/pdf',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// ];

const URL_PATTERN = /^https?:\/\/\S+$/i;

const SOURCE_TYPES: { value: EHRSourceType; label: string }[] = [
  { value: 'appointment', label: 'Appointment' },
  { value: 'prescription', label: 'Prescription' },
];

// History sections, in display order. Records without a source_type fall under 'other'.
const RECORD_SECTIONS: { type: EHRSourceType; title: string }[] = [
  { type: 'appointment', title: 'Consultations' },
  { type: 'prescription', title: 'Prescriptions' },
  { type: 'lab_test', title: 'Lab Tests' },
  { type: 'other', title: 'Other Records' },
];

const ACCESS_LEVELS: {
  value: ConsentAccessLevel;
  label: string;
  description: string;
}[] = [
  {
    value: 'view_only',
    label: 'View only',
    description: "Read the patient's medical records.",
  },
  {
    value: 'full_access',
    label: 'Full access',
    description: "Read and add to the patient's medical records.",
  },
];

const INACTIVE_CONSENT = ['rejected', 'denied', 'revoked', 'expired'];

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const DESCRIPTION_LENGTH = 80;

const fullName = (profile?: ProfileFields | null): string =>
  [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
  'Patient';

interface RecordAction {
  key: string;
  label: string;
  icon: IconSymbolName;
  destructive?: boolean;
}

const toConsentStatus = (status?: string): ConsentStatus => {
  if (!status || INACTIVE_CONSENT.includes(status)) return 'none';
  if (status === 'pending') return 'pending';
  return 'granted';
};

interface PatientReportsProps {
  patientId: string;
  // Required to add a record (used as source_id); the form is hidden without it
  appointmentId?: string;
  // Wrap content in its own ScrollView with pull-to-refresh (standalone screen)
  scrollable?: boolean;
  // Change to trigger a reload from the parent (embedded usage)
  refreshKey?: number;
  // Already-loaded patient profile; fetched here when omitted
  patient?: ProfileFields | null;
}

export function PatientReports({
  patientId,
  appointmentId,
  scrollable = false,
  refreshKey,
  patient: patientProp,
}: PatientReportsProps) {
  const { token, user } = useAuth();
  const { theme: appTheme } = useTheme();
  const [records, setRecords] = useState<EHRRecord[]>([]);
  const [fetchedPatient, setFetchedPatient] = useState<ProfileFields | null>(
    null
  );
  // appointment id -> description, for records sourced from appointments
  const [appointmentDescriptions, setAppointmentDescriptions] = useState<
    Record<string, string>
  >({});
  const [selectedRecord, setSelectedRecord] = useState<EHRRecord | null>(null);
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('none');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestingConsent, setRequestingConsent] = useState(false);

  // Consent request form
  const [consentModalVisible, setConsentModalVisible] = useState(false);
  const [accessLevel, setAccessLevel] =
    useState<ConsentAccessLevel>('view_only');
  const [consentMessage, setConsentMessage] = useState('');

  // Add record form
  const [sourceType, setSourceType] = useState<EHRSourceType>('appointment');
  const [documentUrl, setDocumentUrl] = useState('');
  // const [document, setDocument] = useState<PickedDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const consentAlertShown = useRef(false);

  const trimmedUrl = documentUrl.trim();
  const urlError =
    trimmedUrl && !URL_PATTERN.test(trimmedUrl)
      ? 'Enter a valid URL starting with http:// or https://'
      : undefined;
  const recordSections = useMemo(() => {
    const grouped = new Map<EHRSourceType, EHRRecord[]>();
    for (const record of records) {
      const type =
        record.source_type &&
        RECORD_SECTIONS.some((s) => s.type === record.source_type)
          ? record.source_type
          : 'other';
      grouped.set(type, [...(grouped.get(type) ?? []), record]);
    }
    return RECORD_SECTIONS.map((section) => ({
      ...section,
      records: grouped.get(section.type) ?? [],
    })).filter((section) => section.records.length > 0);
  }, [records]);

  const canSubmit = !!trimmedUrl && !urlError && !submitting;

  const openConsentModal = useCallback(() => {
    setConsentModalVisible(true);
  }, []);

  const closeConsentModal = () => {
    if (requestingConsent) return;
    setConsentModalVisible(false);
  };

  const requestConsent = async () => {
    if (!token || requestingConsent) return;
    setRequestingConsent(true);
    try {
      const message = consentMessage.trim();
      await apiRequestConsent(
        {
          patient_id: patientId,
          access_level: accessLevel,
          ...(message ? { message } : {}),
        },
        token
      );
      setConsentStatus('pending');
      setConsentModalVisible(false);
      setConsentMessage('');
      setAccessLevel('view_only');
      Alert.alert(
        'Consent Requested',
        'A consent request has been sent to the patient.'
      );
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error
          ? err.message
          : 'Failed to request consent. Please try again later.'
      );
    } finally {
      setRequestingConsent(false);
    }
  };

  const userId = user?.id;
  const hasPatientProp = !!patientProp;

  const loadData = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const consentRes = await apiGetConsentList({ patientId }, token);
      const status = toConsentStatus(consentRes.data?.[0]?.status);
      setConsentStatus(status);

      if (status !== 'granted') {
        setRecords([]);
        if (status === 'none' && !consentAlertShown.current) {
          consentAlertShown.current = true;
          Alert.alert(
            'Consent Required',
            "You do not have consent to access this patient's records. Please request consent from the patient.",
            [
              { text: 'Later' },
              { text: 'Request Consent', onPress: openConsentModal },
            ]
          );
        }
        return;
      }

      // Patient profile and appointment descriptions are supplementary;
      // a failure there shouldn't hide the records.
      const [ehrRes, patientRes, appointmentsRes] = await Promise.all([
        apiGetEHRRecords({ id: patientId, limit: 20 }, token),
        hasPatientProp
          ? Promise.resolve(null)
          : apiGetProfileById(patientId, 'patient', token).catch(() => null),
        userId
          ? apiGetAppointments({ ids: [patientId, userId] }, token).catch(
              () => null
            )
          : Promise.resolve(null),
      ]);

      setRecords(Array.isArray(ehrRes.data) ? ehrRes.data : []);
      if (patientRes?.profile) setFetchedPatient(patientRes.profile);
      if (appointmentsRes?.data) {
        setAppointmentDescriptions(
          Object.fromEntries(
            appointmentsRes.data
              .filter((appt) => !!appt.description)
              .map((appt) => [appt.id, appt.description as string])
          )
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load patient records.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, patientId, hasPatientProp, userId, openConsentModal]);

  useEffect(() => {
    if (!token) return;

    const timeoutId = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [token, loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // const pickDocument = async () => {
  //   const result = await DocumentPicker.getDocumentAsync({
  //     type: DOCUMENT_TYPES,
  //     copyToCacheDirectory: true,
  //   });
  //   if (result.canceled) return;
  //
  //   const asset = result.assets[0];
  //   if (asset.size && asset.size > MAX_DOCUMENT_SIZE) {
  //     Alert.alert('File too large', 'Document must be 2MB or smaller.');
  //     return;
  //   }
  //   setDocumentUrl('');
  //   setDocument({
  //     uri: asset.uri,
  //     name: asset.name,
  //     mimeType: asset.mimeType ?? 'application/octet-stream',
  //   });
  // };

  const handleCreateRecord = async () => {
    if (!token || !appointmentId || !canSubmit) return;
    setSubmitting(true);
    try {
      await apiCreateEHRRecord(
        {
          patient_id: patientId,
          source_type: sourceType,
          source_id: appointmentId,
          document_url: trimmedUrl,
          // document: document ?? undefined,
        },
        token
      );
      setDocumentUrl('');
      // setDocument(null);
      Alert.alert(
        'Record Added',
        "The record has been added to the patient's history."
      );
      await loadData();
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to add record.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDocument = (url: string) => {
    openBrowserAsync(url).catch(() =>
      Alert.alert('Error', 'Unable to open this document.')
    );
  };

  const patient = patientProp ?? fetchedPatient;
  const patientName = fullName(patient);

  const openRecordActions = (record: EHRRecord) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedRecord(record);
  };

  const recordActions = (record: EHRRecord): RecordAction[] => [
    { key: 'edit', label: 'Edit report', icon: 'pencil.line' },
    { key: 'share', label: 'Share report', icon: 'square.and.arrow.up' },
    ...(record.document_url
      ? [
          {
            key: 'document',
            label: 'Open document',
            icon: 'folder.circle.fill' as IconSymbolName,
          },
        ]
      : []),
    {
      key: 'delete',
      label: 'Delete report',
      icon: 'trash.fill',
      destructive: true,
    },
  ];

  const handleRecordAction = (action: RecordAction) => {
    const record = selectedRecord;
    setSelectedRecord(null);
    if (!record) return;

    if (action.key === 'document' && record.document_url) {
      openDocument(record.document_url);
      return;
    }
    // TODO: wire up edit / share / delete once the endpoints are available
    Alert.alert(action.label, 'This feature is coming soon.');
  };

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      scroll: { padding: theme.spacing.base, paddingBottom: 100 },
      loader: { flex: 1 },
      embeddedLoader: { paddingVertical: theme.spacing.xl },
      section: { marginBottom: theme.spacing.xl },
      sectionTitle: {
        fontSize: theme.typography.sizes.base,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
      },
      historySection: { marginBottom: theme.spacing.base },
      historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
      },
      historyTitle: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '500',
        color: theme.colors.textSecondary,
      },
      countBadge: {
        minWidth: 24,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceCard,
        alignItems: 'center',
      },
      countText: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
      },
      emptyText: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginVertical: theme.spacing.xl,
      },
      card: {
        backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.base,
        marginBottom: theme.spacing.md,
      },
      infoCard: {
        backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.base,
        alignItems: 'center',
        gap: theme.spacing.md,
      },
      infoText: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
      },
      errorText: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.danger,
        textAlign: 'center',
      },
      fieldLabel: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
      },
      chipRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.base,
      },
      chip: {
        paddingHorizontal: theme.spacing.base,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      chipActive: {
        backgroundColor: theme.colors.primary.extraDeep,
        borderColor: theme.colors.primary.extraDeep,
      },
      chipText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
      },
      chipTextActive: { color: '#fff' },
      cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
      },
      docInfo: { flex: 1 },
      docName: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '500',
        color: theme.colors.text,
      },
      docDate: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
      },
      patientAvatar: { width: 48, height: 48, borderRadius: 24 },
      cardPressed: { opacity: 0.85 },
      description: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
      },
      hint: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
        marginTop: -theme.spacing.sm,
        marginBottom: theme.spacing.md,
      },
      actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
      },
      actionLabel: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
      },
      actionDestructive: { color: theme.colors.danger },
      divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.md,
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
        gap: theme.spacing.md,
      },
      label: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
        flex: 1,
      },
      value: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '500',
        color: theme.colors.text,
        flex: 2,
        textAlign: 'right',
      },
      link: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '500',
        color: theme.colors.primary.deep,
        flex: 2,
        textAlign: 'right',
        textDecorationLine: 'underline',
      },
      modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      },
      modalSheet: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        padding: theme.spacing.base,
        paddingBottom: theme.spacing.xl,
      },
      modalTitle: {
        fontSize: theme.typography.sizes.base,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
      },
      modalSubtitle: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.base,
      },
      option: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
      },
      optionActive: {
        borderColor: theme.colors.primary.extraDeep,
        backgroundColor: theme.colors.surfaceCard,
      },
      optionLabel: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '500',
        color: theme.colors.text,
      },
      optionDescription: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
      },
      messageContainer: { height: 96, alignItems: 'flex-start' },
      messageInput: {
        height: '100%',
        textAlignVertical: 'top',
        paddingVertical: theme.spacing.sm,
      },
      modalActions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
      },
      modalAction: { flex: 1 },
      cancelAction: { marginTop: theme.spacing.sm },
      mutedNote: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
      },
    })
  );

  const renderAddRecord = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Add Record</Text>
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Source</Text>
        <View style={styles.chipRow}>
          {SOURCE_TYPES.map(({ value, label }) => {
            const active = sourceType === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSourceType(value)}
                disabled={submitting}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Document URL"
          placeholder="https://example.com/report.pdf"
          value={documentUrl}
          onChangeText={setDocumentUrl}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          error={urlError}
          disabled={submitting /* || !!document */}
        />

        {/* Document upload — enable once expo-document-picker is installed.
            Only one of document_url or document may be sent.
        {document ? (
          <View style={styles.row}>
            <Text style={styles.value} numberOfLines={1}>{document.name}</Text>
            <TouchableOpacity onPress={() => setDocument(null)}>
              <Text style={styles.link}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            label="Upload document (PDF, DOC, DOCX · max 2MB)"
            variant="outline"
            onPress={pickDocument}
            disabled={submitting || !!trimmedUrl}
            style={{ marginBottom: 16 }}
          />
        )}
        */}

        <Button
          label="Save Record"
          onPress={handleCreateRecord}
          loading={submitting}
          disabled={!canSubmit}
        />
      </View>
    </View>
  );

  const renderConsentModal = () => (
    <Modal
      visible={consentModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeConsentModal}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeConsentModal}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Request Consent</Text>
          <Text style={styles.modalSubtitle}>
            Choose the level of access you need. The patient will be asked to
            approve it.
          </Text>

          <Text style={styles.fieldLabel}>Access level</Text>
          {ACCESS_LEVELS.map(({ value, label, description }) => {
            const active = accessLevel === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setAccessLevel(value)}
                disabled={requestingConsent}
              >
                <Text style={styles.optionLabel}>{label}</Text>
                <Text style={styles.optionDescription}>{description}</Text>
              </TouchableOpacity>
            );
          })}

          <Input
            label="Message (optional)"
            placeholder="Tell the patient why you need access"
            value={consentMessage}
            onChangeText={setConsentMessage}
            multiline
            maxLength={500}
            containerStyle={styles.messageContainer}
            style={styles.messageInput}
            disabled={requestingConsent}
          />

          <View style={styles.modalActions}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={closeConsentModal}
              disabled={requestingConsent}
              style={styles.modalAction}
            />
            <Button
              label="Send Request"
              onPress={requestConsent}
              loading={requestingConsent}
              style={styles.modalAction}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderHistory = () => {
    if (error) {
      return (
        <View style={styles.infoCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            label="Retry"
            variant="outline"
            size="sm"
            onPress={loadData}
          />
        </View>
      );
    }

    if (consentStatus === 'none') {
      return (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Patient has not granted you access to their records.
          </Text>
          <Button
            label="Request Consent"
            variant="outline"
            size="sm"
            onPress={openConsentModal}
          />
        </View>
      );
    }

    if (consentStatus === 'pending') {
      return (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Consent request pending. You will be notified once the patient
            responds.
          </Text>
        </View>
      );
    }

    if (recordSections.length === 0) {
      return <Text style={styles.emptyText}>No medical records found</Text>;
    }

    return recordSections.map((section) => (
      <View key={section.type} style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>{section.title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{section.records.length}</Text>
          </View>
        </View>
        {section.records.map(renderRecordCard)}
      </View>
    ));
  };

  const renderRecordCard = (record: EHRRecord) => {
    const hasDetails =
      !!record.diagnosis ||
      !!record.prescription ||
      !!record.notes ||
      !!record.document_url;

    const description =
      record.source_type === 'appointment' && record.source_id
        ? appointmentDescriptions[record.source_id]
        : undefined;

    return (
      <Pressable
        key={record.id}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onLongPress={() => openRecordActions(record)}
        delayLongPress={350}
        accessibilityHint="Long press for more options"
      >
        <View style={styles.cardHeader}>
          {patient?.profilePicture?.url ? (
            <Image
              source={{ uri: patient.profilePicture.url }}
              style={styles.patientAvatar}
              contentFit="cover"
            />
          ) : (
            <AvatarFromString input={patientName} size={48} />
          )}
          <View style={styles.docInfo}>
            <Text style={styles.docName}>{patientName}</Text>
            <Text style={styles.docDate}>
              {formatDate(record.createdAt)} · {formatTime(record.createdAt)}
            </Text>
          </View>
        </View>
        {description ? (
          <Text style={styles.description}>
            {truncate(description, DESCRIPTION_LENGTH)}
          </Text>
        ) : null}
        <View style={styles.divider} />
        {record.diagnosis ? (
          <View style={styles.row}>
            <Text style={styles.label}>Diagnosis</Text>
            <Text style={styles.value}>{record.diagnosis}</Text>
          </View>
        ) : null}
        {record.prescription ? (
          <View style={styles.row}>
            <Text style={styles.label}>Prescription</Text>
            <Text style={styles.value}>{record.prescription}</Text>
          </View>
        ) : null}
        {record.notes ? (
          <View style={styles.row}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{record.notes}</Text>
          </View>
        ) : null}
        {record.document_url ? (
          <View style={styles.row}>
            <Text style={styles.label}>Document</Text>
            <Text
              style={styles.link}
              onPress={() => openDocument(record.document_url!)}
            >
              View document
            </Text>
          </View>
        ) : null}
        {!hasDetails ? (
          <Text style={styles.mutedNote}>No details recorded.</Text>
        ) : null}
      </Pressable>
    );
  };

  const renderRecordActions = () => (
    <Modal
      visible={!!selectedRecord}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedRecord(null)}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setSelectedRecord(null)}
        />
        {selectedRecord ? (
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Report options</Text>
            <Text style={styles.modalSubtitle}>
              {patientName} · {formatDate(selectedRecord.createdAt)}{' '}
              {formatTime(selectedRecord.createdAt)}
            </Text>
            {recordActions(selectedRecord).map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.actionRow}
                onPress={() => handleRecordAction(action)}
              >
                <IconSymbol
                  name={action.icon}
                  size={22}
                  color={
                    action.destructive
                      ? appTheme.colors.danger
                      : appTheme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.actionLabel,
                    action.destructive && styles.actionDestructive,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
            <Button
              label="Cancel"
              variant="outline"
              onPress={() => setSelectedRecord(null)}
              style={styles.cancelAction}
            />
          </View>
        ) : null}
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <ActivityIndicator
        style={scrollable ? styles.loader : styles.embeddedLoader}
        color={appTheme.colors.primary.deep}
      />
    );
  }

  const content = (
    <>
      {appointmentId ? renderAddRecord() : null}

      <Text style={styles.sectionTitle}>Medical History</Text>
      {recordSections.length > 0 ? (
        <Text style={styles.hint}>Long press a report for more options</Text>
      ) : null}
      {renderHistory()}
      {renderConsentModal()}
      {renderRecordActions()}
    </>
  );

  if (!scrollable) return content;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {content}
    </ScrollView>
  );
}

export default PatientReports;
