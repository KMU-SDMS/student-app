import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { logger } from '@/utils/logger';
import SplashScreen from '@/components/SplashScreen';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 앱 초기화 훅 사용
  const {
    isLoading: isAppInitializing,
    error,
    retryInitialization,
    initializationProgress,
  } = useAppInitialization({
    minLoadingTime: 2000, // 최소 2초 로딩
    enableProgressTracking: true,
  });

  // 스플래시 스크린 표시 상태 관리
  const [showSplash, setShowSplash] = useState(true);

  // 스플래시 스크린 완료 핸들러
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // 에러가 발생한 경우 로깅
  useEffect(() => {
    if (error) {
      logger.error('앱 초기화 오류', new Error(error), { event: 'app_init_error' });
    }
  }, [error]);

  // 스플래시 스크린이 필요한 경우 완전히 분리된 렌더링
  if (!loaded || isAppInitializing || showSplash) {
    return (
      <SplashScreen
        onFinish={handleSplashFinish}
        isVisible={true}
        progress={initializationProgress}
      />
    );
  }

  // 메인 앱 렌더링
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png" />
      </Head>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notices" options={{ headerShown: false }} />
        <Stack.Screen name="notice-detail" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
