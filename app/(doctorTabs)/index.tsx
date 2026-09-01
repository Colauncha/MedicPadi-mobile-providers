import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import { AuthUser, ProfileData } from '@/services/api';
import { useTheme } from '@/theme/ThemeProvider';
import { Theme } from '@/theme/types';
import { router } from 'expo-router';
// import { useState } from 'react';

const MedicpadiLogo = require('../../assets/images/medicpadi-logo.png');

const DashboardHeaderElement = ({
  user,
  profile,
  appTheme,
}: {
  user: AuthUser | null;
  profile: ProfileData | null;
  appTheme: Theme;
}) => {
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      header: {
        paddingTop: 30,
        paddingHorizontal: 20,
      },
      logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // borderWidth: 1,
      },
      logoRowImage: {
        width: 100,
        height: 90,
        position: 'relative',
        left: -10,
      },
      logoRowIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
      },
      icons: {
        padding: 4,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.mono.light,
        height: 32,
        width: 32,
      },
      welcomeRow: {
        paddingHorizontal: 5,
      },
      welcomeText: {
        color: theme.colors.mono.dark,
        fontSize: theme.typography.sizes.lg,
        // fontFamily: theme.typography.fonts?.sans,
      },
      welcomeSubText: {
        color: theme.colors.mono.dark,
        fontSize: theme.typography.sizes.md,
        fontWeight: '200',
      },
      statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
      },
      statCard: {
        width: '48%',
        paddingHorizontal: theme.spacing.md,
        // paddingVertical: theme.spacing.xxl + 4,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surfaceCardBlue,
        alignItems: 'flex-start',
        // justifyContent: 'flex-start',
        position: 'relative',
      },
      statValue: {
        color: theme.colors.mono.light,
        fontSize: theme.typography.sizes.xl,
        paddingTop: theme.spacing.xxl + 20,
      },
      statLabel: {
        color: theme.colors.mono.light,
        fontFamily: theme.typography.fonts?.rounded,
        fontSize: theme.typography.sizes.sm,
        fontWeight: '200',
        marginBottom: theme.spacing.lg,
      },
    })
  );

  // console.log('Profile: ', profile);

  const statCards = [
    {
      value: String('230'),
      label: 'Total Patients',
      icon: 'arrow.up.right',
      to: '',
    },
    {
      value: String('50'),
      label: 'Active Patients',
      icon: 'arrow.up.right',
      to: '',
    },
    {
      value: String('25'),
      label: 'Appointments',
      icon: 'arrow.up.right',
      to: '',
    },
    { value: String('4.5'), label: 'Rating', icon: 'arrow.up.right', to: '' },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <Image
          source={MedicpadiLogo}
          style={styles.logoRowImage}
          contentFit="contain"
        />
        <View style={styles.logoRowIcons}>
          <IconSymbol
            name="bell.badge.fill"
            size={24}
            style={styles.icons}
            color={appTheme.colors.mono.darkGray}
          />
          {profile?.profile.profilePicture ? (
            <Image
              source={{ uri: profile.profile.profilePicture.url }}
              style={styles.icons}
              contentFit="cover"
            />
          ) : (
            <IconSymbol
              name="person.fill"
              size={24}
              style={styles.icons}
              color={appTheme.colors.mono.darkGray}
            />
          )}
        </View>
      </View>
      <View style={styles.welcomeRow}>
        <ThemedText style={styles.welcomeText} type="defaultSemiBold">
          Hello Dr. {user?.fullName || 'User'}
        </ThemedText>
        <ThemedText style={styles.welcomeSubText} type="subtitle">
          Ready to manage your patients today?
        </ThemedText>
      </View>
      <View style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <TouchableOpacity
            onPress={() => router.push(card.to as any)}
            key={index}
            style={styles.statCard}
          >
            <ThemedText style={styles.statValue} type="title">
              {card.value}
            </ThemedText>
            <ThemedText style={styles.statLabel} type="subtitle">
              {card.label}
            </ThemedText>
            <IconSymbol
              name={card.icon as any}
              size={20}
              style={{ marginTop: 10, position: 'absolute', top: 2, right: 10 }}
              color={appTheme.colors.mono.light}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { theme: appTheme } = useTheme();

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      },
      stepContainer: {
        gap: 8,
        marginBottom: 8,
      },
    })
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: appTheme.colors.blue.bg,
        dark: appTheme.colors.blue.bg,
      }}
      headerElement={DashboardHeaderElement({ user, profile, appTheme })}
      // refreshControl={
      // <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
    ></ParallaxScrollView>
  );
}
