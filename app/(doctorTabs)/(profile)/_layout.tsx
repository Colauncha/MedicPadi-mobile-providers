import { Stack } from 'expo-router';

export const ProfilePage = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="editProfile" />
      <Stack.Screen name="editWorkingHours" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
    </Stack>
  );
};

export default ProfilePage;
