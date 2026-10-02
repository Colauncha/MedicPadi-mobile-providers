import { StyleSheet } from 'react-native';

import { PatientReports } from '@/components/patients/PatientReports';
import { AppHeader } from '@/components/ui/AppHeader';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Reports() {
  const { patientId, appointmentId } = useLocalSearchParams<{
    patientId: string;
    appointmentId?: string;
  }>();

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: theme.colors.background },
      appHeader: { paddingHorizontal: theme.spacing.base, marginBottom: 0 },
    })
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title={'Reports'} style={styles.appHeader} />
      <PatientReports
        patientId={patientId}
        appointmentId={appointmentId}
        scrollable
      />
    </SafeAreaView>
  );
}
