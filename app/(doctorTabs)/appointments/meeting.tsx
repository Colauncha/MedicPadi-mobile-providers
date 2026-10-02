import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import {
  apiCompleteAppointment,
  apiGetZAK,
  apiGetZoomSignature,
} from '@/services/api';
import { useTheme } from '@/theme/ThemeProvider';
import {
  ZoomSDKProvider,
  addZoomEventListener,
  useZoom,
} from '@zoom/meetingsdk-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEETING_ENDED_STATES = ['MobileRTCMeetingState_Ended', 'Ended'];
const AUTH_SUCCESS_CODES = ['MobileRTCAuthError_Success', 'ZOOM_ERROR_SUCCESS'];
const JOIN_SUCCESS_CODES = [
  'MobileRTCMeetError_Success',
  'MEETING_ERROR_SUCCESS',
];

const ZoomMeetingContent = ({
  meetingNumber,
  userName,
  appointmentId,
  token,
  zak,
}: {
  meetingNumber: string;
  userName: string;
  appointmentId: string;
  token: string;
  zak: string;
}) => {
  const zoom = useZoom();
  const [error, setError] = useState<string | null>(null);
  const [callEnded, setCallEnded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const hasJoinedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const { theme: appTheme } = useTheme();

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: theme.colors.background },
      center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.base,
        gap: theme.spacing.md,
      },
      endedTitle: {
        fontFamily: theme.typography.fonts?.rounded,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text,
        textAlign: 'center',
      },
      actions: {
        width: '100%',
        maxWidth: 400,
        gap: theme.spacing.sm,
      },
      loadingText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
      },
      errorText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
      },
    })
  );

  useEffect(() => {
    const authSub = addZoomEventListener(
      'onAuthReturn',
      async ({ error: authError }: { error: string }) => {
        if (!AUTH_SUCCESS_CODES.includes(authError)) {
          setError(
            'Failed to authorize the meeting session. Please try again.'
          );
          return;
        }
        if (hasJoinedRef.current) return;
        hasJoinedRef.current = true;
        try {
          const result = await zoom.startMeeting({
            userName,
            meetingNumber,
            zoomAccessToken: zak,
            // password: meetingPassword,
          });
          if (!JOIN_SUCCESS_CODES.includes(result)) {
            setError('Unable to start the consultation. Please try again.');
          }
        } catch {
          setError('Unable to start the consultation. Please try again.');
        }
      }
    );

    const stateSub = addZoomEventListener(
      'onMeetingStateChange',
      ({ state }: { state: string }) => {
        /*
         * "Ended" also fires when the doctor merely leaves or the connection
         * drops, so don't complete the appointment here — ask the doctor.
         */
        if (MEETING_ENDED_STATES.includes(state) && !hasEndedRef.current) {
          hasEndedRef.current = true;
          setCallEnded(true);
        }
      }
    );

    const errorSub = addZoomEventListener(
      'onMeetingError',
      ({ error: meetingError }: { error: string }) => {
        setError(`Meeting error: ${meetingError}`);
      }
    );

    return () => {
      authSub.remove();
      stateSub.remove();
      errorSub.remove();
      zoom.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = async () => {
    if (isCompleting) {
      return;
    }

    try {
      setIsCompleting(true);
      const res = await apiCompleteAppointment(appointmentId, token);

      if (!res.success) {
        throw new Error(res.message);
      }

      router.back();
    } catch (e: any) {
      Alert.alert(
        'Unable to complete appointment',
        e?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsCompleting(false);
    }
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button label="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (callEnded) {
    return (
      <View style={styles.center}>
        <Text style={styles.endedTitle}>Call ended</Text>
        <Text style={styles.errorText}>
          Is this consultation finished? Marking it as completed can&apos;t be
          undone.
        </Text>
        <View style={styles.actions}>
          <Button
            label="Mark as Completed"
            onPress={handleComplete}
            loading={isCompleting}
          />
          <Button
            label="Not Yet, Back to Appointment"
            variant="outline"
            onPress={() => router.back()}
            disabled={isCompleting}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator
        size="large"
        color={appTheme.colors.primary.extraDeep}
      />
      <Text style={styles.loadingText}>Starting the consultation…</Text>
    </View>
  );
};

const ZoomMeetingScreen = () => {
  const { token, user, profile } = useAuth();
  const { appointmentId, meetingNumber } = useLocalSearchParams();

  const [signature, setSignature] = useState<string | null>(null);
  const [zak, setZak] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme: appTheme } = useTheme();

  useEffect(() => {
    if (!token) return;
    apiGetZoomSignature(appointmentId as string, token)
      .then((res) => setSignature(res.signature))
      .catch((e) => setError(e.message ?? 'Failed to prepare the meeting'));
    apiGetZAK(appointmentId as string, token)
      .then((res) => {
        if (!res.zak) {
          throw new Error(
            'This appointment has no valid host link. Please contact support.'
          );
        }
        setZak(res.zak);
      })
      .catch((e) => setError(e.message ?? 'Failed to prepare the meeting'));
  }, [appointmentId, token]);

  const userName =
    [profile?.profile?.firstName, profile?.profile?.lastName]
      .filter(Boolean)
      .join(' ') ||
    user?.fullName ||
    'Doctor';

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: theme.colors.background },
      center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.base,
        gap: theme.spacing.md,
      },
      loadingText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
      },
      errorText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
      },
    })
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Go Back" onPress={() => router.back()} />
        </View>
      ) : !signature || !zak ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={appTheme.colors.primary.extraDeep}
          />
        </View>
      ) : (
        <ZoomSDKProvider
          config={{
            jwtToken: signature,
            domain: 'zoom.us',
            enableLog: true,
            logSize: 5,
          }}
        >
          <ZoomMeetingContent
            meetingNumber={meetingNumber as string}
            userName={userName}
            appointmentId={(appointmentId as string) || ''}
            token={token || ''}
            zak={zak}
          />
        </ZoomSDKProvider>
      )}
    </SafeAreaView>
  );
};

export default ZoomMeetingScreen;
