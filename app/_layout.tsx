import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { logger } from '@/utils/logger';
import { OvernightStayProvider } from '@/contexts/OvernightStayContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OvernightStayProvider>
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="SDS" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png" />
          {/* 웹에서 입력 후 스크롤 이상 동작을 줄이기 위한 전역 스타일 */}
          <style>{`
            html, body, #root { height: 100%; }
            /* 페이지 자체의 스크롤을 차단하고 내부 컨테이너만 스크롤하도록 유도 */
            html, body { overscroll-behavior: none; -webkit-text-size-adjust: 100%; }
            body { position: fixed; width: 100%; overflow: hidden; touch-action: manipulation; }
            /* iOS 포커스 확대 방지: 입력 요소 폰트 16px 이상 */
            input, textarea, select, button { font-size: 16px !important; }
          `}</style>
        </Head>
        {Platform.OS === 'web' ? <ResetScrollEffects pathname={pathname} /> : null}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="notices" options={{ headerShown: false }} />
          <Stack.Screen name="notice-detail" options={{ headerShown: false }} />
          <Stack.Screen name="payment" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </OvernightStayProvider>
    </ThemeProvider>
  );
}

function ResetScrollEffects({ pathname }: { pathname: string }) {
  useEffect(() => {
    const resetBodyScroll = () => {
      if (typeof document === 'undefined') return;
      const htmlEl = document.documentElement as HTMLElement | null;
      const bodyEl = document.body as HTMLElement | null;
      // 고무줄/페이지 스크롤 방지: 항상 고정
      try {
        if (htmlEl) {
          htmlEl.style.setProperty('overscroll-behavior', 'none');
        }
        if (bodyEl) {
          bodyEl.style.setProperty('position', 'fixed');
          bodyEl.style.setProperty('overflow', 'hidden');
          bodyEl.style.setProperty('width', '100%');
          bodyEl.style.setProperty('overscroll-behavior', 'none');
        }
      } catch {}
      const clear = (el: HTMLElement | null) => {
        if (!el) return;
        try {
          el.style.removeProperty('overflow');
          el.style.removeProperty('position');
          el.style.removeProperty('height');
          el.style.removeProperty('touch-action');
          el.style.removeProperty('overscroll-behavior');
          // 일부 환경에서 인라인 스타일이 아닌 값이 남아있을 수 있어 기본값으로 재지정
          (el.style as any).overflow = '';
          (el.style as any).position = '';
          (el.style as any).height = '';
          (el.style as any)['touch-action'] = '';
          (el.style as any)['overscroll-behavior'] = '';
        } catch {}
      };
      clear(htmlEl);
      clear(bodyEl);
      if (document.activeElement && (document.activeElement as HTMLElement).blur) {
        (document.activeElement as HTMLElement).blur();
      }
      // 레이아웃이 고여있는 경우를 대비해 한 틱 뒤 재설정
      setTimeout(() => {
        try {
          window.scrollTo(0, 0);
        } catch {}
      }, 0);
    };

    // 처음 마운트 및 경로 변경 시 복원
    resetBodyScroll();

    const onFocus = () => resetBodyScroll();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') resetBodyScroll();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pathname]);

  return null;
}
