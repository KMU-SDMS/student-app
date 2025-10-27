import { Platform } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function RootIndexRedirect() {
  // 웹: 보호된 API 프로브로 세션 상태 확인 → /home 또는 /auth 분기
  // 네이티브: 기존 탭 루트로 이동
  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/(tabs)');
      return;
    }

    const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL as string) || '';
    const controller = new AbortController();

    const probe = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/rooms`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });
        if (resp.ok || resp.status === 403) {
          if (typeof window !== 'undefined') window.location.replace('/home');
          return;
        }
        if (resp.status === 401) {
          if (typeof window !== 'undefined') window.location.replace('/auth');
          return;
        }
        if (typeof window !== 'undefined') window.location.replace('/auth');
      } catch {
        if (typeof window !== 'undefined') window.location.replace('/auth');
      }
    };

    probe();
    return () => controller.abort();
  }, []);

  return null;
}
