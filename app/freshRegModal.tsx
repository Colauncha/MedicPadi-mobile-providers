import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConsultantProfileForm } from '@/components/profile/ConsultantProfileForm';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader, HeaderAction } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import { useTheme } from '@/theme/ThemeProvider';
import { getRole } from '@/utils/roles';

const PLACEHOLDER_COPY = {
  lab: {
    icon: 'flask.fill',
    title: 'Laboratory profile setup is coming soon',
  },
  pharmacy: {
    icon: 'pill.fill',
    title: 'Pharmacy profile setup is coming soon',
  },
} as const;

export default function FreshRegModalScreen() {
  const { user, completeFreshRegistration } = useAuth();
  const { theme: appTheme } = useTheme();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const role = getRole(user?.role);

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        maxWidth: 500,
        marginBottom: theme.spacing.xl,
      },

      placeholderCard: {
        width: '100%',
        maxWidth: 500,
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.xl,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surfaceCardLight,
      },

      placeholderIcon: {
        padding: theme.spacing.md,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceCard,
      },

      placeholderTitle: {
        fontFamily: theme.typography.fonts?.rounded,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text,
        textAlign: 'center',
      },

      placeholderText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
      },

      btn: {
        width: '100%',
        marginTop: theme.spacing.base,
      },
    })
  );

  const renderBody = () => {
    if (role === 'consultant') {
      return (
        <ConsultantProfileForm
          submitLabel="Complete Profile"
          onSaved={completeFreshRegistration}
          onBusyChange={setIsSubmitting}
        />
      );
    }

    if (role === 'lab' || role === 'pharmacy') {
      const copy = PLACEHOLDER_COPY[role];

      return (
        <ThemedView style={styles.placeholderCard}>
          <IconSymbol
            name={copy.icon}
            size={36}
            color={appTheme.colors.textSecondary}
            style={styles.placeholderIcon}
          />

          <ThemedText style={styles.placeholderTitle}>{copy.title}</ThemedText>

          <ThemedText style={styles.placeholderText}>
            You&apos;ll be able to add your details here soon. For now, you can
            go straight to your dashboard.
          </ThemedText>

          <Button
            label="Continue to dashboard"
            onPress={completeFreshRegistration}
            style={styles.btn}
          />
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.placeholderCard}>
        <ThemedText style={styles.placeholderTitle}>
          Unable to determine your account type
        </ThemedText>

        <ThemedText style={styles.placeholderText}>
          You can continue to the app and complete your profile later.
        </ThemedText>

        <Button
          label="Continue"
          onPress={completeFreshRegistration}
          style={styles.btn}
        />
      </ThemedView>
    );
  };

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
            title="Complete your profile"
            subtitle="You can finish this later from your profile"
            back={false}
            style={styles.header}
            right={
              <HeaderAction
                label="Skip"
                icon="chevron.right"
                onPress={completeFreshRegistration}
                disabled={isSubmitting}
                accessibilityLabel="Skip profile setup"
              />
            }
          />

          {renderBody()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
