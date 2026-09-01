import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';

export const unstable_settings = {
  initialRouteName: 'index',
  anchor: '(doctorsTabs)',
};

export default function TabLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();

  console.log('TabLayout user:', user);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.deep,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          // display: 'none',
          backgroundColor: 'transparent', //theme.colors.background,
          borderTopWidth: 0,
          borderTopColor: theme.colors.border,
          position: 'absolute',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={60}
            tint={theme.mode === 'dark' ? 'dark' : 'light'}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="calendar.badge.plus" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
