// import { Tabs } from 'expo-router';
import React from 'react';

// import { HapticTab } from '@/components/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
import { Stack } from 'expo-router';
// import { ThemedView } from '@/components/themed-view';

export default function AuthLayout() {
  // const colorScheme = useColorScheme();

  return (
      <Stack>
        <Stack.Screen name='onboarding' options={{ headerShown: false }}/>
        <Stack.Screen name='login' options={{ headerShown: false }}/>
        <Stack.Screen name='usertype' options={{ headerShown: false }}/>
        <Stack.Screen name='register' options={{ headerShown: false }}/>
      </Stack>
  );
}
