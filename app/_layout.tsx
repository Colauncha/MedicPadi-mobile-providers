import { ThemeProvider } from '@/theme/ThemeProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { storage } from '@/utils/storage';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

const FRESH_REGISTRATION = 'fresh_registration';

function RootLayoutNav() {
  const { isLoggedIn, token, isLoading: isAuthLoading, user } = useAuth();

  const [isNewReg, setIsNewReg] = useState(false);
  const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);

  const isInitializing = isAuthLoading || !hasCheckedRegistration;
  const isAuthenticated = isLoggedIn && token !== null;

  useEffect(() => {
    let mounted = true;

    const checkFreshRegistration = async () => {
      try {
        const storedValue = await storage.getItem(FRESH_REGISTRATION);

        const freshRegistration = storedValue === '1';

        if (mounted) {
          setIsNewReg(freshRegistration);
          setHasCheckedRegistration(true);
        }

        // Consume the flag so it only applies once.
        // await storage.deleteItem(FRESH_REGISTRATION);
      } catch (error) {
        console.error('Failed to check fresh registration:', error);

        if (mounted) {
          setIsNewReg(false);
          setHasCheckedRegistration(true);
        }
      }
    };

    checkFreshRegistration();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      SplashScreen.hideAsync();
    }
  }, [isInitializing]);

  if (isInitializing) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Authentication */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Fresh registration */}
      <Stack.Protected guard={isAuthenticated && isNewReg}>
        <Stack.Screen
          name="freshRegModal"
          options={{
            presentation: 'modal',
            title: 'Complete Registration',
            headerShown: true,
          }}
        />
      </Stack.Protected>

      {/* Normal authenticated flow */}
      <Stack.Protected
        guard={isAuthenticated && !!user && !isNewReg && user.role === 'lab'}
      >
        <Stack.Screen name="(labTabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected
        guard={
          isAuthenticated && !!user && !isNewReg && user.role === 'pharmacy'
        }
      >
        <Stack.Screen name="(pharmTabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected
        guard={
          isAuthenticated &&
          !!user &&
          !isNewReg &&
          (user.role === 'doctor' || !user.role)
        }
      >
        <Stack.Screen
          name="(doctorsTabs)"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
      </Stack.Protected>

      {/* Modal route */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          title: 'Modal',
        }}
      />
    </Stack>
  );
}

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export default function RootLayout() {
  // useEffect(() => {
  //   SplashScreen.setOptions({
  //     duration: 300,
  //     fade: true,
  //   });
  // }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
