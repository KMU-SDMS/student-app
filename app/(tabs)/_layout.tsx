import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 0,
          marginTop: 0,
          textAlign: 'center',
        },
        tabBarStyle: Platform.select<ViewStyle>({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
            height: 80,
            paddingTop: 8,
            paddingBottom: 8 + insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            bottom: 0,
            left: 0,
            right: 0,
          },
          default: {
            position: 'fixed',
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
            height: 60,
            paddingTop: 8,
            paddingBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            bottom: 0,
            left: 0,
            right: 0,
            // 웹 PWA 안전영역 대응 (iOS 사파리 하단 홈 인디케이터 등)
            // react-native-web은 env(safe-area-inset-*)를 직접 지원하지 않으므로 runtime 스타일 주입이 어렵다.
            // 대신 여기서 기본 여백을 조금 더 준다.
            // 필요 시 글로벌 CSS에 :root { padding-bottom: env(safe-area-inset-bottom); }를 추가 고려.
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: () => null,
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 0,
            marginTop: 0,
          },
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '스캔',
          tabBarIcon: () => null,
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 0,
            marginTop: 0,
          },
        }}
      />
      {/* Explore 탭 제거 */}
    </Tabs>
  );
}
