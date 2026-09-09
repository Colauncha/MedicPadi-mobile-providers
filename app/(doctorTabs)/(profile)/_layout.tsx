// import { useThemedStyles } from '@/hooks/useThemedStyle';
import { Stack } from 'expo-router';
// import { StyleSheet } from 'react-native';

export const ProfilePage = () => {
  // const styles = useThemedStyles((theme) => StyleSheet.create({}));

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="editProfile" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProfilePage;
