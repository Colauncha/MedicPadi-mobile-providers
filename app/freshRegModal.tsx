import { Link, router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storage } from '@/utils/storage';
import { useEffect } from 'react';

const FRESH_REGISTRATION = 'fresh_registration';

export default function FreshRegModalScreen() {
  useEffect(() => {
    (async () => await storage.deleteItem(FRESH_REGISTRATION))();
  }, []);

  const handleGoHome = () => {
    router.navigate('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <TouchableOpacity onPress={handleGoHome}>
        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
