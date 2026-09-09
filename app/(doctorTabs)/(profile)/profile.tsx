import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import { useTheme } from '@/theme/ThemeProvider';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfilePage = () => {
  const { user, token, profile } = useAuth();
  const { theme: appTheme } = useTheme();

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: theme.spacing.xxl + 20,
      },

      scroll: {
        flexGrow: 1,
        alignItems: 'center',
        padding: theme.spacing.base,
      },

      card: {
        backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.xl,
        borderColor: theme.colors.border,
        borderWidth: 0,
        padding: theme.spacing.lg,
        width: '100%',
        maxWidth: 500,
      },

      header: {
        marginTop: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        width: '100%',
        flexDirection: 'row',
        paddingVertical: theme.spacing.xxl,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surfaceCard,
        maxWidth: 500,
        alignItems: 'center',
        gap: theme.spacing.base,
        position: 'relative',
        flexWrap: 'wrap',
      },

      headerTitle: {
        fontSize: theme.typography.sizes.xl,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
      },

      headerSubTitle: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        textTransform: 'capitalize',
        marginBottom: theme.spacing.sm,
      },

      headerIconsView: {
        position: 'absolute',
        bottom: -45,
        right: 10,
        flexDirection: 'row',
        gap: theme.spacing.base,
      },

      headerIcons: {
        padding: theme.spacing.sm,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceCard,
      },

      avatarSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
      },

      avatarContainer: {
        position: 'relative',
        marginBottom: theme.spacing.sm,
      },

      avatar: {
        width: 100,
        height: 100,
        borderRadius: theme.radius.full,
        borderWidth: 3,
        borderColor: theme.colors.border,
      },

      avatarPlaceholder: {
        backgroundColor: theme.colors.textSecondary,
      },
    })
  );

  useEffect(() => {
    if (!token || !user) {
      router.navigate('/login?redirect=profile');
    }
  }, [token, user]);

  const profilePic = profile?.profile.profilePicture?.url ?? null;
  const consultantProfile = profile?.profile ?? null;

  return (
    // <View style={styles.contianer}>
    //   <Text>ProfilePage</Text>
    //   <Button
    //     label="Edit profile"
    //     onPress={() => router.navigate('/(doctorTabs)/(profile)/editProfile')}
    //   />
    //   <Button
    //     label="Settings"
    //     onPress={() => router.push('/(doctorTabs)/(profile)/settings')}
    //   />
    // </View>
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
          </View>
          <View>
            <ThemedText type="title" style={styles.headerTitle}>
              {consultantProfile?.firstName && consultantProfile?.lastName
                ? `Dr. ${consultantProfile?.firstName}  ${consultantProfile?.lastName}`
                : user?.email}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.headerSubTitle}>
              {consultantProfile?.speciality} |{' '}
              {consultantProfile?.yearsOfService
                ? `${consultantProfile?.yearsOfService} years`
                : consultantProfile?.gender}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.headerSubTitle}>
              {consultantProfile?.rating && consultantProfile.totalReviews
                ? `${consultantProfile.rating} (${consultantProfile.totalReviews} reviews)`
                : '0.00 (0 reviews)'}
            </ThemedText>
          </View>
          <View style={styles.headerIconsView}>
            <TouchableOpacity onPress={() => router.navigate('/settings')}>
              <IconSymbol
                name={'gearshape.fill'}
                color={appTheme.colors.textSecondary}
                style={styles.headerIcons}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.navigate('/editProfile')}>
              <IconSymbol
                name={'pencil.line'}
                color={appTheme.colors.textSecondary}
                style={styles.headerIcons}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfilePage;
