import { Platform } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function RootIndexRedirect() {
  // 웹에서는 /auth로, 네이티브에서는 /(tabs)로 즉시 이동
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.location.replace('/auth');
      }
    } else {
      router.replace('/(tabs)');
    }
  }, []);
  return null;
}
