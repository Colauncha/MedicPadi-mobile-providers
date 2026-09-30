import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as TP,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { handleNotificationNavigation } from '@/utils/notificationNavigation';
import { getRole } from '@/utils/roles';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

function RootLayoutNav() {
  const {
    isLoggedIn,
    token,
    isLoading: isInitializing,
    user,
    isNewReg,
  } = useAuth();

  const isAuthenticated = isLoggedIn && token !== null;
  const role = getRole(user?.role);

  const { theme } = useTheme();

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
      }}
    >
      {/* Authentication */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen
          name="(auth)"
          options={{
            contentStyle: { backgroundColor: theme.colors.background },
            headerShown: false,
          }}
        />
      </Stack.Protected>

      {/* Fresh registration */}
      <Stack.Protected guard={isAuthenticated && isNewReg}>
        <Stack.Screen
          name="freshRegModal"
          options={{
            presentation: 'modal',
            title: 'Complete Registration',
            headerShown: false,
          }}
        />
      </Stack.Protected>

      {/* Normal authenticated flow */}
      <Stack.Protected
        guard={isAuthenticated && !!user && !isNewReg && role === 'lab'}
      >
        <Stack.Screen
          name="(labTabs)"
          options={{
            contentStyle: { backgroundColor: theme.colors.background },
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected
        guard={
          isAuthenticated && !!user && !isNewReg && role === 'pharmacy'
        }
      >
        <Stack.Screen
          name="(pharmTabs)"
          options={{
            contentStyle: { backgroundColor: theme.colors.background },
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected
        guard={
          isAuthenticated &&
          !!user &&
          !isNewReg &&
          (role === 'consultant' || !user.role)
        }
      >
        <Stack.Screen
          name="(doctorTabs)"
          options={{
            contentStyle: { backgroundColor: theme.colors.background },
            headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        handleNotificationNavigation(data || {});
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <TP value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </TP>
  );
}
