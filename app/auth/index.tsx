import { Platform, Pressable, Text, View } from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL as string;

export default function AuthScreen() {
  const onLogin = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const redirect = new URL('/home', window.location.origin).toString();
      window.location.href = `${API_BASE}/auth/login?redirect=${encodeURIComponent(redirect)}`;
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>로그인이 필요합니다</Text>
      <Pressable
        onPress={onLogin}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: '#1E90FF',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>로그인하기</Text>
      </Pressable>
      {Platform.OS !== 'web' ? (
        <Text style={{ opacity: 0.7 }}>현재 단계는 웹 전용입니다.</Text>
      ) : null}
    </View>
  );
}
