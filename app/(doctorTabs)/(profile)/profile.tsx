// import { ThemedText } from '@/components/themed-text';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { useAuth } from '@/context/AuthContext';
// import { useThemedStyles } from '@/hooks/useThemedStyle';
// import { apiGetProfile } from '@/services/api';
// import { useTheme } from '@/theme/ThemeProvider';
// import { router } from 'expo-router';
// import { useEffect, useState } from 'react';
// import {
//   Image,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const ProfilePage = () => {
//   const { user, token, profile } = useAuth();
//   const { theme: appTheme } = useTheme();
//   // const [loading, setLoading] = useState(false);

//   const styles = useThemedStyles((theme) =>
//     StyleSheet.create({
//       container: {
//         flex: 1,
//         backgroundColor: theme.colors.background,
//         paddingBottom: theme.spacing.xxl + 20,
//       },

//       scroll: {
//         flexGrow: 1,
//         alignItems: 'center',
//         padding: theme.spacing.base,
//       },

//       card: {
//         backgroundColor: theme.colors.surfaceCard,
//         borderRadius: theme.radius.xl,
//         borderColor: theme.colors.border,
//         borderWidth: 0,
//         padding: theme.spacing.lg,
//         width: '100%',
//         maxWidth: 500,
//       },

//       header: {
//         marginTop: theme.spacing.lg,
//         borderRadius: theme.radius.xl,
//         width: '100%',
//         flexDirection: 'row',
//         paddingVertical: theme.spacing.xxl,
//         paddingHorizontal: theme.spacing.lg,
//         backgroundColor: theme.colors.surfaceCardLight,
//         maxWidth: 500,
//         alignItems: 'center',
//         gap: theme.spacing.base,
//         position: 'relative',
//         flexWrap: 'wrap',
//       },

//       headerTitle: {
//         fontSize: theme.typography.sizes.xl,
//         color: theme.colors.textSecondary,
//         marginBottom: theme.spacing.sm,
//       },

//       headerSubTitle: {
//         fontSize: theme.typography.sizes.sm,
//         color: theme.colors.textMuted,
//         textTransform: 'capitalize',
//         marginBottom: theme.spacing.sm,
//       },

//       headerIconsView: {
//         position: 'absolute',
//         bottom: -50,
//         right: 0,
//         flexDirection: 'row',
//         gap: theme.spacing.base,
//       },

//       headerIcons: {
//         padding: theme.spacing.sm,
//         borderRadius: theme.radius.full,
//         backgroundColor: theme.colors.surfaceCardLight,
//       },

//       avatarSection: {
//         alignItems: 'center',
//         marginBottom: theme.spacing.xl,
//       },

//       avatarContainer: {
//         position: 'relative',
//         marginBottom: theme.spacing.sm,
//       },

//       avatar: {
//         width: 100,
//         height: 100,
//         borderRadius: theme.radius.full,
//         borderWidth: 3,
//         borderColor: theme.colors.border,
//       },

//       avatarPlaceholder: {
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: theme.colors.surfaceCardLight,
//         borderRadius: theme.radius.full,
//       },

//       section: {
//         width: '100%',
//         paddingVertical: theme.spacing.md,
//         marginTop: theme.spacing.xxl + 10,
//         alignItems: 'flex-start',
//         // borderWidth: 1,
//       },

//       bioSectionTItleRow: {
//         width: '100%',
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginTop: theme.spacing.sm,
//       },

//       bioSectionTItle: {
//         fontSize: theme.typography.sizes.lg,
//       },

//       bioSectionPrice: {
//         padding: theme.spacing.xs,
//         borderRadius: theme.radius.md,
//         backgroundColor: theme.colors.surfaceCardLight,
//         borderWidth: 0,
//         borderColor: theme.colors.border,
//         color: theme.colors.textSecondary,
//         fontSize: theme.typography.sizes.sm,
//       },

//       bioSectionPriceSubTItle: {
//         fontSize: theme.typography.sizes.xs,
//         color: theme.colors.textMuted,
//       },

//       bioText: {
//         fontSize: theme.typography.sizes.sm,
//         color: theme.colors.textSecondary,
//         paddingVertical: theme.spacing.md,
//       },
//     })
//   );

//   const handleRefresh = useCallBack(async () => {
//     if (!token) return;

//     try {
//       const profile = apiGetProfile(token);
//     } catch (error) {

//     }

//   }, [token])

//   useEffect(() => {
//     if (!token || !user) {
//       router.navigate('/login?redirect=profile');
//     }
//   }, [token, user]);

//   const profilePic = profile?.profile.profilePicture?.url ?? null;
//   const consultantProfile = profile?.profile ?? null;

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         refreshControl={}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.avatarContainer}>
//             {profilePic ? (
//               <Image source={{ uri: profilePic }} style={styles.avatar} />
//             ) : (
//               <View style={styles.avatar}>
//                 <IconSymbol
//                   style={styles.avatarPlaceholder}
//                   name={'person.fill'}
//                   size={95}
//                   color={appTheme.colors.textMuted}
//                 />
//               </View>
//             )}
//           </View>
//           <View>
//             <ThemedText type="title" style={styles.headerTitle}>
//               {consultantProfile?.firstName && consultantProfile?.lastName
//                 ? `Dr. ${consultantProfile?.firstName}  ${consultantProfile?.lastName}`
//                 : user?.email}
//             </ThemedText>
//             <ThemedText type="subtitle" style={styles.headerSubTitle}>
//               {consultantProfile?.speciality} |{' '}
//               {consultantProfile?.yearsOfService
//                 ? `${consultantProfile?.yearsOfService} years`
//                 : consultantProfile?.gender}
//             </ThemedText>
//             <ThemedText type="subtitle" style={styles.headerSubTitle}>
//               {consultantProfile?.rating && consultantProfile.totalReviews
//                 ? `${consultantProfile.rating} (${consultantProfile.totalReviews} reviews)`
//                 : '0.00 (0 reviews)'}
//             </ThemedText>
//           </View>
//           <View style={styles.headerIconsView}>
//             <TouchableOpacity onPress={() => router.navigate('/settings')}>
//               <IconSymbol
//                 name={'gearshape.fill'}
//                 color={appTheme.colors.textSecondary}
//                 style={styles.headerIcons}
//               />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => router.navigate('/editProfile')}>
//               <IconSymbol
//                 name={'pencil.line'}
//                 color={appTheme.colors.textSecondary}
//                 style={styles.headerIcons}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* About - Bio */}
//         <View style={styles.section}>
//           <View style={styles.bioSectionTItleRow}>
//             <ThemedText type="title" style={styles.bioSectionTItle}>
//               Bio
//             </ThemedText>
//             <ThemedText style={styles.bioSectionPrice}>
//               Price: ₦{consultantProfile?.costPerSession || '₦0'}
//               {''}
//               <ThemedText
//                 type="subtitle"
//                 style={styles.bioSectionPriceSubTItle}
//               >
//                 /session
//               </ThemedText>
//             </ThemedText>
//           </View>
//           <ThemedText type="default" style={styles.bioText}>
//             {consultantProfile?.bio ??
//               'Edit profile to add a short description about you...'}
//           </ThemedText>
//         </View>

//         {/* Education */}
//         <View style={styles.section}>
//           <View style={styles.bioSectionTItleRow}>
//             <ThemedText type="title" style={styles.bioSectionTItle}>
//               Education & Qualification
//             </ThemedText>
//             <ThemedText style={styles.bioSectionPrice}>Edit</ThemedText>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ProfilePage;

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import { apiGetProfile } from '@/services/api';
import { useTheme } from '@/theme/ThemeProvider';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfilePage = () => {
  const { user, token, profile, setProfile } = useAuth();
  const { theme: appTheme } = useTheme();

  const [refreshing, setRefreshing] = useState(false);

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },

      scroll: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: theme.spacing.base,
        paddingBottom: theme.spacing.xxl + 60,
      },

      header: {
        marginTop: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        width: '100%',
        maxWidth: 500,
        flexDirection: 'row',
        paddingVertical: theme.spacing.xxl,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surfaceCardLight,
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
        marginBottom: theme.spacing.xs,
      },

      headerIconsView: {
        position: 'absolute',
        bottom: -50,
        right: 0,
        flexDirection: 'row',
        gap: theme.spacing.base,
      },

      headerIcons: {
        padding: theme.spacing.sm,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceCardLight,
      },

      avatarContainer: {
        position: 'relative',
      },

      avatar: {
        width: 100,
        height: 100,
        borderRadius: theme.radius.full,
        borderWidth: 3,
        borderColor: theme.colors.border,
      },

      avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceCardLight,
        borderRadius: theme.radius.full,
      },

      section: {
        width: '100%',
        maxWidth: 500,
        paddingVertical: theme.spacing.md,
        marginTop: theme.spacing.xxl + 10,
        alignItems: 'flex-start',
      },

      bioSectionTItleRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.spacing.md,
      },

      bioSectionTItle: {
        fontSize: theme.typography.sizes.lg,
        flex: 1,
      },

      bioSectionPrice: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceCardLight,
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.sm,
      },

      bioSectionPriceSubTItle: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
      },

      bioText: {
        fontFamily: theme.typography.fonts?.serif,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        paddingVertical: theme.spacing.md,
        lineHeight: 22,
      },

      emptyText: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sizes.sm,
        paddingTop: theme.spacing.md,
      },

      qualificationCard: {
        width: '100%',
        backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginTop: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
      },

      qualificationIcon: {
        padding: theme.spacing.md,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceCardLight,
      },

      qualificationTitle: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
      },

      qualificationSubtitle: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
      },
    })
  );

  const handleRefresh = useCallback(async () => {
    if (!token) {
      return;
    }

    setRefreshing(true);

    try {
      const response = await apiGetProfile(token);

      if (response) {
        setProfile(response);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [token, setProfile]);

  useEffect(() => {
    if (!token || !user) {
      router.replace('/login?redirect=profile');
    }
  }, [token, user]);

  /*
   * Don't render the profile screen while authentication
   * is being resolved / after redirect has been triggered.
   */
  if (!token || !user) {
    return null;
  }

  const consultantProfile = profile?.profile ?? null;

  const profilePic = consultantProfile?.profilePicture?.url ?? null;

  const fullName =
    consultantProfile?.firstName && consultantProfile?.lastName
      ? `Dr. ${consultantProfile.firstName} ${consultantProfile.lastName}`
      : user.email;

  const rating =
    consultantProfile?.rating != null
      ? (consultantProfile.rating.toFixed?.(2) ?? consultantProfile.rating)
      : '0.00';

  const totalReviews = consultantProfile?.totalReviews ?? 0;

  const price =
    consultantProfile?.costPerSession != null
      ? consultantProfile.costPerSession
      : 0;

  /*
   * Adjust this depending on the exact shape of your API.
   */
  const qualifications = consultantProfile?.education ?? [];

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <IconSymbol
                  name="person.fill"
                  size={60}
                  color={appTheme.colors.textMuted}
                />
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <ThemedText
              type="title"
              style={styles.headerTitle}
              numberOfLines={2}
            >
              {fullName}
            </ThemedText>

            <ThemedText
              type="subtitle"
              style={styles.headerSubTitle}
              numberOfLines={1}
            >
              {consultantProfile?.speciality
                ? consultantProfile.speciality
                : 'Consultant'}
              {' • '}
              {consultantProfile?.yearsOfService != null
                ? `${consultantProfile.yearsOfService} years`
                : (consultantProfile?.gender ?? '')}
            </ThemedText>

            <ThemedText type="subtitle" style={styles.headerSubTitle}>
              {rating} ({totalReviews}{' '}
              {totalReviews === 1 ? 'review' : 'reviews'})
            </ThemedText>
          </View>

          <View style={styles.headerIconsView}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <IconSymbol
                name="gearshape.fill"
                color={appTheme.colors.textSecondary}
                style={styles.headerIcons}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/editProfile')}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <IconSymbol
                name="pencil.line"
                color={appTheme.colors.textSecondary}
                style={styles.headerIcons}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <View style={styles.bioSectionTItleRow}>
            <ThemedText type="title" style={styles.bioSectionTItle}>
              Bio
            </ThemedText>

            <ThemedText style={styles.bioSectionPrice}>
              ₦{Number(price).toLocaleString()}
              <ThemedText
                type="subtitle"
                style={styles.bioSectionPriceSubTItle}
              >
                {' '}
                /session
              </ThemedText>
            </ThemedText>
          </View>

          <ThemedText type="default" style={styles.bioText}>
            {consultantProfile?.bio?.trim()
              ? consultantProfile.bio
              : 'Edit your profile to add a short description about yourself.'}
          </ThemedText>
        </View>

        {/* Education & Qualifications */}
        <View style={[styles.section, { marginTop: -5 }]}>
          <View style={styles.bioSectionTItleRow}>
            <ThemedText type="title" style={styles.bioSectionTItle}>
              Education & Qualification
            </ThemedText>

            <TouchableOpacity
              onPress={() => router.push('/editProfile')}
              accessibilityRole="button"
              accessibilityLabel="Edit education and qualifications"
            >
              <ThemedText style={styles.bioSectionPrice}>Edit</ThemedText>
            </TouchableOpacity>
          </View>

          {qualifications.length > 0 ? (
            qualifications.map((qualification: any, index: number) => (
              <View
                key={qualification.id ?? index}
                style={styles.qualificationCard}
              >
                <IconSymbol
                  name={'graduationcap.fill'}
                  size={30}
                  color={appTheme.colors.textSecondary}
                  style={styles.qualificationIcon}
                />
                <View>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.qualificationTitle}
                  >
                    {qualification.title ??
                      qualification.degree ??
                      qualification.name}
                  </ThemedText>

                  {(qualification.institution || qualification.school) && (
                    <ThemedText
                      type="subtitle"
                      style={styles.qualificationSubtitle}
                    >
                      {qualification.institution ?? qualification.school}
                    </ThemedText>
                  )}

                  {qualification.year && (
                    <ThemedText
                      type="subtitle"
                      style={styles.qualificationSubtitle}
                    >
                      {qualification.year}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>
              No education or qualifications have been added yet.
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};;

export default ProfilePage;
