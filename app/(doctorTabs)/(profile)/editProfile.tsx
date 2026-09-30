import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConsultantProfileForm } from '@/components/profile/ConsultantProfileForm';
import { AppHeader } from '@/components/ui/AppHeader';
import { useThemedStyles } from '@/hooks/useThemedStyle';

export default function EditConsultantProfileScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoBack = () => {
    if (isSubmitting) {
      return;
    }
    router.replace('/profile');
  };

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: theme.spacing.xxl + 20,
      },

      keyboard: {
        flex: 1,
      },

      scroll: {
        flexGrow: 1,
        alignItems: 'center',
        padding: theme.spacing.base,
      },

      header: {
        width: '100%',
        maxWidth: 500,
      },
    })
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AppHeader
            title="Edit Profile"
            onBack={handleGoBack}
            disabled={isSubmitting}
            style={styles.header}
          />

          <ConsultantProfileForm
            onSaved={() => router.replace('/profile')}
            onBusyChange={setIsSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
