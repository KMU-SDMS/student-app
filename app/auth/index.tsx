import { Platform, Pressable, Text } from 'react-native';
import { useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL as string;

export default function AuthScreen() {
  const accent = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  // 이미 로그인된 경우(auth 화면 진입 시) 홈으로 이동
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const controller = new AbortController();
    const probe = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/calendar`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });
        if (resp.ok || resp.status === 403) {
          window.location.replace('/home');
        }
      } catch {}
    };
    probe();
    return () => controller.abort();
  }, []);
  const onLogin = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const redirect = new URL('/home', window.location.origin).toString();
      window.location.href = `${API_BASE}/auth/login?redirect=${encodeURIComponent(redirect)}`;
    }
  };

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <ThemedText style={{ fontSize: 20, fontWeight: '700' }}>로그인이 필요합니다</ThemedText>
      <Pressable
        onPress={onLogin}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: accent,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>로그인하기</Text>
      </Pressable>
      {Platform.OS !== 'web' ? (
        <ThemedText style={{ opacity: 0.7 }}>현재 단계는 웹 전용입니다.</ThemedText>
      ) : null}
    </ThemedView>
  );
}
